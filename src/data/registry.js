/*
  Registry: the one place the site and the admin panel share data.

  The site writes sign-ins and registrations through this file, and the admin panel reads
  them (and records approve / decline decisions) through it too.

  TODAY there is no server, so everything lives in this browser's localStorage. That means the
  admin panel sees the activity of the browser it is opened in, not every visitor. To make it
  site-wide, connect a database (for example Supabase or Firebase) and change only the
  functions in the "storage" section below: readAll, append, readDecisions, writeDecision.
  Nothing else in the site or the admin panel needs to change.

  Older forms already keep their own history (startups, collaborations, inquiries); those are
  read through the adapters below so nothing submitted before this file existed is lost.
*/

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

/* ── Storage (swap these four for a database) ──────── */

const KEYS = {
  registrations: 'bc-registry-registrations',
  logins: 'bc-registry-logins',
  decisions: 'bc-admin-decisions',
};
const LEGACY = {
  startups: 'bc-startup-history',
  collaborations: 'bc-collaboration-history',
  queries: 'bc-queries',
};
const CHANGE_EVENT = 'bc-registry-change';

function readAll(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function append(key, item, cap = 2000) {
  try {
    const list = readAll(key);
    list.unshift(item);
    localStorage.setItem(key, JSON.stringify(list.slice(0, cap)));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch { /* storage unavailable */ }
}

function readDecisions() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.decisions) || '{}') || {};
  } catch {
    return {};
  }
}

function writeDecision(id, decision) {
  try {
    const all = readDecisions();
    if (decision) all[id] = decision;
    else delete all[id];
    localStorage.setItem(KEYS.decisions, JSON.stringify(all));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch { /* storage unavailable */ }
}

/* ── Writing (called by the site) ──────────────────── */

/*
  Record a registration. `type` is one of TYPES. Keep fields flat and short:
  { id, type, name, email, organisation, country, detail, sector }
*/
export function recordRegistration(entry) {
  append(KEYS.registrations, { ...entry, submittedAt: new Date().toISOString() });
}

/* Record a sign-in, sign-up or sign-out. */
export function recordLogin({ action, name, email, method }) {
  append(KEYS.logins, { action, name, email, method, at: new Date().toISOString() });
}

/* ── Reading (used by the admin panel) ─────────────── */

function fromLegacy() {
  const startups = readAll(LEGACY.startups).map((s) => ({
    id: s.id,
    type: 'startup',
    name: s.founderName || '',
    email: s.email || '',
    organisation: s.entityName || s.brandNames || '',
    country: 'India',
    detail: s.brandNames ? `Brand: ${s.brandNames}` : 'Startup showcase',
    payment: s.amount ? `₹${s.amount} · UTR ${s.utr || '—'}` : '',
    submittedAt: s.timestamp,
  }));
  const collabs = readAll(LEGACY.collaborations).map((c) => ({
    id: c.id,
    type: 'collaboration',
    name: c.liaisonName || '',
    email: c.email || '',
    organisation: c.orgName || '',
    country: c.country || '',
    detail: c.trackTitle || 'Collaboration',
    sector: c.orgType || '',
    submittedAt: c.createdAt,
  }));
  const queries = readAll(LEGACY.queries).map((q) => ({
    id: q.id,
    type: 'query',
    name: q.fullName || '',
    email: q.email || '',
    organisation: q.organization || '',
    country: q.country || '',
    detail: q.subject || q.category || 'Inquiry',
    submittedAt: q.timestamp || q.createdAt,
  }));
  return [...startups, ...collabs, ...queries];
}

export function listRegistrations({ includeSamples = false } = {}) {
  const decisions = readDecisions();
  const live = [...readAll(KEYS.registrations), ...fromLegacy()].map((r) => ({ ...r, source: 'live' }));
  const all = includeSamples ? [...live, ...sampleRegistrations()] : live;
  const seen = new Set();
  return all
    .filter((r) => r.id && r.submittedAt && !seen.has(r.id) && seen.add(r.id))
    .map((r) => {
      const d = decisions[r.id];
      return {
        ...r,
        status: TYPES[r.type]?.approvable ? (d?.status || (STATUS[r.status] ? r.status : 'pending')) : 'received',
        decidedAt: d?.at || r.decidedAt || null,
        note: d?.note || '',
      };
    })
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function listLogins({ includeSamples = false } = {}) {
  const live = readAll(KEYS.logins).map((l) => ({ ...l, source: 'live' }));
  const all = includeSamples ? [...live, ...sampleLogins()] : live;
  return all.sort((a, b) => new Date(b.at) - new Date(a.at));
}

export function decide(id, status, note = '') {
  writeDecision(id, status === 'pending' ? null : { status, note, at: new Date().toISOString() });
}

/* Calls `cb` whenever data changes, in this tab or another tab of the site. */
export function subscribe(cb) {
  const onStorage = (e) => {
    if (!e.key || Object.values(KEYS).includes(e.key) || Object.values(LEGACY).includes(e.key)) cb();
  };
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
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
  panel: ['Advisory Panel', 'Investor Panel', 'Expert Panel'],
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
