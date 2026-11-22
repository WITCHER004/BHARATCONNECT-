/*
  Gold line-art diagrams for the panels, in the same drawn style as the skyline.
  Each one shows how its panel is made up; the numbered nodes match the seat cards below.
  - Advisory & Expert, Strategic Partners: a council table, the lead seat at the head
  - Investor: six kinds of capital flowing into startups and ventures, over a rising line
  - Startup: six hexagons networked like an ecosystem
  Strokes draw in with pathLength="1" (see .panel-art in index.css).
*/

const W = 520;
const H = 300;

function Draw({ d, delay = 0, faint, dashed, march, className = '' }) {
  return (
    <path
      d={d}
      pathLength="1"
      className={`pa-draw ${faint ? 'pa-faint' : ''} ${dashed ? 'pa-dashed' : ''} ${march ? 'pa-march' : ''} ${className}`}
      style={{ '--d': `${delay}s` }}
    />
  );
}

// Numbered node, faded in once the lines reach it
function Node({ x, y, n, delay, lead, r = 15 }) {
  return (
    <g className="pa-node" style={{ '--d': `${delay}s` }}>
      <circle cx={x} cy={y} r={r} className={lead ? 'pa-node-lead' : 'pa-node-ring'} />
      <text x={x} y={y + 3.5} textAnchor="middle" className={`pa-num ${lead ? 'pa-num-lead' : ''}`}>
        {String(n).padStart(2, '0')}
      </text>
    </g>
  );
}

// Expanding ring: a seat speaking, capital arriving, a sector lighting up
function Pulse({ x, y, r, i, period, stagger, start = 1.8, coral }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      className={`pa-pulse ${coral ? 'pa-pulse-coral' : ''}`}
      style={{ '--i': i, '--p': `${period}s`, '--s': `${stagger}s`, '--start': `${start}s` }}
    />
  );
}

const circlePath = (cx, cy, r) =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy}`;

const ellipsePath = (cx, cy, rx, ry) =>
  `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;

const hexPath = (cx, cy, r) => {
  const pts = Array.from({ length: 6 }, (_, k) => {
    const a = ((60 * k - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join(' L')} Z`;
};

/* ── Advisory: council table ─────────────────────────────── */
function Advisory({ count = 6 }) {
  const cx = 260;
  const cy = 158;
  const seats = Array.from({ length: count }, (_, i) => {
    const a = ((-90 + (360 / count) * i) * Math.PI) / 180;
    return {
      x: cx + 200 * Math.cos(a),
      y: cy + 102 * Math.sin(a),
      edgeX: cx + 150 * Math.cos(a),
      edgeY: cy + 62 * Math.sin(a),
    };
  });

  return (
    <>
      <Draw d={ellipsePath(cx, cy, 150, 62)} delay={0.1} />
      <Draw d={ellipsePath(cx, cy, 118, 46)} delay={0.3} faint />
      <Draw d={ellipsePath(cx, cy, 228, 124)} delay={0.2} faint dashed march />
      {/* centre emblem */}
      <Draw d={circlePath(cx, cy, 22)} delay={0.5} />
      <Draw d={`M${cx} ${cy - 11} L${cx + 11} ${cy} L${cx} ${cy + 11} L${cx - 11} ${cy} Z`} delay={0.7} />
      {seats.map((s, i) => (
        <Draw key={`l${i}`} d={`M${s.x.toFixed(1)} ${s.y.toFixed(1)} L${s.edgeX.toFixed(1)} ${s.edgeY.toFixed(1)}`} delay={0.6 + i * 0.08} faint />
      ))}
      {/* speaking turns travel round the table, seat by seat */}
      {seats.map((s, i) => (
        <Pulse key={`p${i}`} x={s.x} y={s.y} r={i === 0 ? 17 : 15} i={i} period={4.8} stagger={0.8} />
      ))}
      <Pulse x={cx} y={cy} r={22} i={0} period={4.8} stagger={0} start={1.4} />
      {seats.map((s, i) => (
        <Node key={i} x={s.x} y={s.y} n={i + 1} lead={i === 0} delay={0.9 + i * 0.1} r={i === 0 ? 17 : 15} />
      ))}
    </>
  );
}

/* ── Investor: capital flowing into ventures ─────────────── */
function Investor() {
  const hub = { x: 392, y: 150 };
  const sources = Array.from({ length: 6 }, (_, i) => ({ x: 64, y: 40 + 44 * i }));

  return (
    <>
      {/* rising growth line in the background */}
      <Draw d="M24 290 L110 278 L176 284 L244 262 L310 266 L372 244 L440 226 L500 196" delay={0.1} faint />
      <Draw d="M486 194 L500 196 L494 209" delay={1.2} faint />
      {[0, 1, 2, 3].map((k) => (
        <Draw key={`g${k}`} d={`M24 ${282 - k * 70} H496`} delay={0.05} faint dashed />
      ))}
      {sources.map((s, i) => {
        const d = `M${s.x + 15} ${s.y} C 220 ${s.y}, 260 ${hub.y}, ${hub.x - 36} ${hub.y}`;
        return (
          <g key={`f${i}`}>
            <Draw d={d} delay={0.4 + i * 0.08} />
            <path d={d} className="pa-flow" style={{ '--i': i }} />
          </g>
        );
      })}
      <Draw d={circlePath(hub.x, hub.y, 36)} delay={0.9} />
      <Draw d={circlePath(hub.x, hub.y, 50)} delay={1.0} faint dashed march />
      {sources.map((s, i) => (
        <Pulse key={`hp${i}`} x={hub.x} y={hub.y} r={36} i={i} period={3.2} stagger={0.45} start={3.6} coral />
      ))}
      <g className="pa-node" style={{ '--d': '1.2s' }}>
        <text x={hub.x} y={hub.y - 2} textAnchor="middle" className="pa-label">Startups</text>
        <text x={hub.x} y={hub.y + 12} textAnchor="middle" className="pa-label">&amp; ventures</text>
      </g>
      {sources.map((s, i) => (
        <Pulse key={`sp${i}`} x={s.x} y={s.y} r={15} i={i} period={3.2} stagger={0.45} start={1.6} />
      ))}
      {sources.map((s, i) => (
        <Node key={i} x={s.x} y={s.y} n={i + 1} delay={0.3 + i * 0.08} />
      ))}
    </>
  );
}

/* ── Expert: sector network ──────────────────────────────── */
function Expert() {
  const cx = 260;
  const cy = 150;
  const nodes = Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + 60 * i) * Math.PI) / 180;
    return { x: cx + 168 * Math.cos(a), y: cy + 112 * Math.sin(a) };
  });

  return (
    <>
      {/* outer ring linking neighbouring sectors */}
      {nodes.map((n, i) => {
        const m = nodes[(i + 1) % 6];
        // stop each link at the hexagon edges so it doesn't cross the numbers
        const t = 26 / Math.hypot(m.x - n.x, m.y - n.y);
        const a = { x: n.x + (m.x - n.x) * t, y: n.y + (m.y - n.y) * t };
        const b = { x: m.x - (m.x - n.x) * t, y: m.y - (m.y - n.y) * t };
        return <Draw key={`r${i}`} d={`M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`} delay={0.2 + i * 0.06} faint dashed />;
      })}
      {/* spokes to the centre */}
      {nodes.map((n, i) => (
        <Draw
          key={`s${i}`}
          d={`M${(cx + (n.x - cx) * 0.3).toFixed(1)} ${(cy + (n.y - cy) * 0.3).toFixed(1)} L${(n.x - (n.x - cx) * 0.18).toFixed(1)} ${(n.y - (n.y - cy) * 0.18).toFixed(1)}`}
          delay={0.5 + i * 0.06}
          faint
        />
      ))}
      <Draw d={hexPath(cx, cy, 40)} delay={0.3} />
      <Draw d={hexPath(cx, cy, 28)} delay={0.5} faint />
      <Draw d={`M${cx} ${cy - 10} L${cx + 10} ${cy} L${cx} ${cy + 10} L${cx - 10} ${cy} Z`} delay={0.7} />
      {nodes.map((n, i) => (
        <path
          key={`sig${i}`}
          d={`M${cx} ${cy} L${n.x.toFixed(1)} ${n.y.toFixed(1)}`}
          pathLength="1"
          className="pa-signal"
          style={{ '--i': i }}
        />
      ))}
      {nodes.map((n, i) => (
        <path key={`glow${i}`} d={hexPath(n.x, n.y, 24)} className="pa-hexglow" style={{ '--i': i }} />
      ))}
      <path d={hexPath(cx, cy, 40)} className="pa-hexglow pa-hexglow-hub" />
      {nodes.map((n, i) => (
        <g key={i}>
          <Draw d={hexPath(n.x, n.y, 24)} delay={0.8 + i * 0.08} />
          <Node x={n.x} y={n.y} n={i + 1} delay={1.0 + i * 0.08} r={0.01} />
        </g>
      ))}
    </>
  );
}

const ART = { advisory: Advisory, investor: Investor, 'startup-panel': Expert, partners: Advisory };

export default function PanelArt({ panelId, count, className = '' }) {
  const Art = ART[panelId] || Advisory;
  return (
    <svg
      key={panelId}
      className={`panel-art ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <Art count={count} />
    </svg>
  );
}
