import { useState } from 'react';
import { 
  Music, 
  Globe2, 
  Sparkles, 
  Film, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink,
  Award,
  Mic2,
  Tv,
  Palette
} from 'lucide-react';

const AIMF_PILLARS = [
  {
    icon: Globe2,
    tag: 'Diplomacy & Heritage',
    title: 'Sovereign Cultural & Ministerial Conclave',
    description: 'High-level roundtables uniting ministers of culture, heritage authorities, and bilateral cultural councils from India and the 22 Arab League nations.',
    highlights: [
      'Joint cultural diplomacy communique for 2026–2030',
      'Mutual heritage preservation & museum artefact loans',
      'Fast-track cultural exchange visas for creative practitioners'
    ]
  },
  {
    icon: Music,
    tag: 'Performing Arts',
    title: 'Arab-India Music & Heritage Conclave',
    description: 'A vibrant cross-pollination of ancient and contemporary musical traditions, celebrating shared modal frameworks, maqam, raga, Sufi poetry, and orchestral grandeur.',
    highlights: [
      'Gala symphony with traditional Oud, Sitar, Nay & Sarod ensembles',
      'The Silk Route Sufi & Qawwali bridge performance',
      'Masterclasses on Indo-Arab rhythmic cycles and microtonality'
    ]
  },
  {
    icon: Film,
    tag: 'Creative Economy',
    title: 'Arab-India Media, Cinema & Streaming Summit (AIMES)',
    description: 'Bridging the booming content engines of Bollywood, Indian regional industries, and GCC media capitals (Riyadh, Dubai, Abu Dhabi, Doha, and Cairo).',
    highlights: [
      '₹1,500+ Cr co-production pacts & location incentive frameworks',
      'Cross-corridor OTT licensing and localization for Arab & Indian audiences',
      'AI in animation, gaming studio joint-ventures, and immersive VFX'
    ]
  },
  {
    icon: Palette,
    tag: 'Artisan & Design',
    title: 'Creative Tech & Luxury Artisan Exposition',
    description: 'Curated gallery pavilions highlighting Islamic calligraphy, Indian handloom silks, bespoke fragrances, architecture, and contemporary bilateral design.',
    highlights: [
      'Heritage craftsmanship deal room for high-end retail exports',
      'Architectural conservation and sustainable venue aesthetics',
      'Digital preservation of shared maritime trade and linguistic history'
    ]
  }
];

const SCHEDULE_HIGHLIGHTS = [
  {
    day: 'Day 1 · 18 Dec 2026',
    stage: 'Yashobhoomi Grand Auditorium',
    time: '11:30 – 13:00',
    title: 'Plenary: The Civilizational Tapestry — Indo-Arab Cultural Diplomacy',
    speakers: 'Ministers of Culture (India & GCC States), ICCR Leadership, IACCIA Cultural Chair',
    badge: 'Ministerial Plenary'
  },
  {
    day: 'Day 1 · 18 Dec 2026',
    stage: 'Cultural Pavilion (Hall 4)',
    time: '15:00 – 17:00',
    title: 'Cinema & Streaming Corridors: Co-producing for 1.8 Billion Consumers',
    speakers: 'Studio Heads from Mumbai, Riyadh Media City, Dubai Studio City & Doha',
    badge: 'Media Summit'
  },
  {
    day: 'Day 1 Evening · 18 Dec 2026',
    stage: 'Open-Air Amphitheatre',
    time: '19:30 – 21:30',
    title: 'The Sovereign Symphony: Maqam meets Raga Fusion Gala',
    speakers: 'Renowned Oud & Sitar Maestros, Royal Symphonic Ensembles, Sufi Vocalists',
    badge: 'Cultural Gala'
  },
  {
    day: 'Day 2 · 19 Dec 2026',
    stage: 'Deal Room & Bilateral Suites',
    time: '10:00 – 12:30',
    title: 'Entertainment & Gaming IP Investment Round: Signing of Bilateral MoUs',
    speakers: 'Sovereign Wealth Media Funds, VCs, Studio Producers, Creative Directors',
    badge: 'MoU Signing'
  },
  {
    day: 'Day 2 · 19 Dec 2026',
    stage: 'Yashobhoomi Grand Auditorium',
    time: '14:30 – 16:30',
    title: 'Youth Creative Vanguard: Digital Influencers, OTT Creators & Animation Studios',
    speakers: 'Leading Digital Media Pioneers from India, UAE, Saudi Arabia & Egypt',
    badge: 'Creative Tech'
  }
];

const DELEGATION_BODIES = [
  { country: 'India', entity: 'Ministry of Culture & Indian Council for Cultural Relations (ICCR)', focus: 'Cultural Diplomacy & Performing Arts' },
  { country: 'United Arab Emirates', entity: 'Ministry of Culture & Abu Dhabi Music & Arts Foundation (ADMAF)', focus: 'Global Creative Exchange & Orchestral Heritage' },
  { country: 'Kingdom of Saudi Arabia', entity: 'Ministry of Culture, Film Commission & Music Commission', focus: 'Creative Infrastructure & Media Co-productions' },
  { country: 'Arab Republic of Egypt', entity: 'Ministry of Culture & Cairo International Arts Council', focus: 'Cinematic History, Literature & Performing Arts' },
  { country: 'State of Qatar', entity: 'Qatar Museums & Doha Film Institute', focus: 'Heritage Conservation & Screen Industries' },
  { country: 'Sultanate of Oman', entity: 'Ministry of Heritage and Tourism', focus: 'Maritime Silk Route & Maritime Cultural Ties' },
  { country: 'State of Kuwait', entity: 'National Council for Culture, Arts and Letters (NCCAL)', focus: 'Theatre, Literary Translation & Publishing' },
  { country: 'Kingdom of Bahrain', entity: 'Bahrain Authority for Culture and Antiquities', focus: 'Archaeology & Pearl Heritage Exchange' },
];

export default function AimfPage({ onNavigate, onOpenRegister }) {
  const [activeTab, setActiveTab] = useState('pillars');

  return (
    <div className="pt-24 pb-20 min-h-screen bg-royal text-fg">
      {/* Top Banner / Hero */}
      <section className="relative overflow-hidden border-b border-line">
        {/* Glow ambient effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-foil/15 via-coral/5 to-transparent pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2 border border-gold-foil/30 shadow-sm mb-6">
              <span className="w-2 h-2 rotate-45 bg-gold-foil animate-pulse" />
              <span className="text-xs sm:text-[13px] font-mono uppercase tracking-[0.15em] text-gold-text">
                Arab-India Multilateral Forum · Special Cultural Pavilion
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-fg tracking-[-0.02em] leading-[1.1]">
              AIMF — Arab-India Multilateral Forum
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-lg sm:text-xl text-fg-2 leading-relaxed max-w-3xl">
              Uniting civilizational heritage, creative media economies, performing arts, and sovereign cultural corridors between Bharat and the 22 Arab nations at Yashobhoomi, New Delhi.
            </p>

            {/* Event Highlights Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-y-3 gap-x-6 text-sm sm:text-base font-mono text-gold-text">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-foil" />
                <span>18–19 December 2026</span>
              </div>
              <span className="hidden sm:inline text-line">•</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-foil" />
                <span>Yashobhoomi (IICC), New Delhi</span>
              </div>
              <span className="hidden sm:inline text-line">•</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-foil" />
                <span>India + 22 Arab Corridors</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="btn-primary !rounded-xl h-12 px-7 text-base font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-coral/20 active:scale-[0.98]"
              >
                <span>Register for AIMF Sessions</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('collaborate')}
                className="btn-secondary !rounded-xl h-12 px-6 text-base font-medium flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Propose Cultural Collaboration</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="surface-card p-5 rounded-2xl border border-line-strong/60">
              <div className="font-serif text-3xl sm:text-4xl font-medium text-gold-text">22</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-wider text-fg-3">Arab Nations</div>
              <p className="mt-2 text-xs text-fg-2 leading-relaxed">Full representation across GCC, North Africa and Levant diplomatic missions.</p>
            </div>

            <div className="surface-card p-5 rounded-2xl border border-line-strong/60">
              <div className="font-serif text-3xl sm:text-4xl font-medium text-fg">14+</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-wider text-fg-3">Cultural Ministries</div>
              <p className="mt-2 text-xs text-fg-2 leading-relaxed">Sovereign arts, cinema, and heritage delegations in attendance.</p>
            </div>

            <div className="surface-card p-5 rounded-2xl border border-line-strong/60">
              <div className="font-serif text-3xl sm:text-4xl font-medium text-gold-text">₹1,500 Cr</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-wider text-fg-3">Co-Production Deals</div>
              <p className="mt-2 text-xs text-fg-2 leading-relaxed">Bilateral entertainment, OTT streaming and gaming pipeline.</p>
            </div>

            <div className="surface-card p-5 rounded-2xl border border-line-strong/60">
              <div className="font-serif text-3xl sm:text-4xl font-medium text-fg">40+</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-wider text-fg-3">Master Artists</div>
              <p className="mt-2 text-xs text-fg-2 leading-relaxed">Cross-corridor orchestral, Sufi, and cinematic presentations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-20 z-30 bg-surface-1/90 backdrop-blur-md border-b border-line">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-none py-2.5">
          <button
            onClick={() => setActiveTab('pillars')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'pillars'
                ? 'bg-surface-3 text-gold-text font-semibold shadow-sm'
                : 'text-fg-3 hover:text-fg hover:bg-surface-2'
            }`}
          >
            Strategic Pillars
          </button>
          <button
            onClick={() => setActiveTab('programme')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'programme'
                ? 'bg-surface-3 text-gold-text font-semibold shadow-sm'
                : 'text-fg-3 hover:text-fg hover:bg-surface-2'
            }`}
          >
            Programme & Galas
          </button>
          <button
            onClick={() => setActiveTab('delegations')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'delegations'
                ? 'bg-surface-3 text-gold-text font-semibold shadow-sm'
                : 'text-fg-3 hover:text-fg hover:bg-surface-2'
            }`}
          >
            Participating Delegations
          </button>
          <button
            onClick={() => setActiveTab('secretariat')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'secretariat'
                ? 'bg-surface-3 text-gold-text font-semibold shadow-sm'
                : 'text-fg-3 hover:text-fg hover:bg-surface-2'
            }`}
          >
            Protocol & Secretariat
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab 1: Pillars */}
        {activeTab === 'pillars' && (
          <div className="space-y-12 animate-fade-in">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-[0.14em] text-gold-text">Foundational Frameworks</span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-fg">
                Four Pillars of the Arab-India Multilateral Forum
              </h2>
              <p className="mt-2 text-sm sm:text-base text-fg-3">
                Crafted to bridge ancient civilizational kinship with the modern multi-billion dollar creative economy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AIMF_PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div 
                    key={idx}
                    className="surface-card p-6 sm:p-8 rounded-2xl border border-line-strong hover:border-gold-foil/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-3 border border-line-strong flex items-center justify-center text-gold-text group-hover:scale-105 transition-transform">
                          <Icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-mono uppercase tracking-wider text-fg-3 bg-surface-2 px-2.5 py-1 rounded-md border border-line">
                          {pillar.tag}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-fg group-hover:text-gold-text transition-colors">
                        {pillar.title}
                      </h3>

                      <p className="mt-3 text-sm sm:text-[15px] text-fg-2 leading-relaxed">
                        {pillar.description}
                      </p>

                      <div className="mt-6 pt-5 border-t border-line/60 space-y-2.5">
                        {pillar.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-fg-3">
                            <CheckCircle2 className="w-4 h-4 text-gold-foil shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-4">
                      <button 
                        onClick={() => onNavigate('register')}
                        className="text-xs font-mono uppercase tracking-wider text-gold-text hover:text-gold-foil flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Reserve Accreditation Pass</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Programme */}
        {activeTab === 'programme' && (
          <div className="space-y-8 animate-fade-in">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-[0.14em] text-gold-text">Curated Schedule</span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-fg">
                AIMF Sessions & Cultural Galas
              </h2>
              <p className="mt-2 text-sm sm:text-base text-fg-3">
                Experience intellectual plenaries, bilateral deal sessions, and evening symphonic galas.
              </p>
            </div>

            <div className="space-y-4">
              {SCHEDULE_HIGHLIGHTS.map((item, idx) => (
                <div 
                  key={idx}
                  className="surface-card p-5 sm:p-6 rounded-2xl border border-line hover:border-gold-foil/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-3 text-gold-text border border-gold-foil/20">
                        {item.badge}
                      </span>
                      <span className="text-xs font-mono text-fg-3">{item.day}</span>
                      <span className="text-xs font-mono text-fg-3">•</span>
                      <span className="text-xs font-mono text-fg-3">{item.time}</span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-medium text-fg">
                      {item.title}
                    </h3>

                    <div className="text-xs sm:text-sm text-fg-3 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-foil shrink-0" />
                      <span>{item.stage}</span>
                      <span className="mx-1">•</span>
                      <Users className="w-3.5 h-3.5 text-fg-3 shrink-0" />
                      <span className="truncate">{item.speakers}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('schedule')}
                    className="shrink-0 btn-secondary !rounded-xl h-10 px-4 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Full Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Delegations */}
        {activeTab === 'delegations' && (
          <div className="space-y-8 animate-fade-in">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-[0.14em] text-gold-text">Diplomatic Convergence</span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-fg">
                Accredited Cultural & Media Delegations
              </h2>
              <p className="mt-2 text-sm sm:text-base text-fg-3">
                Official representations joining the Arab-India Multilateral Forum at Yashobhoomi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DELEGATION_BODIES.map((del, idx) => (
                <div key={idx} className="surface-card p-5 rounded-xl border border-line flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rotate-45 bg-gold-foil" />
                      <span className="text-sm font-semibold text-fg">{del.country}</span>
                    </div>
                    <p className="text-xs font-medium text-gold-text">{del.entity}</p>
                    <p className="mt-2 text-xs text-fg-3">{del.focus}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-line/60 text-[11px] font-mono text-fg-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Protocol Confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Secretariat */}
        {activeTab === 'secretariat' && (
          <div className="space-y-8 animate-fade-in max-w-4xl">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-[0.14em] text-gold-text">Governance & Accreditation</span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-fg">
                AIMF Secretariat & Organizing Bodies
              </h2>
              <p className="mt-2 text-sm sm:text-base text-fg-3">
                Administered under the auspices of Bharat Mahotsav Festivals LLP in strategic alliance with IACCIA.
              </p>
            </div>

            <div className="surface-card p-6 sm:p-8 rounded-2xl border border-line-strong space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-mono uppercase tracking-wider text-gold-text mb-2">Bharat Mahotsav Festivals LLP</h4>
                  <p className="text-sm text-fg-2 leading-relaxed">
                    Lead convening entity for cultural, heritage, and creative economy forums celebrating Indian civilizational depth and international diplomatic alliances across global corridors.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-mono uppercase tracking-wider text-gold-text mb-2">IACCIA Diplomatic Secretariat</h4>
                  <p className="text-sm text-fg-2 leading-relaxed">
                    India-Arab Chamber of Commerce and Industry protocol office managing bilateral ministerial itineraries, ambassadorial escorts, and formal bilateral MoUs.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-fg">Have an official cultural proposal?</div>
                  <div className="text-xs text-fg-3">Submit your delegation query to the AIMF Protocol Desk.</div>
                </div>
                <button
                  onClick={() => onNavigate('query')}
                  className="btn-primary !rounded-xl h-11 px-5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span>Contact Protocol Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Banner CTA */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 border border-gold-foil/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-[0.15em] text-gold-text">Accreditation Now Open</span>
            <h3 className="mt-2 font-serif text-3xl sm:text-4xl font-medium text-fg leading-tight">
              Join the historic convergence of Indo-Arab cultural diplomacy.
            </h3>
            <p className="mt-3 text-sm sm:text-base text-fg-2 leading-relaxed">
              Secure your passes for the plenaries, deal rooms, and the grand evening symphonic galas at Yashobhoomi, 18–19 December 2026.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="btn-primary !rounded-xl h-12 px-6 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                <span>Register as Delegate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="btn-secondary !rounded-xl h-12 px-5 text-sm font-medium flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Return to Overview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
