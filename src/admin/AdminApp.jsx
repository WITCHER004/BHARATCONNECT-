import { useCallback, useEffect, useState, Component } from 'react';
import {
  LayoutDashboard, ClipboardCheck, Users, LogIn, Search, ExternalLink, Lock, Check, X,
  Download, ArrowUpRight, Undo2, Database, LogOut, Activity, Menu, BellRing,
  HelpCircle, MessageSquare, Flag, Copy, AlertCircle, Mail, Phone, Building2, UserCheck, CheckCircle2,
  ShieldCheck, FileText, Trash2, Sparkles, Clock, Eye, EyeOff
} from 'lucide-react';
import { currentEvent } from '../data/events';
import { onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import AuthForm from '../auth/AuthForm';
import {
  listRegistrations, listRegisteredUsers, listQueries, listTermsConsents, listLogins, decide, toggleFlag, updateQueryStatus, deleteRecord,
  subscribe, loadError, isAdminAccount, TYPES, TYPE_ORDER, STATUS,
} from '../data/registry';
import {
  Counter, StatusBadge, TypeTag, Legend, DailyBars, Donut, StatusSplit, RankBars, Sparkline,
  timeAgo, lastNDays, sameDay, QUERY_STATUS
} from './charts';

/*
  Bharat Connect admin panel (admin.html), separate from the public site but reading the same
  data through src/data/registry.js.
*/
const SAMPLES_KEY = 'bc-admin-show-samples';
const SITE_URL = `${import.meta.env.BASE_URL}`;

const VIEWS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
  { id: 'aimf', label: 'AIMF Registrations', icon: Sparkles },
  { id: 'users', label: 'Registered Users', icon: Users },
  { id: 'queries', label: 'Query Desk', icon: HelpCircle },
  { id: 'terms', label: 'Terms & Conditions', icon: ShieldCheck },
  { id: 'registrations', label: 'All Registrations', icon: Database },
  { id: 'signins', label: 'Sign-ins', icon: LogIn },
];

/* ── data hook: re-reads whenever the site writes ──── */

function useRegistry(includeSamples, enabled) {
  const read = useCallback(() => ({
    registrations: listRegistrations({ includeSamples }),
    users: listRegisteredUsers({ includeSamples }),
    queries: listQueries({ includeSamples }),
    consents: listTermsConsents({ includeSamples }),
    logins: listLogins({ includeSamples }),
  }), [includeSamples]);
  const [data, setData] = useState(read);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    setData(read());
    if (!enabled) return undefined;
    return subscribe(() => {
      setData(read());
      setPulse((p) => p + 1);
    });
  }, [read, enabled]);
  return { ...data, pulse, error: enabled ? loadError() : null };
}

/* ── Gate ─────────────────────────────────────────────── */

function Gate({ state, email }) {
  const [error, setError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(e.code)) {
        setError(e.code === 'auth/popup-blocked' ? 'Allow pop-ups for this site, then try again.' : 'Sign-in failed. Please try again.');
      }
    }
  };

  const signInEmail = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
    } catch (e) {
      if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(e.code)) {
        setError('Incorrect email or password.');
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a minute and try again.');
      } else {
        setError(e.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ad-gate-bg">
      <div className="w-full max-w-sm surface-card rounded-2xl p-7 border border-line shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="h-10 px-2 rounded-xl bg-[#FCFBF9] ring-1 ring-gold-foil/40 flex items-center">
            <img src={`${import.meta.env.BASE_URL}brand/logo.png`} alt="Bharat Connect" className="h-7 w-auto" />
          </span>
          <span>
            <span className="block font-serif text-lg text-fg leading-5">Admin</span>
            <span className="block text-xs text-fg-3">Bharat Connect 2026</span>
          </span>
        </div>

        {state === 'checking' && (
          <div className="mt-7 flex items-center gap-3 text-sm text-fg-3" aria-busy="true">
            <span className="w-4 h-4 rounded-full border-2 border-gold-foil border-t-transparent animate-spin" />
            <span>Verifying administrative access…</span>
          </div>
        )}

        {state === 'signed-out' && (
          <>
            <p className="mt-5 text-sm text-fg-2 leading-relaxed">Sign in with an authorized secretariat administrator account.</p>
            <button
              type="button"
              onClick={signIn}
              className="mt-4 btn-primary h-11 w-full text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Lock className="w-4 h-4" strokeWidth={1.5} /> Sign in with Google
            </button>

            <div className="mt-5 pt-4 border-t border-line/60">
              <p className="text-xs text-fg-3 mb-3 text-center">Or sign in with email and password</p>
              <form onSubmit={signInEmail} className="space-y-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-surface-2 border border-line text-xs text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil/60"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    className="w-full h-10 pl-3 pr-9 rounded-xl bg-surface-2 border border-line text-xs text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-2.5 text-fg-3 hover:text-fg cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-10 rounded-xl bg-surface-3 hover:bg-surface-3/80 border border-line text-xs font-semibold text-fg flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  {busy ? 'Authenticating…' : 'Sign in with Password'}
                </button>
              </form>
            </div>
            {error && <p className="mt-3 text-xs text-[#E66767]" role="alert">{error}</p>}
          </>
        )}

        {state === 'not-admin' && (
          <>
            <p className="mt-7 text-sm text-fg leading-relaxed">
              <span className="font-mono text-xs break-all text-gold-text">{email}</span> is not registered on the admin list.
            </p>
            <p className="mt-2 text-xs text-fg-3 leading-relaxed">
              Please verify that you are signed in with the correct email, or ensure <span className="font-mono text-fg">{email}</span> is in the <span className="font-mono text-gold-text">admins</span> collection in Firestore.
            </p>
            <button onClick={() => signOut(auth)} className="mt-5 btn-secondary h-10 w-full text-sm cursor-pointer">
              Sign out &amp; switch account
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Error Boundary ───────────────────────────────────── */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Admin portal uncaught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-1 text-fg">
          <div className="w-full max-w-md surface-card rounded-2xl p-7 border border-[#D03B3B]/40 text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#D03B3B]/15 text-[#D03B3B] flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl text-fg font-medium">Admin Portal Notice</h2>
            <p className="mt-2 text-xs text-fg-3 leading-relaxed">
              An unexpected render issue occurred in the Secretariat portal.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 p-2.5 rounded-lg bg-surface-2 border border-line text-xs font-mono text-[#FAB219] text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-5 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = 'overview';
                  window.location.reload();
                }}
                className="btn-primary h-10 px-5 text-xs font-semibold cursor-pointer"
              >
                Reload Portal
              </button>
              <button
                type="button"
                onClick={() => signOut(auth).then(() => window.location.reload())}
                className="btn-secondary h-10 px-4 text-xs font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

class ViewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('View render error in', this.props.view, error, errorInfo);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.view !== this.props.view && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="surface-card rounded-2xl p-6 sm:p-8 border border-line text-center max-w-lg mx-auto my-6">
          <div className="w-10 h-10 rounded-xl bg-[#D03B3B]/15 border border-[#D03B3B]/30 flex items-center justify-center mx-auto text-[#D03B3B]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="mt-3 font-serif text-lg text-fg">Notice: {this.props.view}</h3>
          <p className="mt-1.5 text-xs text-fg-3 leading-relaxed">
            A display issue occurred while rendering this section.
          </p>
          <pre className="mt-3 p-3 rounded-lg bg-surface-2 text-left font-mono text-[11px] text-[#FAB219] overflow-x-auto whitespace-pre-wrap">
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 btn-primary h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            Retry Section
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Shell ────────────────────────────────────────────── */

function AdminAppInner() {
  const [access, setAccess] = useState({ state: 'checking', email: '' });
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    if (!u || u.isAnonymous) { setAccess({ state: 'signed-out', email: '' }); return; }
    setAccess({ state: 'checking', email: u.email });
    setAccess({ state: (await isAdminAccount(u)) ? 'admin' : 'not-admin', email: u.email });
  }), []);
  const unlocked = access.state === 'admin';
  const [view, setView] = useState(() => {
    const h = window.location.hash.replace('#', '');
    return VIEWS.some((v) => v.id === h) ? h : 'overview';
  });
  const [showSamples, setShowSamples] = useState(() => {
    try { return localStorage.getItem(SAMPLES_KEY) === '1'; } catch { return false; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { registrations, users = [], queries = [], consents = [], logins, pulse, error: dataError } = useRegistry(showSamples, unlocked);

  useEffect(() => {
    try { localStorage.setItem(SAMPLES_KEY, showSamples ? '1' : '0'); } catch { /* storage unavailable */ }
  }, [showSamples]);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      if (VIEWS.some((v) => v.id === h)) setView(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (id) => {
    setView(id);
    setMenuOpen(false);
    window.location.hash = id;
    window.scrollTo({ top: 0 });
  };

  const handleToggleFlag = async (id, coll) => {
    await toggleFlag(id, coll);
  };

  const handleUpdateQueryStatus = async (id, status, note) => {
    await updateQueryStatus(id, status, note);
  };

  if (!unlocked) return <Gate state={access.state} email={access.email} />;

  const approvable = (registrations || []).filter((r) => r && TYPES[r.type]?.approvable);
  const pending = approvable.filter((r) => r && r.status === 'pending');
  const aimfList = (registrations || []).filter((r) => r && r.type === 'aimf');
  const aimfPendingCount = aimfList.filter((r) => r && r.status === 'pending').length;
  const flaggedUsersCount = (users || []).filter((u) => u && u.flagged).length;
  const openQueriesCount = (queries || []).filter((q) => q && (q.status === 'received' || q.status === 'in-progress')).length;
  const flaggedQueriesCount = (queries || []).filter((q) => q && q.flagged).length;
  const totalFlaggedCount = flaggedUsersCount + flaggedQueriesCount;

  const liveCount = (registrations || []).filter((r) => r && r.source === 'live').length + (logins || []).filter((l) => l && l.source === 'live').length;
  const current = VIEWS.find((v) => v.id === view) || VIEWS[0];

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {VIEWS.map((v) => {
        const Icon = v.icon;
        const on = v.id === view;
        return (
          <button
            key={v.id}
            onClick={() => go(v.id)}
            aria-current={on ? 'page' : undefined}
            className={`ad-nav h-11 px-3 rounded-xl flex items-center gap-3 text-sm font-medium cursor-pointer transition-colors ${on ? 'is-on bg-surface-3 text-fg' : 'text-fg-2 hover:text-fg hover:bg-surface-2'}`}
          >
            <Icon className={`w-[18px] h-[18px] ${on ? 'text-gold-text' : 'text-fg-3'}`} strokeWidth={1.5} />
            {v.label}
            {v.id === 'approvals' && pending.length > 0 && (
              <span className="ml-auto min-w-6 h-6 px-1.5 rounded-full bg-[#FAB219]/15 text-[#FAB219] text-xs font-semibold flex items-center justify-center tabular-nums">
                {pending.length}
              </span>
            )}
            {v.id === 'aimf' && (
              <span
                className={`ml-auto min-w-6 h-6 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center tabular-nums ${
                  aimfPendingCount > 0 ? 'bg-[#FAB219]/15 text-[#FAB219]' : 'bg-surface-3 border border-line text-gold-text'
                }`}
                title={aimfPendingCount > 0 ? `${aimfPendingCount} pending review` : `${aimfList.length} AIMF accreditations`}
              >
                {aimfPendingCount > 0 ? aimfPendingCount : aimfList.length}
              </span>
            )}
            {v.id === 'users' && flaggedUsersCount > 0 && (
              <span className="ml-auto flex items-center gap-1 text-[11px] text-[#FAB219] bg-[#FAB219]/15 px-2 py-0.5 rounded-full font-mono">
                <Flag className="w-3 h-3 fill-[#FAB219]" /> {flaggedUsersCount}
              </span>
            )}
            {v.id === 'queries' && openQueriesCount > 0 && (
              <span className="ml-auto min-w-6 h-6 px-1.5 rounded-full bg-surface-3 border border-line text-gold-text text-xs font-semibold flex items-center justify-center tabular-nums">
                {openQueriesCount}
              </span>
            )}
            {v.id === 'terms' && (
              <span className="ml-auto min-w-6 h-6 px-1.5 rounded-full bg-surface-3 border border-line text-gold-text text-xs font-semibold flex items-center justify-center tabular-nums">
                {consents.length}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const sourceCard = (
    <div className="rounded-xl border border-line p-3.5 bg-surface-2/60">
      <p className="flex items-center gap-2 text-xs font-medium text-fg">
        <Database className="w-3.5 h-3.5 text-gold-text" strokeWidth={1.5} />
        Data source
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-fg-3">
        Firestore · {liveCount} record{liveCount === 1 ? '' : 's'} from every visitor, updating live.
      </p>
      <label className="mt-3 flex items-center justify-between gap-3 text-xs text-fg-2 cursor-pointer">
        Show sample data
        <button
          type="button"
          role="switch"
          aria-checked={showSamples}
          onClick={() => setShowSamples((v) => !v)}
          className={`ad-switch ${showSamples ? 'is-on' : ''}`}
        >
          <span />
        </button>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      {/* sidebar */}
      <aside className="hidden lg:flex flex-col gap-6 p-5 border-r border-line bg-surface-0 sticky top-0 h-screen">
        <Brand />
        {nav}
        <div className="mt-auto flex flex-col gap-3">
          {sourceCard}
          <button
            onClick={() => signOut(auth)}
            title={access.email}
            className="h-10 px-3 rounded-xl flex items-center gap-2.5 text-sm text-fg-3 hover:text-fg hover:bg-surface-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        {/* top bar */}
        <header className="sticky top-0 z-30 bg-surface-1/90 backdrop-blur-md border-b border-line">
          <div className="h-16 px-4 sm:px-8 flex items-center gap-3">
            <button onClick={() => setMenuOpen((o) => !o)} className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-fg-2 hover:bg-surface-3 cursor-pointer" aria-label="Menu" aria-expanded={menuOpen}>
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <h1 className="font-serif text-xl sm:text-2xl text-fg">{current.label}</h1>
            <span key={pulse} className={`ml-2 hidden sm:inline-flex items-center gap-2 text-xs text-fg-3 ${pulse ? 'ad-flash' : ''}`}>
              <span className="ad-live" aria-hidden="true" /> Live
            </span>

            {totalFlaggedCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-[#FAB219]/15 border border-[#FAB219]/30 text-[#FAB219] text-xs font-mono">
                <Flag className="w-3.5 h-3.5 fill-[#FAB219]" /> {totalFlaggedCount} Flagged for review
              </span>
            )}

            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="ml-auto btn-secondary h-9 px-3 text-sm">
              Open site <ExternalLink className="w-3.5 h-3.5 text-fg-3" strokeWidth={1.5} />
            </a>
          </div>
          {menuOpen && (
            <div className="lg:hidden px-4 pb-4 flex flex-col gap-3 animate-slide-up">
              {nav}
              {sourceCard}
            </div>
          )}
        </header>

        {dataError && (
          <div role="alert" className="mx-4 sm:mx-8 mt-5 rounded-xl border border-[#D03B3B]/40 bg-[#D03B3B]/[0.08] px-4 py-2.5 text-xs text-fg-2">
            {dataError === 'permission-denied'
              ? 'The database refused access. Check that the latest firestore.rules are deployed and that your email is in the admins collection.'
              : `The data could not be loaded (${dataError}). Check your connection and reload.`}
          </div>
        )}

        {showSamples && (
          <div className="mx-4 sm:mx-8 mt-5 rounded-xl border border-dashed border-[#FAB219]/40 bg-[#FAB219]/[0.06] px-4 py-2.5 text-xs text-fg-2">
            Sample records are shown alongside real ones and are marked <SampleTag />. Turn them off under Data source.
          </div>
        )}

        <main key={view} className="ad-view p-4 sm:p-8">
          <ViewErrorBoundary view={view}>
            {(view === 'overview' || !VIEWS.some((v) => v.id === view)) && (
              <Overview
                registrations={registrations}
                users={users}
                queries={queries}
                consents={consents}
                logins={logins}
                onOpen={setSelected}
                go={go}
              />
            )}
            {view === 'approvals' && (
              <Approvals
                registrations={approvable}
                onOpen={setSelected}
                onToggleFlag={handleToggleFlag}
              />
            )}
            {view === 'aimf' && (
              <AimfRegistrations
                registrations={aimfList}
                onOpen={setSelected}
                onToggleFlag={handleToggleFlag}
              />
            )}
            {view === 'users' && (
              <RegisteredUsers
                users={users}
                onOpen={setSelected}
                onToggleFlag={handleToggleFlag}
              />
            )}
            {view === 'queries' && (
              <QueryDesk
                queries={queries}
                onOpen={setSelected}
                onToggleFlag={handleToggleFlag}
                onUpdateStatus={handleUpdateQueryStatus}
              />
            )}
            {view === 'terms' && (
              <TermsConsentDesk
                consents={consents}
                onOpen={setSelected}
              />
            )}
            {view === 'registrations' && (
              <Registrations
                registrations={registrations}
                onOpen={setSelected}
                onToggleFlag={handleToggleFlag}
              />
            )}
            {view === 'signins' && (
              <SignIns
                logins={logins}
                registrations={registrations}
              />
            )}
          </ViewErrorBoundary>
        </main>
      </div>

      {selected && (
        <Drawer
          record={[...registrations, ...queries, ...users, ...consents].find((r) => r.id === selected)}
          onClose={() => setSelected(null)}
          onToggleFlag={handleToggleFlag}
          onUpdateStatus={handleUpdateQueryStatus}
        />
      )}
    </div>
  );
}

export default function AdminApp(props) {
  return (
    <ErrorBoundary>
      <AdminAppInner {...props} />
    </ErrorBoundary>
  );
}

function Brand() {
  return (
    <a href="#overview" className="flex items-center gap-3">
      <span className="h-10 px-2 rounded-xl bg-[#FCFBF9] ring-1 ring-gold-foil/40 flex items-center">
        <img src={`${import.meta.env.BASE_URL}brand/logo.png`} alt="Bharat Connect" className="h-7 w-auto" />
      </span>
      <span>
        <span className="block font-serif text-[15px] text-fg leading-5 tracking-[0.08em] uppercase">Admin</span>
        <span className="block text-[11px] text-gold-text font-mono">Bharat Connect 2026</span>
      </span>
    </a>
  );
}

function SampleTag() {
  return <span className="inline-block align-middle text-[10px] font-mono tracking-wider text-[#FAB219] border border-[#FAB219]/40 rounded px-1 py-px">SAMPLE</span>;
}

function Card({ title, action, children, className = '' }) {
  return (
    <section className={`ad-card rounded-2xl border border-line bg-surface-2 p-5 sm:p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-sm font-medium text-fg">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* ── Overview ─────────────────────────────────────────── */

export function Overview({ registrations = [], users = [], queries = [], consents = [], logins = [], onOpen, go }) {
  const approvable = (registrations || []).filter((r) => r && TYPES[r.type]?.approvable);
  const pending = approvable.filter((r) => r && r.status === 'pending').length;
  const approved = approvable.filter((r) => r && r.status === 'approved').length;
  const declined = approvable.filter((r) => r && r.status === 'declined').length;
  const decided = approved + declined;
  const week = lastNDays(7);
  const signIns7 = (logins || []).filter((l) => l && l.action !== 'sign-out' && l.at && new Date(l.at) >= week[0]).length;
  const days14 = lastNDays(14);
  const regSpark = days14.map((d) => approvable.filter((r) => r && sameDay(r.submittedAt, d)).length);
  const loginSpark = days14.map((d) => (logins || []).filter((l) => l && l.action !== 'sign-out' && sameDay(l.at, d)).length);

  const flaggedCount = [...(users || []), ...(queries || [])].filter((x) => x && x.flagged).length;
  const openQueries = (queries || []).filter((q) => q && (q.status === 'received' || q.status === 'in-progress')).length;
  const agreedConsents = (consents || []).filter((c) => c && c.decision === 'agreed').length;
  const disagreedConsents = (consents || []).filter((c) => c && c.decision === 'disagreed').length;

  const countries = Object.entries(
    approvable.reduce((acc, r) => {
      if (r && r.country) acc[r.country] = (acc[r.country] || 0) + 1;
      return acc;
    }, {}),
  ).map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, 6);

  const feed = [
    ...(registrations || []).filter(Boolean).slice(0, 8).map((r) => ({ kind: 'reg', at: r.submittedAt, r })),
    ...(queries || []).filter(Boolean).slice(0, 8).map((q) => ({ kind: 'query', at: q.submittedAt, q })),
    ...(consents || []).filter(Boolean).slice(0, 8).map((c) => ({ kind: 'consent', at: c.timestamp, c })),
    ...(logins || []).filter(Boolean).slice(0, 8).map((l) => ({ kind: 'login', at: l.at, l })),
  ].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)).slice(0, 9);

  const aimfList = (registrations || []).filter((r) => r && r.type === 'aimf');
  const aimfPending = aimfList.filter((r) => r && r.status === 'pending').length;

  const tiles = [
    { label: 'Registered Users', value: users.length, caption: `${approvable.length} conclave accreditations`, spark: regSpark, onClick: () => go('users') },
    { label: 'Awaiting review', value: pending, caption: pending ? 'need a decision' : 'queue is clear', accent: '#FAB219', onClick: () => go('approvals') },
    { label: 'AIMF Cultural Desk', value: aimfList.length, caption: aimfPending ? `${aimfPending} pending review` : 'cultural showcases', accent: aimfPending ? '#FAB219' : undefined, onClick: () => go('aimf') },
    { label: 'Query Desk', value: openQueries, suffix: ` / ${queries.length}`, caption: `${openQueries} inquiries pending response`, onClick: () => go('queries'), accent: openQueries ? '#FAB219' : undefined },
    { label: 'Terms & Conditions', value: agreedConsents, suffix: ` / ${consents.length}`, caption: `${disagreedConsents} disagreements logged`, onClick: () => go('terms'), accent: disagreedConsents ? '#D03B3B' : '#0CA30C' },
    { label: 'Flagged for review', value: flaggedCount, caption: flaggedCount ? 'requires administrative attention' : 'no flagged items', accent: flaggedCount ? '#FAB219' : undefined, onClick: () => go('users') },
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex items-center justify-between text-xs text-fg-3 border-b border-line/40 pb-2">
        <span className="font-medium text-fg">Secretariat Operations Dashboard</span>
        <span className="font-mono text-[11px] text-gold-text">
          {approvable.length} conclave accreditations · {users.length} users · {queries.length} queries
        </span>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        {tiles.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.onClick}
            disabled={!t.onClick}
            className={`ad-card text-left rounded-2xl border border-line bg-surface-2 p-4 sm:p-5 shadow-sm transition-all ${t.onClick ? 'cursor-pointer hover:border-gold-foil/50 hover:bg-surface-3' : 'cursor-default'}`}
          >
            <p className="text-xs text-fg-3 flex items-center gap-1.5 font-medium">
              {t.accent && <span className="w-1.5 h-1.5 rounded-full ad-blink" style={{ background: t.accent }} />}
              {t.label}
            </p>
            <p className="mt-3 font-serif text-3xl sm:text-[40px] leading-none text-fg font-medium">
              {t.value === null ? '—' : <Counter value={t.value} suffix={t.suffix} />}
            </p>
            <div className="mt-3 flex items-end justify-between gap-2">
              <p className="text-xs text-fg-3">{t.caption}</p>
              {t.spark && <Sparkline values={t.spark} />}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        <Card
          title="Registrations, last 14 days"
          action={<Legend items={TYPE_ORDER.map((t) => ({ label: TYPES[t]?.short || t, color: TYPES[t]?.color || '#FAB219' }))} />}
          className="xl:col-span-2"
          i={4}
        >
          <DailyBars records={approvable} />
        </Card>
        <Card title="By registration type" i={5}>
          <Donut records={approvable} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
        <Card title="Review status by type" i={6}>
          <StatusSplit records={approvable} />
        </Card>
        <Card title="Top countries" i={7}>
          {countries.length ? <RankBars items={countries} /> : <Empty text="No registrations yet" />}
        </Card>
        <Card
          title="Live activity"
          action={<span className="inline-flex items-center gap-2 text-xs text-fg-3"><span className="ad-live" /> updating</span>}
          i={8}
        >
          <ul className="flex flex-col">
            {feed.length === 0 && <Empty text="Nothing yet. Activity on the site appears here." />}
            {feed.map((f, i) => (
              <li key={(f.r?.id || f.q?.id || f.c?.id || f.l?.id || f.l?.email || '') + (f.at || '') + i} className="ad-feed-item py-2.5 border-b border-line last:border-0" style={{ '--i': i }}>
                {f.kind === 'reg' ? (
                  <button onClick={() => f.r?.id && onOpen(f.r.id)} className="w-full text-left flex items-start gap-3 cursor-pointer group">
                    <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: TYPES[f.r?.type]?.color || '#FAB219' }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-fg truncate group-hover:text-gold-text transition-colors">
                        {f.r?.name || 'Someone'} <span className="text-fg-3">registered · {TYPES[f.r?.type]?.short || f.r?.type || 'User'}</span>
                      </span>
                      <span className="block text-xs text-fg-3">{timeAgo(f.at)} {f.r?.source === 'sample' && <SampleTag />} {f.r?.flagged && <span className="text-[#FAB219] font-mono ml-1">· Flagged</span>}</span>
                    </span>
                  </button>
                ) : f.kind === 'query' ? (
                  <button onClick={() => f.q?.id && onOpen(f.q.id)} className="w-full text-left flex items-start gap-3 cursor-pointer group">
                    <span className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-[#8A9E97]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-fg truncate group-hover:text-gold-text transition-colors">
                        {f.q?.name || 'Someone'} <span className="text-fg-3">inquired · {f.q?.category || 'General'}</span>
                      </span>
                      <span className="block text-xs text-fg-3">{timeAgo(f.at)} · <span className="font-mono text-gold-text">{f.q?.id || ''}</span></span>
                    </span>
                  </button>
                ) : f.kind === 'consent' ? (
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${f.c?.decision === 'agreed' ? 'bg-[#0CA30C]' : 'bg-coral'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-fg truncate">
                        {f.c?.userName || f.c?.userEmail || 'User'}{' '}
                        <span className={f.c?.decision === 'agreed' ? 'text-[#0CA30C]' : 'text-coral'}>
                          {f.c?.decision === 'agreed' ? 'agreed to terms' : 'disagreed with terms'}
                        </span>
                        <span className="text-fg-3"> · {f.c?.portalTitle || f.c?.portal || 'Terms'}</span>
                      </span>
                      <span className="block text-xs text-fg-3">{timeAgo(f.at)} {f.c?.source === 'sample' && <SampleTag />}</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Activity className="mt-0.5 w-3.5 h-3.5 text-fg-3 shrink-0" strokeWidth={1.5} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-fg truncate">
                        {f.l?.name || f.l?.email || 'User'} <span className="text-fg-3">{(f.l?.action || 'session').replace('-', ' ')} · {f.l?.method || 'auth'}</span>
                      </span>
                      <span className="block text-xs text-fg-3">{timeAgo(f.at)} {f.l?.source === 'sample' && <SampleTag />}</span>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <p className="py-8 text-center text-sm text-fg-3">{text}</p>;
}

/* ── Approvals ────────────────────────────────────────── */

function TypeFilter({ value, onChange, records }) {
  const opts = [{ id: 'all', label: 'All' }, ...TYPE_ORDER.map((t) => ({ id: t, label: TYPES[t]?.short || t }))];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
      {opts.map((o) => {
        const n = o.id === 'all' ? records.length : records.filter((r) => r.type === o.id).length;
        const on = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-pressed={on}
            className={`h-9 px-3.5 rounded-full text-sm flex items-center gap-2 border transition-colors cursor-pointer ${on ? 'bg-surface-3 border-gold-foil/50 text-fg' : 'border-line text-fg-2 hover:text-fg hover:bg-surface-2'}`}
          >
            {o.id !== 'all' && <span className="w-2 h-2 rounded-full" style={{ background: TYPES[o.id]?.color || '#FAB219' }} />}
            {o.label}
            <span className="text-xs text-fg-3 tabular-nums">{n}</span>
          </button>
        );
      })}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder = 'Search name, company, ID…' }) {
  return (
    <label className="relative block w-full sm:w-80">
      <span className="sr-only">Search</span>
      <Search className="w-4 h-4 text-fg-3 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-3 rounded-full bg-surface-2 border border-line text-sm text-fg placeholder:text-fg-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
      />
    </label>
  );
}

const matches = (r, q) => {
  if (!q) return true;
  const s = q.trim().toLowerCase();
  return [r.name, r.email, r.id, r.ref, r.organisation, r.organization, r.country, r.category, r.subject]
    .some((v) => v && String(v).toLowerCase().includes(s));
};

function Approvals({ registrations, onOpen, onToggleFlag }) {
  const [scope, setScope] = useState('pending'); // 'pending' | 'all'
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [flagFilter, setFlagFilter] = useState(false);
  const [leaving, setLeaving] = useState({});
  const [toast, setToast] = useState(null);

  const pending = registrations.filter((r) => r.status === 'pending');
  const targetList = scope === 'pending' ? pending : registrations;
  const shown = targetList
    .filter((r) => (type === 'all' || r.type === type))
    .filter((r) => (!flagFilter || r.flagged))
    .filter((r) => matches(r, q));

  const recent = registrations
    .filter((r) => r.status !== 'pending' && r.decidedAt)
    .sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt))
    .slice(0, 8);

  const pendingFlagged = pending.filter((r) => r.flagged).length;

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const act = (r, status) => {
    setLeaving((l) => ({ ...l, [r.id]: status }));
    setTimeout(() => {
      decide(r.id, status);
      setLeaving((l) => { const n = { ...l }; delete n[r.id]; return n; });
      setToast({ id: r.id, name: r.name, status });
    }, 380);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 items-start">
      <div className="xl:col-span-2 flex flex-col gap-4">
        {/* Scope selector: Pending vs All */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-1 rounded-2xl bg-surface-2 border border-line">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setScope('pending')}
              className={`h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                scope === 'pending' ? 'bg-surface-3 text-fg shadow-sm' : 'text-fg-3 hover:text-fg'
              }`}
            >
              Awaiting Review ({pending.length})
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                scope === 'all' ? 'bg-surface-3 text-fg shadow-sm' : 'text-fg-3 hover:text-fg'
              }`}
            >
              All Applications ({registrations.length})
            </button>
          </div>
          <span className="text-xs text-fg-3 pr-3 hidden sm:inline">
            Direct Secretariat Accreditation Actions
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <TypeFilter value={type} onChange={setType} records={targetList} />
            <button
              onClick={() => setFlagFilter(!flagFilter)}
              className={`h-9 px-3 rounded-full text-xs font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
                flagFilter ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]' : 'border-line text-fg-3 hover:text-fg'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${flagFilter ? 'fill-[#FAB219]' : ''}`} />
              Flagged only ({pendingFlagged})
            </button>
          </div>
          <SearchBox value={q} onChange={setQ} />
        </div>

        {shown.length === 0 && (
          <Card i={1}>
            <div className="py-10 flex flex-col items-center text-center">
              <span className="ad-clear w-14 h-14 rounded-full border border-[#0CA30C]/50 flex items-center justify-center">
                <Check className="w-6 h-6 text-[#0CA30C]" strokeWidth={2} />
              </span>
              <p className="mt-4 font-serif text-xl text-fg">
                {scope === 'pending' ? 'All caught up' : 'No applications found'}
              </p>
              <p className="mt-1 text-sm text-fg-3">
                {scope === 'pending'
                  ? 'No registrations are currently waiting for review.'
                  : 'No applications match your filter settings.'}
              </p>
            </div>
          </Card>
        )}

        <ul className="flex flex-col gap-3">
          {shown.map((r, i) => (
            <li
              key={r.id}
              className={`ad-queue rounded-2xl border border-line bg-surface-2 overflow-hidden ${leaving[r.id] ? `is-leaving is-${leaving[r.id]}` : ''}`}
              style={{ '--i': Math.min(i, 8), '--type': TYPES[r.type]?.color || '#FAB219' }}
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <button onClick={() => onOpen(r.id)} className="flex-1 min-w-0 text-left cursor-pointer group">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <TypeTag type={r.type} />
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-fg-3">{timeAgo(r.submittedAt)}</span>
                    {r.source === 'sample' && <SampleTag />}
                    {r.flagged && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#FAB219] bg-[#FAB219]/15 border border-[#FAB219]/30 rounded px-1.5 py-0.5">
                        <Flag className="w-3 h-3 fill-[#FAB219]" /> Flagged
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[15px] text-fg font-medium truncate group-hover:text-gold-text transition-colors">
                    {r.name || 'Unnamed'} <span className="text-fg-3 font-normal">· {r.organisation || '—'}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-fg-3 truncate">
                    {[r.detail, r.sector, r.country].filter(Boolean).join(' · ')} · <span className="font-mono text-gold-text">{r.id}</span>
                  </p>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleFlag(r.id, 'registrations')}
                    className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      r.flagged ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]' : 'border-line text-fg-3 hover:text-fg hover:bg-surface-2'
                    }`}
                    title={r.flagged ? 'Remove review flag' : 'Flag for review'}
                  >
                    <Flag className={`w-3.5 h-3.5 ${r.flagged ? 'fill-[#FAB219]' : ''}`} />
                    <span className="hidden sm:inline">{r.flagged ? 'Flagged' : 'Flag'}</span>
                  </button>
                  {r.status !== 'declined' && (
                    <button onClick={() => act(r, 'declined')} className="ad-btn ad-btn-decline" aria-label={`Decline ${r.name}`}>
                      <X className="w-4 h-4" strokeWidth={2} /> Decline
                    </button>
                  )}
                  {r.status !== 'approved' && (
                    <button onClick={() => act(r, 'approved')} className="ad-btn ad-btn-approve" aria-label={`Approve ${r.name}`}>
                      <Check className="w-4 h-4" strokeWidth={2} /> Approve
                    </button>
                  )}
                  {r.status !== 'pending' && (
                    <button onClick={() => act(r, 'pending')} className="ad-btn text-xs" title="Reset back to pending">
                      <Undo2 className="w-3.5 h-3.5" /> Reset
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Card title="Recently decided" i={2} className="xl:sticky xl:top-24">
        {recent.length === 0 && <Empty text="Decisions you make appear here." />}
        <ul className="flex flex-col">
          {recent.map((r) => (
            <li key={r.id} className="py-2.5 border-b border-line last:border-0 flex items-center gap-3">
              <button onClick={() => onOpen(r.id)} className="flex-1 min-w-0 text-left cursor-pointer">
                <span className="block text-sm text-fg truncate">{r.name}</span>
                <span className="block text-xs text-fg-3">{TYPES[r.type]?.short || r.type} · {timeAgo(r.decidedAt)}</span>
              </button>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </Card>

      {toast && (
        <div className="ad-toast fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-xl border border-line-strong bg-surface-0 shadow-2xl px-4 py-3" role="status">
          <StatusBadge status={toast.status} />
          <span className="text-sm text-fg-2">{toast.name}</span>
          <button
            onClick={() => { decide(toast.id, 'pending'); setToast(null); }}
            className="inline-flex items-center gap-1.5 text-sm text-fg hover:text-gold-text cursor-pointer"
          >
            <Undo2 className="w-4 h-4" strokeWidth={1.5} /> Undo
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Registered Users View ────────────────────────────── */

function RegisteredUsers({ users, onOpen, onToggleFlag }) {
  const [tab, setTab] = useState('all');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const flaggedCount = users.filter((u) => u.flagged).length;

  // Search by: Name, Company/Organisation, Registered Unique ID, Email
  const userMatches = (u, searchStr) => {
    if (!searchStr) return true;
    const s = searchStr.trim().toLowerCase();
    const name = (u.name || '').toLowerCase();
    const company = (u.organisation || u.organization || '').toLowerCase();
    const id = (u.id || u.ref || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(s) || company.includes(s) || id.includes(s) || email.includes(s);
  };

  const rows = users
    .filter((u) => {
      if (tab === 'flagged') return u.flagged;
      if (tab !== 'all') return u.type === tab;
      return true;
    })
    .filter((u) => status === 'all' || u.status === status)
    .filter((u) => userMatches(u, q));

  const copyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const download = () => {
    const cols = ['Registered Unique ID', 'Name', 'Email', 'Company / Organisation', 'Type', 'Country', 'Status', 'Flagged', 'Submitted Date'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csvRows = [
      cols.join(','),
      ...rows.map((u) => [
        esc(u.id), esc(u.name), esc(u.email), esc(u.organisation || u.organization), esc(u.type),
        esc(u.country), esc(u.status), esc(u.flagged ? 'Yes' : 'No'), esc(u.submittedAt)
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bharat-connect-registered-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-surface-2/80 border border-line">
            <button
              onClick={() => setTab('all')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'all' ? 'bg-surface-3 text-fg shadow-sm' : 'text-fg-3 hover:text-fg'}`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setTab('flagged')}
              className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${tab === 'flagged' ? 'bg-[#FAB219]/20 text-[#FAB219] font-semibold border border-[#FAB219]/40' : 'text-fg-3 hover:text-fg'}`}
            >
              <Flag className={`w-3 h-3 ${tab === 'flagged' ? 'fill-[#FAB219]' : ''}`} />
              Flagged for Review ({flaggedCount})
            </button>
            <button
              onClick={() => setTab('delegate')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'delegate' ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg'}`}
            >
              Delegates
            </button>
            <button
              onClick={() => setTab('startup')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'startup' ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg'}`}
            >
              Startups
            </button>
            <button
              onClick={() => setTab('aimf')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'aimf' ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg'}`}
            >
              AIMF
            </button>
            <button
              onClick={() => setTab('collaboration')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'collaboration' ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg'}`}
            >
              Collaborations
            </button>
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="ad-select text-xs h-10"
            aria-label="Filter by approval status"
          >
            <option value="all">All statuses</option>
            {Object.keys(STATUS).map((s) => (
              <option key={s} value={s}>{STATUS[s].label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <SearchBox
            value={q}
            onChange={setQ}
            placeholder="Search by name, company, registered ID…"
          />
          <button onClick={download} className="btn-secondary h-10 px-3.5 text-xs sm:text-sm shrink-0 flex items-center gap-2">
            <Download className="w-4 h-4 text-fg-3" strokeWidth={1.5} /> CSV
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[840px]">
            <thead>
              <tr className="text-left text-xs text-fg-3 border-b border-line bg-surface-1/40">
                <th className="font-medium px-4 py-3">Registered Unique ID</th>
                <th className="font-medium px-4 py-3">User Name &amp; Contact</th>
                <th className="font-medium px-3 py-3">Company / Organisation</th>
                <th className="font-medium px-3 py-3">Category / Role</th>
                <th className="font-medium px-3 py-3">Country</th>
                <th className="font-medium px-3 py-3">Registered</th>
                <th className="font-medium px-3 py-3">Status</th>
                <th className="font-medium px-4 py-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((u, i) => (
                <tr
                  key={u.id}
                  onClick={() => onOpen(u.id)}
                  className={`ad-row border-b border-line last:border-0 hover:bg-surface-2/70 cursor-pointer transition-colors ${
                    u.flagged ? 'bg-[#FAB219]/[0.03]' : ''
                  }`}
                  style={{ '--i': Math.min(i, 14) }}
                >
                  {/* Unique ID */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-gold-text font-semibold bg-surface-2 px-2 py-1 rounded border border-line">
                        {u.id}
                      </span>
                      <button
                        onClick={(e) => copyId(e, u.id)}
                        className="text-fg-3 hover:text-fg p-1 rounded hover:bg-surface-3 transition-colors"
                        title="Copy ID"
                      >
                        {copiedId === u.id ? <Check className="w-3.5 h-3.5 text-[#0CA30C]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Name & Email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="block font-medium text-fg">{u.name || '—'}</span>
                      {u.source === 'sample' && <SampleTag />}
                    </div>
                    <span className="block text-xs text-fg-3">{u.email}</span>
                  </td>

                  {/* Company */}
                  <td className="px-3 py-3">
                    <span className="text-fg-2 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-fg-3 shrink-0" />
                      <span className="truncate max-w-[200px]">{u.organisation || u.organization || '—'}</span>
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-3 py-3">
                    <TypeTag type={u.type} />
                    {u.detail && <span className="block text-[11px] text-fg-3 mt-0.5 truncate max-w-[160px]">{u.detail}</span>}
                  </td>

                  {/* Country */}
                  <td className="px-3 py-3 text-fg-2 text-xs">
                    {u.country || '—'}
                  </td>

                  {/* Submitted */}
                  <td className="px-3 py-3 text-fg-3 text-xs whitespace-nowrap">
                    {timeAgo(u.submittedAt)}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    <StatusBadge status={u.status} />
                  </td>

                  {/* Inline Approval & Flag Actions */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {u.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => decide(u.id, 'approved')}
                          className="h-8 px-2.5 rounded-lg bg-[#0CA30C]/15 border border-[#0CA30C]/40 text-[#3FC23F] hover:bg-[#0CA30C] hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Approve ${u.name || u.id}`}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Approve
                        </button>
                      )}
                      {u.status !== 'declined' && (
                        <button
                          type="button"
                          onClick={() => decide(u.id, 'declined')}
                          className="h-8 px-2.5 rounded-lg border border-line text-fg-3 hover:border-[#D03B3B] hover:text-[#E66767] hover:bg-[#D03B3B]/10 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Decline ${u.name || u.id}`}
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} /> Decline
                        </button>
                      )}
                      {u.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => decide(u.id, 'pending')}
                          className="h-8 px-2 rounded-lg border border-line text-fg-3 hover:text-fg text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Reset status back to pending"
                        >
                          <Undo2 className="w-3 h-3" /> Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleFlag(u.id, 'registrations')}
                        className={`h-8 w-8 rounded-lg border inline-flex items-center justify-center transition-colors cursor-pointer ${
                          u.flagged
                            ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]'
                            : 'border-line text-fg-3 hover:text-fg'
                        }`}
                        title={u.flagged ? 'Flagged for review (click to unflag)' : 'Flag for review'}
                      >
                        <Flag className={`w-3.5 h-3.5 ${u.flagged ? 'fill-[#FAB219]' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && <Empty text="No registered users match your search criteria." />}

        <div className="px-4 py-3 border-t border-line text-xs text-fg-3 flex items-center justify-between">
          <span>{rows.length} of {users.length} registered users</span>
          {flaggedCount > 0 && (
            <span className="text-[#FAB219] font-mono">
              {flaggedCount} user{flaggedCount === 1 ? '' : 's'} marked for review
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Query Desk View ──────────────────────────────────── */

function QueryDesk({ queries, onOpen, onToggleFlag, onUpdateStatus }) {
  const [tab, setTab] = useState('all');
  const [dept, setDept] = useState('all');
  const [q, setQ] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const flaggedQueriesCount = queries.filter((q) => q.flagged).length;
  const urgentCount = queries.filter((q) => q.urgent).length;
  const receivedCount = queries.filter((q) => q.status === 'received').length;
  const inProgressCount = queries.filter((q) => q.status === 'in-progress').length;
  const answeredCount = queries.filter((q) => q.status === 'answered').length;

  const depts = [...new Set(queries.map((x) => x.dept || x.category).filter(Boolean))];

  const queryMatches = (item, searchStr) => {
    if (!searchStr) return true;
    const s = searchStr.trim().toLowerCase();
    return [
      item.name, item.fullName, item.email, item.phone, item.organisation, item.organization,
      item.subject, item.message, item.id, item.ref, item.category, item.dept
    ].some((v) => v && String(v).toLowerCase().includes(s));
  };

  const rows = queries
    .filter((item) => {
      if (tab === 'flagged') return item.flagged;
      if (tab === 'urgent') return item.urgent;
      if (tab !== 'all') return item.status === tab;
      return true;
    })
    .filter((item) => dept === 'all' || (item.dept === dept || item.category === dept))
    .filter((item) => queryMatches(item, q));

  const copyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-line bg-surface-0/70 p-4">
          <p className="text-xs text-fg-3">Total Inquiries</p>
          <p className="mt-1 font-serif text-2xl text-fg">{queries.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-0/70 p-4">
          <p className="text-xs text-fg-3">Awaiting Response</p>
          <p className="mt-1 font-serif text-2xl text-[#FAB219]">{receivedCount}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-0/70 p-4">
          <p className="text-xs text-fg-3">In Progress</p>
          <p className="mt-1 font-serif text-2xl text-[#5B8DEF]">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-0/70 p-4">
          <p className="text-xs text-fg-3">Urgent Protocol</p>
          <p className="mt-1 font-serif text-2xl text-coral">{urgentCount}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-0/70 p-4">
          <p className="text-xs text-fg-3">Flagged for Review</p>
          <p className="mt-1 font-serif text-2xl text-[#FAB219] flex items-center gap-2">
            <Flag className="w-5 h-5 fill-[#FAB219]" /> {flaggedQueriesCount}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-surface-2/80 border border-line">
            <button
              onClick={() => setTab('all')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'all' ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg'}`}
            >
              All ({queries.length})
            </button>
            <button
              onClick={() => setTab('flagged')}
              className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${tab === 'flagged' ? 'bg-[#FAB219]/20 text-[#FAB219] font-semibold border border-[#FAB219]/40' : 'text-fg-3 hover:text-fg'}`}
            >
              <Flag className={`w-3 h-3 ${tab === 'flagged' ? 'fill-[#FAB219]' : ''}`} />
              Flagged ({flaggedQueriesCount})
            </button>
            <button
              onClick={() => setTab('received')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'received' ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg'}`}
            >
              Received ({receivedCount})
            </button>
            <button
              onClick={() => setTab('in-progress')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'in-progress' ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg'}`}
            >
              In Progress
            </button>
            <button
              onClick={() => setTab('answered')}
              className={`h-8 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${tab === 'answered' ? 'bg-surface-3 text-fg' : 'text-fg-3 hover:text-fg'}`}
            >
              Answered ({answeredCount})
            </button>
            <button
              onClick={() => setTab('urgent')}
              className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${tab === 'urgent' ? 'bg-coral/20 text-coral font-semibold border border-coral/40' : 'text-fg-3 hover:text-fg'}`}
            >
              Urgent ({urgentCount})
            </button>
          </div>

          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="ad-select text-xs h-10"
            aria-label="Filter by department"
          >
            <option value="all">All Departments</option>
            {depts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search subject, inquirer, ticket ID…"
        />
      </div>

      {/* Query Desk Table */}
      <div className="rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="text-left text-xs text-fg-3 border-b border-line bg-surface-1/40">
                <th className="font-medium px-4 py-3">Ticket Ref</th>
                <th className="font-medium px-4 py-3">Inquirer Contact</th>
                <th className="font-medium px-3 py-3">Department &amp; Topic</th>
                <th className="font-medium px-4 py-3">Subject &amp; Message Excerpt</th>
                <th className="font-medium px-3 py-3">Received</th>
                <th className="font-medium px-3 py-3">Status</th>
                <th className="font-medium px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 150).map((item, i) => (
                <tr
                  key={item.id}
                  onClick={() => onOpen(item.id)}
                  className={`ad-row border-b border-line last:border-0 hover:bg-surface-2/70 cursor-pointer transition-colors ${
                    item.flagged ? 'bg-[#FAB219]/[0.03]' : ''
                  }`}
                  style={{ '--i': Math.min(i, 14) }}
                >
                  {/* Ticket ID */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-gold-text font-semibold bg-surface-2 px-2 py-1 rounded border border-line">
                        {item.id}
                      </span>
                      <button
                        onClick={(e) => copyId(e, item.id)}
                        className="text-fg-3 hover:text-fg p-1 rounded hover:bg-surface-3 transition-colors"
                        title="Copy Ticket ID"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#0CA30C]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {item.urgent && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-coral bg-coral/15 px-1.5 py-0.5 rounded border border-coral/30">
                        URGENT
                      </span>
                    )}
                  </td>

                  {/* Submitter Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-fg">{item.name || item.fullName || 'Anonymous'}</span>
                      {item.source === 'sample' && <SampleTag />}
                    </div>
                    <span className="block text-xs text-fg-3">{item.email}</span>
                    {(item.organisation || item.organization) && (
                      <span className="block text-[11px] text-fg-2 truncate max-w-[180px]">
                        {item.organisation || item.organization}
                      </span>
                    )}
                  </td>

                  {/* Dept / Category */}
                  <td className="px-3 py-3">
                    <span className="text-xs text-fg-2 font-medium block truncate max-w-[180px]">
                      {item.dept || item.category || 'General'}
                    </span>
                    <span className="text-[11px] text-fg-3 block mt-0.5">{item.country || 'India'}</span>
                  </td>

                  {/* Subject & Message Preview */}
                  <td className="px-4 py-3 max-w-xs">
                    <span className="block text-xs font-medium text-fg truncate">
                      {item.subject || 'Conclave General Query'}
                    </span>
                    <p className="text-xs text-fg-3 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message || 'No additional message text provided.'}
                    </p>
                  </td>

                  {/* Time */}
                  <td className="px-3 py-3 text-xs text-fg-3 whitespace-nowrap">
                    {timeAgo(item.submittedAt)}
                  </td>

                  {/* Status & Quick Change */}
                  <td className="px-3 py-3">
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status || 'received'}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                        className="ad-select text-xs h-7 py-0 px-2 rounded-lg"
                      >
                        <option value="received">Received</option>
                        <option value="in-progress">In Progress</option>
                        <option value="answered">Answered</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </td>

                  {/* Flag & Email Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {item.email && (
                        <a
                          href={`mailto:${item.email}?subject=Re: [${item.id}] ${encodeURIComponent(item.subject || 'Bharat Connect Inquiry')}`}
                          className="h-8 w-8 rounded-lg border border-line text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center transition-colors"
                          title="Reply via Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleFlag(item.id, 'queries')}
                        className={`h-8 px-2.5 rounded-lg border flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors ${
                          item.flagged
                            ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]'
                            : 'border-line text-fg-3 hover:text-fg hover:bg-surface-3'
                        }`}
                        title={item.flagged ? 'Flagged for review (click to remove)' : 'Flag for review'}
                      >
                        <Flag className={`w-3.5 h-3.5 ${item.flagged ? 'fill-[#FAB219]' : ''}`} />
                        <span className="hidden sm:inline">{item.flagged ? 'Flagged' : 'Flag'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && <Empty text="No inquiries match these filter settings." />}

        <div className="px-4 py-3 border-t border-line text-xs text-fg-3 flex items-center justify-between">
          <span>{rows.length} of {queries.length} queries</span>
          {flaggedQueriesCount > 0 && (
            <span className="text-[#FAB219] font-mono">
              {flaggedQueriesCount} query ticket{flaggedQueriesCount === 1 ? '' : 's'} flagged for review
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Terms & Conditions Consent Panel ───────────────── */

function toConsentsCsv(rows) {
  const cols = ['id', 'userName', 'userEmail', 'decision', 'portal', 'portalTitle', 'timestamp', 'complianceDoc', 'note', 'userAgent'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

function TermsConsentDesk({ consents = [], onOpen }) {
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [q, setQ] = useState('');
  const [selectedConsent, setSelectedConsent] = useState(null);

  const agreedCount = consents.filter((c) => c.decision === 'agreed').length;
  const disagreedCount = consents.filter((c) => c.decision === 'disagreed').length;
  const agreementRate = consents.length ? Math.round((agreedCount / consents.length) * 100) : 100;

  const rows = consents
    .filter((c) => decisionFilter === 'all' || c.decision === decisionFilter)
    .filter((c) => {
      const term = q.trim().toLowerCase();
      if (!term) return true;
      return [c.id, c.userName, c.userEmail, c.portalTitle, c.portal, c.note]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });

  const download = () => {
    const blob = new Blob([toConsentsCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bharat-connect-terms-consents-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="ad-card rounded-2xl border border-line bg-surface-2 p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-fg-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gold-text" />
            Total Consents Logged
          </p>
          <p className="mt-3 font-serif text-3xl sm:text-[38px] leading-none text-fg font-medium">
            <Counter value={consents.length} />
          </p>
          <p className="mt-2 text-xs text-fg-3">Tracked legal acknowledgements</p>
        </div>

        <div className="ad-card rounded-2xl border border-line bg-surface-2 p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-fg-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0CA30C]" />
            Agreed Users
          </p>
          <p className="mt-3 font-serif text-3xl sm:text-[38px] leading-none text-[#0CA30C] font-medium">
            <Counter value={agreedCount} />
          </p>
          <p className="mt-2 text-xs text-fg-3">{agreementRate}% compliance rate</p>
        </div>

        <div className="ad-card rounded-2xl border border-line bg-surface-2 p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-fg-3 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-coral" />
            Disagreed Users
          </p>
          <p className="mt-3 font-serif text-3xl sm:text-[38px] leading-none text-coral font-medium">
            <Counter value={disagreedCount} />
          </p>
          <p className="mt-2 text-xs text-fg-3">
            {disagreedCount ? 'Action required for pass release' : '0 objections logged'}
          </p>
        </div>

        <div className="ad-card rounded-2xl border border-line bg-surface-2 p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-fg-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gold-text" />
            Master Terms Protocol
          </p>
          <p className="mt-3 font-serif text-xl sm:text-2xl leading-none text-fg truncate">
            CEPA &amp; DPDP v2.6
          </p>
          <a
            href="/terms/Bharat-Mahotsav-Festivals-LLP-Registration-Terms-and-Conditions-v1-04Nov2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs text-gold-text hover:underline flex items-center gap-1"
          >
            <span>View PDF Document</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Table Container */}
      <div className="ad-card rounded-2xl border border-line bg-surface-0/70 overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              ['all', `All (${consents.length})`],
              ['agreed', `Agreed (${agreedCount})`],
              ['disagreed', `Disagreed (${disagreedCount})`],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setDecisionFilter(id)}
                className={`h-9 px-3.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  decisionFilter === id
                    ? 'bg-surface-3 text-fg border border-gold-foil/50 font-semibold'
                    : 'text-fg-2 hover:bg-surface-2 hover:text-fg border border-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="relative flex-1 sm:w-64">
              <span className="sr-only">Search terms consents</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search user, email, portal…"
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-2 border border-line text-xs text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil/60"
              />
            </label>
            <button
              type="button"
              onClick={download}
              className="h-9 px-3 rounded-xl border border-line text-fg-2 hover:text-fg hover:bg-surface-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Download terms consents CSV"
            >
              <Download className="w-3.5 h-3.5 text-gold-text" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Consents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-fg">
            <thead>
              <tr className="border-b border-line bg-surface-2/40 text-[11px] font-mono uppercase tracking-wider text-fg-3">
                <th className="px-5 py-3 font-medium">User / Registrant</th>
                <th className="px-3 py-3 font-medium">Protocol Decision</th>
                <th className="px-3 py-3 font-medium">Portal / Scope</th>
                <th className="px-5 py-3 font-medium">Agreement Date &amp; Time</th>
                <th className="px-3 py-3 font-medium">Compliance Ref</th>
                <th className="px-4 py-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => {
                const isAgreed = c.decision === 'agreed';
                return (
                  <tr
                    key={c.id + c.timestamp + i}
                    className="ad-row border-b border-line last:border-0 hover:bg-surface-2/40 transition-colors"
                    style={{ '--i': Math.min(i, 14) }}
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-surface-3 border border-line text-xs font-semibold text-fg flex items-center justify-center shrink-0">
                          {(c.userName || c.userEmail || '?').charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-fg truncate flex items-center gap-1.5">
                            <span>{c.userName || 'Unnamed User'}</span>
                            {c.source === 'sample' && <SampleTag />}
                          </p>
                          <p className="text-[11px] text-fg-3 truncate">{c.userEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Decision */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {isAgreed ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#0CA30C] bg-[#0CA30C]/10 border border-[#0CA30C]/30 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Agreed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-coral bg-coral/10 border border-coral/30 px-2.5 py-0.5 rounded-full">
                          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Disagreed
                        </span>
                      )}
                    </td>

                    {/* Portal / Scope */}
                    <td className="px-3 py-3.5 text-fg-2">
                      <span className="font-medium text-fg block text-xs">{c.portalTitle || c.portal}</span>
                      {c.note && <span className="text-[10.5px] text-coral truncate block max-w-xs">{c.note}</span>}
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-fg text-xs block">
                        {new Date(c.timestamp).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        })}
                      </span>
                      <span className="text-[11px] text-fg-3 block">{timeAgo(c.timestamp)}</span>
                    </td>

                    {/* Compliance Ref */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-gold-text text-xs block">{c.id}</span>
                      <span className="text-[10px] text-fg-3">{c.complianceDoc || 'CEPA v2.6'}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedConsent(c)}
                        className="h-8 px-2.5 rounded-lg border border-line text-xs font-medium text-fg-2 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer"
                      >
                        View audit log
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <Empty text="No terms and conditions consent records matching your criteria." />
        )}

        <div className="px-4 py-3 border-t border-line text-xs text-fg-3 flex items-center justify-between">
          <span>{rows.length} of {consents.length} consent records logged</span>
          <span className="font-mono text-gold-text">{agreementRate}% Accepted</span>
        </div>
      </div>

      {/* Consent Audit Detail Modal */}
      {selectedConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-surface-0 border border-line-strong rounded-2xl shadow-2xl overflow-hidden p-6 animate-slide-up">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedConsent.decision === 'agreed' ? 'bg-[#0CA30C]/15 text-[#0CA30C]' : 'bg-coral/15 text-coral'}`}>
                  {selectedConsent.decision === 'agreed' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-serif text-lg text-fg">Terms Consent Audit Record</h3>
                  <p className="font-mono text-xs text-gold-text">{selectedConsent.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConsent(null)}
                className="w-8 h-8 rounded-lg text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-2 border border-line flex items-center justify-between">
                <span className="text-fg-3">Decision Status</span>
                <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${selectedConsent.decision === 'agreed' ? 'bg-[#0CA30C]/15 text-[#0CA30C]' : 'bg-coral/15 text-coral'}`}>
                  {selectedConsent.decision === 'agreed' ? 'Agreed to Terms' : 'Disagreed with Terms'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-surface-2 border border-line">
                  <span className="text-fg-3 block text-[11px]">User Name</span>
                  <span className="font-medium text-fg block mt-0.5 text-xs truncate">{selectedConsent.userName || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-2 border border-line">
                  <span className="text-fg-3 block text-[11px]">User Email</span>
                  <span className="font-medium text-fg block mt-0.5 text-xs truncate">{selectedConsent.userEmail || '—'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-2 border border-line">
                <span className="text-fg-3 block text-[11px]">Portal &amp; Scope</span>
                <span className="font-medium text-fg block mt-0.5">{selectedConsent.portalTitle || selectedConsent.portal}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-2 border border-line">
                <span className="text-fg-3 block text-[11px]">Exact Timestamp (ISO 8601)</span>
                <span className="font-mono text-fg block mt-0.5 text-xs">{selectedConsent.timestamp}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-2 border border-line">
                <span className="text-fg-3 block text-[11px]">Compliance Baseline</span>
                <span className="font-mono text-gold-text block mt-0.5 text-xs">{selectedConsent.complianceDoc || 'CEPA v2.6'}</span>
              </div>

              {selectedConsent.note && (
                <div className="p-3 rounded-xl bg-coral/10 border border-coral/30">
                  <span className="text-coral block text-[11px] font-semibold">Audit Note</span>
                  <span className="text-fg-2 block mt-0.5 text-xs">{selectedConsent.note}</span>
                </div>
              )}

              {selectedConsent.userAgent && (
                <div className="p-3 rounded-xl bg-surface-2 border border-line">
                  <span className="text-fg-3 block text-[11px]">Client Device / Browser</span>
                  <span className="font-mono text-fg-3 block mt-0.5 text-[10.5px] break-all">{selectedConsent.userAgent}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedConsent(null)}
                className="btn-primary h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── AIMF Registrations Desk ──────────────────────────── */

function toAimfCsv(rows) {
  const cols = ['id', 'status', 'name', 'email', 'organisation', 'country', 'detail', 'sector', 'submittedAt', 'decidedAt', 'flagged', 'source'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

function AimfRegistrations({ registrations, onOpen, onToggleFlag }) {
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [flagOnly, setFlagOnly] = useState(false);

  // Exclusively filter for AIMF registrations
  const aimfRecords = registrations.filter((r) => r.type === 'aimf');

  const pendingCount = aimfRecords.filter((r) => r.status === 'pending').length;
  const approvedCount = aimfRecords.filter((r) => r.status === 'approved').length;
  const declinedCount = aimfRecords.filter((r) => r.status === 'declined').length;
  const flaggedCount = aimfRecords.filter((r) => r.flagged).length;

  const rows = aimfRecords
    .filter((r) => (status === 'all' || r.status === status))
    .filter((r) => (!flagOnly || r.flagged))
    .filter((r) => matches(r, q));

  const downloadCsv = () => {
    const blob = new Blob([toAimfCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bharat-connect-aimf-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const aimfEmails = [...new Set(aimfRecords
    .filter((r) => r.source !== 'sample' && r.status !== 'declined' && r.email)
    .map((r) => r.email.toLowerCase()))];

  const emailApplicants = () => {
    const subject = 'Update from Atal Innovation Multilateral Forum (AIMF) Secretariat';
    const body = `Dear AIMF Delegate,\n\nThis is an official communication regarding your AIMF cultural & creative accreditation for Bharat Connect 2026.\n\nPlease check your registration details in the portal or reply to this email if you have any questions.\n\nWarm regards,\nAIMF Secretariat · Bharat Connect 2026`;
    window.location.href = `mailto:?bcc=${encodeURIComponent(aimfEmails.join(','))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-foil animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-gold-text">Dedicated Desk</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-fg">
            AIMF Registrations & Accreditations
          </h1>
          <p className="mt-1 text-sm text-fg-3">
            Atal Innovation Multilateral Forum creative enterprises, cultural troupes, and media accreditations.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="surface-card rounded-2xl p-4 sm:p-5 border border-line">
          <span className="text-xs text-fg-3 font-medium">Total AIMF Applications</span>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-fg font-medium tabular-nums">{aimfRecords.length}</p>
        </div>
        <div className="surface-card rounded-2xl p-4 sm:p-5 border border-line">
          <span className="text-xs text-[#FAB219] font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-[#FAB219] font-medium tabular-nums">{pendingCount}</p>
        </div>
        <div className="surface-card rounded-2xl p-4 sm:p-5 border border-line">
          <span className="text-xs text-[#0CA30C] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved Accreditations
          </span>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-[#0CA30C] font-medium tabular-nums">{approvedCount}</p>
        </div>
        <div className="surface-card rounded-2xl p-4 sm:p-5 border border-line">
          <span className="text-xs text-[#E66767] font-medium flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" /> Flagged for Review
          </span>
          <p className="mt-2 font-serif text-2xl sm:text-3xl text-[#E66767] font-medium tabular-nums">{flaggedCount}</p>
        </div>
      </div>

      {/* Controls: Filters, Search, and Exports */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="ad-select text-xs h-10"
            aria-label="Filter by approval status"
          >
            <option value="all">All Statuses ({aimfRecords.length})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="declined">Declined ({declinedCount})</option>
          </select>

          <button
            onClick={() => setFlagOnly(!flagOnly)}
            className={`h-10 px-3 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              flagOnly ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]' : 'border-line text-fg-3 hover:text-fg'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${flagOnly ? 'fill-[#FAB219]' : ''}`} />
            Flagged ({flaggedCount})
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <SearchBox value={q} onChange={setQ} />
          <button
            onClick={emailApplicants}
            disabled={!aimfEmails.length}
            title={aimfEmails.length ? `Email announcement to ${aimfEmails.length} active AIMF applicant${aimfEmails.length === 1 ? '' : 's'}` : 'No active AIMF applicants'}
            className="btn-secondary h-10 px-3.5 text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-4 h-4 text-fg-3" strokeWidth={1.5} /> Email Applicants ({aimfEmails.length})
          </button>
          <button onClick={downloadCsv} className="btn-secondary h-10 px-3.5 text-sm shrink-0">
            <Download className="w-4 h-4 text-fg-3" strokeWidth={1.5} /> Export CSV
          </button>
        </div>
      </div>

      {/* AIMF Table */}
      <div className="rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-fg-3 border-b border-line bg-surface-1/40">
                <th className="font-medium px-4 py-3">Accreditation ID</th>
                <th className="font-medium px-4 py-3">Applicant / Delegate</th>
                <th className="font-medium px-3 py-3">Creative Enterprise / Troupe</th>
                <th className="font-medium px-3 py-3">Category / Showcase</th>
                <th className="font-medium px-3 py-3">Country</th>
                <th className="font-medium px-3 py-3">Submitted</th>
                <th className="font-medium px-3 py-3">Status</th>
                <th className="font-medium px-4 py-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => onOpen(r.id)}
                  className={`ad-row border-b border-line last:border-0 hover:bg-surface-2/70 cursor-pointer ${
                    r.flagged ? 'bg-[#FAB219]/[0.03]' : ''
                  }`}
                  style={{ '--i': Math.min(i, 14) }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gold-text font-semibold">{r.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-fg font-medium">{r.name || '—'} {r.source === 'sample' && <SampleTag />}</span>
                    <span className="block text-xs text-fg-3">{r.email}</span>
                  </td>
                  <td className="px-3 py-3 text-fg-2 font-medium">{r.organisation || '—'}</td>
                  <td className="px-3 py-3 text-xs text-fg-3">{r.detail || r.sector || 'AIMF Accreditation'}</td>
                  <td className="px-3 py-3 text-fg-2">{r.country || '—'}</td>
                  <td className="px-3 py-3 text-fg-3 whitespace-nowrap">{timeAgo(r.submittedAt)}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {r.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => decide(r.id, 'approved')}
                          className="h-8 px-2.5 rounded-lg bg-[#0CA30C]/15 border border-[#0CA30C]/40 text-[#3FC23F] hover:bg-[#0CA30C] hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Approve AIMF accreditation for ${r.name}`}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Approve
                        </button>
                      )}
                      {r.status !== 'declined' && (
                        <button
                          type="button"
                          onClick={() => decide(r.id, 'declined')}
                          className="h-8 px-2.5 rounded-lg border border-line text-fg-3 hover:border-[#D03B3B] hover:text-[#E66767] hover:bg-[#D03B3B]/10 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Decline AIMF accreditation for ${r.name}`}
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} /> Decline
                        </button>
                      )}
                      {r.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => decide(r.id, 'pending')}
                          className="h-8 px-2 rounded-lg border border-line text-fg-3 hover:text-fg text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Reset status back to pending"
                        >
                          <Undo2 className="w-3 h-3" /> Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleFlag(r.id, 'registrations')}
                        className={`h-8 w-8 rounded-lg border inline-flex items-center justify-center transition-colors cursor-pointer ${
                          r.flagged ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]' : 'border-line text-fg-3 hover:text-fg'
                        }`}
                        title={r.flagged ? 'Flagged for review (click to remove)' : 'Flag for review'}
                      >
                        <Flag className={`w-3.5 h-3.5 ${r.flagged ? 'fill-[#FAB219]' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty text="No AIMF registrations match these filters." />}
        <p className="px-5 py-3 border-t border-line text-xs text-fg-3">
          {rows.length} of {aimfRecords.length} AIMF records{rows.length > 200 ? ' · showing the latest 200' : ''}
        </p>
      </div>
    </div>
  );
}

/* ── Registrations table ──────────────────────────────── */

function toCsv(rows) {
  const cols = ['id', 'type', 'status', 'name', 'email', 'organisation', 'country', 'detail', 'sector', 'submittedAt', 'decidedAt', 'flagged', 'source'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

function Registrations({ registrations, onOpen, onToggleFlag }) {
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [flagOnly, setFlagOnly] = useState(false);
  const rows = registrations
    .filter((r) => (type === 'all' || r.type === type))
    .filter((r) => (status === 'all' || r.status === status))
    .filter((r) => (!flagOnly || r.flagged))
    .filter((r) => matches(r, q));

  const download = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bharat-connect-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const typeOpts = [...TYPE_ORDER, 'query'];

  const event = currentEvent();
  const startupEmails = [...new Set(registrations
    .filter((r) => r.type === 'startup' && r.source !== 'sample' && r.status !== 'declined' && r.email)
    .map((r) => r.email.toLowerCase()))];
  const remindStartups = () => {
    const when = new Date(event.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
    const subject = `Reminder: ${event.name} on ${when}`;
    const body = `Dear founder,\n\nThis is a reminder that ${event.name} (${event.subtitle}) begins on ${when} at ${event.venue}.\n\n${event.startupNote}\n\nSign in to your startup page on the Bharat Connect website for your registration details, the programme and live updates during the event.\n\nRegards,\nBharat Connect Secretariat`;
    window.location.href = `mailto:?bcc=${encodeURIComponent(startupEmails.join(','))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="ad-select text-xs h-10" aria-label="Type">
            <option value="all">All types</option>
            {typeOpts.map((t) => <option key={t} value={t}>{TYPES[t]?.short || t}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="ad-select text-xs h-10" aria-label="Status">
            <option value="all">All statuses</option>
            {Object.keys(STATUS).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
            <option value="received">Received (inquiries)</option>
          </select>
          <button
            onClick={() => setFlagOnly(!flagOnly)}
            className={`h-10 px-3 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              flagOnly ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]' : 'border-line text-fg-3 hover:text-fg'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${flagOnly ? 'fill-[#FAB219]' : ''}`} />
            Flagged
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <SearchBox value={q} onChange={setQ} />
          {event && (
            <button
              onClick={remindStartups}
              disabled={!startupEmails.length}
              title={startupEmails.length ? `Email a reminder for ${event.name} to ${startupEmails.length} startup${startupEmails.length === 1 ? '' : 's'}` : 'No registered startups yet'}
              className="btn-secondary h-10 px-3.5 text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BellRing className="w-4 h-4 text-fg-3" strokeWidth={1.5} /> Remind startups ({startupEmails.length})
            </button>
          )}
          <button onClick={download} className="btn-secondary h-10 px-3.5 text-sm shrink-0">
            <Download className="w-4 h-4 text-fg-3" strokeWidth={1.5} /> CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-fg-3 border-b border-line bg-surface-1/40">
                <th className="font-medium px-4 py-3">ID / Reference</th>
                <th className="font-medium px-4 py-3">Name</th>
                <th className="font-medium px-3 py-3">Type</th>
                <th className="font-medium px-3 py-3">Organisation</th>
                <th className="font-medium px-3 py-3">Country</th>
                <th className="font-medium px-3 py-3">Submitted</th>
                <th className="font-medium px-3 py-3">Status</th>
                <th className="font-medium px-4 py-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => onOpen(r.id)}
                  className={`ad-row border-b border-line last:border-0 hover:bg-surface-2/70 cursor-pointer ${
                    r.flagged ? 'bg-[#FAB219]/[0.03]' : ''
                  }`}
                  style={{ '--i': Math.min(i, 14) }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gold-text font-semibold">{r.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-fg font-medium">{r.name || '—'} {r.source === 'sample' && <SampleTag />}</span>
                    <span className="block text-xs text-fg-3">{r.email}</span>
                  </td>
                  <td className="px-3 py-3"><TypeTag type={r.type} /></td>
                  <td className="px-3 py-3 text-fg-2">{r.organisation || '—'}</td>
                  <td className="px-3 py-3 text-fg-2">{r.country || '—'}</td>
                  <td className="px-3 py-3 text-fg-3 whitespace-nowrap">{timeAgo(r.submittedAt)}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {r.type !== 'query' && r.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => decide(r.id, 'approved')}
                          className="h-8 px-2.5 rounded-lg bg-[#0CA30C]/15 border border-[#0CA30C]/40 text-[#3FC23F] hover:bg-[#0CA30C] hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Approve ${r.name || r.id}`}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Approve
                        </button>
                      )}
                      {r.type !== 'query' && r.status !== 'declined' && (
                        <button
                          type="button"
                          onClick={() => decide(r.id, 'declined')}
                          className="h-8 px-2.5 rounded-lg border border-line text-fg-3 hover:border-[#D03B3B] hover:text-[#E66767] hover:bg-[#D03B3B]/10 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title={`Decline ${r.name || r.id}`}
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} /> Decline
                        </button>
                      )}
                      {r.type !== 'query' && r.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => decide(r.id, 'pending')}
                          className="h-8 px-2 rounded-lg border border-line text-fg-3 hover:text-fg text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Reset status back to pending"
                        >
                          <Undo2 className="w-3 h-3" /> Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleFlag(r.id, r.type === 'query' ? 'queries' : 'registrations')}
                        className={`h-8 w-8 rounded-lg border inline-flex items-center justify-center transition-colors cursor-pointer ${
                          r.flagged ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]' : 'border-line text-fg-3 hover:text-fg'
                        }`}
                        title={r.flagged ? 'Flagged for review (click to remove)' : 'Flag for review'}
                      >
                        <Flag className={`w-3.5 h-3.5 ${r.flagged ? 'fill-[#FAB219]' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty text="No registrations match these filters." />}
        <p className="px-5 py-3 border-t border-line text-xs text-fg-3">
          {rows.length} of {registrations.length} records{rows.length > 200 ? ' · showing the latest 200' : ''}
        </p>
      </div>
    </div>
  );
}

/* ── Sign-ins ─────────────────────────────────────────── */

function SignIns({ logins, registrations }) {
  const [q, setQ] = useState('');
  const days = lastNDays(14);
  const people = new Set(logins.map((l) => l.email)).size;
  const signUps = logins.filter((l) => l.action === 'sign-up').length;
  const registeredEmails = new Set(registrations.map((r) => (r.email || '').toLowerCase()));
  const converted = [...new Set(logins.map((l) => (l.email || '').toLowerCase()))].filter((e) => registeredEmails.has(e)).length;
  const rows = logins.filter((l) => !q || [l.name, l.email].some((v) => v && v.toLowerCase().includes(q.toLowerCase())));

  const perDay = days.map((d) => ({
    d,
    in: logins.filter((l) => l.action === 'sign-in' && sameDay(l.at, d)).length,
    up: logins.filter((l) => l.action === 'sign-up' && sameDay(l.at, d)).length,
  }));
  const max = Math.max(3, ...perDay.map((p) => p.in + p.up));

  const tiles = [
    { label: 'People signed in', value: people },
    { label: 'New accounts', value: signUps },
    { label: 'Signed in and registered', value: converted },
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
        {tiles.map((t) => (
          <div key={t.label} className="ad-card rounded-2xl border border-line bg-surface-2 p-5 shadow-sm">
            <p className="text-xs text-fg-3">{t.label}</p>
            <p className="mt-3 font-serif text-[40px] leading-none text-fg font-medium"><Counter value={t.value} /></p>
          </div>
        ))}
      </div>

      <Card
        title="Sign-ins and new accounts, last 14 days"
        action={<Legend items={[{ label: 'Sign-ins', color: '#5B8DEF' }, { label: 'New accounts', color: '#B98A3A' }]} />}
        i={3}
      >
        <div className="flex items-end gap-1.5 sm:gap-2 h-40">
          {perDay.map((p, i) => (
            <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-[2px] group relative" title={`${p.d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: ${p.in} sign-ins, ${p.up} new accounts`}>
              <span className="ad-col w-full max-w-7 rounded-t-[4px]" style={{ height: `${(p.up / max) * 100}%`, background: '#B98A3A', '--i': i }} />
              <span className={`ad-col w-full max-w-7 ${p.up ? '' : 'rounded-t-[4px]'}`} style={{ height: `${(p.in / max) * 100}%`, background: '#5B8DEF', '--i': i }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-fg-3">
          <span>{days[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span>Today</span>
        </div>
      </Card>

      <div className="flex justify-end"><SearchBox value={q} onChange={setQ} placeholder="Search name or email…" /></div>

      <div className="rounded-2xl border border-line bg-surface-2 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-left text-xs text-fg-3 border-b border-line">
                <th className="font-medium px-5 py-3">Person</th>
                <th className="font-medium px-3 py-3">Action</th>
                <th className="font-medium px-3 py-3">Method</th>
                <th className="font-medium px-3 py-3">Registered?</th>
                <th className="font-medium px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((l, i) => (
                <tr key={l.email + l.at + i} className="ad-row border-b border-line last:border-0" style={{ '--i': Math.min(i, 14) }}>
                  <td className="px-5 py-3">
                    <span className="block text-fg">{l.name || '—'} {l.source === 'sample' && <SampleTag />}</span>
                    <span className="block text-xs text-fg-3">{l.email}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`ad-action ad-action-${l.action}`}>{l.action === 'sign-up' ? 'New account' : l.action === 'sign-in' ? 'Signed in' : 'Signed out'}</span>
                  </td>
                  <td className="px-3 py-3 text-fg-2">{l.method}</td>
                  <td className="px-3 py-3 text-fg-2">{registeredEmails.has((l.email || '').toLowerCase()) ? 'Yes' : 'Not yet'}</td>
                  <td className="px-5 py-3 text-fg-3 whitespace-nowrap">{timeAgo(l.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty text="No sign-ins yet. They appear here when people sign in on the site." />}
      </div>
    </div>
  );
}

/* ── Detail drawer ────────────────────────────────────── */

const FIELD_LABELS = {
  id: 'Reference / ID', email: 'Email', phone: 'Phone', organisation: 'Organisation', organization: 'Organisation',
  designation: 'Designation', country: 'Country', detail: 'Category / Track', sector: 'Sector',
  dealSize: 'Deal size', payment: 'Payment', message: 'Message', b2b: 'B2B deal rooms', visaLetter: 'Visa letter',
  category: 'Inquiry Category', dept: 'Department', subject: 'Subject', urgent: 'Urgent Protocol',
};

const fieldLabel = (k) => k.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()).replace(/ ([A-Z])(?=[a-z])/g, (m, c) => ` ${c.toLowerCase()}`);
const formatValue = (v) => (typeof v === 'boolean' ? (v ? 'Yes' : 'No') : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v));

export function Drawer({ record, onClose, onToggleFlag, onUpdateStatus }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!record) return null;
  const r = record;
  const isQuery = r.type === 'query';
  const fields = Object.keys(FIELD_LABELS).filter((k) => r[k] !== undefined && r[k] !== '' && r[k] !== null);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${r.name} details`}>
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <aside className="ad-drawer absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface-0 border-l border-line overflow-y-auto">
        <div className="h-1.5" style={{ background: TYPES[r.type]?.color || '#FAB219' }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TypeTag type={r.type} />
                {r.urgent && (
                  <span className="text-[10px] font-mono font-bold text-coral bg-coral/15 px-1.5 py-0.5 rounded border border-coral/30">
                    URGENT
                  </span>
                )}
              </div>
              <h2 className="mt-2 font-serif text-2xl text-fg">{r.name || r.fullName || 'Unnamed'}</h2>
              <p className="text-sm text-fg-3">
                Submitted {new Date(r.submittedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-lg text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center cursor-pointer" aria-label="Close">
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Status & Flag Actions Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-2/60 border border-line">
            <div className="flex items-center gap-2">
              <StatusBadge status={r.status} />
              {r.source === 'sample' && <SampleTag />}
            </div>

            {/* Flag for Review Toggle */}
            <button
              type="button"
              onClick={() => onToggleFlag(r.id, isQuery ? 'queries' : 'registrations')}
              className={`h-8 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
                r.flagged
                  ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]'
                  : 'border-line text-fg-3 hover:text-fg hover:bg-surface-3'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${r.flagged ? 'fill-[#FAB219]' : ''}`} />
              <span>{r.flagged ? 'Flagged for review' : 'Flag for review'}</span>
            </button>
          </div>

          {/* Review Approval Controls - Prominent at the top */}
          {!isQuery && (
            <div className="mt-4 p-4 rounded-xl border border-line bg-surface-1 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-gold-text" /> Accreditation Decision Desk
                </span>
                <span className="text-xs text-fg-3 font-mono">
                  Current: <strong className="text-gold-text capitalize">{r.status || 'pending'}</strong>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => decide(r.id, 'approved')}
                  className={`ad-btn h-9 px-3.5 text-xs font-semibold transition-all ${
                    r.status === 'approved'
                      ? 'bg-[#0CA30C] border-[#0CA30C] text-white shadow-md'
                      : 'border-line hover:border-[#0CA30C] text-[#3FC23F] hover:bg-[#0CA30C]/15'
                  }`}
                  title={`Approve accreditation for ${r.name || r.id}`}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {r.status === 'approved' ? 'Approved ✓' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => decide(r.id, 'declined')}
                  className={`ad-btn h-9 px-3.5 text-xs font-semibold transition-all ${
                    r.status === 'declined'
                      ? 'bg-[#D03B3B] border-[#D03B3B] text-white shadow-md'
                      : 'border-line hover:border-[#D03B3B] text-[#E66767] hover:bg-[#D03B3B]/15'
                  }`}
                  title={`Decline accreditation for ${r.name || r.id}`}
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                  {r.status === 'declined' ? 'Declined ✕' : 'Decline'}
                </button>
                <button
                  type="button"
                  onClick={() => decide(r.id, 'pending')}
                  className={`ad-btn h-9 px-3 text-xs font-medium transition-all ${
                    r.status === 'pending'
                      ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]'
                      : 'text-fg-3 hover:text-fg border-line hover:bg-surface-3'
                  }`}
                  title="Reset status back to pending"
                >
                  <Undo2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Reset to Pending
                </button>
              </div>
            </div>
          )}

          {/* Query Status Selector */}
          {isQuery && (
            <div className="mt-4 p-3.5 rounded-xl border border-line bg-surface-1">
              <label className="block text-xs font-medium text-fg mb-1.5">Query Processing Status</label>
              <div className="grid grid-cols-2 gap-2">
                {['received', 'in-progress', 'answered', 'closed'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(r.id, st)}
                    className={`h-8 px-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer capitalize ${
                      r.status === st
                        ? 'bg-surface-3 border-gold-foil text-gold-text font-semibold'
                        : 'border-line text-fg-3 hover:text-fg hover:bg-surface-2'
                    }`}
                  >
                    {st.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query Message Block */}
          {isQuery && r.message && (
            <div className="mt-4 p-3.5 rounded-xl border border-line bg-surface-2">
              <p className="text-xs font-medium text-gold-text mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Full Inquiry Message
              </p>
              <p className="text-xs sm:text-sm text-fg leading-relaxed whitespace-pre-wrap">{r.message}</p>
            </div>
          )}

          {/* Key Fields */}
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {fields.map((k) => (
              <div key={k} className="py-2.5 grid grid-cols-[120px_1fr] gap-3 text-sm">
                <dt className="text-fg-3">{FIELD_LABELS[k]}</dt>
                <dd className={`text-fg break-words ${k === 'id' ? 'font-mono text-xs pt-0.5 text-gold-text' : ''}`}>
                  {typeof r[k] === 'boolean' ? (r[k] ? 'Yes' : 'No') : String(r[k])}
                </dd>
              </div>
            ))}
          </dl>

          {/* Registration Form Details */}
          {r.details && typeof r.details === 'object' && (
            <details className="mt-6 group" open>
              <summary className="text-xs font-medium text-fg cursor-pointer select-none">Full form ({Object.keys(r.details).length} fields)</summary>
              <dl className="mt-2 divide-y divide-line border-y border-line">
                {Object.entries(r.details)
                  .filter(([, v]) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && !v.length))
                  .map(([k, v]) => (
                    <div key={k} className="py-2 grid grid-cols-[120px_1fr] gap-3 text-xs">
                      <dt className="text-fg-3 break-words">{fieldLabel(k)}</dt>
                      <dd className="text-fg break-words whitespace-pre-wrap">{formatValue(v)}</dd>
                    </div>
                  ))}
              </dl>
            </details>
          )}


          {r.email && (
            <div className="mt-5 pt-3 border-t border-line flex items-center justify-between">
              <a
                href={`mailto:${r.email}?subject=${encodeURIComponent(`Bharat Connect 2026: Reference ${r.id}`)}`}
                className="inline-flex items-center gap-1.5 text-sm text-gold-text hover:text-fg font-medium"
              >
                <Mail className="w-4 h-4" strokeWidth={1.5} /> Email {r.name?.split(' ')[0] || 'submitter'} <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </a>
              {r.phone && (
                <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-xs text-fg-3 hover:text-fg">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              )}
            </div>
          )}

          {r.source === 'sample' && (
            <p className="mt-6 text-xs text-fg-3 leading-relaxed">This is a sample record for demonstration, not a real person.</p>
          )}

          {/* Quick Decision Desk at Bottom */}
          {!isQuery && (
            <div className="mt-6 pt-4 border-t border-line flex flex-col gap-2.5">
              <span className="text-xs text-fg-3 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-text" /> Quick Status Decision
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => decide(r.id, 'approved')}
                  className={`ad-btn h-9 px-3.5 text-xs font-semibold cursor-pointer transition-all ${
                    r.status === 'approved'
                      ? 'bg-[#0CA30C] border-[#0CA30C] text-white shadow-md'
                      : 'border-line hover:border-[#0CA30C] text-[#3FC23F] hover:bg-[#0CA30C]/15'
                  }`}
                  title={`Approve ${r.name || r.id}`}
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {r.status === 'approved' ? 'Approved ✓' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => decide(r.id, 'declined')}
                  className={`ad-btn h-9 px-3.5 text-xs font-semibold cursor-pointer transition-all ${
                    r.status === 'declined'
                      ? 'bg-[#D03B3B] border-[#D03B3B] text-white shadow-md'
                      : 'border-line hover:border-[#D03B3B] text-[#E66767] hover:bg-[#D03B3B]/15'
                  }`}
                  title={`Decline ${r.name || r.id}`}
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                  {r.status === 'declined' ? 'Declined ✕' : 'Decline'}
                </button>
                <button
                  type="button"
                  onClick={() => decide(r.id, 'pending')}
                  className={`ad-btn h-9 px-3 text-xs font-medium cursor-pointer transition-all ${
                    r.status === 'pending'
                      ? 'bg-[#FAB219]/20 border-[#FAB219] text-[#FAB219]'
                      : 'text-fg-3 hover:text-fg border-line hover:bg-surface-3'
                  }`}
                  title="Reset status back to pending"
                >
                  <Undo2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Reset to Pending
                </button>
              </div>
            </div>
          )}

          {r.source === 'live' && TYPES[r.type] && <DeleteRecord record={r} onDeleted={onClose} />}
        </div>
      </aside>
    </div>
  );
}

// permanent delete, behind a confirmation that names the record
function DeleteRecord({ record, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const remove = async () => {
    const what = record.type === 'query' ? 'inquiry' : 'registration';
    if (!window.confirm(`Delete ${what} ${record.id} from ${record.name || 'this person'}?

This cannot be undone.`)) return;
    setBusy(true);
    setError('');
    try {
      await deleteRecord(record.id);
      onDeleted();
    } catch {
      setError('Could not delete. Check your connection and that you are signed in as an admin.');
      setBusy(false);
    }
  };
  return (
    <div className="mt-8 pt-5 border-t border-line">
      <button
        onClick={remove}
        disabled={busy}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-[#D03B3B]/50 text-sm text-[#E66767] hover:bg-[#D03B3B]/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" strokeWidth={1.5} /> {busy ? 'Deleting…' : `Delete ${record.type === 'query' ? 'inquiry' : 'registration'}`}
      </button>
      {error && <p className="mt-2 text-xs text-[#E66767]" role="alert">{error}</p>}
    </div>
  );
}
