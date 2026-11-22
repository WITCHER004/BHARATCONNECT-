import { useCallback, useEffect, useState } from 'react';
import {
  LayoutDashboard, ClipboardCheck, Users, LogIn, Search, ExternalLink, Lock, Check, X,
  Download, ArrowUpRight, Undo2, Database, LogOut, Activity, Menu, BellRing,
} from 'lucide-react';
import { currentEvent } from '../data/events';
import {
  listRegistrations, listLogins, decide, subscribe, TYPES, TYPE_ORDER, STATUS,
} from '../data/registry';
import {
  Counter, StatusBadge, TypeTag, Legend, DailyBars, Donut, StatusSplit, RankBars, Sparkline,
  timeAgo, lastNDays, sameDay,
} from './charts';

/*
  Bharat Connect admin panel (admin.html), separate from the public site but reading the same
  data through src/data/registry.js.

  ACCESS: the passcode check below runs in the browser, so it keeps casual visitors out but is not
  real security. Set VITE_ADMIN_PASSCODE in .env.local, and replace this with a proper server login
  when a database is connected.
*/
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'bharat-admin-2026';
const SESSION_KEY = 'bc-admin-session';
const SAMPLES_KEY = 'bc-admin-show-samples';
const SITE_URL = `${import.meta.env.BASE_URL}`;

const VIEWS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
  { id: 'registrations', label: 'Registrations', icon: Users },
  { id: 'signins', label: 'Sign-ins', icon: LogIn },
];

/* ── data hook: re-reads whenever the site writes ──── */

function useRegistry(includeSamples) {
  const read = useCallback(() => ({
    registrations: listRegistrations({ includeSamples }),
    logins: listLogins({ includeSamples }),
  }), [includeSamples]);
  const [data, setData] = useState(read);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    setData(read());
    return subscribe(() => {
      setData(read());
      setPulse((p) => p + 1);
    });
  }, [read]);
  return { ...data, pulse };
}

/* ── Gate ─────────────────────────────────────────────── */

function Gate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (code.trim() === PASSCODE) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* storage unavailable */ }
      onUnlock();
    } else {
      setError(true);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 ad-gate-bg">
      <form onSubmit={submit} className="ad-rise w-full max-w-sm surface-card rounded-2xl p-7 border border-line">
        <div className="flex items-center gap-3">
          <span className="h-10 px-2 rounded-xl bg-[#FCFBF9] ring-1 ring-gold-foil/40 flex items-center">
            <img src={`${import.meta.env.BASE_URL}brand/logo.png`} alt="Bharat Connect" className="h-7 w-auto" />
          </span>
          <span>
            <span className="block font-serif text-lg text-fg leading-5">Admin</span>
            <span className="block text-xs text-fg-3">Bharat Connect 2026</span>
          </span>
        </div>
        <label htmlFor="ad-code" className="mt-7 block text-xs text-fg-3 mb-1.5">Passcode</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-fg-3 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            id="ad-code"
            type="password"
            autoFocus
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            className={`w-full h-11 pl-9 pr-3 rounded-[10px] bg-surface-3 border text-sm text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 ${error ? 'border-[#D03B3B] ad-shake' : 'border-line'}`}
          />
        </div>
        <p className="mt-2 h-4 text-xs text-[#E66767]" aria-live="polite">{error ? 'That passcode is not right.' : ''}</p>
        <button type="submit" className="mt-3 btn-primary h-11 w-full text-sm">Enter dashboard</button>
        <p className="mt-5 text-[11px] leading-relaxed text-fg-3">
          This check runs in the browser and is not real security. Use a server login once a database is connected.
        </p>
      </form>
    </div>
  );
}

/* ── Shell ────────────────────────────────────────────── */

export default function AdminApp() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
  });
  const [view, setView] = useState(() => {
    const h = window.location.hash.replace('#', '');
    return VIEWS.some((v) => v.id === h) ? h : 'overview';
  });
  const [showSamples, setShowSamples] = useState(() => {
    try { return localStorage.getItem(SAMPLES_KEY) !== '0'; } catch { return true; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { registrations, logins, pulse } = useRegistry(showSamples);

  useEffect(() => {
    try { localStorage.setItem(SAMPLES_KEY, showSamples ? '1' : '0'); } catch { /* storage unavailable */ }
  }, [showSamples]);

  // follow the address bar, so links like admin.html#approvals and the Back button work
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

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;

  const approvable = registrations.filter((r) => TYPES[r.type]?.approvable);
  const pending = approvable.filter((r) => r.status === 'pending');
  const liveCount = registrations.filter((r) => r.source === 'live').length + logins.filter((l) => l.source === 'live').length;
  const current = VIEWS.find((v) => v.id === view);

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
        This browser · {liveCount} live record{liveCount === 1 ? '' : 's'}. Connect a database to see every visitor.
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
            onClick={() => { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* */ } setUnlocked(false); }}
            className="h-10 px-3 rounded-xl flex items-center gap-2.5 text-sm text-fg-3 hover:text-fg hover:bg-surface-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} /> Lock dashboard
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

        {showSamples && (
          <div className="mx-4 sm:mx-8 mt-5 rounded-xl border border-dashed border-[#FAB219]/40 bg-[#FAB219]/[0.06] px-4 py-2.5 text-xs text-fg-2">
            Sample records are shown alongside real ones and are marked <SampleTag />. Turn them off under Data source.
          </div>
        )}

        <main key={view} className="ad-view p-4 sm:p-8">
          {view === 'overview' && <Overview registrations={registrations} logins={logins} onOpen={setSelected} go={go} />}
          {view === 'approvals' && <Approvals registrations={approvable} onOpen={setSelected} />}
          {view === 'registrations' && <Registrations registrations={registrations} onOpen={setSelected} />}
          {view === 'signins' && <SignIns logins={logins} registrations={registrations} />}
        </main>
      </div>

      {selected && (
        <Drawer
          record={registrations.find((r) => r.id === selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
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

function Card({ title, action, children, className = '', i = 0 }) {
  return (
    <section className={`ad-card ad-rise rounded-2xl border border-line bg-surface-0/70 p-5 sm:p-6 ${className}`} style={{ '--i': i }}>
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

function Overview({ registrations, logins, onOpen, go }) {
  const approvable = registrations.filter((r) => TYPES[r.type]?.approvable);
  const pending = approvable.filter((r) => r.status === 'pending').length;
  const approved = approvable.filter((r) => r.status === 'approved').length;
  const declined = approvable.filter((r) => r.status === 'declined').length;
  const decided = approved + declined;
  const week = lastNDays(7);
  const signIns7 = logins.filter((l) => l.action !== 'sign-out' && new Date(l.at) >= week[0]).length;
  const days14 = lastNDays(14);
  const regSpark = days14.map((d) => approvable.filter((r) => sameDay(r.submittedAt, d)).length);
  const loginSpark = days14.map((d) => logins.filter((l) => l.action !== 'sign-out' && sameDay(l.at, d)).length);

  const countries = Object.entries(
    approvable.reduce((acc, r) => {
      if (r.country) acc[r.country] = (acc[r.country] || 0) + 1;
      return acc;
    }, {}),
  ).map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, 6);

  const feed = [
    ...registrations.slice(0, 12).map((r) => ({ kind: 'reg', at: r.submittedAt, r })),
    ...logins.slice(0, 12).map((l) => ({ kind: 'login', at: l.at, l })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 9);

  const tiles = [
    { label: 'Registrations', value: approvable.length, caption: 'all forms, all time', spark: regSpark },
    { label: 'Awaiting review', value: pending, caption: pending ? 'need a decision' : 'queue is clear', accent: '#FAB219', onClick: () => go('approvals') },
    { label: 'Approval rate', value: decided ? Math.round((approved / decided) * 100) : null, suffix: '%', caption: decided ? `${approved} approved · ${declined} declined` : 'no decisions yet' },
    { label: 'Sign-ins, 7 days', value: signIns7, caption: (() => { const n = new Set(logins.map((l) => l.email)).size; return `${n} ${n === 1 ? 'person' : 'people'} overall`; })(), spark: loginSpark },
  ];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        {tiles.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={t.onClick}
            disabled={!t.onClick}
            className={`ad-card ad-rise text-left rounded-2xl border border-line bg-surface-0/70 p-4 sm:p-5 ${t.onClick ? 'cursor-pointer hover:border-gold-foil/50' : 'cursor-default'}`}
            style={{ '--i': i }}
          >
            <p className="text-xs text-fg-3 flex items-center gap-1.5">
              {t.accent && <span className="w-1.5 h-1.5 rounded-full ad-blink" style={{ background: t.accent }} />}
              {t.label}
            </p>
            <p className="mt-3 font-serif text-3xl sm:text-[40px] leading-none text-fg">{t.value === null ? '—' : <Counter value={t.value} suffix={t.suffix} />}</p>
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
          action={<Legend items={TYPE_ORDER.map((t) => ({ label: TYPES[t].short, color: TYPES[t].color }))} />}
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
              <li key={(f.r?.id || f.l?.email) + f.at} className="ad-feed-item py-2.5 border-b border-line last:border-0" style={{ '--i': i }}>
                {f.kind === 'reg' ? (
                  <button onClick={() => onOpen(f.r.id)} className="w-full text-left flex items-start gap-3 cursor-pointer group">
                    <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: TYPES[f.r.type]?.color }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-fg truncate group-hover:text-gold-text transition-colors">
                        {f.r.name || 'Someone'} <span className="text-fg-3">registered · {TYPES[f.r.type]?.short}</span>
                      </span>
                      <span className="block text-xs text-fg-3">{timeAgo(f.at)} {f.r.source === 'sample' && <SampleTag />}</span>
                    </span>
                  </button>
                ) : (
                  <div className="flex items-start gap-3">
                    <Activity className="mt-0.5 w-3.5 h-3.5 text-fg-3 shrink-0" strokeWidth={1.5} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-fg truncate">
                        {f.l.name || f.l.email} <span className="text-fg-3">{f.l.action.replace('-', ' ')} · {f.l.method}</span>
                      </span>
                      <span className="block text-xs text-fg-3">{timeAgo(f.at)} {f.l.source === 'sample' && <SampleTag />}</span>
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
  const opts = [{ id: 'all', label: 'All' }, ...TYPE_ORDER.map((t) => ({ id: t, label: TYPES[t].short }))];
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
            {o.id !== 'all' && <span className="w-2 h-2 rounded-full" style={{ background: TYPES[o.id].color }} />}
            {o.label}
            <span className="text-xs text-fg-3 tabular-nums">{n}</span>
          </button>
        );
      })}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder = 'Search name, email, ID…' }) {
  return (
    <label className="relative block w-full sm:w-72">
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

const matches = (r, q) => !q || [r.name, r.email, r.id, r.organisation, r.country].some((v) => v && String(v).toLowerCase().includes(q.toLowerCase()));

function Approvals({ registrations, onOpen }) {
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [leaving, setLeaving] = useState({});
  const [toast, setToast] = useState(null);

  const pending = registrations.filter((r) => r.status === 'pending');
  const shown = pending.filter((r) => (type === 'all' || r.type === type) && matches(r, q));
  const recent = registrations
    .filter((r) => r.status !== 'pending' && r.decidedAt)
    .sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt))
    .slice(0, 8);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const act = (r, status) => {
    setLeaving((l) => ({ ...l, [r.id]: status }));
    // let the card animate out, then record the decision
    setTimeout(() => {
      decide(r.id, status);
      setLeaving((l) => { const n = { ...l }; delete n[r.id]; return n; });
      setToast({ id: r.id, name: r.name, status });
    }, 380);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 items-start">
      <div className="xl:col-span-2 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TypeFilter value={type} onChange={setType} records={pending} />
          <SearchBox value={q} onChange={setQ} />
        </div>

        {shown.length === 0 && (
          <Card i={1}>
            <div className="py-10 flex flex-col items-center text-center">
              <span className="ad-clear w-14 h-14 rounded-full border border-[#0CA30C]/50 flex items-center justify-center">
                <Check className="w-6 h-6 text-[#0CA30C]" strokeWidth={2} />
              </span>
              <p className="mt-4 font-serif text-xl text-fg">All caught up</p>
              <p className="mt-1 text-sm text-fg-3">No registrations are waiting for review{type !== 'all' ? ' in this category' : ''}.</p>
            </div>
          </Card>
        )}

        <ul className="flex flex-col gap-3">
          {shown.map((r, i) => (
            <li
              key={r.id}
              className={`ad-queue ad-rise rounded-2xl border border-line bg-surface-0/70 overflow-hidden ${leaving[r.id] ? `is-leaving is-${leaving[r.id]}` : ''}`}
              style={{ '--i': Math.min(i, 8), '--type': TYPES[r.type].color }}
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <button onClick={() => onOpen(r.id)} className="flex-1 min-w-0 text-left cursor-pointer group">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <TypeTag type={r.type} />
                    <span className="text-xs text-fg-3">{timeAgo(r.submittedAt)}</span>
                    {r.source === 'sample' && <SampleTag />}
                  </div>
                  <p className="mt-1.5 text-[15px] text-fg font-medium truncate group-hover:text-gold-text transition-colors">
                    {r.name || 'Unnamed'} <span className="text-fg-3 font-normal">· {r.organisation || '—'}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-fg-3 truncate">
                    {[r.detail, r.sector, r.country].filter(Boolean).join(' · ')} · <span className="font-mono">{r.id}</span>
                  </p>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => act(r, 'declined')} className="ad-btn ad-btn-decline" aria-label={`Decline ${r.name}`}>
                    <X className="w-4 h-4" strokeWidth={2} /> Decline
                  </button>
                  <button onClick={() => act(r, 'approved')} className="ad-btn ad-btn-approve" aria-label={`Approve ${r.name}`}>
                    <Check className="w-4 h-4" strokeWidth={2} /> Approve
                  </button>
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
                <span className="block text-xs text-fg-3">{TYPES[r.type].short} · {timeAgo(r.decidedAt)}</span>
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

/* ── Registrations table ──────────────────────────────── */

function toCsv(rows) {
  const cols = ['id', 'type', 'status', 'name', 'email', 'organisation', 'country', 'detail', 'sector', 'submittedAt', 'decidedAt', 'source'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

function Registrations({ registrations, onOpen }) {
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const withQueries = registrations;
  const rows = withQueries.filter((r) => (type === 'all' || r.type === type) && (status === 'all' || r.status === status) && matches(r, q));

  const download = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bharat-connect-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const typeOpts = [...TYPE_ORDER, 'query'];

  // Reminder for the next event to every registered (not declined) startup, blind-copied.
  // shortcut: opens the admin's mail app; long lists can exceed mailto limits, so switch to a
  // scheduled Cloud Function + email service once Firebase is connected.
  const event = currentEvent();
  const startupEmails = [...new Set(registrations
    .filter((r) => r.type === 'startup' && r.source !== 'sample' && r.status !== 'declined' && r.email)
    .map((r) => r.email.toLowerCase()))];
  const remindStartups = () => {
    const when = new Date(event.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
    const subject = `Reminder: ${event.name} on ${when}`;
    const body = `Dear founder,

This is a reminder that ${event.name} (${event.subtitle}) begins on ${when} at ${event.venue}.

${event.startupNote}

Sign in to your startup page on the Bharat Connect website for your registration details, the programme and live updates during the event.

Regards,
Bharat Connect Secretariat`;
    window.location.href = `mailto:?bcc=${encodeURIComponent(startupEmails.join(','))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="ad-select" aria-label="Type">
            <option value="all">All types</option>
            {typeOpts.map((t) => <option key={t} value={t}>{TYPES[t].short}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="ad-select" aria-label="Status">
            <option value="all">All statuses</option>
            {Object.keys(STATUS).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
            <option value="received">Received (inquiries)</option>
          </select>
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

      <div className="ad-rise rounded-2xl border border-line bg-surface-0/70 overflow-hidden" style={{ '--i': 1 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs text-fg-3 border-b border-line">
                <th className="font-medium px-5 py-3">Name</th>
                <th className="font-medium px-3 py-3">Type</th>
                <th className="font-medium px-3 py-3">Organisation</th>
                <th className="font-medium px-3 py-3">Country</th>
                <th className="font-medium px-3 py-3">Submitted</th>
                <th className="font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 200).map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => onOpen(r.id)}
                  className="ad-row border-b border-line last:border-0 hover:bg-surface-2/70 cursor-pointer"
                  style={{ '--i': Math.min(i, 14) }}
                >
                  <td className="px-5 py-3">
                    <span className="block text-fg">{r.name || '—'} {r.source === 'sample' && <SampleTag />}</span>
                    <span className="block text-xs text-fg-3">{r.email}</span>
                  </td>
                  <td className="px-3 py-3"><TypeTag type={r.type} /></td>
                  <td className="px-3 py-3 text-fg-2">{r.organisation || '—'}</td>
                  <td className="px-3 py-3 text-fg-2">{r.country || '—'}</td>
                  <td className="px-3 py-3 text-fg-3 whitespace-nowrap">{timeAgo(r.submittedAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <Empty text="No registrations match these filters." />}
        <p className="px-5 py-3 border-t border-line text-xs text-fg-3">
          {rows.length} of {withQueries.length} records{rows.length > 200 ? ' · showing the latest 200' : ''}
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
        {tiles.map((t, i) => (
          <div key={t.label} className="ad-card ad-rise rounded-2xl border border-line bg-surface-0/70 p-5" style={{ '--i': i }}>
            <p className="text-xs text-fg-3">{t.label}</p>
            <p className="mt-3 font-serif text-[40px] leading-none text-fg"><Counter value={t.value} /></p>
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

      <div className="ad-rise rounded-2xl border border-line bg-surface-0/70 overflow-hidden" style={{ '--i': 4 }}>
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
  id: 'Reference', email: 'Email', phone: 'Phone', organisation: 'Organisation', designation: 'Designation',
  country: 'Country', detail: 'Category', sector: 'Sector', dealSize: 'Deal size', payment: 'Payment',
  message: 'Message', b2b: 'B2B deal rooms', visaLetter: 'Visa letter',
};

function Drawer({ record, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!record) return null;
  const r = record;
  const fields = Object.keys(FIELD_LABELS).filter((k) => r[k] !== undefined && r[k] !== '' && r[k] !== null);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${r.name} details`}>
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <aside className="ad-drawer absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface-0 border-l border-line overflow-y-auto">
        <div className="h-1" style={{ background: TYPES[r.type]?.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <TypeTag type={r.type} />
              <h2 className="mt-2 font-serif text-2xl text-fg">{r.name || 'Unnamed'}</h2>
              <p className="text-sm text-fg-3">Submitted {new Date(r.submittedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-lg text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center cursor-pointer" aria-label="Close">
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <StatusBadge status={r.status} />
            {r.source === 'sample' && <SampleTag />}
          </div>

          <dl className="mt-6 divide-y divide-line border-y border-line">
            {fields.map((k) => (
              <div key={k} className="py-2.5 grid grid-cols-[120px_1fr] gap-3 text-sm">
                <dt className="text-fg-3">{FIELD_LABELS[k]}</dt>
                <dd className={`text-fg break-words ${k === 'id' ? 'font-mono text-xs pt-0.5' : ''}`}>
                  {typeof r[k] === 'boolean' ? (r[k] ? 'Yes' : 'No') : String(r[k])}
                </dd>
              </div>
            ))}
          </dl>

          {TYPES[r.type]?.approvable && (
            <div className="mt-6 flex flex-wrap gap-2">
              {r.status !== 'approved' && (
                <button onClick={() => decide(r.id, 'approved')} className="ad-btn ad-btn-approve"><Check className="w-4 h-4" strokeWidth={2} /> Approve</button>
              )}
              {r.status !== 'declined' && (
                <button onClick={() => decide(r.id, 'declined')} className="ad-btn ad-btn-decline"><X className="w-4 h-4" strokeWidth={2} /> Decline</button>
              )}
              {r.status !== 'pending' && (
                <button onClick={() => decide(r.id, 'pending')} className="ad-btn"><Undo2 className="w-4 h-4" strokeWidth={1.5} /> Back to pending</button>
              )}
            </div>
          )}
          {r.email && (
            <a href={`mailto:${r.email}`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-fg-2 hover:text-gold-text">
              Email {r.name?.split(' ')[0] || 'them'} <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
            </a>
          )}
          {r.source === 'sample' && (
            <p className="mt-6 text-xs text-fg-3 leading-relaxed">This is a sample record for demonstration, not a real person.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
