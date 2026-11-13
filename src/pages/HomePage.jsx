import { useState, useRef } from 'react';
import IntroSplash from '../components/IntroSplash';
import HeroBackgroundFilm from '../components/HeroBackgroundFilm';
import SummitSpotlightHUD from '../components/SummitSpotlightHUD';
import Skyline from '../components/Skyline';
import AnimatedCounter from '../components/AnimatedCounter';
import DealMatchmakerSimulator from '../components/DealMatchmakerSimulator';
import {
  EXECUTIVE_METRICS,
  STRATEGIC_VERTICALS,
  PARTNERS_CHAMBERS,
  ARAB_NATIONS,
  KEYNOTE_SPEAKERS,
} from '../data/conclaveData';
import { ArrowRight, ChevronDown } from 'lucide-react';

const ICON = { className: 'w-4 h-4', strokeWidth: 1.5 };

function Ornament() {
  return (
    <span className="ornament" aria-hidden="true">
      <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="currentColor" /></svg>
    </span>
  );
}

function SectionHeader({ title, intro, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div className="max-w-2xl">
        <Ornament />
        <h2 className="mt-4 font-serif text-3xl sm:text-4xl font-medium text-fg tracking-[-0.01em]">{title}</h2>
        {intro && <p className="mt-4 text-[15px] text-fg-2 leading-relaxed">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

function TextLink({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-medium text-fg-2 hover:text-fg transition-colors cursor-pointer self-start md:self-auto"
    >
      {children}
      <ArrowRight {...ICON} />
    </button>
  );
}

const INTRO_KEY = 'babc-intro-seen';

// The opening film plays once per browser tab, and never for people who ask for less motion.
// Add ?intro to the address (e.g. localhost:3000/?intro) to play it again on demand.
function shouldPlayIntro() {
  try {
    if (new URLSearchParams(window.location.search).has('intro')) return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return !sessionStorage.getItem(INTRO_KEY);
  } catch {
    return false;
  }
}

export default function HomePage({ onNavigate, onOpenRegister }) {
  const [introActive, setIntroActive] = useState(shouldPlayIntro);

  const finishIntro = () => {
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* storage unavailable */ }
    setIntroActive(false);
  };
  const [selectedVertical, setSelectedVertical] = useState(STRATEGIC_VERTICALS[0]?.id ?? null);

  const regions = ARAB_NATIONS.reduce((acc, n) => {
    (acc[n.region] ||= []).push(n);
    return acc;
  }, {});

  return (
    <div className="page-enter flex flex-col">
      {introActive && <IntroSplash onDone={finishIntro} />}

      {/* Hero: the launch film plays here as the overall backdrop, over the twin skyline */}
      <section className="relative bg-royal border-b border-line overflow-hidden min-h-[100svh] flex flex-col justify-center">
        {/* Overall Homepage Film Canvas (Full-Bleed Background Animation) */}
        <HeroBackgroundFilm active={!introActive} />

        {/* Skyline line art at the bottom horizon */}
        <Skyline play={!introActive} className="absolute inset-x-0 bottom-0 pointer-events-none z-10 opacity-70" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 w-full pt-28 pb-24 lg:pt-16 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7">
            <p className="ref-line text-gold-text">18–19 Dec 2026 · Palash Hall, 6F · Yashobhoomi, New Delhi</p>

            <h1 className="mt-6 font-serif font-medium text-fg text-[40px] leading-[1.08] sm:text-6xl lg:text-[68px] lg:leading-[1.04] tracking-[-0.025em] max-w-[13ch]">
              India and 22 Arab nations <span className="text-gold-text">at one table</span>
            </h1>

            <p className="mt-6 text-lg leading-[1.6] text-fg-2 max-w-xl">
              Two days of ministerial plenaries, sector deal rooms and 100+ exhibition stalls, working towards
              a $500B bilateral trade target. Organised by IACCIA in New Delhi.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button onClick={() => onNavigate('startup')} className="btn-primary h-12 px-6 text-[15px]">
                Register a startup
              </button>
              <button onClick={() => onNavigate('register')} className="btn-secondary h-12 px-6 text-[15px]">
                Event registration
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <SummitSpotlightHUD onNavigate={onNavigate} />
          </div>
        </div>
      </section>

      {/* Registration: startups, event and business summit collaboration */}
      <section id="registration" className="theme-ivory !bg-white py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            title="Registration & Summit Collaboration"
            intro="Bring your startup to the Startup Pavilion, register to attend the conclave, or partner directly with the business summit."
          />

          <div className="relative">
            {/* Fine minimalistic vertical divider lines between columns on desktop */}
            <div
              className="hidden lg:block absolute left-1/3 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-[#B8893A]/40 to-transparent -translate-x-1/2 pointer-events-none z-10"
              aria-hidden="true"
            />
            <div
              className="hidden lg:block absolute left-2/3 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-[#B8893A]/40 to-transparent -translate-x-1/2 pointer-events-none z-10"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {/* Box 1: Startup Registration */}
              <article className="theme-dark bg-[#0b0b0b] border border-line-strong rounded-2xl p-2 shadow-[0_2px_6px_rgb(0_0_0/0.06),0_18px_48px_-8px_rgb(0_0_0/0.18),0_0_0_6px_rgb(184_137_58/0.06)] flex flex-col h-full">
                <div className="h-full rounded-xl border border-[#B8893A]/50 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <p className="ref-line text-gold-text text-xs tracking-wider min-h-[22px] flex items-center">
                      Startup Pavilion · 18–19 Dec 2026 · Yashobhoomi
                    </p>
                    <h3 className="mt-4 font-serif text-2xl sm:text-[26px] xl:text-[28px] font-medium text-fg leading-tight min-h-[68px] flex items-center">
                      Want to register a startup?
                    </h3>
                    <p className="mt-4 text-[14px] sm:text-[15px] text-fg-2 leading-relaxed min-h-[105px]">
                      Present your venture to investors and key stakeholders at the Bharat Connect Startup Showcase. Each registration
                      receives a verified unique accreditation ID (<span className="font-mono text-gold-text">BMF.BC-SU-00001</span> onwards) valid for 2 years across 5 flagship events of Bharat Mahotsav Festivals LLP.
                    </p>
                    <dl className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-[13px] border-t border-line/80 pt-6">
                      <div><dt className="text-fg-3">Fee</dt><dd className="mt-1 text-fg font-mono figure font-medium">₹5,900 incl.</dd></div>
                      <div><dt className="text-fg-3">Valid for</dt><dd className="mt-1 text-fg font-medium">2 yrs / 5 evts</dd></div>
                      <div><dt className="text-fg-3">Takes about</dt><dd className="mt-1 text-fg font-medium">10 minutes</dd></div>
                    </dl>
                  </div>
                  <div className="mt-8 pt-6 border-t border-line/60 flex flex-col gap-2.5">
                    <button onClick={() => onNavigate('startup')} className="btn-primary h-12 px-5 text-[15px] flex items-center justify-center gap-2 w-full whitespace-nowrap cursor-pointer">
                      Register now
                      <ArrowRight {...ICON} />
                    </button>
                    <button
                      onClick={() => onNavigate('query')}
                      className="h-12 px-4 rounded-[10px] border border-gold-foil/70 text-gold-text text-xs sm:text-[14px] font-medium hover:bg-gold-foil/10 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap w-full"
                    >
                      Startup Showcase FAQ
                    </button>
                  </div>
                </div>
              </article>

              {/* Minimalist horizontal separator on mobile between card 1 and 2 */}
              <div className="lg:hidden w-full h-px bg-gradient-to-r from-transparent via-[#B8893A]/30 to-transparent -my-2" aria-hidden="true" />

              {/* Box 2: Event Registration */}
              <article className="theme-dark bg-[#0b0b0b] border border-line-strong rounded-2xl p-2 shadow-[0_2px_6px_rgb(0_0_0/0.06),0_18px_48px_-8px_rgb(0_0_0/0.18),0_0_0_6px_rgb(184_137_58/0.06)] flex flex-col h-full">
                <div className="h-full rounded-xl border border-[#B8893A]/50 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <p className="ref-line text-gold-text text-xs tracking-wider min-h-[22px] flex items-center">
                      500 Accreditations · 18–19 Dec 2026 · Yashobhoomi
                    </p>
                    <h3 className="mt-4 font-serif text-2xl sm:text-[26px] xl:text-[28px] font-medium text-fg leading-tight min-h-[68px] flex items-center">
                      Event &amp; delegate registration
                    </h3>
                    <p className="mt-4 text-[14px] sm:text-[15px] text-fg-2 leading-relaxed min-h-[105px]">
                      Attend plenary keynotes, private B2B deal rooms, the 7,000 sq ft Yashobhoomi lounge, bilateral
                      networking lunches, and the inaugural gala dinner and leadership awards with 22 Arab delegations.
                    </p>
                    <dl className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-[13px] border-t border-line/80 pt-6">
                      <div><dt className="text-fg-3">Access</dt><dd className="mt-1 text-fg font-medium">Plenary &amp; B2B</dd></div>
                      <div><dt className="text-fg-3">Capacity</dt><dd className="mt-1 text-fg font-mono figure font-medium">500 Passes</dd></div>
                      <div><dt className="text-fg-3">Accreditation</dt><dd className="mt-1 text-fg font-medium">Instant E-Badge</dd></div>
                    </dl>
                  </div>
                  <div className="mt-8 pt-6 border-t border-line/60 flex flex-col gap-2.5">
                    <button onClick={() => onNavigate('register')} className="btn-primary h-12 px-5 text-[15px] flex items-center justify-center gap-2 w-full whitespace-nowrap cursor-pointer">
                      Register for the event
                      <ArrowRight {...ICON} />
                    </button>
                    <button
                      onClick={() => onNavigate('exhibition')}
                      className="h-12 px-4 rounded-[10px] border border-gold-foil/70 text-gold-text text-xs sm:text-[14px] font-medium hover:bg-gold-foil/10 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap w-full"
                    >
                      Book an exhibition stall
                    </button>
                  </div>
                </div>
              </article>

              {/* Minimalist horizontal separator on mobile between card 2 and 3 */}
              <div className="lg:hidden w-full h-px bg-gradient-to-r from-transparent via-[#B8893A]/30 to-transparent -my-2" aria-hidden="true" />

              {/* Box 3: Collaboration for Business Summit (New Portal) */}
              <article className="theme-dark bg-[#0b0b0b] border border-line-strong rounded-2xl p-2 shadow-[0_2px_6px_rgb(0_0_0/0.06),0_18px_48px_-8px_rgb(0_0_0/0.18),0_0_0_6px_rgb(184_137_58/0.06)] flex flex-col h-full">
                <div className="h-full rounded-xl border border-[#B8893A]/50 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <p className="ref-line text-gold-text text-xs tracking-wider min-h-[22px] flex items-center">
                      Bilateral Directorate · Strategic Partnerships · 2026
                    </p>
                    <h3 className="mt-4 font-serif text-2xl sm:text-[26px] xl:text-[28px] font-medium text-fg leading-tight min-h-[68px] flex items-center">
                      Collaboration for business summit
                    </h3>
                    <p className="mt-4 text-[14px] sm:text-[15px] text-fg-2 leading-relaxed min-h-[105px]">
                      Partner with the conclave as a country pavilion, industry co-host, sovereign deal-room sponsor, or knowledge think-tank. Dedicated portal for institutions seeking strategic bilateral collaboration.
                    </p>
                    <dl className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-[13px] border-t border-line/80 pt-6">
                      <div><dt className="text-fg-3">Track</dt><dd className="mt-1 text-fg font-medium">Country / Sponsor</dd></div>
                      <div><dt className="text-fg-3">Fast-track</dt><dd className="mt-1 text-fg font-medium">Direct Desk</dd></div>
                      <div><dt className="text-fg-3">Reference</dt><dd className="mt-1 text-fg font-mono text-gold-text figure font-medium">BMF.BC-COL</dd></div>
                    </dl>
                  </div>
                  <div className="mt-8 pt-6 border-t border-line/60 flex flex-col gap-2.5">
                    <button onClick={() => onNavigate('collaborate')} className="btn-primary h-12 px-5 text-[15px] flex items-center justify-center gap-2 w-full whitespace-nowrap cursor-pointer">
                      Collaborate with summit
                      <ArrowRight {...ICON} />
                    </button>
                    <button
                      onClick={() => onNavigate('query')}
                      className="h-12 px-4 rounded-[10px] border border-gold-foil/70 text-gold-text text-xs sm:text-[14px] font-medium hover:bg-gold-foil/10 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap w-full"
                    >
                      Partnership Prospectus
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Scale and impact */}
      <section className="py-20 sm:py-24 border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            title="The conclave in figures"
            intro="Anchored by Comprehensive Economic Partnership Agreements (CEPA) and direct investment channels between India and the Arab world."
          />

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-line">
            {EXECUTIVE_METRICS.map((metric, idx) => (
              <div key={metric.label} className="p-6 sm:p-8 border-r border-b border-line">
                <dd className={`font-medium text-5xl tracking-[-0.02em] ${idx === 0 ? 'text-gold-text' : 'text-fg'}`}>
                  <AnimatedCounter value={metric.value} />
                </dd>
                <dt className="mt-4 text-[15px] font-medium text-fg">{metric.label}</dt>
                <p className="mt-2 text-sm text-fg-2 leading-relaxed">{metric.description}</p>
                <p className="mt-4 ref-line">{metric.badge}</p>
              </div>
            ))}
          </dl>

          <div className="mt-12 surface-card rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <p className="text-sm text-fg-3">CEPA and bilateral investment treaty framework</p>
              <h3 className="mt-2 font-serif text-2xl sm:text-[28px] font-medium text-fg leading-tight">
                From diplomatic accords to bankable deals
              </h3>
              <p className="mt-4 text-[15px] text-fg-2 leading-relaxed">
                The India-UAE CEPA has taken bilateral commerce past $85B. Bharat Connect 2026 extends that platform to the
                wider GCC, North Africa and the Levant: cross-border supply chains, critical mineral offtakes and
                infrastructure co-investment.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button onClick={() => onNavigate('schedule')} className="btn-secondary h-11 px-5 text-sm">
                View the two-day programme
              </button>
              <button
                onClick={() => onNavigate('exhibition')}
                className="h-11 px-5 text-sm font-medium text-fg-2 hover:text-fg transition-colors cursor-pointer"
              >
                Exhibition stall packages
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-20 sm:py-24 border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            title="Six sector tracks"
            intro="Roundtables, ministerial presentations and private B2B deal rooms, organised around six corridors of trade."
            action={<TextLink onClick={() => onNavigate('schedule')}>Track schedules</TextLink>}
          />

          <ul className="border-t border-line">
            {STRATEGIC_VERTICALS.map((vert, idx) => {
              const open = selectedVertical === vert.id;
              return (
                <li key={vert.id} className="border-b border-line">
                  <button
                    onClick={() => setSelectedVertical(open ? null : vert.id)}
                    aria-expanded={open}
                    className="w-full py-6 grid grid-cols-[56px_1fr_auto] sm:grid-cols-[96px_1fr_auto_24px] items-baseline gap-4 text-left cursor-pointer group"
                  >
                    <span className="ref-line text-gold-text">Track {String(idx + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="block font-serif text-xl sm:text-2xl font-medium text-fg group-hover:text-fg transition-colors">
                        {vert.title}
                      </span>
                      <span className="block mt-1 text-sm text-fg-3">{vert.tagline}</span>
                    </span>
                    <span className="hidden sm:block font-mono text-sm text-gold-text figure">{vert.targetInvestment}</span>
                    <ChevronDown
                      {...ICON}
                      className={`w-4 h-4 text-fg-3 self-center transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {open && (
                    <div className="pb-8 grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-4 animate-slide-up">
                      <span className="hidden sm:block" />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[15px] text-fg-2 leading-relaxed">{vert.description}</p>
                          <p className="mt-4 sm:hidden font-mono text-sm text-fg-2">{vert.targetInvestment}</p>
                          <button onClick={onOpenRegister} className="mt-6 btn-secondary h-9 px-4 text-sm">
                            Join this track
                          </button>
                        </div>
                        <ul className="flex flex-col">
                          {vert.keyAreas.map((area) => (
                            <li key={area} className="flex gap-3 py-2 text-sm text-fg">
                              <span className="mt-2 w-1 h-1 rounded-full bg-fg-3 shrink-0" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-16">
            <DealMatchmakerSimulator onOpenBooking={() => onNavigate('register')} />
          </div>
        </div>
      </section>

      {/* Nations and chambers */}
      <section className="py-20 sm:py-24 border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader title="22 Arab nations and their chambers" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
              {Object.entries(regions).map(([region, nations]) => (
                <div key={region}>
                  <h3 className="text-sm font-medium text-fg pb-3 border-b border-line flex justify-between">
                    {region}
                    <span className="ref-line">{nations.length}</span>
                  </h3>
                  <ul className="mt-2">
                    {nations.map((n) => (
                      <li key={n.code} className="h-8 flex items-center justify-between text-sm text-fg-2">
                        {n.name}
                        <span className="ref-line">{n.code}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 flex flex-col gap-8">
              <div>
                <h3 className="text-sm font-medium text-fg pb-3 border-b border-line">National chambers</h3>
                <ul>
                  {PARTNERS_CHAMBERS.nationalArabChambers.map((c) => (
                    <li key={c.name} className="py-3 border-b border-line">
                      <span className="block text-sm text-fg">{c.name}</span>
                      <span className="block mt-1 ref-line">{c.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-fg pb-3 border-b border-line">Joint chambers</h3>
                <ul>
                  {PARTNERS_CHAMBERS.bilateralJointChambers.map((c) => (
                    <li key={c.name} className="py-3 border-b border-line">
                      <span className="block text-sm text-fg">{c.name}</span>
                      <span className="block mt-1 ref-line">{c.base} · {c.focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section className="py-20 sm:py-24 border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            title="Confirmed keynote speakers"
            action={<TextLink onClick={() => onNavigate('schedule')}>Full plenary roster</TextLink>}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KEYNOTE_SPEAKERS.slice(0, 4).map((spk) => (
              <article key={spk.id} className="surface-card rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="ref-line text-gold-text">{spk.country}</p>
                  <span className="text-xs text-fg-2 bg-surface-3 rounded-md px-2 py-1">{spk.track}</span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-medium text-fg leading-snug">{spk.name}</h3>
                <p className="mt-1 text-sm text-fg-2">{spk.title}</p>
                <p className="mt-4 text-sm text-fg-3 leading-relaxed flex-1">{spk.bio}</p>
                <p className="mt-6 pt-4 border-t border-line text-sm text-fg">{spk.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
