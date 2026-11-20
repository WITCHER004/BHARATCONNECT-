import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpRight, UserPlus, MapPin } from 'lucide-react';

/*
  Panel member cards and profile pop-up.
  A confirmed member shows their photo, name and bio. A seat that is still open shows a gold
  line-art portrait whose animated backdrop matches the panel:
  - Advisory: ripples spreading from the speaker, like a voice in the council chamber
  - Investor: market bars rising behind a growth line
  - Expert: a hexagon grid whose cells light up one by one
*/

const GOLD = '#D9B36A';
const GOLD_SOFT = 'rgba(217, 179, 106, 0.35)';
const pad = (n) => String(n).padStart(2, '0');

function hex(cx, cy, r) {
  const pts = Array.from({ length: 6 }, (_, k) => {
    const a = ((60 * k - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return pts.join(' ');
}

function Backdrop({ panelId }) {
  if (panelId === 'investor') {
    const bars = [70, 95, 82, 120, 108, 150];
    return (
      <g>
        {[60, 110, 160, 210].map((y) => (
          <line key={y} x1="0" x2="200" y1={y} y2={y} stroke={GOLD_SOFT} strokeDasharray="2 5" strokeWidth="0.8" />
        ))}
        {bars.map((h, i) => (
          <rect
            key={i}
            className="pm-bar"
            x={14 + i * 30}
            y={240 - h}
            width="16"
            height={h}
            rx="2"
            fill="rgba(217,179,106,0.12)"
            stroke={GOLD_SOFT}
            strokeWidth="0.8"
            style={{ '--i': i }}
          />
        ))}
        <polyline
          className="pm-trend"
          points="10,200 44,176 74,186 104,150 134,160 164,118 192,88"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
        />
      </g>
    );
  }

  if (panelId === 'expert') {
    const cells = [];
    const r = 20;
    const w = r * Math.sqrt(3);
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 7; col++) {
        const cx = col * w + (row % 2 ? w / 2 : 0) - 6;
        const cy = row * r * 1.5 - 4;
        cells.push({ cx, cy, k: (row * 7 + col) % 11 });
      }
    }
    return (
      <g>
        {cells.map((c, i) => (
          <polygon
            key={i}
            points={hex(c.cx, c.cy, r - 1.5)}
            className={c.k < 3 ? 'pm-cell pm-cell-lit' : 'pm-cell'}
            style={{ '--i': c.k }}
            fill="none"
            stroke={GOLD_SOFT}
            strokeWidth="0.8"
          />
        ))}
      </g>
    );
  }

  // advisory
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} className="pm-ripple" cx="100" cy="112" r="34" fill="none" stroke={GOLD} strokeWidth="1" style={{ '--i': i }} />
      ))}
      {[52, 78, 104].map((r) => (
        <circle key={r} cx="100" cy="112" r={r} fill="none" stroke={GOLD_SOFT} strokeWidth="0.6" strokeDasharray="2 4" />
      ))}
    </g>
  );
}

export function MemberPortrait({ panelId, seat, index, size = 'card' }) {
  const [broken, setBroken] = useState(false);
  const hasPhoto = seat.photo && !broken;

  return (
    <div className={`pm-portrait relative overflow-hidden bg-[#0B0F0E] ${size === 'card' ? 'aspect-square' : 'aspect-[4/5] sm:aspect-auto sm:h-full'}`}>
      {hasPhoto ? (
        <img
          src={`${import.meta.env.BASE_URL}${seat.photo}`}
          alt={seat.name || seat.title}
          onError={() => setBroken(true)}
          className="pm-photo absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <svg viewBox="0 0 200 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <radialGradient id={`pm-glow-${panelId}-${index}`} cx="50%" cy="40%" r="60%">
              <stop offset="0" stopColor="#D9B36A" stopOpacity="0.22" />
              <stop offset="1" stopColor="#D9B36A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="240" fill={`url(#pm-glow-${panelId}-${index})`} />
          <Backdrop panelId={panelId} />
          {/* bust */}
          <g className="pm-bust">
            <path d="M42 240 C42 186 72 164 100 164 C128 164 158 186 158 240 Z" fill="#0B0F0E" stroke={GOLD} strokeWidth="1.4" />
            <circle cx="100" cy="112" r="32" fill="#0B0F0E" stroke={GOLD} strokeWidth="1.4" />
            <path d="M86 164 L100 184 L114 164" fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinejoin="round" />
          </g>
        </svg>
      )}

      {/* bottom fade + seat badge */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
      <span className="absolute top-3 left-3 font-mono text-[11px] text-[#E6C47F] bg-black/50 backdrop-blur-sm border border-[#D9B36A]/40 rounded-md px-1.5 py-0.5">
        {pad(index + 1)}
      </span>
      {!seat.name && (
        <span className="absolute top-3 right-3 text-[10.5px] font-medium text-[#E6C47F] bg-black/50 backdrop-blur-sm border border-[#D9B36A]/40 rounded-full px-2 py-0.5">
          Seat open
        </span>
      )}
      <span className="pm-sheen absolute inset-0 pointer-events-none" aria-hidden="true" />
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function MemberCard({ panelId, seat, index, onOpen }) {
  const [ref, shown] = useReveal();
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(index)}
      className={`pm-card pm-reveal ${shown ? 'is-in' : ''} group text-left rounded-2xl overflow-hidden bg-surface-2 border border-line hover:border-gold-foil/60 cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60`}
      style={{ '--i': index }}
      aria-label={`${seat.title}: ${seat.name || 'seat open'}. View profile`}
    >
      <MemberPortrait panelId={panelId} seat={seat} index={index} />
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-gold-text">{seat.title}</span>
        <span className={`mt-1.5 font-serif text-xl leading-tight ${seat.name ? 'text-fg' : 'text-fg-3 italic'}`}>
          {seat.name || 'To be announced'}
        </span>
        {(seat.position || seat.organisation) && (
          <span className="mt-1 text-xs text-fg-3">
            {[seat.position, seat.organisation].filter(Boolean).join(' · ')}
          </span>
        )}
        <p className="mt-3 text-sm text-fg-2 leading-relaxed line-clamp-3">{seat.bio || seat.role}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {seat.focus.map((f) => (
            <span key={f} className="text-[11px] text-fg-2 bg-surface-3 border border-line rounded-full px-2 py-0.5">{f}</span>
          ))}
        </div>
        <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-medium text-fg group-hover:text-gold-text transition-colors">
          View profile
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
        </span>
      </div>
    </button>
  );
}

function ProfileModal({ panel, index, onClose, onNominate, onStep }) {
  const seat = panel.seats[index];
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);

  // rendered into <body> so the page's entrance animation can't offset the fixed overlay
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`${seat.title} profile`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div key={index} className="theme-cream relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-line shadow-2xl pm-modal grid grid-cols-1 sm:grid-cols-5">
        <div className="sm:col-span-2">
          <MemberPortrait panelId={panel.id} seat={seat} index={index} size="modal" />
        </div>
        <div className="sm:col-span-3 p-6 sm:p-8 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-gold-text pt-1">
              {pad(index + 1)} · {panel.label}
            </span>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close profile"
              className="w-9 h-9 -mt-1 -mr-2 rounded-lg text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <h3 className="mt-3 font-serif text-3xl text-fg leading-tight">{seat.title}</h3>
          <p className={`mt-1 text-[15px] ${seat.name ? 'text-fg' : 'text-fg-3 italic'}`}>
            {seat.name || 'Member to be announced'}
          </p>
          {(seat.position || seat.organisation || seat.country) && (
            <p className="mt-1 text-sm text-fg-3 flex flex-wrap items-center gap-x-2">
              {[seat.position, seat.organisation].filter(Boolean).join(' · ')}
              {seat.country && (
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />{seat.country}</span>
              )}
            </p>
          )}

          <h4 className="mt-6 text-xs font-medium text-fg">About</h4>
          <p className="mt-1.5 text-sm text-fg-2 leading-relaxed">
            {seat.bio || 'The profile will be published here once the member for this seat is confirmed.'}
          </p>

          <h4 className="mt-5 text-xs font-medium text-fg">Role on the panel</h4>
          <p className="mt-1.5 text-sm text-fg-2 leading-relaxed">{seat.role}</p>

          <h4 className="mt-5 text-xs font-medium text-fg">Focus areas</h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {seat.focus.map((f) => (
              <span key={f} className="text-xs text-fg-2 bg-surface-3 border border-line rounded-full px-2.5 py-1">{f}</span>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-line flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button onClick={() => onStep(-1)} className="h-9 px-3 rounded-lg text-sm text-fg-2 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer">← Previous</button>
              <button onClick={() => onStep(1)} className="h-9 px-3 rounded-lg text-sm text-fg-2 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer">Next →</button>
            </div>
            {!seat.name && (
              <button onClick={() => onNominate(seat)} className="btn-primary h-10 px-4 text-sm">
                <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                Nominate for this seat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function PanelMembers({ panel, onNominate }) {
  const [openIndex, setOpenIndex] = useState(null);
  const count = panel.seats.length;

  // close the pop-up when switching panels
  useEffect(() => setOpenIndex(null), [panel.id]);

  const step = useCallback((d) => setOpenIndex((i) => (i === null ? i : (i + d + count) % count)), [count]);
  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {panel.seats.map((seat, i) => (
          <MemberCard key={`${panel.id}-${seat.title}`} panelId={panel.id} seat={seat} index={i} onOpen={setOpenIndex} />
        ))}
      </div>
      {openIndex !== null && (
        <ProfileModal
          panel={panel}
          index={openIndex}
          onClose={close}
          onStep={step}
          onNominate={(seat) => {
            setOpenIndex(null);
            onNominate(seat);
          }}
        />
      )}
    </>
  );
}
