import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Rocket, Search, LogIn } from 'lucide-react';
import { watchStartupDirectory } from '../data/registry';
import { useAuth } from '../auth/AuthContext';

/*
  Directory of registered startups. Only startups the Secretariat has approved in the admin panel
  appear (approving writes a public card to the startupDirectory collection), and only their
  public profile (brand, sectors, stage, pitch, website), never founder contact details.
*/

const href = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

export default function StartupsPage({ onNavigate }) {
  const { openAuth } = useAuth();
  const [startups, setStartups] = useState([]);
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');

  useEffect(() => watchStartupDirectory(setStartups), []);

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
    <div className="page-enter flex flex-col">
      <section className="pt-32 pb-12 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="ref-line mb-4">Bharat Connect 2026 · Startup Pavilion</p>
          <h1 className="font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em] mb-4">
            Registered startups
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <span className="block font-serif text-3xl text-gold-text tabular-nums">{String(startups.length).padStart(2, '0')}</span>
              <span className="text-xs text-fg-3">Confirmed startups</span>
            </div>
            <button
              onClick={() => openAuth({ mode: 'signin' })}
              className="btn-primary h-11 px-5 text-sm flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" strokeWidth={2} />
              <span>Login to Portal</span>
            </button>
          </div>
        </div>
      </section>

      <section className="theme-cream py-12 sm:py-16 bg-surface-0 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {startups.length === 0 ? (
            <div className="surface-card rounded-2xl p-10 text-center max-w-xl mx-auto">
              <Rocket className="w-8 h-8 text-gold-text mx-auto" strokeWidth={1.5} />
              <h2 className="mt-4 font-serif text-2xl text-fg">The first startups are on their way</h2>
              <p className="mt-2 text-sm text-fg-2 leading-6">
                Startups appear here once the secretariat confirms their registration.
              </p>
              <button
                onClick={() => openAuth({ mode: 'signin' })}
                className="mt-6 btn-secondary h-10 px-4 text-sm flex items-center gap-2 mx-auto cursor-pointer active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4 text-fg-3" strokeWidth={2} />
                <span>Login to Portal</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <label className="relative flex-1 max-w-sm">
                  <span className="sr-only">Search startups</span>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" strokeWidth={1.5} />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or sector"
                    className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-surface-3 border border-line text-sm text-fg placeholder:text-fg-3 focus:border-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
                  />
                </label>
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
              </div>

              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shown.map((s, i) => (
                  <li
                    key={s.id}
                    className="surface-card rounded-2xl p-5 flex flex-col motion-safe:animate-slide-up"
                    style={{ animationDelay: `${Math.min(i, 8) * 60}ms`, animationFillMode: 'backwards' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-11 h-11 rounded-xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center font-serif text-lg text-gold-text shrink-0">
                        {(s.name || '?').trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-[15px] font-semibold text-fg leading-5 truncate">{s.name}</h2>
                        {s.stage && <p className="text-xs text-fg-3 mt-0.5">{s.stage}</p>}
                      </div>
                    </div>
                    {s.pitch && <p className="mt-3 text-[13px] leading-5 text-fg-2 line-clamp-3">{s.pitch}</p>}
                    {s.sectors?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {s.sectors.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-surface-3 border border-line text-[11px] text-fg-2">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-fg-3 truncate">{s.id}</span>
                      {s.website && (
                        <a
                          href={href(s.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[13px] text-gold-text hover:underline shrink-0"
                        >
                          Website
                          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {shown.length === 0 && (
                <p className="mt-8 text-sm text-fg-3">No startups match that search.</p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
