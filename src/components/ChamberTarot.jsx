import { useEffect, useRef, useState } from 'react';

/*
  National chambers as a tarot spread.
  As the section scrolls into view, the cards fly up from below in a spin, land in a gentle arc with
  a burst of gold sparks, and turn face-up one by one. A faint rune ring turns behind them and gold
  motes drift upward. It follows the scroll both ways: scrolling into the section brings the cards in
  from the direction you came from, and scrolling away sends them off face-down the way you are going.
  Face: Roman numeral, a gold sigil (a polygon with one more side per card), name and country.
  Back: the same sigil framed, with the chamber's partner role. Hover, focus or tap turns a card.
*/

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function polygon(cx, cy, r, sides, rot = -90) {
  return Array.from({ length: sides }, (_, k) => {
    const a = ((rot + (360 / sides) * k) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

// eight sparks per card, evenly spread with a little variation in reach
const SPARKS = Array.from({ length: 8 }, (_, k) => ({ a: `${k * 45 + (k % 2) * 12}deg`, d: `${46 + (k % 3) * 14}px` }));

// motes drifting up through the spread
const MOTES = Array.from({ length: 14 }, (_, k) => ({
  x: `${(k * 37 + 7) % 100}%`,
  dx: `${((k * 13) % 30) - 15}px`,
  t: `${6 + (k % 5)}s`,
  delay: `${1.2 + (k % 7) * 0.7}s`,
}));

// tick marks round the rune ring
const RUNE_TICKS = Array.from({ length: 36 }, (_, k) => k * 10);

function RuneRing() {
  return (
    <svg viewBox="0 0 400 400" className="tarot-ring" aria-hidden="true">
      <g>
        <circle cx="200" cy="200" r="190" strokeWidth="0.8" strokeDasharray="2 6" />
        {RUNE_TICKS.map((deg) => (
          <line
            key={deg}
            x1="200" y1="14" x2="200" y2={deg % 30 === 0 ? 30 : 22}
            strokeWidth="0.8"
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
      </g>
      <g className="ring-b">
        <circle cx="200" cy="200" r="150" strokeWidth="0.6" />
        <polygon points={polygon(200, 200, 150, 9)} strokeWidth="0.6" />
        <polygon points={polygon(200, 200, 150, 9, -70)} strokeWidth="0.4" strokeDasharray="3 5" />
      </g>
    </svg>
  );
}

function Sigil({ sides, size = 56 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} className="tarot-sigil" aria-hidden="true">
      <circle cx="30" cy="30" r="27" />
      <circle cx="30" cy="30" r="22" className="tarot-sigil-faint" />
      <polygon points={polygon(30, 30, 18, sides)} />
      <polygon points={polygon(30, 30, 9, sides, 90)} className="tarot-sigil-faint" />
      <circle cx="30" cy="30" r="1.8" className="tarot-sigil-dot" />
    </svg>
  );
}

export default function ChamberTarot({ chambers }) {
  const ref = useRef(null);
  // idle (not yet seen) → in (dealt) → out (flown away) → in …
  const [phase, setPhase] = useState('idle');
  // which way the cards travel: 'up' = they come from / leave towards the top of the screen
  const [dir, setDir] = useState('down');
  const phaseRef = useRef('idle');
  const [turned, setTurned] = useState({});
  const n = chambers.length;
  const mid = (n - 1) / 2;

  useEffect(() => {
    const el = ref.current;
    const set = (p) => { phaseRef.current = p; setPhase(p); };
    if (!el || typeof IntersectionObserver === 'undefined') {
      set('in');
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      const r = e.intersectionRatio;
      const viewMid = (e.rootBounds?.height || window.innerHeight) / 2;
      const cardsBelowMiddle = e.boundingClientRect.top + e.boundingClientRect.height / 2 > viewMid;
      if (r >= 0.5 && phaseRef.current !== 'in') {
        // arriving: from below when scrolling down, from above when scrolling up
        setDir(cardsBelowMiddle ? 'down' : 'up');
        set('in');
      } else if (r < 0.3 && phaseRef.current === 'in') {
        // leaving: off the top when scrolling down past, off the bottom when scrolling back up
        setDir(cardsBelowMiddle ? 'down' : 'up');
        setTurned({});
        set('out');
      }
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = (i) => setTurned((t) => ({ ...t, [i]: !t[i] }));

  return (
    <div
      ref={ref}
      className={`tarot-spread ${phase === 'in' ? 'is-dealt' : ''} ${phase === 'out' ? 'is-leaving' : ''}`}
      data-dir={dir}
    >
      <RuneRing />
      <span className="tarot-motes" aria-hidden="true">
        {MOTES.map((m, k) => (
          <i key={k} style={{ '--x': m.x, '--dx': m.dx, '--t': m.t, '--delay': m.delay }} />
        ))}
      </span>
      <ul className="tarot-cards">
      {chambers.map((c, i) => {
        const off = i - mid;
        return (
          <li
            key={c.name}
            className="tarot-slot"
            style={{
              '--i': i,
              '--off': off,
              '--abs': Math.abs(off),
            }}
          >
            <button
              type="button"
              className={`tarot ${turned[i] ? 'is-turned' : ''}`}
              onClick={() => toggle(i)}
              aria-pressed={!!turned[i]}
              aria-label={`${ROMAN[i]}. ${c.name}, ${c.country}. ${c.role}`}
            >
              <span className="tarot-inner">
                {/* face */}
                <span className="tarot-face tarot-front">
                  <span className="tarot-frame" aria-hidden="true" />
                  <span className="tarot-numeral">{ROMAN[i]}</span>
                  <span className="tarot-art"><Sigil sides={i + 3} /></span>
                  <span className="tarot-name">{c.name}</span>
                  <span className="tarot-country">{c.country}</span>
                </span>
                {/* back */}
                <span className="tarot-face tarot-back" aria-hidden="true">
                  <span className="tarot-frame" />
                  <span className="tarot-back-art"><Sigil sides={i + 3} size={44} /></span>
                  <span className="tarot-role">{c.role}</span>
                  <span className="tarot-numeral tarot-numeral-back">{ROMAN[i]}</span>
                </span>
              </span>
            </button>
            <span className="tarot-sparks" aria-hidden="true">
              {SPARKS.map((sp, k) => <i key={k} style={{ '--a': sp.a, '--d': sp.d }} />)}
            </span>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
