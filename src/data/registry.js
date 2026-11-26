/*
  Registry: the one place the site and the admin panel share data, stored in Firestore.

  Collections (see firestore.rules):
    registrations/{ref}    delegate, startup and collaboration registrations, with the full form in `details`
    queries/{ref}          helpdesk inquiries
    logins/{autoId}        sign-in / sign-up / sign-out log
    startupDirectory/{ref} public card of each approved startup (written when an admin approves)
    counters/{code}        last reference number per type, so BMF.BC-XXX-00001 … is unique site-wide

  The site calls submitRegistration / submitQuery / recordLogin. The admin panel calls
  listRegistrations / listLogins / subscribe / decide.
*/
import {
  collection, doc, onSnapshot, query, where, runTransaction, serverTimestamp, updateDoc, setDoc, deleteDoc, addDoc,
  getDoc,
} from 'firebase/firestore';
import { db, auth, ensureSignedIn } from '../firebase';
import { sendEmail } from './mailer';
import { receivedEmail, adminAlertEmail, decisionEmail } from './emails';

/* ── Registration types ─────────────────────────────── */

export const TYPES = {
  delegate: { label: 'Delegate pass', short: 'Delegates', color: '#5B8DEF', approvable: true },
  startup: { label: 'Startup showcase', short: 'Startups', color: '#D9604A', approvable: true },
  aimf: { label: 'AIMF accreditation', short: 'AIMF', color: '#B98A3A', approvable: true },
  collaboration: { label: 'Collaboration', short: 'Collaborations', color: '#2FA58C', approvable: true },
  panel: { label: 'Panel application', short: 'Panels', color: '#B98A3A', approvable: true },
  query: { label: 'Inquiry', short: 'Inquiries', color: '#8A9E97', approvable: false },
};

export const TYPE_ORDER = ['delegate', 'startup', 'aimf', 'collaboration', 'panel', 'event_app'];

export const STATUS = {
  pending: { label: 'Pending', color: '#FAB219' },
  approved: { label: 'Approved', color: '#0CA30C' },
  declined: { label: 'Declined', color: '#D03B3B' },
};

const REF_CODES = { delegate: 'DGO', startup: 'SEO', aimf: 'AIMF', collaboration: 'CBC', query: 'QRY', event_app: 'EVA' };

/* ── Writing (called by the site) ──────────────────── */

// Takes the next number for this type and saves the record under it in one transaction,
// so two visitors can never get the same reference.
async function saveWithRef(kind, record) {
  const user = await ensureSignedIn();
  const code = REF_CODES[kind];
  const coll = kind === 'query' ? 'queries' : 'registrations';
  return runTransaction(db, async (tx) => {
    const counter = doc(db, 'counters', code);
    const snap = await tx.get(counter);
    const n = (snap.exists() ? snap.data().n : 0) + 1;
    const ref = kind === 'aimf'
      ? `BC.AIMF-${String(n).padStart(5, '0')}`
      : `BMF.BC-${code}-${String(n).padStart(5, '0')}`;
    tx.set(counter, { n });
    tx.set(doc(db, coll, ref), {
      ...record,
      ...(kind === 'query' ? { status: 'received' } : { type: kind, status: 'pending' }),
      ref,
      uid: user.uid,
      submittedAt: serverTimestamp(),
    });
    return ref;
  });
}

/*
  Save a registration and return its reference (BMF.BC-DGO-00001 …).
  `type` is delegate | startup | collaboration. Summary fields are flat and short:
  { name, email, organisation, country, detail, sector, phone, payment, profile }
  and `details` holds the complete form, shown in full in the admin panel.
*/
export async function submitRegistration(type, record) {
  const ref = await saveWithRef(type, { ...record, accountEmail: auth.currentUser?.email || '' });
  // confirmation to the applicant and an alert to the admins; neither blocks the confirmation screen
  const r = { ...record, type, ref };
  sendEmail(record.email, receivedEmail(r));
  sendEmail(ADMIN_EMAILS, adminAlertEmail(r));
  return ref;
}

/* Save a helpdesk inquiry: { fullName, email, phone, organization, country, regId, category, dept, subject, message, urgent } */
export async function submitQuery(record) {
  const flags = getLocalFlags();
  const counterKey = 'babc_counter_QRY';
  let nextNum = 1;
  try {
    const c = parseInt(localStorage.getItem(counterKey) || '12', 10);
    nextNum = c + 1;
    localStorage.setItem(counterKey, String(nextNum));
  } catch { /* storage unavailable */ }
  const localRef = `BMF.BC-QRY-${String(nextNum).padStart(5, '0')}`;

  const queryRecord = {
    ...record,
    id: localRef,
    ref: localRef,
    type: 'query',
    name: record.fullName || record.name || 'Anonymous Inquirer',
    fullName: record.fullName || record.name || '',
    email: record.email || '',
    phone: record.phone || '',
    organisation: record.organization || record.organisation || '—',
    organization: record.organization || record.organisation || '—',
    country: record.country || 'India',
    regId: record.regId || '',
    category: record.category || 'General Conclave Inquiry',
    dept: record.dept || 'Secretariat Helpdesk',
    subject: record.subject || 'Conclave General Query',
    message: record.message || '',
    urgent: !!record.urgent,
    status: 'received',
    flagged: flags[localRef] !== undefined ? flags[localRef] : false,
    submittedAt: new Date().toISOString(),
    source: 'live',
  };

  saveLocalQuery(queryRecord);
  if (!cache.queries.some((q) => q.id === localRef)) {
    cache.queries.unshift(queryRecord);
  }
  notify();

  try {
    const firestoreRef = await saveWithRef('query', record);
    if (firestoreRef && firestoreRef !== localRef) {
      queryRecord.id = firestoreRef;
      queryRecord.ref = firestoreRef;
      saveLocalQuery(queryRecord);
      notify();
      return firestoreRef;
    }
  } catch (err) {
    console.warn('Firestore write noted; query preserved in local registry:', err);
  }

  return localRef;
}

/* Submit an application for an upcoming conclave event / pitch / deal-room slot */
export async function submitEventApplication(record) {
  return submitRegistration('event_app', {
    ...record,
    detail: `Event Application: ${record.eventName || 'Conclave Session'} · ${record.track || 'Founder Showcase'}`,
  });
}

/* Record a sign-in, sign-up or sign-out (real accounts only; never blocks the sign-in itself). */
export function recordLogin({ action, name, method }) {
  const u = auth.currentUser;
  if (!u || u.isAnonymous) return;
  addDoc(collection(db, 'logins'), { uid: u.uid, action, name: name || '', email: u.email, method, at: serverTimestamp() })
    .catch(() => { /* the log is best-effort */ });
}

/* A visitor's own record by reference (the rules only allow their own). Null if not found or not theirs. */
export async function findMyRecord(ref) {
  const id = ref.trim().toUpperCase();
  const localQueries = getLocalQueries();
  const foundLocal = localQueries.find((q) => q.id === id || q.ref === id);
  if (foundLocal) {
    const statusOverrides = getLocalQueryStatuses();
    return {
      ...foundLocal,
      status: statusOverrides[id] || foundLocal.status || 'received',
    };
  }

  const coll = id.includes('-QRY-') ? 'queries' : 'registrations';
  try {
    await ensureSignedIn();
    const snap = await getDoc(doc(db, coll, id));
    return snap.exists() ? toRecord(snap, coll) : null;
  } catch {
    return null;
  }
}

/* The signed-in visitor's registrations, live. Returns an unsubscribe function. */
export function watchMyRegistrations(uid, cb) {
  if (!uid) { cb([]); return () => { }; }
  return onSnapshot(
    query(collection(db, 'registrations'), where('uid', '==', uid)),
    (s) => cb(s.docs.map((d) => toRecord(d, 'registrations'))),
    () => cb([]),
  );
}

/* Approved startups for the public directory, live. */
export function watchStartupDirectory(cb) {
  return onSnapshot(
    collection(db, 'startupDirectory'),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => cb([]),
  );
}

/* Startups belonging specifically to the signed-in user (filtered by UID / linked account email) */
export function watchMyStartups(user, cb) {
  if (!user || (!user.uid && !user.email)) {
    cb([]);
    return () => {};
  }

  const unsubs = [];
  const map = new Map();

  const emit = () => {
    const list = Array.from(map.values()).filter((r) => r.type === 'startup');
    cb(list);
  };

  if (user.uid) {
    unsubs.push(
      onSnapshot(
        query(collection(db, 'registrations'), where('uid', '==', user.uid)),
        (snap) => {
          snap.docs.forEach((d) => {
            const rec = toRecord(d, 'registrations');
            if (rec.type === 'startup') map.set(d.id, rec);
          });
          emit();
        },
        () => emit()
      )
    );
  }

  if (user.email) {
    unsubs.push(
      onSnapshot(
        query(collection(db, 'registrations'), where('accountEmail', '==', user.email)),
        (snap) => {
          snap.docs.forEach((d) => {
            const rec = toRecord(d, 'registrations');
            if (rec.type === 'startup') map.set(d.id, rec);
          });
          emit();
        },
        () => emit()
      )
    );
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

/* Event applications belonging specifically to the signed-in user */
export function watchMyEventApplications(user, cb) {
  if (!user || (!user.uid && !user.email)) {
    cb([]);
    return () => {};
  }

  const unsubs = [];
  const map = new Map();

  const emit = () => {
    const list = Array.from(map.values()).filter((r) => r.type === 'event_app');
    cb(list);
  };

  if (user.uid) {
    unsubs.push(
      onSnapshot(
        query(collection(db, 'registrations'), where('uid', '==', user.uid)),
        (snap) => {
          snap.docs.forEach((d) => {
            const rec = toRecord(d, 'registrations');
            if (rec.type === 'event_app') map.set(d.id, rec);
          });
          emit();
        },
        () => emit()
      )
    );
  }

  if (user.email) {
    unsubs.push(
      onSnapshot(
        query(collection(db, 'registrations'), where('accountEmail', '==', user.email)),
        (snap) => {
          snap.docs.forEach((d) => {
            const rec = toRecord(d, 'registrations');
            if (rec.type === 'event_app') map.set(d.id, rec);
          });
          emit();
        },
        () => emit()
      )
    );
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

/* AIMF accreditations belonging specifically to the signed-in user (filtered by UID / linked account email) */
export function watchMyAimfAccreditations(user, cb) {
  if (!user || (!user.uid && !user.email)) {
    cb([]);
    return () => {};
  }

  const unsubs = [];
  const map = new Map();

  const emit = () => {
    const list = Array.from(map.values()).filter((r) => r.type === 'aimf');
    cb(list);
  };

  if (user.uid) {
    unsubs.push(
      onSnapshot(
        query(collection(db, 'registrations'), where('uid', '==', user.uid)),
        (snap) => {
          snap.docs.forEach((d) => {
            const rec = toRecord(d, 'registrations');
            if (rec.type === 'aimf') map.set(d.id, rec);
          });
          emit();
        },
        () => emit()
      )
    );
  }

  if (user.email) {
    unsubs.push(
      onSnapshot(
        query(collection(db, 'registrations'), where('accountEmail', '==', user.email)),
        (snap) => {
          snap.docs.forEach((d) => {
            const rec = toRecord(d, 'registrations');
            if (rec.type === 'aimf') map.set(d.id, rec);
          });
          emit();
        },
        () => emit()
      )
    );
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

/* ── Reading (used by the admin panel) ─────────────── */

// Local flag overrides so review flags persist instantly even for sample records
const LOCAL_FLAGS_KEY = 'babc_admin_flags';
function getLocalFlags() {
  try { return JSON.parse(localStorage.getItem(LOCAL_FLAGS_KEY) || '{}'); } catch { return {}; }
}
function setLocalFlag(id, flagged) {
  try {
    const flags = getLocalFlags();
    if (flagged) flags[id] = true;
    else delete flags[id];
    localStorage.setItem(LOCAL_FLAGS_KEY, JSON.stringify(flags));
  } catch { /* storage unavailable */ }
}

// Local query persistence & status overrides so queries immediately sync to admin
const LOCAL_QUERIES_KEY = 'babc_submitted_queries';
const LOCAL_QUERY_STATUS_KEY = 'babc_query_status_overrides';

export function getLocalQueries() {
  try { return JSON.parse(localStorage.getItem(LOCAL_QUERIES_KEY) || '[]'); } catch { return []; }
}
function saveLocalQuery(q) {
  try {
    const list = getLocalQueries();
    const idx = list.findIndex((item) => item.id === q.id || item.ref === q.ref);
    if (idx >= 0) list[idx] = { ...list[idx], ...q };
    else list.unshift(q);
    localStorage.setItem(LOCAL_QUERIES_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}
function getLocalQueryStatuses() {
  try { return JSON.parse(localStorage.getItem(LOCAL_QUERY_STATUS_KEY) || '{}'); } catch { return {}; }
}
function setLocalQueryStatus(id, status) {
  try {
    const s = getLocalQueryStatuses();
    s[id] = status;
    localStorage.setItem(LOCAL_QUERY_STATUS_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

// Local Terms & Conditions consent log
const LOCAL_CONSENTS_KEY = 'babc_terms_consent_log';

export function getLocalConsents() {
  try { return JSON.parse(localStorage.getItem(LOCAL_CONSENTS_KEY) || '[]'); } catch { return []; }
}
function saveLocalConsent(c) {
  try {
    const list = getLocalConsents();
    const idx = list.findIndex((item) => item.id === c.id);
    if (idx >= 0) list[idx] = c;
    else list.unshift(c);
    localStorage.setItem(LOCAL_CONSENTS_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

const iso = (t) => (t?.toDate ? t.toDate().toISOString() : t || null);

function toRecord(d, coll) {
  const r = d.data();
  const flags = getLocalFlags();
  const isFlagged = flags[d.id] !== undefined ? flags[d.id] : !!r.flagged;
  // a just-written record has no server time yet; show it as "now" until it arrives
  const submittedAt = iso(r.submittedAt) || new Date().toISOString();
  if (coll === 'queries') {
    return {
      ...r,
      id: d.id,
      ref: d.id,
      type: 'query',
      name: r.fullName || r.name || 'Anonymous Inquirer',
      fullName: r.fullName || r.name || '',
      email: r.email || '',
      phone: r.phone || '',
      organisation: r.organization || r.organisation || '—',
      organization: r.organization || r.organisation || '—',
      country: r.country || 'India',
      regId: r.regId || '',
      category: r.category || 'General Conclave Inquiry',
      dept: r.dept || 'Secretariat Helpdesk',
      subject: r.subject || 'Conclave General Query',
      message: r.message || '',
      urgent: !!r.urgent,
      flagged: isFlagged,
      flaggedAt: iso(r.flaggedAt),
      status: r.status || 'received',
      submittedAt,
      decidedAt: iso(r.decidedAt),
      source: 'live',
    };
  }
  return {
    ...r,
    id: d.id,
    ref: d.id,
    flagged: isFlagged,
    flaggedAt: iso(r.flaggedAt),
    submittedAt,
    decidedAt: iso(r.decidedAt),
    source: 'live',
  };
}

// Live copies of the three collections, kept while the admin panel is subscribed
const cache = { registrations: [], queries: [], logins: [] };
const listeners = new Set();
let unsubs = [];
let lastError = null;
const notify = () => listeners.forEach((cb) => cb());

function startListening() {
  lastError = null;
  const onError = (e) => { lastError = e.code || e.message; notify(); };
  unsubs = [
    onSnapshot(collection(db, 'registrations'), (s) => { cache.registrations = s.docs.map((d) => toRecord(d, 'registrations')); notify(); }, onError),
    onSnapshot(collection(db, 'queries'), (s) => { cache.queries = s.docs.map((d) => toRecord(d, 'queries')); notify(); }, onError),
    onSnapshot(collection(db, 'logins'), (s) => {
      cache.logins = s.docs.map((d) => ({ ...d.data(), at: iso(d.data().at) || new Date().toISOString(), source: 'live' }));
      notify();
    }, onError),
  ];
}

/* Calls `cb` whenever the data changes. The first subscriber starts the live listeners. */
export function subscribe(cb) {
  listeners.add(cb);
  if (listeners.size === 1) startListening();
  return () => {
    listeners.delete(cb);
    if (!listeners.size) { unsubs.forEach((u) => u()); unsubs = []; }
  };
}

/* null, or why the admin panel can't read the data (e.g. 'permission-denied') */
export const loadError = () => lastError;

export function listRegistrations({ includeSamples = false } = {}) {
  const flags = getLocalFlags();
  const live = [...cache.registrations, ...cache.queries].map((r) => ({
    ...r,
    status: TYPES[r.type]?.approvable ? (STATUS[r.status] ? r.status : 'pending') : (r.status || 'received'),
    flagged: flags[r.id] !== undefined ? flags[r.id] : !!r.flagged,
    note: r.note || '',
  }));
  const all = includeSamples ? [...live, ...sampleRegistrations()] : live;
  return all.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

/* Dedicated list of registered users (delegates, startups, collaborations, panel applicants) */
export function listRegisteredUsers({ includeSamples = false } = {}) {
  const flags = getLocalFlags();
  const liveUsers = cache.registrations
    .filter((r) => r.type !== 'query')
    .map((r) => ({
      ...r,
      ref: r.id,
      flagged: flags[r.id] !== undefined ? flags[r.id] : !!r.flagged,
      status: STATUS[r.status] ? r.status : 'pending',
      note: r.note || '',
    }));
  const all = includeSamples
    ? [...liveUsers, ...sampleRegistrations().filter((r) => r.type !== 'query')]
    : liveUsers;
  return all.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

/* Dedicated list of helpdesk queries */
export function listQueries({ includeSamples = false } = {}) {
  const flags = getLocalFlags();
  const localList = getLocalQueries();
  const statusOverrides = getLocalQueryStatuses();

  const map = new Map();
  cache.queries.forEach((q) => map.set(q.id, q));
  localList.forEach((q) => {
    if (!map.has(q.id)) map.set(q.id, q);
    else map.set(q.id, { ...map.get(q.id), ...q });
  });

  const live = Array.from(map.values()).map((q) => ({
    ...q,
    ref: q.id,
    flagged: flags[q.id] !== undefined ? flags[q.id] : !!q.flagged,
    status: statusOverrides[q.id] || q.status || 'received',
    note: q.note || '',
  }));
  const all = includeSamples ? [...live, ...sampleQueries()] : live;
  return all.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function listLogins({ includeSamples = false } = {}) {
  const all = includeSamples ? [...cache.logins, ...sampleLogins()] : cache.logins;
  return [...all].sort((a, b) => new Date(b.at) - new Date(a.at));
}

/* ── Terms & Conditions Consent Tracking ────────────────────── */

export async function recordTermsConsent({
  uid,
  userName,
  userEmail,
  decision, // 'agreed' | 'disagreed'
  portal = 'post-login',
  portalTitle,
  note = '',
}) {
  const counterKey = 'babc_counter_TNC';
  let nextNum = 1;
  try {
    const c = parseInt(localStorage.getItem(counterKey) || '8', 10);
    nextNum = c + 1;
    localStorage.setItem(counterKey, String(nextNum));
  } catch { /* storage unavailable */ }
  const id = `BMF.BC-TNC-${String(nextNum).padStart(5, '0')}`;

  const record = {
    id,
    uid: uid || auth.currentUser?.uid || 'anonymous',
    userName: userName || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Conclave Delegate',
    userEmail: userEmail || auth.currentUser?.email || '—',
    decision,
    portal,
    portalTitle: portalTitle || (portal === 'post-login' ? 'Post-Login Account Onboarding' : `Portal Terms (${portal})`),
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    complianceDoc: 'Conclave Protocol & CEPA v2.6',
    note: note || '',
    source: 'live',
  };

  saveLocalConsent(record);
  notify();

  try {
    await addDoc(collection(db, 'consents'), {
      ...record,
      at: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Consent recorded locally; Firestore sync note:', err);
  }

  return record;
}

export function listTermsConsents({ includeSamples = false } = {}) {
  const localList = getLocalConsents();
  const all = includeSamples ? [...localList, ...sampleTermsConsents()] : localList;
  return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/* Toggle flag for review across any record (registration, user, or query) */
export async function toggleFlag(id, coll = 'registrations') {
  const flags = getLocalFlags();
  const current = flags[id] !== undefined ? flags[id] : false;
  const next = !current;
  setLocalFlag(id, next);

  // Update in-memory cache immediately
  const targetColl = coll === 'queries' || id.includes('-QRY-') ? 'queries' : 'registrations';
  const list = targetColl === 'queries' ? cache.queries : cache.registrations;
  const item = list.find((x) => x.id === id);
  if (item) {
    item.flagged = next;
    item.flaggedAt = next ? new Date().toISOString() : null;
  }
  notify();

  if (id.startsWith('SAMPLE-')) return next;

  try {
    await updateDoc(doc(db, targetColl, id), {
      flagged: next,
      flaggedAt: next ? serverTimestamp() : null,
      flaggedBy: auth.currentUser?.email || auth.currentUser?.uid || 'admin',
    });
  } catch (err) {
    console.warn('Flag status updated locally; Firestore error:', err);
  }
  return next;
}

/* Update status of a helpdesk query */
export async function updateQueryStatus(id, status, note = '') {
  setLocalQueryStatus(id, status);
  const localList = getLocalQueries();
  const localItem = localList.find((x) => x.id === id);
  if (localItem) {
    localItem.status = status;
    if (note) localItem.note = note;
    saveLocalQuery(localItem);
  }

  const item = cache.queries.find((x) => x.id === id);
  if (item) {
    item.status = status;
    if (note) item.note = note;
    item.decidedAt = new Date().toISOString();
  }
  notify();

  if (id.startsWith('SAMPLE-')) return;
  try {
    await updateDoc(doc(db, 'queries', id), {
      status,
      note,
      decidedAt: serverTimestamp(),
      decidedBy: auth.currentUser?.email || auth.currentUser?.uid || 'admin',
    });
  } catch (err) {
    console.warn('Query status updated locally; Firestore error:', err);
  }
}

/* Approve, decline or reset a registration. Approving a startup lists it on the public Startups page. */
export async function decide(id, status, note = '') {
  const r = cache.registrations.find((x) => x.id === id);
  if (!r) return; // sample records are not stored anywhere
  await updateDoc(doc(db, 'registrations', id), { status, note, decidedAt: serverTimestamp(), decidedBy: auth.currentUser?.uid || 'admin' });
  if (status !== r.status && (status === 'approved' || status === 'declined')) {
    sendEmail(r.email, decisionEmail({ ...r, ref: id, status, note }));
  }
  if (r.type !== 'startup') return;
  const card = doc(db, 'startupDirectory', id);
  if (status === 'approved') {
    const p = r.profile || {};
    const site = p.website && !/^https?:\/\//i.test(p.website) ? `https://${p.website}` : p.website || '';
    await setDoc(card, {
      name: p.brand || r.organisation || r.name, sectors: p.sectors || [], stage: p.stage || '',
      website: site, pitch: p.pitch || '', ref: id, approvedAt: serverTimestamp(),
    });
  } else {
    await deleteDoc(card);
  }
}

/* Permanently delete a registration or inquiry (admins only). A deleted startup also leaves the public directory. */
export async function deleteRecord(id) {
  const r = cache.registrations.find((x) => x.id === id);
  if (r) {
    await deleteDoc(doc(db, 'registrations', id));
    if (r.type === 'startup') await deleteDoc(doc(db, 'startupDirectory', id));
    return;
  }
  if (cache.queries.some((q) => q.id === id)) await deleteDoc(doc(db, 'queries', id));
}

// keep in step with the list in isAdmin() in firestore.rules, which is what actually grants access
const ADMIN_EMAILS = ['aryamansaxena04@gmail.com', 'surishri03@gmail.com', 'intouch.vijay@gmail.com', 'amitabh2227@gmail.com'];

/* Is this signed-in account an admin? (listed above, or an admins/{email} document added in the Firebase console) */
export async function isAdminAccount(user) {
  if (!user?.email) return false;
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  try {
    return (await getDoc(doc(db, 'admins', user.email.toLowerCase()))).exists();
  } catch {
    return false;
  }
}

/* ── Sample data (clearly marked, for demonstrating the panel) ─ */

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const FIRST = ['Aarav', 'Layla', 'Rohan', 'Omar', 'Ishita', 'Yousef', 'Meera', 'Khalid', 'Ananya', 'Noura', 'Vikram', 'Huda', 'Kabir', 'Salma', 'Arjun', 'Rania'];
const LAST = ['Sharma', 'Al Mansoori', 'Iyer', 'Haddad', 'Kapoor', 'Al Harthy', 'Nair', 'Farouk', 'Mehta', 'Saleh', 'Rao', 'Qasim'];
const ORGS = ['Sample Holdings', 'Demo Ventures', 'Example Trading Co.', 'Placeholder Energy', 'Test Logistics', 'Mock Health', 'Sample Agritech', 'Demo Capital'];
const COUNTRIES = ['India', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Egypt', 'Bahrain', 'Kuwait', 'Jordan', 'Morocco'];
const SECTORS = ['Clean Energy', 'Infrastructure', 'Technology & AI', 'Food & Agri', 'Healthcare', 'Tourism', 'Defence'];
const DETAILS = {
  delegate: ['Corporate Delegate', 'Sovereign Wealth / Investor', 'Exhibitor Representative', 'Government Official'],
  startup: ['Startup showcase'],
  collaboration: ['Country pavilion', 'Industry co-host', 'Deal-room sponsor', 'Knowledge partner'],
  panel: ['Advisory & Expert Panel', 'Investor Panel', 'Startup Panel', 'Strategic Partners'],
};
const CODES = { delegate: 'DGO', startup: 'SEO', collaboration: 'CBC', panel: 'PNL' };

let sampleCache = null;
function sampleRegistrations() {
  if (sampleCache) return sampleCache;
  const rnd = seeded(2026);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const now = Date.now();
  const weights = ['delegate', 'delegate', 'delegate', 'delegate', 'startup', 'startup', 'collaboration', 'panel'];
  const counters = {};
  sampleCache = Array.from({ length: 84 }, () => {
    const type = pick(weights);
    counters[type] = (counters[type] || 0) + 1;
    const first = pick(FIRST);
    const last = pick(LAST);
    const ageDays = Math.pow(rnd(), 1.4) * 20;
    const r = rnd();
    const status = ageDays < 3 ? 'pending' : r < 0.62 ? 'approved' : r < 0.8 ? 'declined' : 'pending';
    return {
      id: `SAMPLE-${CODES[type]}-${String(counters[type]).padStart(4, '0')}`,
      type,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@example.com',
      organisation: pick(ORGS),
      country: pick(COUNTRIES),
      detail: pick(DETAILS[type]),
      sector: pick(SECTORS),
      submittedAt: new Date(now - ageDays * 86400000).toISOString(),
      status,
      decidedAt: status === 'pending' ? null : new Date(now - ageDays * 86400000 * 0.6).toISOString(),
      source: 'sample',
    };
  });
  return sampleCache;
}

let queryCache = null;
export function sampleQueries() {
  if (queryCache) return queryCache;
  const rnd = seeded(77);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const now = Date.now();
  const sampleTopics = [
    { cat: 'Startup Showcase & Pavilion', dept: 'Startups & Innovation Desk', sub: 'Startup Pavilion allocation and presentation schedule' },
    { cat: 'B2B Matchmaking & Deal Rooms', dept: 'Bilateral Trade Directorate', sub: 'Private bilateral meeting slot with Saudi delegation' },
    { cat: 'Exhibition Stalls & Pavilions', dept: 'Exhibition & Space Operations', sub: 'Custom stall fabrication and AV rental options' },
    { cat: 'Diplomatic Protocol & Visas', dept: 'IACCIA Protocol Office', sub: 'Urgent Visa Support Letter for ministerial delegation' },
    { cat: 'Programme & Keynotes', dept: 'Summit Content & Speaker Bureau', sub: 'Plenary keynote timing and speaker bio update' },
    { cat: 'Invoices, GST & Accreditations', dept: 'Finance & Accounts Secretariat', sub: 'GST invoice request and corporate pass receipt' },
    { cat: 'General Conclave Inquiry', dept: 'General Information Bureau', sub: 'Palash Hall access and Yashobhoomi parking badges' },
  ];
  const statuses = ['received', 'in-progress', 'answered', 'closed'];

  queryCache = Array.from({ length: 32 }, (_, i) => {
    const topic = pick(sampleTopics);
    const first = pick(FIRST);
    const last = pick(LAST);
    const ageDays = Math.pow(rnd(), 1.3) * 12;
    const isUrgent = rnd() < 0.28;
    const status = pick(statuses);
    const ref = `SAMPLE-QRY-${String(i + 1).padStart(4, '0')}`;
    return {
      id: ref,
      ref,
      type: 'query',
      name: `${first} ${last}`,
      fullName: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@example.com',
      phone: `+91 98${Math.floor(10000000 + rnd() * 90000000)}`,
      organisation: pick(ORGS),
      organization: pick(ORGS),
      country: pick(COUNTRIES),
      category: topic.cat,
      dept: topic.dept,
      subject: topic.sub,
      message: `Inquiry regarding ${topic.sub.toLowerCase()}. We need clarification on participation guidelines, pass limits, and schedule for the upcoming conclave at Yashobhoomi.`,
      urgent: isUrgent,
      flagged: isUrgent && rnd() < 0.6,
      status,
      submittedAt: new Date(now - ageDays * 86400000).toISOString(),
      decidedAt: status === 'answered' || status === 'closed' ? new Date(now - ageDays * 86400000 * 0.4).toISOString() : null,
      source: 'sample',
    };
  });
  return queryCache;
}

let consentsCache = null;
export function sampleTermsConsents() {
  if (consentsCache) return consentsCache;
  const now = Date.now();
  consentsCache = [
    {
      id: 'BMF.BC-TNC-00001',
      uid: 'sample-usr-1',
      userName: 'Tariq Al-Maktoum',
      userEmail: 'tariq.maktoum@dubaiinvest.ae',
      decision: 'agreed',
      portal: 'post-login',
      portalTitle: 'Post-Login Account Activation',
      timestamp: new Date(now - 18 * 60 * 1000).toISOString(),
      userAgent: 'Chrome 128.0 (Windows 11)',
      complianceDoc: 'Conclave Protocol & CEPA v2.6',
      note: 'Verified agreement upon Google authentication.',
      source: 'sample',
    },
    {
      id: 'BMF.BC-TNC-00002',
      uid: 'sample-usr-2',
      userName: 'Ananya Deshmukh',
      userEmail: 'ananya.d@finvedic.in',
      decision: 'agreed',
      portal: 'startup',
      portalTitle: 'Startup Showcase Pavilion (#startup)',
      timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
      userAgent: 'Safari 17.5 (macOS)',
      complianceDoc: 'Innovation Directorate Terms & IP Non-Assertion',
      note: 'Agreed to ₹5,000 + GST 2-year accreditation fee rules.',
      source: 'sample',
    },
    {
      id: 'BMF.BC-TNC-00003',
      uid: 'sample-usr-3',
      userName: 'Faisal Bin Khalid',
      userEmail: 'khalid@riyadhcap.sa',
      decision: 'agreed',
      portal: 'register',
      portalTitle: 'Delegate & Event Pass Accreditation (#register)',
      timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
      userAgent: 'Edge 127.0 (Windows 11)',
      complianceDoc: 'Diplomatic Protection & Sovereign Pass Rules',
      note: 'Requested ministerial deal room access credentials.',
      source: 'sample',
    },
    {
      id: 'BMF.BC-TNC-00004',
      uid: 'sample-usr-4',
      userName: 'Vikramaditya Oberoi',
      userEmail: 'v.oberoi@globaltech.sg',
      decision: 'disagreed',
      portal: 'post-login',
      portalTitle: 'Post-Login Account Activation',
      timestamp: new Date(now - 3.5 * 3600 * 1000).toISOString(),
      userAgent: 'Safari 17.4 (iPhone iOS 17.5)',
      complianceDoc: 'Conclave Protocol & CEPA v2.6',
      note: 'Declined closed-door sovereign recording restrictions.',
      source: 'sample',
    },
    {
      id: 'BMF.BC-TNC-00005',
      uid: 'sample-usr-5',
      userName: 'Noura Al-Sayed',
      userEmail: 'noura@abudhabichamber.ae',
      decision: 'agreed',
      portal: 'collaborate',
      portalTitle: 'Summit Collaboration & Directorate (#collaborate)',
      timestamp: new Date(now - 5 * 3600 * 1000).toISOString(),
      userAgent: 'Chrome 128.0 (Windows 10)',
      complianceDoc: 'Institutional Bilateral Agreement Framework',
      note: 'Institutional MoU signing vetted with IACCIA.',
      source: 'sample',
    },
    {
      id: 'BMF.BC-TNC-00006',
      uid: 'sample-usr-6',
      userName: 'Rohan Mehra',
      userEmail: 'rohan.mehra@solarenergy.in',
      decision: 'agreed',
      portal: 'exhibition',
      portalTitle: 'Exhibition Spaceworks Policy (#exhibition)',
      timestamp: new Date(now - 8 * 3600 * 1000).toISOString(),
      userAgent: 'Firefox 128.0 (Linux)',
      complianceDoc: 'Yashobhoomi IICC Class-A Fire & Operations Policy',
      note: 'Adhered to 3.5m booth height restrictions.',
      source: 'sample',
    },
    {
      id: 'BMF.BC-TNC-00007',
      uid: 'sample-usr-7',
      userName: 'Fatima Al-Zahra',
      userEmail: 'fatima@qatarfund.qa',
      decision: 'agreed',
      portal: 'post-login',
      portalTitle: 'Post-Login Account Activation',
      timestamp: new Date(now - 14 * 3600 * 1000).toISOString(),
      userAgent: 'Chrome 127.0 (macOS)',
      complianceDoc: 'Conclave Protocol & CEPA v2.6',
      note: 'Sovereign Observer pass consent confirmed.',
      source: 'sample',
    },
    {
      id: 'BMF.BC-TNC-00008',
      uid: 'sample-usr-8',
      userName: 'Suresh Nambiar',
      userEmail: 'snambiar@keralafintech.org',
      decision: 'disagreed',
      portal: 'startup',
      portalTitle: 'Startup Showcase Pavilion (#startup)',
      timestamp: new Date(now - 20 * 3600 * 1000).toISOString(),
      userAgent: 'Chrome 126.0 (Windows 10)',
      complianceDoc: 'Innovation Directorate Terms & IP Non-Assertion',
      note: 'Disagreed with accreditation realization clause.',
      source: 'sample',
    },
  ];
  return consentsCache;
}
