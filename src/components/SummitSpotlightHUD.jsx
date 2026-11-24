import { ArrowRight, Globe2, Building2, TrendingUp, Sparkles } from 'lucide-react';

export default function SummitSpotlightHUD({ onNavigate }) {
  return (
    <div className="glass-edge rounded-2xl p-6 sm:p-8 bg-black/30 backdrop-blur-xl backdrop-saturate-150 border flex flex-col justify-between">
      <div>
        {/* Top Tag & Live Indicator */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-line/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-gold-text">
              Live Corridor Visualizer
            </span>
          </div>

          <span className="text-[11px] font-mono text-fg-3 border border-line px-2.5 py-0.5 rounded-full bg-surface-2/40">
            Yashobhoomi 2026
          </span>
        </div>

        {/* Central Overview */}
        <div className="mt-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/95 px-2.5 py-1 rounded-md border border-gold-foil/40 shadow-sm flex items-center justify-center">
              <img
                src={`${import.meta.env.BASE_URL}brand/logo.png`}
                alt="Bharat Connect Official Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
            <p className="text-[11px] font-mono text-gold-text uppercase tracking-wider">
              Official Conclave Emblem
            </p>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg leading-tight">
            India &amp; 22 Arab Corridors
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-fg-2 leading-relaxed">
            Connecting bilateral trade routes linking New Delhi, Abu Dhabi, Riyadh, Cairo, and London under the CEPA &amp; IMEC frameworks.
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center border-y border-line/60 py-4">
          <div className="glass-edge glass-edge-sm p-2 rounded-lg bg-white/[0.03] border">
            <span className="font-serif text-xl sm:text-2xl font-medium text-gold-text figure block">22</span>
            <span className="text-[10px] font-mono text-fg-3 uppercase tracking-wider block mt-0.5">Arab Nations</span>
          </div>
          <div className="glass-edge glass-edge-sm p-2 rounded-lg bg-white/[0.03] border">
            <span className="font-serif text-xl sm:text-2xl font-medium text-fg figure block">₹100 Cr+</span>
            <span className="text-[10px] font-mono text-fg-3 uppercase tracking-wider block mt-0.5">Bilateral Goal</span>
          </div>
          <div className="glass-edge glass-edge-sm p-2 rounded-lg bg-white/[0.03] border">
            <span className="font-serif text-xl sm:text-2xl font-medium text-fg figure block">24</span>
            <span className="text-[10px] font-mono text-fg-3 uppercase tracking-wider block mt-0.5">Deal Suites</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-2 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate?.('collaborate')}
          className="btn-primary h-11 px-5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 cursor-pointer whitespace-nowrap shadow-md"
        >
          <span>Summit Collaboration</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('schedule')}
          className="h-11 px-4 rounded-[10px] border border-gold-foil/70 text-gold-text text-xs sm:text-sm font-medium hover:bg-gold-foil/15 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span>Explore 7 Tracks</span>
        </button>
      </div>
    </div>
  );
}

