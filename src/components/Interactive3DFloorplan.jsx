import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

const HOTSPOTS = [
  {
    id: 'pavilions',
    code: 'Zone A',
    short: 'Country pavilions',
    name: 'Country and sovereign pavilions',
    specs: '6×6 m (36 m²) to 10×10 m (100 m²) islands',
    description:
      'Islands open on four sides, allocated to the national Arab chambers (Union of Arab Chambers, UAE, Saudi Arabia, Qatar, Kuwait, Oman, Egypt, Morocco) and Indian state investment boards.',
    capacity: '12 pavilions',
    total: 12,
    available: 4,
    features: ['Private bilateral meeting lounge', 'Suspended country mast', 'Dedicated 3-phase power drop', 'Priority access for delegations'],
  },
  {
    id: 'corporate',
    code: 'Zone B',
    short: 'Corporate stalls',
    name: 'Corporate and premium corner stalls',
    specs: '6×3 m (18 m²), open on two sides',
    description:
      'Central corridors with the highest footfall, reserved for energy companies, infrastructure EPC contractors, ports and logistics, and pharmaceutical manufacturers.',
    capacity: '32 premium stalls',
    total: 32,
    available: 11,
    features: ['Corner position, open on two sides', 'Backlit acrylic fascia', '4 delegate badges included', 'Listing on the shared video loop'],
  },
  {
    id: 'msme',
    code: 'Zone C',
    short: 'MSME village',
    name: 'MSME and innovation village',
    specs: '3×3 m (9 m²) Octanorm shell scheme',
    description:
      'Modular stalls for export merchants, AgriTech and FinTech companies, and specialty formulation laboratories from both regions.',
    capacity: '56 standard stalls',
    total: 56,
    available: 18,
    features: ['Pre-fabricated shell scheme', 'Spotlights and power outlet', '2 delegate badges included', 'Listing in the conclave app directory'],
  },
  {
    id: 'b2blounge',
    code: 'Zone D',
    short: 'B2B lounge',
    name: 'B2B deal lounge, 7,000 sq ft',
    specs: '7,000 sq ft, acoustically isolated · 24 private rooms',
    description:
      '24 private meeting rooms with simultaneous interpretation, displays and hospitality, used for confidential negotiations and contract signings.',
    capacity: '24 private deal rooms',
    total: 24,
    features: ['Acoustic enclosures', 'Matchmaking liaison desk', 'Ministerial protocol suite', 'Dining and refreshment lounge'],
  },
  {
    id: 'plenary',
    code: 'Stage',
    short: 'Plenary',
    name: 'Main plenary stage',
    specs: '24×6 m stage · 32×6 m LED wall · 500 seats',
    description:
      'Hosts the inaugural plenary, ministerial addresses and the adoption of the New Delhi Bharat-Arab Declaration 2026. Interpretation booths for Arabic, English and Hindi.',
    capacity: '500 delegates',
    features: ['32 m curved LED screen', 'Interpretation booths', 'Broadcast control', 'Secured VVIP perimeter'],
  },
  {
    id: 'foyer',
    code: 'Foyer',
    short: 'Foyer',
    name: 'Grand foyer and metro link',
    specs: 'Escalator corridor from Yashobhoomi Dwarka Sector 25 station',
    description:
      'Connects the metro station to the 6th floor security reception without leaving the building.',
    capacity: '3,000 delegates per hour',
    features: ['Airport Express escalators', 'RFID badge collection', 'Drop-off porch', 'Cloakroom and currency exchange'],
  },
];

// Plan geometry in a 1000 × 520 drawing
const ZONES = {
  foyer: { x: 380, y: 20, w: 240, h: 56 },
  pavilions: { x: 52, y: 108, w: 240, h: 260, cols: 3, rows: 4, cw: 64, ch: 48, gx: 12, gy: 10 },
  corporate: { x: 324, y: 108, w: 300, h: 260, cols: 8, rows: 4, cw: 32, ch: 48, gx: 4, gy: 12 },
  b2blounge: { x: 656, y: 108, w: 292, h: 84, cols: 12, rows: 2, cw: 20, ch: 22, gx: 4, gy: 4 },
  msme: { x: 656, y: 224, w: 292, h: 144, cols: 14, rows: 4, cw: 16, ch: 26, gx: 4, gy: 4 },
  plenary: { x: 52, y: 400, w: 896, h: 92 },
};

function isAvailable(i, total, available) {
  if (!available) return false;
  return (i * 7) % total < available;
}

function ZoneCells({ zone, spot, active }) {
  const { x, y, w, h, cols, rows, cw, ch, gx, gy } = zone;
  const gridW = cols * cw + (cols - 1) * gx;
  const gridH = rows * ch + (rows - 1) * gy;
  const ox = x + (w - gridW) / 2;
  const oy = y + (h - gridH) / 2 + 8;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const avail = isAvailable(i, spot.total, spot.available);
      cells.push(
        <rect
          key={i}
          x={ox + c * (cw + gx)}
          y={oy + r * (ch + gy)}
          width={cw}
          height={ch}
          rx="2"
          fill={avail ? 'rgb(22 140 70 / 0.16)' : active ? 'rgb(20 20 20 / 0.07)' : 'rgb(20 20 20 / 0.04)'}
          stroke={avail ? 'rgb(22 140 70 / 0.7)' : 'rgb(20 20 20 / 0.16)'}
          strokeWidth="1"
        />
      );
    }
  }
  return <g>{cells}</g>;
}

export default function Interactive3DFloorplan({ onReserve }) {
  const [activeHotspot, setActiveHotspot] = useState('corporate');
  const current = HOTSPOTS.find((h) => h.id === activeHotspot) || HOTSPOTS[0];

  return (
    <div className="space-y-4">
      {/* Zone selector, also the keyboard path into the plan */}
      <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1" role="tablist" aria-label="Hall zones">
        {HOTSPOTS.map((h) => {
          const active = h.id === activeHotspot;
          return (
            <button
              key={h.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveHotspot(h.id)}
              className={`h-9 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                active ? 'bg-surface-3 text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]' : 'text-fg-2 hover:text-fg hover:bg-surface-2'
              }`}
            >
              {h.short}
            </button>
          );
        })}
      </div>

      {/* Plan drawing */}
      <div className="surface-card rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <span className="ref-line">Palash Hall · 6th floor · Yashobhoomi Convention Centre</span>
          <span className="ref-line">34,065 sq ft column-free</span>
        </div>

        <svg viewBox="0 0 1000 520" className="w-full h-auto select-none" role="img" aria-label="Floorplan of Palash Hall">
          <defs>
            <pattern id="plan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(20 20 20 / 0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Hall shell */}
          <rect x="20" y="20" width="960" height="490" fill="url(#plan-grid)" />
          <path
            d="M 380 20 L 20 20 L 20 510 L 980 510 L 980 20 L 620 20"
            fill="none"
            stroke="rgb(20 20 20 / 0.35)"
            strokeWidth="2"
          />

          {/* Zones */}
          {HOTSPOTS.map((spot) => {
            const z = ZONES[spot.id];
            const active = spot.id === activeHotspot;
            return (
              <g
                key={spot.id}
                onClick={() => setActiveHotspot(spot.id)}
                className="cursor-pointer"
              >
                <rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  rx="6"
                  fill={active ? 'rgb(255 111 94 / 0.06)' : 'rgb(20 20 20 / 0.015)'}
                  stroke={active ? '#FF6F5E' : 'rgb(20 20 20 / 0.14)'}
                  strokeWidth={active ? 1.5 : 1}
                  strokeDasharray={spot.id === 'foyer' ? '4 4' : undefined}
                  className="transition-colors"
                />
                {z.cols && <ZoneCells zone={z} spot={spot} active={active} />}

                {spot.id === 'plenary' && (
                  <g>
                    {[0, 1, 2, 3].map((r) => (
                      <line
                        key={r}
                        x1={260 + r * 12}
                        x2={740 - r * 12}
                        y1={416 + r * 10}
                        y2={416 + r * 10}
                        stroke="rgb(20 20 20 / 0.14)"
                        strokeDasharray="3 5"
                      />
                    ))}
                    <rect x="350" y="462" width="300" height="18" rx="2" fill="rgb(20 20 20 / 0.1)" stroke="rgb(20 20 20 / 0.3)" />
                  </g>
                )}

                <text
                  x={z.x + 12}
                  y={z.y + (z.cols ? 18 : 24)}
                  className="hidden sm:inline"
                  fill={active ? '#b93d2c' : 'rgb(20 20 20 / 0.55)'}
                  fontSize="13"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {spot.code}
                </text>
                {!z.cols && (
                  <text
                    x={z.x + 12}
                    y={z.y + 42}
                    className="hidden sm:inline"
                    fill="rgb(20 20 20 / 0.8)"
                    fontSize="15"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {spot.short}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="ref-line flex items-center gap-2">
            <span className="w-3 h-3 rounded-[2px] border border-positive bg-positive/15" />
            Available
          </span>
          <span className="ref-line flex items-center gap-2">
            <span className="w-3 h-3 rounded-[2px] border border-line-strong bg-fg/5" />
            Allocated
          </span>
          <span className="ref-line flex items-center gap-2">
            <span className="w-3 h-3 rounded-[2px] border border-coral" />
            Selected zone
          </span>
          <span className="ref-line sm:ml-auto">Not to scale · entry from foyer, north wall</span>
        </div>
      </div>

      {/* Zone detail */}
      <div className="surface-card rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <span className="ref-line">{current.code} · {current.specs}</span>
          <h3 className="font-serif text-2xl font-medium text-fg mt-2">{current.name}</h3>
          <p className="text-sm text-fg-2 leading-6 mt-2 max-w-2xl">{current.description}</p>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {current.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-fg-2">
                <Check className="w-4 h-4 text-fg-3 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between gap-6 lg:pl-6 lg:border-l border-line">
          <div>
            <div className="text-sm text-fg-3">Capacity</div>
            <div className="text-2xl font-medium text-fg figure mt-1">{current.capacity}</div>
            {current.available != null && (
              <div className="ref-line mt-2">
                {current.available} of {current.total} available
              </div>
            )}
          </div>
          <button
            onClick={() => onReserve && onReserve(current.id)}
            className="btn-secondary w-full h-11 px-4 text-sm"
          >
            Reserve in this zone
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
