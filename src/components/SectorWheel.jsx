import { useEffect, useRef, useState } from 'react';
import { Zap, Building2, Cpu, Wheat, Activity, Compass, Shield } from 'lucide-react';

/*
  Seven sector tracks as a wheel around the conclave.
  - Spokes run from the centre to each track; a coral pulse travels out along them in turn
  - The orbit ring and outer ring turn slowly, like trade routes in motion
  - The track you hover or open in the list lights up here, and the centre names it
  - Clicking a track on the wheel opens it in the list
*/

const ICONS = { Zap, Building2, Cpu, Wheat, Activity, Compass, Shield };

const W = 540;
const H = 440;
const CX = W / 2;
const CY = H / 2;
const R = 140;

const SHORT = {
  'clean-energy': 'Clean Energy',
  'infrastructure-smart-cities': 'Infrastructure',
  'tech-ai-innovation': 'Technology & AI',
  'food-security-mining': 'Food & Agri',
  'healthcare-pharma': 'Healthcare',
  'tourism-hospitality': 'Tourism',
  'defence-aerospace': 'Defence',
};
const shortTitle = (s) => SHORT[s.id] || s.title.split(',')[0];

export default function SectorWheel({ sectors, activeId, onSelect, onHover }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  // draw the wheel in when it scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setPlaying(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setPlaying(true);
        io.disconnect();
      }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const n = sectors.length;
  const nodes = sectors.map((s, i) => {
    const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
    return { s, i, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a), a };
  });
  const activeIndex = nodes.findIndex((nd) => nd.s.id === activeId);
  const active = activeIndex >= 0 ? nodes[activeIndex] : null;

  // polygon joining the seven tracks
  const ring = nodes.map((nd) => `${nd.x.toFixed(1)},${nd.y.toFixed(1)}`).join(' ');

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className={`sector-wheel ${playing ? 'is-playing' : ''} ${active ? 'has-active' : ''}`}
      role="group"
      aria-label={`${n} sector tracks`}
    >
      {/* turning rings */}
      <circle className="sw-orbit sw-orbit-outer" cx={CX} cy={CY} r={R + 44} />
      <circle className="sw-orbit" cx={CX} cy={CY} r={R} />
      <polygon className="sw-draw sw-ring" points={ring} pathLength="1" />

      {/* spokes, with a pulse travelling out along each */}
      {nodes.map((nd) => (
        <g key={`sp-${nd.s.id}`}>
          <line
            className={`sw-draw sw-spoke ${nd.i === activeIndex ? 'is-on' : ''}`}
            x1={CX} y1={CY} x2={nd.x} y2={nd.y}
            pathLength="1"
            style={{ '--d': `${0.3 + nd.i * 0.08}s` }}
          />
          <line
            className="sw-pulse"
            x1={CX} y1={CY} x2={nd.x} y2={nd.y}
            pathLength="1"
            style={{ '--i': nd.i, '--n': n }}
          />
        </g>
      ))}

      {/* centre */}
      <circle className="sw-hub-glow" cx={CX} cy={CY} r="62" />
      <circle className="sw-draw sw-hub" cx={CX} cy={CY} r="56" pathLength="1" style={{ '--d': '0.1s' }} />
      <circle className="sw-hub-inner" cx={CX} cy={CY} r="46" />
      <g className="sw-fade" style={{ '--d': '0.8s' }}>
        {active ? (
          <g key={active.s.id} className="sw-hub-text">
            <text x={CX} y={CY - 10} textAnchor="middle" className="sw-hub-num">Track {String(active.i + 1).padStart(2, '0')}</text>
            <text x={CX} y={CY + 8} textAnchor="middle" className="sw-hub-title">{shortTitle(active.s)}</text>
            <text x={CX} y={CY + 24} textAnchor="middle" className="sw-hub-num">{active.s.targetInvestment.replace(' Pipeline', '')}</text>
          </g>
        ) : (
          <g className="sw-hub-text">
            <text x={CX} y={CY - 4} textAnchor="middle" className="sw-hub-big">{n}</text>
            <text x={CX} y={CY + 16} textAnchor="middle" className="sw-hub-num">sector tracks</text>
          </g>
        )}
      </g>

      {/* track nodes */}
      {nodes.map((nd) => {
        const Icon = ICONS[nd.s.icon] || Compass;
        const on = nd.i === activeIndex;
        // label sits outside the node, pushed away from the centre
        const lx = CX + (R + 38) * Math.cos(nd.a);
        const ly = CY + (R + 38) * Math.sin(nd.a);
        const anchor = Math.abs(Math.cos(nd.a)) < 0.3 ? 'middle' : Math.cos(nd.a) > 0 ? 'start' : 'end';
        return (
          <g
            key={nd.s.id}
            className={`sw-node ${on ? 'is-on' : ''}`}
            style={{ '--d': `${0.7 + nd.i * 0.1}s` }}
            onClick={() => onSelect(nd.s.id)}
            onMouseEnter={() => onHover(nd.s.id)}
            onMouseLeave={() => onHover(null)}
            role="button"
            tabIndex={0}
            aria-label={`Track ${nd.i + 1}: ${nd.s.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(nd.s.id);
              }
            }}
          >
            <circle className="sw-node-halo" cx={nd.x} cy={nd.y} r="30" />
            <circle className="sw-node-dot" cx={nd.x} cy={nd.y} r="24" />
            <Icon x={nd.x - 10} y={nd.y - 10} width="20" height="20" strokeWidth={1.5} className="sw-node-icon" />
            <text
              x={lx}
              y={ly + (Math.sin(nd.a) > 0.5 ? 10 : Math.sin(nd.a) < -0.5 ? -4 : 4)}
              textAnchor={anchor}
              className="sw-label"
            >
              {shortTitle(nd.s)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
