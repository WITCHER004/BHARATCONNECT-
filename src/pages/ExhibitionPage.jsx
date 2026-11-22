import { useState } from 'react';
import { STALL_TIERS } from '../data/conclaveData';
import BilateralMatchmakerModal from '../components/BilateralMatchmakerModal';
import Interactive3DFloorplan from '../components/Interactive3DFloorplan';
import { ArrowRight, Check } from 'lucide-react';

const BOOTHS = [
  { id: 'P-01', name: 'UAE pavilion', status: 'Reserved', size: '36 m²', entity: 'Federation of UAE Chambers' },
  { id: 'P-02', name: 'Invest Saudi pavilion', status: 'Reserved', size: '36 m²', entity: 'Federation of Saudi Chambers' },
  { id: 'P-03', name: 'Qatar pavilion', status: 'Reserved', size: '36 m²', entity: 'Qatar Chamber' },
  { id: 'P-04', name: 'Oman pavilion', status: 'Reserved', size: '36 m²', entity: 'Oman Chamber' },
  { id: 'P-05', name: 'Egypt pavilion', status: 'Reserved', size: '36 m²', entity: 'FEDCOC Egypt' },
  { id: 'P-06', name: 'Bahrain pavilion', status: 'Available', size: '36 m²', entity: 'Open for a delegation' },
  { id: 'P-07', name: 'Kuwait pavilion', status: 'Available', size: '36 m²', entity: 'Open for a delegation' },
  { id: 'P-08', name: 'Morocco pavilion', status: 'Available', size: '36 m²', entity: 'Open for a delegation' },
  { id: 'C-01', name: 'Reliance CleanTech', status: 'Reserved', size: '18 m²', entity: 'Renewables' },
  { id: 'C-02', name: 'ACWA Power Middle East', status: 'Reserved', size: '18 m²', entity: 'Green hydrogen and desalination' },
  { id: 'C-03', name: 'Adani Ports & Logistics', status: 'Reserved', size: '18 m²', entity: 'IMEC corridor' },
  { id: 'C-04', name: 'DP World', status: 'Reserved', size: '18 m²', entity: 'Port infrastructure' },
  { id: 'C-05', name: 'Dr. Reddy’s', status: 'Reserved', size: '18 m²', entity: 'Pharma formulations' },
  { id: 'C-06', name: 'Clean energy corner', status: 'Available', size: '18 m²', entity: 'Open for booking' },
  { id: 'C-07', name: 'FinTech corner', status: 'Available', size: '18 m²', entity: 'Open for booking' },
  { id: 'C-08', name: 'Agri-logistics corner', status: 'Available', size: '18 m²', entity: 'Open for booking' },
  { id: 'M-01', name: 'AgriTech stall', status: 'Available', size: '9 m²', entity: 'Open for booking' },
  { id: 'M-02', name: 'DeepTech diagnostics', status: 'Reserved', size: '9 m²', entity: 'Diagnostics lab' },
  { id: 'M-03', name: 'Solar PV stall', status: 'Available', size: '9 m²', entity: 'Open for booking' },
  { id: 'M-04', name: 'BioPharma stall', status: 'Available', size: '9 m²', entity: 'Open for booking' },
];

const CALC_TIERS = [
  { id: 'standard', name: 'Standard', size: '9 m²', price: 125000 },
  { id: 'premium', name: 'Premium corner', size: '18 m²', price: 275000 },
  { id: 'pavilion', name: 'Pavilion', size: '36 m²', price: 650000 },
];

const PASS_PRICE = 15000;
const DEAL_ROOM_PRICE = 35000;

const inr = (n) => `INR ${n.toLocaleString('en-IN')}`;

function SectionHeader({ title, intro, aside }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
      <div className="max-w-2xl">
        <h2 className="font-serif text-3xl sm:text-4xl font-medium text-fg">{title}</h2>
        {intro && <p className="text-base text-fg-2 leading-7 mt-3">{intro}</p>}
      </div>
      {aside}
    </div>
  );
}

export default function ExhibitionPage({ onOpenRegister, onSelectTier }) {
  const [calcStallTier, setCalcStallTier] = useState('premium');
  const [extraPasses, setExtraPasses] = useState(2);
  const [includeVipLounge, setIncludeVipLounge] = useState(true);
  const [matchmakerOpen, setMatchmakerOpen] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState(null);

  const base = CALC_TIERS.find((t) => t.id === calcStallTier)?.price || 0;
  const passCost = extraPasses * PASS_PRICE;
  const loungeCost = includeVipLounge ? DEAL_ROOM_PRICE : 0;
  const subtotal = base + passCost + loungeCost;
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;
  const approxUSD = Math.round(grandTotal / 84);

  const reserveTier = (tierId) => {
    if (onSelectTier) onSelectTier(tierId);
    onOpenRegister();
  };

  const availableCount = BOOTHS.filter((b) => b.status === 'Available').length;

  return (
    <div className="page-enter flex flex-col">
      {/* Header */}
      <section className="pt-32 pb-12 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <span className="ref-line">18-19 Dec 2026 / Palash Hall, 6th floor / Yashobhoomi, New Delhi</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-fg tracking-[-0.02em] mt-4">
            Exhibition stalls and floorplan
          </h1>
          <p className="text-lg text-fg-2 leading-7 max-w-2xl mt-4">
            Show your organisation to 500+ ministerial and institutional decision makers in 34,065 sq ft of column-free hall space.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={() => document.getElementById('stall-tiers')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary h-11 px-5 text-sm"
            >
              See stall packages
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => document.getElementById('cost-calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary h-11 px-5 text-sm"
            >
              Estimate your cost
            </button>
          </div>
        </div>
      </section>

      <div className="theme-cream">

      {/* Hall facts */}
      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <dl className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
            {[
              ['34,065 sq ft', 'Column-free hall, 6th floor'],
              ['7,000 sq ft', 'B2B networking lounge'],
              ['Metro link', 'Direct from Yashobhoomi Dwarka Sector 25 station'],
            ].map(([figure, label], i) => (
              <div key={label} className={`py-8 ${i > 0 ? 'sm:pl-8' : ''}`}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-medium text-fg figure">{figure}</dd>
                <dd className="text-sm text-fg-3 mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Floorplan */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            title="Hall floorplan"
            intro="Select a zone to see its stall sizes, capacity and what is included."
          />

          <Interactive3DFloorplan onReserve={() => onOpenRegister()} />

          {/* Booth directory */}
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-2xl font-medium text-fg">Booth allocations</h3>
                <p className="ref-line mt-2">{availableCount} of {BOOTHS.length} listed booths open</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="ref-line flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-positive" />
                  Available
                </span>
                <span className="ref-line flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-fg-3/50" />
                  Reserved
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {BOOTHS.map((booth) => {
                const isAvail = booth.status === 'Available';
                const isSelected = selectedBooth?.id === booth.id;
                return (
                  <button
                    key={booth.id}
                    onClick={() => setSelectedBooth(booth)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-xl text-left border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-surface-3 border-coral'
                        : 'bg-surface-2 border-line hover:border-line-strong hover:bg-surface-3'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-fg-2">{booth.id}</span>
                      <span className="flex items-center gap-2 font-mono text-xs text-fg-3">
                        {booth.size}
                        <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-positive' : 'bg-fg-3/50'}`} />
                      </span>
                    </div>
                    <div className={`text-sm font-medium truncate mt-2 ${isAvail ? 'text-fg' : 'text-fg-2'}`}>{booth.name}</div>
                    <div className="text-xs text-fg-3 truncate mt-1">{booth.entity}</div>
                  </button>
                );
              })}
            </div>

            {selectedBooth && (
              <div className="mt-4 p-4 rounded-xl surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-fg">{selectedBooth.name}</div>
                  <div className="ref-line mt-1">
                    {selectedBooth.id} · {selectedBooth.size} · {selectedBooth.status === 'Available' ? 'Available' : `Allocated to ${selectedBooth.entity}`}
                  </div>
                </div>
                {selectedBooth.status === 'Available' && (
                  <button
                    onClick={() => {
                      const tier = selectedBooth.size.startsWith('36') ? 'pavilion' : selectedBooth.size.startsWith('18') ? 'premium' : 'standard';
                      reserveTier(tier);
                    }}
                    className="btn-primary h-9 px-4 text-sm shrink-0"
                  >
                    Reserve {selectedBooth.id}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Deal room */}
          <div className="mt-12 p-6 rounded-2xl surface-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="text-base font-medium text-fg">Private deal rooms in Zone D</div>
              <p className="text-sm text-fg-2 mt-1 max-w-xl">
                Book a 45-minute confidential meeting with a visiting Arab trade delegation or minister in the 7,000 sq ft lounge.
              </p>
            </div>
            <button onClick={() => setMatchmakerOpen(true)} className="btn-secondary h-11 px-5 text-sm shrink-0">
              Book a deal room
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>

      {/* Stall packages */}
      <section id="stall-tiers" className="py-20 sm:py-24 bg-surface-0 border-y border-line scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            title="Stall packages"
            intro="Choose a space to present your products, services and investment opportunities to accredited buyers and delegations."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {STALL_TIERS.map((tier) => {
              const [priceINR, priceUSD] = tier.investment.split(' / ');
              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl p-6 flex flex-col border ${
                    tier.popular ? 'bg-surface-3 border-line-strong' : 'bg-surface-2 border-line'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="ref-line">{tier.dimensions} · {tier.area}</span>
                    {tier.popular && <span className="text-xs text-fg-2 shrink-0">Recommended</span>}
                  </div>
                  <h3 className="text-lg font-medium text-fg mt-4">{tier.name}</h3>
                  <p className="text-sm text-fg-2 leading-5 mt-1">{tier.tagline}</p>

                  <div className="mt-6">
                    <div className="text-3xl font-medium text-fg figure">{priceINR}</div>
                    <div className="ref-line mt-1">
                      {priceUSD ? `${priceUSD} · ` : ''}plus GST
                    </div>
                  </div>

                  <ul className="mt-6 pt-6 border-t border-line space-y-2">
                    {[...tier.specs.slice(0, 4), ...tier.inclusions.slice(0, 3)].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-fg-2">
                        <Check className="w-4 h-4 text-fg-3 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => reserveTier(tier.id)}
                    className={`mt-8 w-full h-11 px-4 text-sm ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Reserve this stall
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cost estimator */}
      <section id="cost-calculator" className="py-20 sm:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-medium text-fg">Estimate your cost</h2>
                <p className="text-base text-fg-2 leading-7 mt-3 max-w-xl">
                  A preliminary estimate including extra delegate badges, a deal-room slot and 18% GST.
                </p>
              </div>

              <fieldset>
                <legend className="text-sm text-fg-2 mb-2">Stall type</legend>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-2 border border-line">
                  {CALC_TIERS.map((t) => {
                    const active = calcStallTier === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCalcStallTier(t.id)}
                        className={`h-12 rounded-lg text-sm transition-colors cursor-pointer flex flex-col items-center justify-center ${
                          active
                            ? 'bg-surface-4 text-fg shadow-sm'
                            : 'text-fg-2 hover:text-fg'
                        }`}
                      >
                        <span className="font-medium leading-4">{t.name}</span>
                        <span className="font-mono text-xs text-fg-3 leading-4">{t.size}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label htmlFor="extra-passes" className="text-sm text-fg-2">Extra delegate passes</label>
                  <span className="font-mono text-sm text-fg figure">{extraPasses}</span>
                </div>
                <input
                  id="extra-passes"
                  type="range"
                  min="0"
                  max="10"
                  value={extraPasses}
                  onChange={(e) => setExtraPasses(parseInt(e.target.value, 10))}
                  className="w-full accent-coral cursor-pointer"
                />
                <div className="flex justify-between ref-line mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-2 border border-line cursor-pointer hover:border-line-strong transition-colors">
                <input
                  type="checkbox"
                  checked={includeVipLounge}
                  onChange={(e) => setIncludeVipLounge(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-coral"
                />
                <span>
                  <span className="text-sm font-medium text-fg block">Add a deal-room slot</span>
                  <span className="text-sm text-fg-3 block mt-1">Two 45-minute private sessions in the 7,000 sq ft lounge</span>
                </span>
              </label>
            </div>

            {/* Quote */}
            <div className="lg:col-span-5 p-6 rounded-2xl surface-card self-start lg:sticky lg:top-24">
              <h3 className="text-base font-medium text-fg">Estimate</h3>

              <dl className="mt-4 space-y-3 text-sm pb-4 border-b border-line">
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-2">{CALC_TIERS.find((t) => t.id === calcStallTier)?.name} stall</dt>
                  <dd className="font-mono text-fg figure">{inr(base)}</dd>
                </div>
                {extraPasses > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-2">Extra passes × {extraPasses}</dt>
                    <dd className="font-mono text-fg figure">{inr(passCost)}</dd>
                  </div>
                )}
                {includeVipLounge && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-2">Deal-room slot</dt>
                    <dd className="font-mono text-fg figure">{inr(loungeCost)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-3">GST 18%</dt>
                  <dd className="font-mono text-fg-3 figure">{inr(gst)}</dd>
                </div>
              </dl>

              <div className="pt-4">
                <div className="text-sm text-fg-3">Total estimate</div>
                <div className="text-3xl font-medium text-coral-text figure mt-1">{inr(grandTotal)}</div>
                <div className="ref-line mt-1">About USD {approxUSD.toLocaleString('en-US')} at INR 84</div>
              </div>

              <button onClick={() => reserveTier(calcStallTier)} className="mt-6 w-full btn-primary h-11 text-sm">
                Reserve with this estimate
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <BilateralMatchmakerModal isOpen={matchmakerOpen} onClose={() => setMatchmakerOpen(false)} />
      </div>
    </div>
  );
}
