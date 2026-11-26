import { useEffect, useMemo, useState } from 'react';
import { 
  ArrowUpRight, 
  Rocket, 
  Search, 
  Lock, 
  LogIn, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Building2 
} from 'lucide-react';
import { watchMyStartups } from '../data/registry';
import { useAuth } from '../auth/AuthContext';

/*
  Private directory of the signed-in founder's registered startups.
  Confidential: each user only sees startups linked to their verified account / email.
*/

const href = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

const STATUS_VIEW = {
  pending: { label: 'Under review', Icon: Clock, cls: 'text-[#9A6B00] bg-[#FAB219]/15 border-[#FAB219]/40' },
  approved: { label: 'Approved', Icon: CheckCircle2, cls: 'text-[#0A7A0A] bg-[#0CA30C]/10 border-[#0CA30C]/35' },
  declined: { label: 'Declined', Icon: XCircle, cls: 'text-[#B02E2E] bg-[#D03B3B]/10 border-[#D03B3B]/35' },
};

export default function StartupsPage({ onNavigate }) {
  const { user, openAuth } = useAuth();
  const [startups, setStartups] = useState([]);
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');

  useEffect(() => {
    if (!user) {
      setStartups([]);
      return;
    }

    return watchMyStartups(user, (rawList) => {
      const formatted = rawList.map((r) => {
        const p = r.profile || {};
        const sectorsList = Array.isArray(p.sectors) && p.sectors.length > 0 
          ? p.sectors 
          : typeof r.sector === 'string' 
          ? r.sector.split(', ').filter(Boolean) 
          : [];

        return {
          id: r.id || r.ref,
          name: p.brand || r.organisation || r.name || 'Untitled Startup',
          stage: p.stage || r.stage || '',
          pitch: p.pitch || r.pitch || '',
          sectors: sectorsList,
          website: p.website || r.website || '',
          status: r.status || 'pending',
          submittedAt: r.submittedAt,
          email: r.email || r.accountEmail,
        };
      });
      setStartups(formatted);
    });
  }, [user]);

  const sectors = useMemo(
    () => ['All', ...new Set(startups.flatMap((s) => s.sectors || []))],
    [startups],
  );

  const shown = startups.filter((s) => {
    const q = query.trim().toLowerCase();
    const inSector = sector === 'All' || (s.sectors || []).includes(sector);
    const matches = !q || [s.name, s.pitch, ...(s.sectors || [])].join(' ').toLowerCase().includes(q);
    return inSector && matches;
  });

  return (
    <div className="page-enter flex flex-col min-h-screen">
      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="ref-line mb-4">Bharat Connect 2026 · Startup Pavilion</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em]">
                My Registered Startups
              </h1>
              <p className="mt-2 text-sm sm:text-base text-fg-2 max-w-xl leading-relaxed">
                {user ? (
                  <>
                    Showing private showcases registered under <strong className="text-fg">{user.email}</strong>.
                  </>
                ) : (
                  'Private showcase & accreditation registry for Bharat Connect 2026.'
                )}
              </p>
            </div>

            {user && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="px-4 py-2 rounded-xl bg-surface-2 border border-line">
                  <span className="block font-serif text-2xl text-gold-text tabular-nums">{startups.length}</span>
                  <span className="text-xs text-fg-3">Registered {startups.length === 1 ? 'Startup' : 'Startups'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('startup')}
                  className="btn-primary h-11 px-5 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>Register Startup</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="theme-cream py-12 sm:py-16 bg-surface-0 flex-1 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {!user ? (
            /* Unauthenticated Protected State - Nobody sees other startups */
            <div className="surface-card rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-line shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center mx-auto text-gold-text mb-4">
                <Lock className="w-7 h-7" strokeWidth={1.75} />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
                Sign in to view your startups
              </h2>
              <p className="mt-3 text-sm text-fg-2 leading-relaxed">
                For confidentiality and security, startup profiles are restricted to the registered account holder. Please sign in with the email linked to your startup.
              </p>
              <button
                type="button"
                onClick={() => openAuth({ mode: 'signin', reason: 'Sign in to access your registered startups.' })}
                className="mt-6 btn-primary h-11 px-7 text-sm font-semibold flex items-center gap-2 mx-auto cursor-pointer shadow-md active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" strokeWidth={2} />
                <span>Sign in with Email</span>
              </button>
              <div className="mt-8 pt-5 border-t border-line/60 text-xs text-fg-3">
                Haven't registered your startup yet?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('startup')}
                  className="text-coral hover:underline font-medium cursor-pointer"
                >
                  Register your venture
                </button>
              </div>
            </div>
          ) : startups.length === 0 ? (
            /* Authenticated but no startups for this email */
            <div className="surface-card rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto border border-line shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-line flex items-center justify-center mx-auto text-gold-text mb-4">
                <Rocket className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h2 className="mt-4 font-serif text-2xl sm:text-3xl text-fg">
                No startups registered yet
              </h2>
              <p className="mt-2 text-sm text-fg-2 leading-relaxed">
                You are signed in as <strong className="text-fg">{user.email}</strong>. No startup registration was found linked to this email.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('startup')}
                className="mt-6 btn-primary h-11 px-6 text-sm font-semibold flex items-center gap-2 mx-auto cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Register your startup</span>
              </button>
            </div>
          ) : (
            /* Authenticated with startups belonging to user */
            <>
              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <label className="relative flex-1 max-w-sm">
                  <span className="sr-only">Search your startups</span>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" strokeWidth={1.5} />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by brand, sector or stage"
                    className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-surface-3 border border-line text-sm text-fg placeholder:text-fg-3 focus:border-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
                  />
                </label>
                {sectors.length > 2 && (
                  <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by sector">
                    {sectors.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSector(s)}
                        aria-pressed={sector === s}
                        className={`h-9 px-3 rounded-full text-[13px] whitespace-nowrap border transition-colors cursor-pointer ${
                          sector === s ? 'bg-fg text-surface-0 border-fg' : 'border-line text-fg-2 hover:text-fg hover:border-line-strong'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Startup Cards Grid */}
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {shown.map((s, i) => {
                  const statusCfg = STATUS_VIEW[s.status] || STATUS_VIEW.pending;
                  const StatusIcon = statusCfg.Icon;
                  return (
                    <li
                      key={s.id}
                      className="surface-card rounded-2xl p-6 flex flex-col justify-between motion-safe:animate-slide-up border border-line hover:border-gold-foil/40 transition-all shadow-sm"
                      style={{ animationDelay: `${Math.min(i, 8) * 60}ms`, animationFillMode: 'backwards' }}
                    >
                      <div>
                        {/* Top header row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-11 h-11 rounded-xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center font-serif text-lg text-gold-text shrink-0">
                              {(s.name || '?').trim().charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <h2 className="text-base font-semibold text-fg leading-tight truncate">{s.name}</h2>
                              {s.stage && <p className="text-xs text-fg-3 mt-0.5">{s.stage}</p>}
                            </div>
                          </div>

                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusCfg.cls}`}>
                            <StatusIcon className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{statusCfg.label}</span>
                          </span>
                        </div>

                        {/* Pitch */}
                        {s.pitch && <p className="mt-4 text-[13px] leading-relaxed text-fg-2 line-clamp-3">{s.pitch}</p>}

                        {/* Sectors */}
                        {s.sectors?.length > 0 && (
                          <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {s.sectors.map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded-full bg-surface-3 border border-line text-[11px] text-fg-2">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer bar */}
                      <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-fg-3 tracking-wider">{s.id}</span>
                        {s.website ? (
                          <a
                            href={href(s.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[13px] text-gold-text hover:underline shrink-0"
                          >
                            <span>Website</span>
                            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </a>
                        ) : (
                          <span className="text-[11px] text-fg-3 font-mono">Confidential Record</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {shown.length === 0 && (
                <p className="mt-8 text-sm text-fg-3">No startups match that search filter.</p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
