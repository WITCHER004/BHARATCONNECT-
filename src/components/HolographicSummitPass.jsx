import { useState } from 'react';
import { Home, CalendarDays, MessageCircle, UserRound, QrCode } from 'lucide-react';
import { BrandMark } from './Navbar';

/*
  The delegate pass, shown as the Bharat Connect app on a phone.
  Same props as before, so the registration form keeps drawing it live as people type.
*/

const PAPER = 'var(--color-surface-1)';
const CARD_DARK = 'var(--color-teal-dark)';
const INK = 'var(--color-fg)';

// A deterministic QR-like code drawn from the pass ID
function PassCode({ seed, size = 120, ink = INK, paper = '#FFFFFF' }) {
  const n = 21;
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && rand() > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }
  const finder = (x, y) => (
    <g key={`f${x}${y}`}>
      <rect x={x} y={y} width="7" height="7" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill={paper} />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} fill={ink} shapeRendering="crispEdges" aria-label={`Entry code ${seed}`}>
      {cells}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

function Ring({ value, size = 64 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6E2DA" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={CARD_DARK}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-medium figure" style={{ color: INK }}>
        {value}%
      </span>
    </div>
  );
}

const label = 'font-mono text-[10px] uppercase tracking-[0.2em] text-[#7A766F]';

export default function HolographicSummitPass({
  name = 'Your name',
  organization = 'Organisation',
  designation = 'Designation',
  country = 'United Arab Emirates',
  flag = 'AE',
  vertical = 'Clean Energy & Sustainability',
  passId = 'BMF.BC-DGO-00001',
  role = 'Corporate Delegate',
}) {
  const [showQr, setShowQr] = useState(false);

  // placeholders passed in while the form is empty count as missing
  const filled = {
    name: name && name !== 'Your name',
    organization: organization && organization !== 'Organisation',
    designation: designation && designation !== 'Designation',
    country: !!country,
    vertical: !!vertical,
  };
  const completeness = Math.round((Object.values(filled).filter(Boolean).length / 5) * 100);
  const missing = !filled.name ? 'your name' : !filled.organization ? 'your organisation' : !filled.designation ? 'your designation' : '';

  const firstName = filled.name ? name.trim().split(/\s+/)[0] : 'there';
  const initials = filled.name
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'BC';
  const sector = vertical.split(/[,&]/)[0].trim();

  return (
    <div className="w-full max-w-[min(320px,calc((100svh-128px)*0.56))]">
      {/* phone */}
      <div className="rounded-[48px] bg-[#0a0a0a] p-2.5 ring-1 ring-white/10 shadow-[inset_0_0_0_2px_#1c1c1c,0_25px_50px_-12px_rgb(0_0_0/0.45)]">
        <div className="relative rounded-[40px] overflow-hidden" style={{ background: PAPER, color: INK }}>
          {/* status bar */}
          <div className="h-12 px-7 flex items-center justify-between font-mono text-[13px]">
            <span>9:41</span>
            <span className="absolute left-1/2 top-2.5 -translate-x-1/2 w-28 h-7 rounded-full bg-[#0a0a0a]" aria-hidden="true" />
            <span>5G</span>
          </div>

          <div className="px-5 pb-[88px] pt-2">
            {/* greeting */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={label}>Fri, 18 Dec / Palash Hall</p>
                <h3 className="mt-1 font-serif text-[24px] leading-tight truncate">Hi, {firstName}</h3>
              </div>
              <span className="w-10 h-10 shrink-0 rounded-full bg-surface-3 text-fg flex items-center justify-center text-base font-medium">
                {initials}
              </span>
            </div>

            {/* the pass */}
            <div className="mt-4 rounded-3xl p-4 text-fg" style={{ background: CARD_DARK }}>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-medium text-fg/80">
                  <BrandMark className="w-4 h-4" />
                  Bharat Connect 2026
                </p>
                <span className="font-mono text-[10px] text-fg/60">{passId}</span>
              </div>

              {showQr ? (
                <div className="mt-3 flex flex-col items-center motion-safe:animate-fade-in">
                  <div className="rounded-2xl bg-white p-2.5">
                    <PassCode seed={passId} size={104} />
                  </div>
                  <p className="mt-2 text-xs text-fg/70">Show at the Palash Hall entrance</p>
                </div>
              ) : (
                <p className="mt-3 font-serif italic text-[18px] leading-snug">
                  “Your {role.toLowerCase()} pass is ready. See you in Palash Hall.”
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="mt-4 h-9 px-4 rounded-full bg-surface-1 text-fg text-sm font-medium inline-flex items-center gap-2 hover:bg-surface-2 active:scale-[0.98] transition-colors duration-150 cursor-pointer"
              >
                <QrCode className="w-4 h-4" strokeWidth={1.5} />
                {showQr ? 'Hide entry QR' : 'Show entry QR'}
              </button>
            </div>

            {/* profile completeness */}
            <div className="mt-3 rounded-3xl bg-surface-2/80 border border-line p-3.5 flex items-center gap-4">
              <Ring value={completeness} size={54} />
              <div className="min-w-0">
                <p className="text-[17px] font-medium leading-tight">Delegate profile</p>
                <p className="mt-1 text-sm text-fg-3 leading-snug">
                  {missing ? `Add ${missing} to finish` : `${designation} / ${flag}`}
                </p>
              </div>
            </div>

            {/* details */}
            <div className="mt-3 rounded-3xl bg-surface-2/80 border border-line p-3.5">
              <p className={label}>Your pass</p>
              <ul className="mt-2 flex flex-col gap-2 text-[14px]">
                <li className="flex items-center justify-between gap-3">
                  <span className="truncate">{organization}</span>
                  <span className="shrink-0 font-mono text-xs px-2.5 py-1 rounded-full bg-surface-3 text-fg-2">{flag}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="truncate">{sector}</span>
                  <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-surface-3 text-fg-2">Track</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="truncate">Palash Hall, Yashobhoomi</span>
                  <span className="shrink-0 font-mono text-xs px-2.5 py-1 rounded-full bg-surface-3 text-fg-2">6F</span>
                </li>
              </ul>
            </div>
          </div>

          {/* tab bar */}
          <nav className="absolute left-4 right-4 bottom-4 h-14 rounded-full bg-surface-2/95 border border-line shadow-md flex items-center justify-around" aria-hidden="true">
            <Home className="w-5 h-5 text-fg" strokeWidth={1.5} />
            <CalendarDays className="w-5 h-5 text-fg-3" strokeWidth={1.5} />
            <MessageCircle className="w-5 h-5 text-fg-3" strokeWidth={1.5} />
            <UserRound className="w-5 h-5 text-fg-3" strokeWidth={1.5} />
          </nav>
        </div>
      </div>
    </div>
  );
}
