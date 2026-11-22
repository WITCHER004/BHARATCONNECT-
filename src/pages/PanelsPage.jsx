import { Landmark, TrendingUp, Rocket, Handshake } from 'lucide-react';
import { PANELS, getPanel } from '../data/panels';
import PanelArt from '../components/PanelArt';
import PanelMembers from '../components/PanelMembers';

const ICONS = { advisory: Landmark, investor: TrendingUp, 'startup-panel': Rocket, partners: Handshake };

export default function PanelsPage({ panelId, onNavigate }) {
  const panel = getPanel(panelId);

  return (
    <div className="page-enter flex flex-col">

      {/* Page header */}
      <section className="pt-32 pb-12 bg-royal border-b border-line overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="ref-line mb-4">Bharat Connect 2026 · Panels</p>
            <h1 className="font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em] mb-4">
              {panel.label}
            </h1>
            <p className="text-[15px] sm:text-lg text-fg-2 max-w-xl leading-relaxed">{panel.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <span className="block font-serif text-3xl text-gold-text">{String(panel.seats.length).padStart(2, '0')}</span>
                <span className="text-xs text-fg-3">Seats</span>
              </div>
              <div>
                <span className="block font-serif text-3xl text-gold-text">23</span>
                <span className="text-xs text-fg-3">Nations: India + 22 Arab states</span>
              </div>
              <div>
                <span className="block font-serif text-3xl text-gold-text">2026</span>
                <span className="text-xs text-fg-3">Inaugural term</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 max-w-xl w-full mx-auto lg:mx-0">
            <PanelArt panelId={panel.id} count={panel.seats.length} />
          </div>
        </div>
      </section>

      {/* Panel switcher */}
      <section className="sticky top-[92px] z-30 bg-surface-0/95 backdrop-blur-sm border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 w-max" role="tablist" aria-label="Panels">
            {PANELS.map((p) => {
              const TabIcon = ICONS[p.id];
              const active = p.id === panel.id;
              return (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => onNavigate(p.id)}
                  className={`h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-surface-3 text-fg border border-gold-foil/50'
                      : 'text-fg-2 hover:text-fg hover:bg-surface-2 border border-transparent'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${active ? 'text-gold-text' : 'text-fg-3'}`} strokeWidth={1.5} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Panel members */}
      <section className="theme-cream pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="pt-14 sm:pt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-gold-text">The {panel.short.toLowerCase()} panel</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-fg tracking-[-0.01em]">Panel members</h2>
              <p className="mt-2 text-sm text-fg-3 max-w-xl">
                Select a member to see their profile and role. Seat numbers match the diagram at the top of the page.
              </p>
            </div>
            <span className="text-sm text-fg-3">
              <span className="font-serif text-2xl text-fg">{panel.seats.filter((s) => s.name).length}</span>
              <span className="mx-1">/</span>
              {panel.seats.length} {panel.seats.length === 1 ? 'seat' : 'seats'} confirmed
            </span>
          </div>
          <PanelMembers panel={panel} />
        </div>
      </section>
    </div>
  );
}
