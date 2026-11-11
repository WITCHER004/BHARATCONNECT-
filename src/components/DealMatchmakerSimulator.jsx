import { useState } from 'react';
import { ARAB_NATIONS, STRATEGIC_VERTICALS } from '../data/conclaveData';
import { ChevronDown, MapPin, Zap, Building2, Cpu, Wheat, Activity, Compass, ArrowRight } from 'lucide-react';

/*
  Find your deal room: a light, app-style panel (white surfaces, black ink).
  Figures are indicative, from getMatch() below.
*/

function getMatch(vertical) {
  if (vertical.includes('Tech') || vertical.includes('AI')) {
    return {
      dealPool: '$9.6B',
      buyerCount: 42,
      rooms: 9,
      entities: ['Dubai Future District Fund', 'Saudi AI Authority (SDAIA)', 'NPCI International (UPI)', 'Hub71'],
      tradeNote: 'Double tax avoidance and a fast-track fintech regulatory sandbox',
    };
  }
  if (vertical.includes('Infrastructure') || vertical.includes('Smart Cities')) {
    return {
      dealPool: '$34.2B',
      buyerCount: 19,
      rooms: 4,
      entities: ['ADIA Real Estate & Infrastructure', 'NEOM Project Logistics', 'Adani Ports & SEZ', 'DP World'],
      tradeNote: 'Direct clearance on the IMEC rail and maritime freight corridor',
    };
  }
  if (vertical.includes('Food') || vertical.includes('Agri')) {
    return {
      dealPool: '$7.8B',
      buyerCount: 35,
      rooms: 8,
      entities: ['SALIC', 'Al Dahra Agriculture', 'APEDA India', 'Fertiliser sovereign pool'],
      tradeNote: 'Zero-tariff farm-to-port green corridor',
    };
  }
  if (vertical.includes('Healthcare') || vertical.includes('Pharma')) {
    return {
      dealPool: '$6.5B',
      buyerCount: 24,
      rooms: 5,
      entities: ['UAE Ministry of Health (MOHAP)', 'Saudi Food & Drug Authority', 'Dr. Reddy’s Laboratories', 'Sun Pharma'],
      tradeNote: 'Reciprocal pharmaceutical GMP inspection within 90 days',
    };
  }
  return {
    dealPool: '$18.4B',
    buyerCount: 28,
    rooms: 6,
    entities: ['PIF Green Energy', 'ACWA Power', 'Reliance CleanTech', 'NIIF Infrastructure'],
    tradeNote: 'Zero customs duty under the bilateral accord',
  };
}

const ICONS = { Zap, Building2, Cpu, Wheat, Activity, Compass };
const SHORT = {
  'clean-energy': 'Energy',
  'infrastructure-smart-cities': 'Infra',
};
const shortLabel = (v) => SHORT[v.id] || v.title.split(/[ ,&]+/)[0];

const ICON = { className: 'w-[18px] h-[18px]', strokeWidth: 1.5 };

// light palette, local to this panel
const C = {
  page: 'bg-[#FAF9F6]',
  card: 'bg-white border border-[#E8E4DC] shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.12)]',
  ink: 'text-[#141414]',
  ink2: 'text-[#55524D]',
  ink3: 'text-[#7A766F]',
  label: 'font-mono text-[11px] uppercase tracking-[0.18em] text-[#7A766F]',
};

function StatCard({ label, value, caption, accent }) {
  return (
    <div className={`${C.card} rounded-2xl p-5 sm:p-6`}>
      <p className={C.label}>{label}</p>
      <p className={`mt-4 font-serif text-[40px] leading-none tracking-[-0.01em] figure ${accent ? 'text-[#141414]' : 'text-[#141414]'}`}>{value}</p>
      <p className={`mt-3 text-sm ${C.ink2}`}>{caption}</p>
    </div>
  );
}

export default function DealMatchmakerSimulator({ onOpenBooking }) {
  const [originCountry, setOriginCountry] = useState('India');
  const [targetArabNation, setTargetArabNation] = useState('Saudi Arabia');
  const [selectedId, setSelectedId] = useState(STRATEGIC_VERTICALS[0]?.id);

  const vertical = STRATEGIC_VERTICALS.find((v) => v.id === selectedId) ?? STRATEGIC_VERTICALS[0];
  const match = getMatch(vertical.title);
  const nation = ARAB_NATIONS.find((n) => n.name === targetArabNation);

  const bars = STRATEGIC_VERTICALS.map((v) => ({ v, count: getMatch(v.title).buyerCount }));
  const max = Math.max(...bars.map((b) => b.count));
  const avg = Math.round(bars.reduce((s, b) => s + b.count, 0) / bars.length);

  return (
    <div className={`${C.page} ${C.ink} rounded-2xl overflow-hidden border border-[#E8E4DC] shadow-[0_32px_64px_-32px_rgb(0_0_0/0.5)]`}>
      {/* top bar */}
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between gap-4 border-b border-[#E8E4DC] bg-[#F3F1EC]">
        <div className="flex items-center gap-4 sm:gap-6">
        {/* window controls */}
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]/60" />
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#DEA123]/60" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]/60" />
        </div>
        <div role="tablist" aria-label="Your organisation is based in" className="p-1 rounded-full bg-[#E9E6DF] border border-[#E0DCD3] flex">
          {[
            ['India', 'India'],
            ['International', 'International'],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={originCountry === id}
              onClick={() => setOriginCountry(id)}
              className={`h-8 px-4 rounded-full text-sm transition-colors cursor-pointer ${
                originCountry === id ? 'bg-white text-[#141414] font-medium shadow-[0_1px_2px_rgb(0_0_0/0.08)]' : 'text-[#55524D] hover:text-[#141414]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-full border border-[#E0DCD3] bg-white/70 font-mono text-xs text-[#55524D]">
          <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
          palash-hall · zone D · 7,000 sq ft
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* sidebar: sectors */}
        <nav aria-label="Sector" className="border-b lg:border-b-0 lg:border-r border-[#E8E4DC] p-3 lg:p-4">
          <p className={`${C.label} hidden lg:block px-3 pt-2 pb-3`}>Sectors</p>
          <ul className="flex lg:flex-col gap-1 overflow-x-auto">
            {STRATEGIC_VERTICALS.map((v) => {
              const Icon = ICONS[v.icon] || Compass;
              const on = v.id === selectedId;
              return (
                <li key={v.id} className="shrink-0">
                  <button
                    onClick={() => setSelectedId(v.id)}
                    aria-current={on ? 'true' : undefined}
                    className={`w-full h-11 px-3 rounded-xl flex items-center gap-3 text-[15px] text-left whitespace-nowrap transition-colors cursor-pointer ${
                      on ? 'bg-white text-[#141414] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_4px_12px_-4px_rgb(0_0_0/0.08)]' : 'text-[#55524D] hover:bg-white/60 hover:text-[#141414]'
                    }`}
                  >
                    <Icon {...ICON} />
                    <span className="lg:truncate">{v.title.split(',')[0].replace(' & Sustainability', '')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* main */}
        <div className="p-5 sm:p-8 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className={C.label}>Fri, 18 Dec · Palash Hall</p>
              <h3 className="mt-2 font-serif text-3xl sm:text-[34px] font-medium leading-tight">Find your deal room</h3>
            </div>
            <label className="relative self-start sm:self-auto">
              <span className="sr-only">Counterpart country</span>
              <select
                value={targetArabNation}
                onChange={(e) => setTargetArabNation(e.target.value)}
                className="h-10 appearance-none rounded-full border border-[#E0DCD3] bg-white pl-4 pr-10 text-sm text-[#141414] cursor-pointer hover:border-[#C9C4BA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141414]/30"
              >
                {ARAB_NATIONS.map((n) => (
                  <option key={n.code} value={n.name}>{n.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A766F]" strokeWidth={1.5} />
            </label>
          </div>

          {/* stat cards */}
          <div key={selectedId} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <StatCard label="Pipeline 2026–2030" value={match.dealPool} caption="Indicative investment pool" />
            <StatCard label="Matching delegations" value={match.buyerCount} caption={`From ${targetArabNation} and the GCC`} />
            <StatCard label="Rooms open" value={match.rooms} caption="Private suites in Zone D" />
            <StatCard label="Counterpart" value={nation?.code ?? '—'} caption={`${targetArabNation} · ${nation?.region ?? ''}`} />
          </div>

          {/* chart + organisations */}
          <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className={`${C.card} rounded-2xl p-5 sm:p-6 xl:col-span-7`}>
              <div className="flex items-baseline justify-between gap-4">
                <p className={C.label}>Delegations · by sector</p>
                <p className="text-sm font-medium figure">{avg} avg</p>
              </div>
              <div className="mt-6 h-44 flex items-end gap-2 sm:gap-3" role="img" aria-label={`Matching delegations by sector. ${vertical.title}: ${match.buyerCount}`}>
                {bars.map(({ v, count }) => {
                  const on = v.id === selectedId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className="flex-1 h-full flex flex-col justify-end items-center gap-2 group cursor-pointer"
                      aria-label={`${v.title}: ${count}`}
                    >
                      <span className={`font-mono text-[11px] figure transition-opacity ${on ? 'opacity-100 text-[#141414]' : 'opacity-0 group-hover:opacity-100 text-[#7A766F]'}`}>{count}</span>
                      <span
                        className={`w-full rounded-lg transition-colors duration-200 ${on ? 'bg-[#141414]' : 'bg-[#E7E4DE] group-hover:bg-[#D9D5CD]'}`}
                        style={{ height: `${(count / max) * 100}%` }}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2 sm:gap-3">
                {bars.map(({ v }) => (
                  <span key={v.id} className={`flex-1 text-center font-mono text-[11px] truncate ${v.id === selectedId ? 'text-[#141414]' : 'text-[#7A766F]'}`}>
                    {shortLabel(v)}
                  </span>
                ))}
              </div>
            </div>

            <div className={`${C.card} rounded-2xl p-5 sm:p-6 xl:col-span-5 flex flex-col`}>
              <p className={C.label}>Organisations active</p>
              <ul key={selectedId} className="mt-4 flex flex-col gap-4 animate-fade-in">
                {match.entities.map((ent, i) => (
                  <li key={ent} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#141414] shrink-0" />
                    <span className="flex-1 text-[15px] leading-snug font-medium">{ent}</span>
                    <span className="font-mono text-xs text-[#7A766F] pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  </li>
                ))}
              </ul>
              <p className={`mt-6 pt-4 border-t border-[#EEEAE3] text-sm ${C.ink2} leading-relaxed`}>
                <span className={C.ink3}>Trade benefit: </span>
                {match.tradeNote}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="font-mono text-xs text-[#7A766F]">Indicative figures · {originCountry === 'India' ? 'Indian' : 'International'} delegation</p>
            <button
              onClick={onOpenBooking}
              className="h-11 px-5 rounded-xl bg-[#141414] text-white text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-[#2a2a2a] active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
            >
              Request a deal room
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
