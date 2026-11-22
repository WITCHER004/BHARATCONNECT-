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

/* ── Registration types ─────────────────────────────── */

export const TYPES = {
  delegate: { label: 'Delegate pass', short: 'Delegates', color: '#5B8DEF', approvable: true },
  startup: { label: 'Startup showcase', short: 'Startups', color: '#D9604A', approvable: true },
  collaboration: { label: 'Collaboration', short: 'Collaborations', color: '#2FA58C', approvable: true },
  panel: { label: 'Panel application', short: 'Panels', color: '#B98A3A', approvable: true },
  query: { label: 'Inquiry', short: 'Inquiries', color: '#8A9E97', approvable: false },
};

export const TYPE_ORDER = ['delegate', 'startup', 'collaboration', 'panel'];

export const STATUS = {
  pending: { label: 'Pending', color: '#FAB219' },
  approved: { label: 'Approved', color: '#0CA30C' },
  declined: { label: 'Declined', color: '#D03B3B' },
};

const REF_CODES = { delegate: 'DGO', startup: 'SEO', collaboration: 'CBC', query: 'QRY' };

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
    const ref = `BMF.BC-${code}-${String(n).padStart(5, '0')}`;
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
export function submitRegistration(type, record) {
  return saveWithRef(type, { ...record, accountEmail: auth.currentUser?.email || '' });
}

/* Save a helpdesk inquiry: { fullName, email, phone, organization, country, regId, category, dept, subject, message, urgent } */
export function submitQuery(record) {
  return saveWithRef('query', record);
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
  const live = cache.queries.map((q) => ({
    ...q,
    ref: q.id,
    flagged: flags[q.id] !== undefined ? flags[q.id] : !!q.flagged,
    status: q.status || 'received',
    note: q.note || '',
  }));
  const all = includeSamples ? [...live, ...sampleQueries()] : live;
  return all.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function listLogins({ includeSamples = false } = {}) {
  const all = includeSamples ? [...cache.logins, ...sampleLogins()] : cache.logins;
  return [...all].sort((a, b) => new Date(b.at) - new Date(a.at));
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
  const item = cache.queries.find((x) => x.id === id);
  if (item) {
    item.status = status;
    if (note) item.note = note;
    item.decidedAt = new Date().toISOString();
    notify();
  }
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

// keep in step with the list in isAdmin() in firestore.rules, which is what actually grants access
const ADMIN_EMAILS = ['aryamansaxena04@gmail.com'];

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
