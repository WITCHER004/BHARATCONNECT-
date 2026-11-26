import { useState, useRef, useEffect, useMemo } from 'react';
import SummitSpotlightHUD from '../components/SummitSpotlightHUD';
import Skyline from '../components/Skyline';
import AnimatedCounter from '../components/AnimatedCounter';
import DealMatchmakerSimulator from '../components/DealMatchmakerSimulator';
import SectorWheel from '../components/SectorWheel';
import ChamberTarot from '../components/ChamberTarot';
import {
  EXECUTIVE_METRICS,
  STRATEGIC_VERTICALS,
  PARTNERS_CHAMBERS,
  ARAB_NATIONS,
  KEYNOTE_SPEAKERS,
} from '../data/conclaveData';
import { ArrowRight } from 'lucide-react';

const ICON = { className: 'w-4 h-4', strokeWidth: 1.5 };

function Ornament() {
  return (
    <span className="ornament" aria-hidden="true">
      <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="currentColor" /></svg>
    </span>
  );
}

/* Hairline between the registration cards: vertical on desktop, horizontal on mobile,
   fading out at both ends with a small gold diamond at its centre. */
function CardDivider() {
  return (
    <div className="relative flex md:hidden xl:flex items-center justify-center py-2 xl:py-8 2xl:py-10" aria-hidden="true">
      <span className="block w-full h-[2px] xl:w-[2px] xl:h-full rounded-full bg-gradient-to-r xl:bg-gradient-to-b from-transparent via-[#B8893A]/80 to-transparent" />
      <span className="absolute w-2 h-2 rotate-45 bg-[#B8893A] ring-4 ring-surface-1" />
    </div>
  );
}

/*
  "22 Arab nations and their chambers"
  A gold corridor map (India at the centre, a route to every nation, grouped by region)
  beside an editorial index of the regions. Hovering a region, or a nation on the map,
  lights its routes. The chambers follow as a grid of gold-ruled cards.
*/
const MAP = { size: 560, c: 280, dot: 196, label: 222, arc: 244 };

function layoutNations(regions) {
  const entries = Object.entries(regions);
  const GAP = 1.3; // empty slots between regions
  const slots = entries.reduce((s, [, list]) => s + list.length, 0) + entries.length * GAP;
  const step = (Math.PI * 2) / slots;
  let a = -Math.PI / 2 + (GAP / 2) * step;
  const nodes = [];
  const arcs = [];
  entries.forEach(([region, list]) => {
    const start = a - step * 0.45;
    list.forEach((n) => {
      nodes.push({ ...n, region, angle: a });
      a += step;
    });
    arcs.push({ region, start, end: a - step + step * 0.45 });
    a += GAP * step;
  });
  return { nodes, arcs };
}

const polar = (r, ang) => [MAP.c + r * Math.cos(ang), MAP.c + r * Math.sin(ang)];

function arcPath(r, start, end) {
  const [x1, y1] = polar(r, start);
  const [x2, y2] = polar(r, end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function routePath(ang) {
  const [x0, y0] = polar(52, ang);
  const [x1, y1] = polar(MAP.dot - 8, ang);
  const [cx, cy] = polar(MAP.dot * 0.55, ang + 0.22);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

function CorridorMap({ regions, active, setActive, visible }) {
  const { nodes, arcs } = useMemo(() => layoutNations(regions), [regions]);
  const [hoverNation, setHoverNation] = useState(null);
  const focus = hoverNation || (active ? { region: active } : null);
  const on = (region) => !focus || focus.region === region;

  return (
    <svg
      viewBox={`0 0 ${MAP.size} ${MAP.size}`}
      className="w-full h-auto select-none"
      role="img"
      aria-label="Map of routes from India to the 22 Arab nations, grouped by region"
    >
      <defs>
        <radialGradient id="cm-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D9B36A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D9B36A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* guide rings */}
      {[MAP.dot, MAP.dot * 0.66, MAP.dot * 0.33].map((r) => (
        <circle key={r} cx={MAP.c} cy={MAP.c} r={r} fill="none" stroke="rgb(217 179 106 / 0.12)" strokeDasharray="2 6" />
      ))}
      <circle cx={MAP.c} cy={MAP.c} r={150} fill="url(#cm-core)" />

      {/* region arcs */}
      {arcs.map((g) => (
        <path
          key={g.region}
          d={arcPath(MAP.arc, g.start, g.end)}
          fill="none"
          strokeLinecap="round"
          className="cursor-pointer"
          style={{ transition: 'stroke 300ms, stroke-width 300ms' }}
          stroke={on(g.region) ? '#D9B36A' : 'rgb(217 179 106 / 0.18)'}
          strokeWidth={focus && focus.region === g.region ? 4 : 2}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActive(g.region); }}
          onClick={() => setActive((a) => (a === g.region ? null : g.region))}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActive(null); }}
        />
      ))}

      {/* routes */}
      {nodes.map((n, i) => (
        <path
          key={`r-${n.code}`}
          d={routePath(n.angle)}
          fill="none"
          stroke="#D9B36A"
          strokeLinecap="round"
          strokeWidth={hoverNation?.code === n.code ? 2 : 1.1}
          pathLength="1"
          style={{
            opacity: on(n.region) ? 0.85 : 0.1,
            strokeDasharray: 1,
            strokeDashoffset: visible ? 0 : 1,
            transition: `stroke-dashoffset 1100ms cubic-bezier(.2,.7,.2,1) ${visible ? i * 45 : 0}ms, opacity 300ms`,
          }}
        />
      ))}

      {/* nations */}
      {nodes.map((n, i) => {
        const [x, y] = polar(MAP.dot, n.angle);
        const [lx, ly] = polar(MAP.label, n.angle);
        const lit = on(n.region);
        const hot = hoverNation?.code === n.code;
        return (
          <g
            key={n.code}
            className="cursor-pointer"
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHoverNation(n); }}
            onClick={() => setHoverNation((h) => (h?.code === n.code ? null : n))}
            onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHoverNation(null); }}
            style={{ opacity: visible ? 1 : 0, transition: `opacity 500ms ${600 + i * 45}ms` }}
          >
            <circle cx={x} cy={y} r={14} fill="transparent" />
            {hot && <circle cx={x} cy={y} r={9} fill="none" stroke="#E8C789" strokeOpacity="0.6" />}
            <circle
              cx={x}
              cy={y}
              r={hot ? 5 : 3.5}
              style={{ transition: 'fill 300ms' }}
              fill={lit ? '#E8C789' : 'rgb(217 179 106 / 0.25)'}
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="10.5"
              letterSpacing="0.06em"
              style={{ transition: 'fill 300ms' }}
              fill={hot ? '#F7F2E8' : lit ? '#c4d0cb' : 'rgb(196 208 203 / 0.3)'}
            >
              {n.code}
            </text>
          </g>
        );
      })}

      {/* India hub */}
      <circle cx={MAP.c} cy={MAP.c} r={56} fill="none" stroke="#D9B36A" strokeOpacity="0.2" />
      <circle cx={MAP.c} cy={MAP.c} r={50} fill="#0a0d0c" stroke="#D9B36A" strokeOpacity="0.7" />
      {hoverNation ? (
        <>
          <text x={MAP.c} y={MAP.c - 5} textAnchor="middle" fill="#F7F2E8" fontSize={hoverNation.name.length > 11 ? 10.5 : 14} fontFamily="Playfair Display, serif">
            {hoverNation.name}
          </text>
          <text x={MAP.c} y={MAP.c + 14} textAnchor="middle" fill="#e6c47f" fontSize="8.5" letterSpacing="0.12em" fontFamily="IBM Plex Mono, monospace">
            {hoverNation.capital.split(' / ')[0].toUpperCase()}
          </text>
        </>
      ) : (
        <>
          <text x={MAP.c} y={MAP.c - 3} textAnchor="middle" fill="#F7F2E8" fontSize="17" fontFamily="Playfair Display, serif">India</text>
          <text x={MAP.c} y={MAP.c + 15} textAnchor="middle" fill="#e6c47f" fontSize="8.5" letterSpacing="0.16em" fontFamily="IBM Plex Mono, monospace">NEW DELHI</text>
        </>
      )}
    </svg>
  );
}

function NationsAndChambers({ regions }) {
  const [active, setActive] = useState(null);
  const [visible, setVisible] = useState(false);
  const mapRef = useRef(null);
  const national = PARTNERS_CHAMBERS.nationalArabChambers;
  const joint = PARTNERS_CHAMBERS.bilateralJointChambers;
  const regionList = Object.entries(regions);
  const nationCount = regionList.reduce((s, [, list]) => s + list.length, 0);

  // draw the routes when the map scrolls into view
  useEffect(() => {
    const el = mapRef.current;
    if (!el || !('IntersectionObserver' in window)) { setVisible(true); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="nations" className="relative overflow-hidden py-20 sm:py-28 border-t border-line bg-surface-1 scroll-mt-24">
      <div
        className="absolute left-1/2 top-24 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(217,179,106,0.07),transparent_60%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        {/* header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-14">
          <div className="lg:col-span-7">
            <Ornament />
            <h2 className="mt-5 font-serif font-medium text-fg tracking-[-0.02em]">
              <span className="block text-[64px] xs:text-[84px] sm:text-[120px] lg:text-[132px] leading-[0.85] bg-[linear-gradient(180deg,#F3DDA6_0%,#D9B36A_55%,#9c7330_100%)] bg-clip-text text-transparent">
                {nationCount}
              </span>
              <span className="block mt-3 text-3xl sm:text-5xl leading-[1.05]">Arab nations,</span>
              <span className="block text-3xl sm:text-5xl leading-[1.1] italic text-fg-2">one corridor.</span>
            </h2>
          </div>
          <p className="lg:col-span-5 text-[15px] text-fg-2 leading-relaxed lg:pb-3 max-w-md">
            {regionList.length} regions, {national.length} national chambers and {joint.length} joint chambers, each a
            route from New Delhi. Tap or hover a region to trace its corridor.
          </p>
        </div>

        {/* map + region index */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div ref={mapRef} className="lg:col-span-6 max-w-[560px] mx-auto w-full">
            <CorridorMap regions={regions} active={active} setActive={setActive} visible={visible} />
          </div>

          <ol className="lg:col-span-6 border-t border-line-strong">
            {regionList.map(([region, nations], i) => {
              const isOn = active === region;
              return (
                <li key={region}>
                  <button
                    type="button"
                    onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActive(region); }}
                    onClick={() => setActive((a) => (a === region ? null : region))}
                    onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActive(null); }}
                    aria-pressed={isOn}
                    className={`relative w-full text-left grid grid-cols-[2.25rem_1fr_auto] gap-x-4 items-baseline py-4 pl-3 pr-2 border-b border-line transition-colors duration-300 cursor-pointer [-webkit-tap-highlight-color:transparent] ${
                      isOn ? 'bg-surface-2' : ''
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gold-foil transition-opacity duration-300 ${isOn ? 'opacity-100' : 'opacity-0'}`}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-[11px] text-gold-text/70">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className={`block font-serif text-xl sm:text-[22px] transition-colors duration-300 ${isOn ? 'text-gold-text' : 'text-fg'}`}>
                        {region}
                      </span>
                      <span className="block mt-1 text-[13px] text-fg-3 leading-relaxed">
                        {nations.map((n) => n.name).join('  ·  ')}
                      </span>
                    </span>
                    <span className={`font-serif text-3xl leading-none transition-colors duration-300 ${isOn ? 'text-gold-text' : 'text-fg/25'}`}>
                      {String(nations.length).padStart(2, '0')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* chambers */}
        <div className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pb-5 border-b border-line-strong">
            <h3 className="font-serif text-3xl sm:text-4xl font-medium text-fg whitespace-nowrap">The chambers</h3>
            <p className="ref-line text-gold-text">{national.length} national · {joint.length} joint</p>
          </div>

          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
            <p className="ref-line">National chambers</p>
            <p className="text-xs text-fg-3">Hover or tap a card to read its role</p>
          </div>
          <div className="mt-6">
            <ChamberTarot chambers={national} />
          </div>

          <p className="mt-12 ref-line">Joint chambers</p>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {joint.map((c) => {
              const host = /host/i.test(c.focus);
              return (
                <li
                  key={c.name}
                  className={`relative rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                    host
                      ? 'bg-[linear-gradient(160deg,#1f1a10,#0f0d09)] border border-gold-foil/70 shadow-[0_20px_40px_-20px_rgba(217,179,106,0.35)]'
                      : 'bg-surface-2 border border-line hover:border-line-strong'
                  }`}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold-text">{c.base.split(',')[0]}</span>
                  <p className="mt-3 font-serif text-[17px] leading-snug text-fg flex-1">{c.name}</p>
                  <p className="mt-4 pt-3 min-h-[3.25rem] border-t border-line text-[12px] leading-[1.5] text-fg-3">{c.focus}</p>
                  {host && (
                    <span className="absolute -top-2.5 right-4 px-2 h-5 inline-flex items-center rounded-full bg-gold-foil text-[10px] font-medium uppercase tracking-[0.12em] text-[#1a1408]">
                      Host
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
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

export default function HomePage({ onNavigate, onOpenRegister }) {
  const [selectedVertical, setSelectedVertical] = useState(STRATEGIC_VERTICALS[0]?.id ?? null);
  const [hoverVertical, setHoverVertical] = useState(null);
  const tracksRef = useRef(null);
  const [tracksIn, setTracksIn] = useState(false);

  // track rows slide in once the list scrolls into view
  useEffect(() => {
    const el = tracksRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setTracksIn(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTracksIn(true);
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);


  const regions = ARAB_NATIONS.reduce((acc, n) => {
    (acc[n.region] ||= []).push(n);
    return acc;
  }, {});

  return (
    <div className="page-enter flex flex-col">
      {/* Hero: Golden architectural building designs on luxury black ground */}
      <section className="relative bg-black border-b border-line overflow-hidden min-h-[100svh] flex flex-col justify-center">
        {/* Subtle warm ambient horizon glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 90% 50% at 50% 100%, rgba(217, 179, 106, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
          }}
          aria-hidden="true"
        />

        {/* Skyline line art of Indian, Arab, and global monuments across the horizon */}
        <Skyline play={true} className="absolute inset-x-0 bottom-0 pointer-events-none z-10 opacity-90 sm:opacity-95" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 w-full pt-28 pb-24 lg:pt-16 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7">
            <p className="ref-line text-gold-text">18–19 Dec 2026 · Palash Hall, 6F · Yashobhoomi, New Delhi</p>

            <h1 className="mt-6 font-serif font-medium text-fg text-[32px] sm:text-5xl lg:text-[68px] leading-[1.12] sm:leading-[1.08] lg:leading-[1.04] tracking-[-0.025em] max-w-[14ch]">
              India and 22 Arab nations <span className="text-gold-text">at one table</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-[1.6] text-fg-2 max-w-xl">
              Two days of ministerial plenaries, sector deal rooms and 50+ exhibition stalls, working towards
              a ₹100 Cr+ bilateral trade target. Organised by IACCIA in New Delhi.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3">
              <button onClick={() => onNavigate('startup')} className="btn-primary min-h-[44px] h-12 px-6 text-[15px] shadow-md active:scale-[0.98]">
                Register a startup
              </button>
              <button onClick={() => onNavigate('register')} className="btn-secondary min-h-[44px] h-12 px-6 text-[15px] active:scale-[0.98]">
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
      <section id="registration" className="theme-ivory !bg-white py-20 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-8">
          <SectionHeader
            title="Registration & Summit Collaboration"
            intro="Bring your startup to the Startup Pavilion, register for conclave delegates, accredit for the Atal Innovation Multilateral Forum (AIMF), or partner directly with the business summit."
          />

          <div className="relative">
            {/* cards and their dividers share one grid: 1 col on mobile, 2x2 on tablet/laptop, 4 in a row on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-6 xl:gap-x-2 2xl:gap-x-4 items-stretch">
              {/* Box 1: Startup Registration */}
              <article className="theme-dark bg-[#0b0b0b] border border-line-strong rounded-2xl p-2 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(184,137,58,0.2)] hover:shadow-[0_20px_48px_-6px_rgba(0,0,0,0.26),0_6px_16px_-2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(184,137,58,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                <div className="h-full rounded-xl border border-[#B8893A]/50 p-5 sm:p-7 xl:p-4 2xl:p-6 flex flex-col justify-between">
                  <div>
                    <p className="ref-line text-gold-text text-xs tracking-wider min-h-0 sm:min-h-[22px] flex items-center">
                      Startup Pavilion · 18–19 Dec 2026 · Yashobhoomi
                    </p>
                    <h3 className="mt-3 sm:mt-4 font-serif text-xl sm:text-[22px] xl:text-[21px] 2xl:text-[24px] font-medium text-fg leading-tight min-h-0 sm:min-h-[56px] xl:min-h-[58px] flex items-center">
                      Want to register a startup?
                    </h3>
                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] xl:text-[13px] 2xl:text-[13.5px] text-fg-2 leading-relaxed min-h-0 sm:min-h-[84px] xl:min-h-[108px]">
                      Present your venture to investors and key stakeholders at the Bharat Connect Startup Showcase. Each registration
                      receives a verified unique accreditation ID (<span className="font-mono text-gold-text">BMF.BC-SEO-00001</span> onwards) valid for 2 years across 5 flagship events of Bharat Mahotsav Festivals LLP.
                    </p>
                    <dl className="mt-5 sm:mt-6 flex items-start justify-between gap-1 sm:gap-2 text-[11px] sm:text-xs xl:text-[10.5px] 2xl:text-[12px] border-t border-line/80 pt-4 sm:pt-5">
                      <div className="min-w-0"><dt className="text-fg-3">Fee</dt><dd className="mt-1 text-fg font-mono figure font-medium">₹5,900 incl.</dd></div>
                      <div className="min-w-0 text-center sm:text-left"><dt className="text-fg-3">Valid for</dt><dd className="mt-1 text-fg font-medium">2 yrs / 5 evts</dd></div>
                      <div className="min-w-0 text-right"><dt className="text-fg-3">Takes about</dt><dd className="mt-1 text-fg font-medium">10 mins</dd></div>
                    </dl>
                  </div>
                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-line/60 flex flex-col gap-2.5">
                    <button onClick={() => onNavigate('startup')} className="btn-primary min-h-[44px] h-11 xl:h-12 px-4 sm:px-5 text-[14px] sm:text-[15px] flex items-center justify-center gap-2 w-full whitespace-nowrap cursor-pointer shadow-sm active:scale-[0.98]">
                      Register now
                      <ArrowRight {...ICON} />
                    </button>
                    <button
                      onClick={() => onNavigate('query')}
                      className="min-h-[44px] h-11 xl:h-12 px-3 sm:px-4 rounded-[10px] border border-gold-foil/70 text-gold-text text-xs sm:text-[13.5px] font-medium hover:bg-gold-foil/10 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap w-full"
                    >
                      Startup Showcase FAQ
                    </button>
                  </div>
                </div>
              </article>

              <CardDivider />

              {/* Box 2: Event Registration */}
              <article className="theme-dark bg-[#0b0b0b] border border-line-strong rounded-2xl p-2 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(184,137,58,0.2)] hover:shadow-[0_20px_48px_-6px_rgba(0,0,0,0.26),0_6px_16px_-2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(184,137,58,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                <div className="h-full rounded-xl border border-[#B8893A]/50 p-5 sm:p-7 xl:p-4 2xl:p-6 flex flex-col justify-between">
                  <div>
                    <p className="ref-line text-gold-text text-xs tracking-wider min-h-0 sm:min-h-[22px] flex items-center">
                      500 Accreditations · 18–19 Dec 2026 · Yashobhoomi
                    </p>
                    <h3 className="mt-3 sm:mt-4 font-serif text-xl sm:text-[22px] xl:text-[21px] 2xl:text-[24px] font-medium text-fg leading-tight min-h-0 sm:min-h-[56px] xl:min-h-[58px] flex items-center">
                      Event &amp; delegate registration
                    </h3>
                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] xl:text-[13px] 2xl:text-[13.5px] text-fg-2 leading-relaxed min-h-0 sm:min-h-[84px] xl:min-h-[108px]">
                      Attend plenary keynotes, private B2B deal rooms, the 7,000 sq ft Yashobhoomi lounge, bilateral
                      networking lunches, and the inaugural gala dinner and leadership awards with 22 Arab delegations.
                    </p>
                    <dl className="mt-5 sm:mt-6 flex items-start justify-between gap-1 sm:gap-2 text-[11px] sm:text-xs xl:text-[10.5px] 2xl:text-[12px] border-t border-line/80 pt-4 sm:pt-5">
                      <div className="min-w-0"><dt className="text-fg-3">Access</dt><dd className="mt-1 text-fg font-medium">Plenary &amp; B2B</dd></div>
                      <div className="min-w-0 text-center sm:text-left"><dt className="text-fg-3">Capacity</dt><dd className="mt-1 text-fg font-mono figure font-medium">500 Passes</dd></div>
                      <div className="min-w-0 text-right"><dt className="text-fg-3">Accreditation</dt><dd className="mt-1 text-fg font-medium">Instant E-Badge</dd></div>
                    </dl>
                  </div>
                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-line/60 flex flex-col gap-2.5">
                    <button onClick={() => onNavigate('register')} className="btn-primary min-h-[44px] h-11 xl:h-12 px-4 sm:px-5 text-[14px] sm:text-[15px] flex items-center justify-center gap-2 w-full whitespace-nowrap cursor-pointer shadow-sm active:scale-[0.98]">
                      Register for the event
                      <ArrowRight {...ICON} />
                    </button>
                    <button
                      onClick={() => onNavigate('exhibition')}
                      className="min-h-[44px] h-11 xl:h-12 px-3 sm:px-4 rounded-[10px] border border-gold-foil/70 text-gold-text text-xs sm:text-[13.5px] font-medium hover:bg-gold-foil/10 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap w-full"
                    >
                      Book an exhibition stall
                    </button>
                  </div>
                </div>
              </article>

              <CardDivider />

              {/* Box 3: Collaboration for Business Summit */}
              <article className="theme-dark bg-[#0b0b0b] border border-line-strong rounded-2xl p-2 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(184,137,58,0.2)] hover:shadow-[0_20px_48px_-6px_rgba(0,0,0,0.26),0_6px_16px_-2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(184,137,58,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                <div className="h-full rounded-xl border border-[#B8893A]/50 p-5 sm:p-7 xl:p-4 2xl:p-6 flex flex-col justify-between">
                  <div>
                    <p className="ref-line text-gold-text text-xs tracking-wider min-h-0 sm:min-h-[22px] flex items-center">
                      Bilateral Directorate · Strategic Partnerships · 2026
                    </p>
                    <h3 className="mt-3 sm:mt-4 font-serif text-xl sm:text-[22px] xl:text-[21px] 2xl:text-[24px] font-medium text-fg leading-tight min-h-0 sm:min-h-[56px] xl:min-h-[58px] flex items-center">
                      Collaboration through Bharat Connect
                    </h3>
                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] xl:text-[13px] 2xl:text-[13.5px] text-fg-2 leading-relaxed min-h-0 sm:min-h-[84px] xl:min-h-[108px]">
                      Partner with the conclave as a country pavilion, industry co-host, sovereign deal-room sponsor, or knowledge think-tank. Dedicated portal for institutions seeking strategic bilateral collaboration.
                    </p>
                    <dl className="mt-5 sm:mt-6 flex items-start justify-between gap-1 sm:gap-2 text-[11px] sm:text-xs xl:text-[10.5px] 2xl:text-[12px] border-t border-line/80 pt-4 sm:pt-5">
                      <div className="min-w-0"><dt className="text-fg-3">Track</dt><dd className="mt-1 text-fg font-medium">Country / Sponsor</dd></div>
                      <div className="min-w-0 text-center sm:text-left"><dt className="text-fg-3">Fast-track</dt><dd className="mt-1 text-fg font-medium">Direct Desk</dd></div>
                      <div className="min-w-0 text-right"><dt className="text-fg-3">Reference</dt><dd className="mt-1 text-fg font-mono text-gold-text figure font-medium">BMF.BC-CBC</dd></div>
                    </dl>
                  </div>
                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-line/60 flex flex-col gap-2.5">
                    <button onClick={() => onNavigate('collaborate')} className="btn-primary min-h-[44px] h-11 xl:h-12 px-4 sm:px-5 text-[14px] sm:text-[15px] flex items-center justify-center gap-2 w-full whitespace-nowrap cursor-pointer shadow-sm active:scale-[0.98]">
                      Collaborate with summit
                      <ArrowRight {...ICON} />
                    </button>
                    <button
                      onClick={() => onNavigate('query')}
                      className="min-h-[44px] h-11 xl:h-12 px-3 sm:px-4 rounded-[10px] border border-gold-foil/70 text-gold-text text-xs sm:text-[13.5px] font-medium hover:bg-gold-foil/10 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap w-full"
                    >
                      Partnership Prospectus
                    </button>
                  </div>
                </div>
              </article>

              <CardDivider />

              {/* Box 4: AIMF Registration & Accreditation */}
              <article className="theme-dark bg-[#0b0b0b] border border-line-strong rounded-2xl p-2 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(184,137,58,0.2)] hover:shadow-[0_20px_48px_-6px_rgba(0,0,0,0.26),0_6px_16px_-2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(184,137,58,0.35)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                <div className="h-full rounded-xl border border-[#B8893A]/50 p-5 sm:p-7 xl:p-4 2xl:p-6 flex flex-col justify-between">
                  <div>
                    <p className="ref-line text-gold-text text-xs tracking-wider min-h-0 sm:min-h-[22px] flex items-center">
                      Cultural Pavilion · 18–19 Dec 2026 · Yashobhoomi
                    </p>
                    <h3 className="mt-3 sm:mt-4 font-serif text-xl sm:text-[22px] xl:text-[21px] 2xl:text-[24px] font-medium text-fg leading-tight min-h-0 sm:min-h-[56px] xl:min-h-[58px] flex items-center">
                      Atal Innovation Multilateral Forum
                    </h3>
                    <p className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] xl:text-[13px] 2xl:text-[13.5px] text-fg-2 leading-relaxed min-h-0 sm:min-h-[84px] xl:min-h-[108px]">
                      Complimentary accreditation for artists, cultural ensembles, cinema studios, and creative economy leaders. Verified unique accreditation ID (<span className="font-mono text-gold-text">BC.AIMF-00001</span> onwards) granting access to Grand Auditorium symphonies and plenaries.
                    </p>
                    <dl className="mt-5 sm:mt-6 flex items-start justify-between gap-1 sm:gap-2 text-[11px] sm:text-xs xl:text-[10.5px] 2xl:text-[12px] border-t border-line/80 pt-4 sm:pt-5">
                      <div className="min-w-0"><dt className="text-fg-3">Admission</dt><dd className="mt-1 text-gold-text font-medium whitespace-nowrap">Complimentary</dd></div>
                      <div className="min-w-0 text-center sm:text-left"><dt className="text-fg-3">Corridors</dt><dd className="mt-1 text-fg font-medium whitespace-nowrap">23 Nations</dd></div>
                      <div className="min-w-0 text-right"><dt className="text-fg-3">Reference</dt><dd className="mt-1 text-fg font-mono text-gold-text figure font-medium whitespace-nowrap">BC.AIMF</dd></div>
                    </dl>
                  </div>
                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-line/60 flex flex-col gap-2.5">
                    <button onClick={() => onNavigate('aimf-register')} className="btn-primary min-h-[44px] h-11 xl:h-12 px-4 sm:px-5 text-[14px] sm:text-[15px] flex items-center justify-center gap-2 w-full whitespace-nowrap cursor-pointer shadow-sm active:scale-[0.98]">
                      Register for AIMF
                      <ArrowRight {...ICON} />
                    </button>
                    <button
                      onClick={() => onNavigate('aimf')}
                      className="min-h-[44px] h-11 xl:h-12 px-3 sm:px-4 rounded-[10px] border border-gold-foil/70 text-gold-text text-xs sm:text-[13.5px] font-medium hover:bg-gold-foil/10 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center whitespace-nowrap w-full"
                    >
                      AIMF Overview &amp; Pavilion
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

          {/* Newspaper clipping */}
          <div className="mt-12 news-clip-shadow relative">
            {/* push pin holding the clipping to the board */}
            <svg
              className="absolute z-10 left-2 sm:left-7 -top-4 w-11 h-12 pointer-events-none"
              viewBox="0 0 44 48"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="pin-head" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ff8a7a" />
                  <stop offset="45%" stopColor="#d7261b" />
                  <stop offset="100%" stopColor="#7a0f0a" />
                </radialGradient>
                <linearGradient id="pin-needle" x1="0" x2="1">
                  <stop offset="0%" stopColor="#8d8d8d" />
                  <stop offset="50%" stopColor="#e6e6e6" />
                  <stop offset="100%" stopColor="#6d6d6d" />
                </linearGradient>
              </defs>
              {/* pin's shadow on the paper */}
              <ellipse cx="27" cy="36" rx="11" ry="4" fill="rgba(0,0,0,0.28)" />
              {/* needle going into the paper */}
              <path d="M20.5 26 L22 39 L23.5 26 Z" fill="url(#pin-needle)" />
              {/* collar */}
              <ellipse cx="22" cy="25" rx="7" ry="2.6" fill="#8e140d" />
              <path d="M16 18 Q22 21 28 18 L27 25 Q22 27.5 17 25 Z" fill="#b51d14" />
              {/* head */}
              <circle cx="22" cy="13" r="11" fill="url(#pin-head)" />
              <ellipse cx="18" cy="8.5" rx="3.6" ry="2.4" fill="rgba(255,255,255,0.55)" transform="rotate(-25 18 8.5)" />
            </svg>
            <article className="news-clip px-4 py-6 sm:px-9 sm:py-9">
              {/* masthead */}
              <header>
                <div className="flex items-end justify-between gap-4 text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[var(--ink-2)]">
                  <span className="hidden sm:block w-40">Summit Edition</span>
                  <p className="news-masthead flex-1 text-center text-[20px] xs:text-[26px] sm:text-[38px] md:text-[46px] normal-case tracking-normal text-[var(--ink)] leading-tight">
                    The Bharat Connect Chronicle
                  </p>
                  <span className="hidden sm:block w-40 text-right">Vol. I · No. 2026</span>
                </div>
                <div className="mt-3 news-rule-double" />
                <div className="py-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-[var(--ink-2)] border-b border-[var(--rule)]">
                  <span>New Delhi · Yashobhoomi</span>
                  <span className="hidden md:inline">CEPA and Bilateral Investment Treaty Framework</span>
                  <span>December 2026</span>
                </div>
              </header>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-0">
                {/* lead story */}
                <div className="lg:col-span-8 lg:pr-8">
                  <p className="text-[11px] uppercase tracking-[0.16em] font-bold">Trade &amp; Diplomacy</p>
                  <h3 className="mt-2 text-[30px] sm:text-[42px] font-bold leading-[1.05] tracking-[-0.01em]">
                    From Diplomatic Accords to Bankable Deals
                  </h3>
                  <p className="mt-3 text-[17px] sm:text-[19px] italic leading-snug text-[var(--ink-2)]">
                    With India-UAE commerce past $85 billion, the summit widens the corridor to the Gulf, North Africa
                    and the Levant.
                  </p>
                  <p className="mt-4 pb-3 text-[11px] uppercase tracking-[0.14em] border-b border-[var(--rule)]/30">
                    By the Bharat Connect Desk
                  </p>
                  <p className="news-columns news-dropcap mt-4 sm:columns-2 text-[15px] leading-[1.55]">
                    The India-UAE CEPA has taken bilateral commerce past $85B. Bharat Connect 2026 extends that platform
                    to the wider GCC, North Africa and the Levant: cross-border supply chains, critical mineral offtakes
                    and infrastructure co-investment.
                  </p>
                </div>

                {/* sidebar */}
                <aside className="lg:col-span-4 lg:pl-8 lg:border-l border-t lg:border-t-0 border-[var(--rule)]/40 pt-6 lg:pt-0 flex flex-col">
                  <div className="text-center border-y-2 border-[var(--rule)] py-4">
                    <p className="text-[56px] font-bold leading-none tracking-[-0.02em]">$85B</p>
                    <p className="mt-2 text-[13px] italic text-[var(--ink-2)]">India-UAE bilateral commerce under CEPA</p>
                  </div>

                  <p className="mt-5 text-[11px] uppercase tracking-[0.16em] font-bold">Inside</p>
                  <ul className="mt-2 text-[15px] divide-y divide-[var(--rule)]/25">
                    <li>
                      <button onClick={() => onNavigate('schedule')} className="news-link w-full flex items-baseline gap-2 py-2.5 text-left">
                        <span>The two-day programme</span>
                        <span className="flex-1 border-b border-dotted border-[var(--rule)]/50 translate-y-[-3px]" aria-hidden="true" />
                        <span aria-hidden="true">→</span>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => onNavigate('exhibition')} className="news-link w-full flex items-baseline gap-2 py-2.5 text-left">
                        <span>Exhibition stall packages</span>
                        <span className="flex-1 border-b border-dotted border-[var(--rule)]/50 translate-y-[-3px]" aria-hidden="true" />
                        <span aria-hidden="true">→</span>
                      </button>
                    </li>
                  </ul>
                </aside>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-20 sm:py-24 border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            title="Seven sector tracks"
            intro="Roundtables, ministerial presentations and private B2B deal rooms, organised around seven corridors of trade."
            action={<TextLink onClick={() => onNavigate('schedule')}>Track schedules</TextLink>}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* animated wheel of the seven tracks */}
            <div className="lg:col-span-6 max-w-lg w-full mx-auto">
              <SectorWheel
                sectors={STRATEGIC_VERTICALS}
                activeId={hoverVertical || selectedVertical}
                onSelect={setSelectedVertical}
                onHover={setHoverVertical}
              />
            </div>

            {/* track titles: hover or select one to light it up on the wheel */}
            <ul ref={tracksRef} className="lg:col-span-6 border-t border-line">
              {STRATEGIC_VERTICALS.map((vert, idx) => {
                const on = (hoverVertical || selectedVertical) === vert.id;
                return (
                  <li
                    key={vert.id}
                    className={`track-row relative border-b border-line ${tracksIn ? 'is-in' : ''} ${on ? 'is-open' : ''}`}
                    style={{ '--i': idx }}
                    onMouseEnter={() => setHoverVertical(vert.id)}
                    onMouseLeave={() => setHoverVertical(null)}
                  >
                    <span className="track-bar absolute -left-3 sm:-left-4 top-3 bottom-3 w-0.5 rounded-full bg-gold-foil" aria-hidden="true" />
                    <button
                      onClick={() => setSelectedVertical(vert.id)}
                      onFocus={() => setHoverVertical(vert.id)}
                      onBlur={() => setHoverVertical(null)}
                      aria-pressed={selectedVertical === vert.id}
                      className="w-full py-4 flex items-baseline gap-5 text-left cursor-pointer"
                    >
                      <span className="ref-line text-gold-text shrink-0 w-14">{String(idx + 1).padStart(2, '0')}</span>
                      <span className={`font-serif text-lg sm:text-xl font-medium transition-colors duration-200 ${on ? 'text-gold-text' : 'text-fg'}`}>
                        {vert.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-16">
            <DealMatchmakerSimulator onOpenBooking={() => onNavigate('register')} />
          </div>
        </div>
      </section>

      {/* Nations and chambers */}
      <NationsAndChambers regions={regions} />

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
