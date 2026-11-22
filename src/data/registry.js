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
  if (!uid) { cb([]); return () => {}; }
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

const iso = (t) => (t?.toDate ? t.toDate().toISOString() : t || null);

function toRecord(d, coll) {
  const r = d.data();
  // a just-written record has no server time yet; show it as "now" until it arrives
  const submittedAt = iso(r.submittedAt) || new Date().toISOString();
  if (coll === 'queries') {
    return {
      ...r, id: d.id, type: 'query', name: r.fullName || '', organisation: r.organization || '',
      detail: r.subject || r.category || 'Inquiry', submittedAt, decidedAt: iso(r.decidedAt), source: 'live',
    };
  }
  return { ...r, id: d.id, submittedAt, decidedAt: iso(r.decidedAt), source: 'live' };
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
  const live = [...cache.registrations, ...cache.queries].map((r) => ({
    ...r,
    status: TYPES[r.type]?.approvable ? (STATUS[r.status] ? r.status : 'pending') : 'received',
    note: r.note || '',
  }));
  const all = includeSamples ? [...live, ...sampleRegistrations()] : live;
  return all.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function listLogins({ includeSamples = false } = {}) {
  const all = includeSamples ? [...cache.logins, ...sampleLogins()] : cache.logins;
  return [...all].sort((a, b) => new Date(b.at) - new Date(a.at));
}

/* Approve, decline or reset a registration. Approving a startup lists it on the public Startups page. */
export async function decide(id, status, note = '') {
  const r = cache.registrations.find((x) => x.id === id);
  if (!r) return; // sample records are not stored anywhere
  await updateDoc(doc(db, 'registrations', id), { status, note, decidedAt: serverTimestamp(), decidedBy: auth.currentUser.uid });
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

let loginCache = null;
function sampleLogins() {
  if (loginCache) return loginCache;
  const rnd = seeded(18);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const now = Date.now();
  loginCache = Array.from({ length: 70 }, () => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const r = rnd();
    return {
      action: r < 0.2 ? 'sign-up' : r < 0.85 ? 'sign-in' : 'sign-out',
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@example.com',
      method: rnd() < 0.6 ? 'Google' : 'Email',
      at: new Date(now - Math.pow(rnd(), 1.3) * 14 * 86400000).toISOString(),
      source: 'sample',
    };
  });
  return loginCache;
}
