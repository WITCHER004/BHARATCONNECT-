
import { useState } from 'react';
import { VENUE_DETAILS } from '../data/conclaveData';
import { Train, Leaf, ShieldCheck, Languages, ChevronDown } from 'lucide-react';

const ITINERARY = [
  {
    day: 'Day 0',
    date: 'Thu 17 Dec',
    title: 'Arrival, protocol reception and Aerocity check-in',
    desc: 'Delegations arrive at Indira Gandhi International Airport (T3). IACCIA protocol officers handle fast-track immigration, baggage clearance and chauffeured transfers to partner hotels in Aerocity and Dwarka.',
    highlights: ['Airport fast-track lounge', 'Welcome dates and coffee', 'Badge pick-up at partner hotels']
  },
  {
    day: 'Day 1',
    date: 'Fri 18 Dec',
    title: 'Inaugural plenary, sector roundtables and Gala Dinner',
    desc: 'The conclave opens in Palash Hall (6th floor, Yashobhoomi) with keynotes by Cabinet Ministers, the exhibition opening and sector breakouts on clean energy, AI and infrastructure, followed by the black-tie Inaugural Gala Dinner in the Yashobhoomi Grand Ballroom.',
    highlights: ['Ministerial lighting of the lamp', 'Palash exhibition floor opening', 'Sitar and oud performance', 'Leadership Awards banquet']
  },
  {
    day: 'Day 2',
    date: 'Sat 19 Dec',
    title: 'Sovereign wealth roundtables, B2B matchmaking and declaration',
    desc: 'Closed-door sovereign wealth dialogues (ADIA, PIF, QIA, KIA, NIIF), then 100+ concurrent deal-room sessions in the 7,000 sq ft lounge, bilateral MoU signings and the adoption of the New Delhi Declaration.',
    highlights: ['Sovereign fund breakfast roundtable', '100+ pre-matched B2B meetings', 'MoU exchange on the dais', 'Farewell high tea']
  },
  {
    day: 'Day 3',
    date: 'Sun 20 Dec',
    title: 'Cultural heritage excursion',
    desc: 'An optional excursion for international delegates and spouses: guided tours of Delhi’s UNESCO World Heritage sites, the Lutyens’ diplomatic avenue and a showcase of Indian crafts.',
    highlights: ['Humayun’s Tomb and India Gate', 'Rashtrapati Bhavan circuit', 'National Crafts Museum']
  }
];

const ROUTES = [
  { id: 't3', label: 'IGI Airport (T3)', time: '15 min', dist: '11.2 km', desc: '8-lane expressway and Airport Express Metro' },
  { id: 'aerocity', label: 'Aerocity hotels', time: '12 min', dist: '9.5 km', desc: 'Conclave shuttle every 20 min' },
  { id: 'chanakyapuri', label: 'Chanakyapuri embassies', time: '28 min', dist: '22.0 km', desc: 'Police-escorted corridors for visiting ministers' },
  { id: 'gurugram', label: 'Gurugram CyberCity', time: '20 min', dist: '14.8 km', desc: 'Signal-free Dwarka Expressway' }
];

const HOTELS = [
  {
    name: 'JW Marriott Hotel New Delhi Aerocity',
    minutes: '12 min',
    rating: '5-star',
    desc: 'Official accommodation for presidential delegations, with private bilateral salons and executive security suites'
  },
  {
    name: 'Andaz Delhi (Hyatt) Aerocity',
    minutes: '14 min',
    rating: '5-star',
    desc: 'Preferred residence for visiting trade ministers, chamber chairpersons and sovereign wealth fund executives'
  },
  {
    name: 'Radisson Blu Hotel New Delhi Dwarka',
    minutes: '8 min',
    rating: '5-star',
    desc: 'The closest partner property to Yashobhoomi, suited to corporate delegations, exhibitors and matchmaking teams'
  }
];

const SERVICES = [
  { icon: Languages, title: 'Simultaneous interpretation', desc: 'Wireless headsets with Arabic, English and Hindi channels' },
  { icon: ShieldCheck, title: 'Protocol and motorcade porch', desc: 'A ministerial reception porch, bullet-resistant holding suites and security clearance' },
  { icon: Leaf, title: 'Sustainable operations', desc: 'No single-use plastics, rooftop solar and MERV-14 filtered air' }
];

export default function ExperiencePage({ onNavigate, onOpenRegister }) {
  const [openDay, setOpenDay] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState('t3');

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="page-enter flex flex-col">

      {/* Page header */}
      <section className="pt-32 pb-12 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="ref-line mb-4">Yashobhoomi (IICC) / Dwarka Sector 25 / New Delhi</p>
          <h1 className="font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em] mb-4">
            Venue and Delhi
          </h1>
          <p className="text-[15px] sm:text-lg text-fg-2 max-w-2xl leading-relaxed mb-8">
            Getting to Yashobhoomi, where to stay, visa support and the four-day delegate itinerary
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => scrollTo('itinerary-section')} className="btn-primary h-11 px-5 text-sm">
              See the itinerary
            </button>
            <button onClick={() => scrollTo('hotel-section')} className="btn-secondary h-11 px-5 text-sm">
              Partner hotels
            </button>
          </div>
        </div>
      </section>

      <div className="theme-cream">

        {/* Venue */}
        <section className="py-20 sm:py-24 bg-surface-1 border-b border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
              <div className="lg:col-span-7">
                <h2 className="font-serif font-medium text-3xl sm:text-4xl text-fg mb-4">
                  Yashobhoomi, IICC New Delhi
                </h2>
                <p className="text-[15px] text-fg-2 leading-relaxed max-w-2xl mb-8">
                  India’s international convention centre, with column-free halls, an underground climate-controlled metro link and IGBC Platinum green certification
                </p>

                <dl className="grid grid-cols-3 border-t border-line">
                  <div className="pt-4 pr-3 sm:pr-4 min-w-0">
                    <dt className="text-xs sm:text-sm text-fg-3 mb-1">From IGI Airport (T3)</dt>
                    <dd className="font-serif text-2xl sm:text-3xl text-coral-text figure">15 min</dd>
                  </div>
                  <div className="pt-4 px-3 sm:px-4 border-l border-line min-w-0">
                    <dt className="text-xs sm:text-sm text-fg-3 mb-1">IGBC rating</dt>
                    <dd className="font-serif text-2xl sm:text-3xl text-fg">Platinum</dd>
                  </div>
                  <div className="pt-4 pl-3 sm:pl-4 border-l border-line min-w-0">
                    <dt className="text-xs sm:text-sm text-fg-3 mb-1">Metro</dt>
                    <dd className="font-serif text-2xl sm:text-3xl text-fg">Direct link</dd>
                  </div>
                </dl>
              </div>

              <div className="lg:col-span-5 p-6 rounded-2xl surface-card">
                <h3 className="text-sm font-medium text-fg mb-4">Delegation services</h3>
                <ul className="flex flex-col gap-4">
                  {SERVICES.map(({ icon: Icon, title, desc }) => (
                    <li key={title} className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-fg-3 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <div className="text-sm font-medium text-fg">{title}</div>
                        <div className="text-sm text-fg-2 leading-relaxed">{desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Venue highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 mb-16 border-t border-line pt-8">
              {VENUE_DETAILS.highlights.map((item, idx) => (
                <div key={idx}>
                  <span className="ref-line block mb-2">{String(idx + 1).padStart(2, '0')}</span>
                  <h3 className="text-base font-medium text-fg mb-2">{item.title}</h3>
                  <p className="text-sm text-fg-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Route planner */}
            <div className="rounded-2xl surface-card p-6 sm:p-8">
              <div className="mb-6 pb-6 border-b border-line">
                <h3 className="font-serif font-medium text-2xl text-fg mb-1">Travel times to the venue</h3>
                <p className="text-sm text-fg-3">Choose where you are starting from in Delhi NCR</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROUTES.map((route) => {
                    const isActive = selectedRoute === route.id;
                    return (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => setSelectedRoute(route.id)}
                        aria-pressed={isActive}
                        className={`p-4 rounded-xl border text-left transition-[background-color,border-color,transform] duration-150 cursor-pointer active:scale-[0.98] ${isActive
                          ? 'bg-surface-3 border-line-strong shadow-sm'
                          : 'border-line hover:bg-surface-3'
                          }`}
                      >
                        <div className="text-sm font-medium text-fg">{route.label}</div>
                        <div className="font-mono text-sm text-fg mt-1 figure">{route.time} · {route.dist}</div>
                        <div className="text-xs text-fg-3 mt-1">{route.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-6 p-6 rounded-xl bg-surface-3 border border-line flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-fg-3">
                    <Train className="w-4 h-4" strokeWidth={1.5} />
                    Recommended: Airport Express (Orange Line)
                  </div>
                  <h4 className="font-serif font-medium text-xl text-fg">
                    Underground access to Palash Hall
                  </h4>
                  <p className="text-sm text-fg-2 leading-relaxed">
                    From the Terminal 3 Airport station it is two stops to Yashobhoomi Dwarka Sector 25. Escalators lead straight to the registration foyer without leaving the climate-controlled security perimeter.
                  </p>
                  <div className="pt-3 mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line">
                    <span className="ref-line">Every 8 min</span>
                    <span className="text-sm text-fg-2">Free with your summit badge</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Itinerary */}
        <section id="itinerary-section" className="py-20 sm:py-24 bg-surface-1 scroll-mt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">

            <div className="mb-12">
              <h2 className="font-serif font-medium text-3xl sm:text-4xl text-fg mb-3">
                Four-day delegate itinerary
              </h2>
              <p className="text-[15px] text-fg-2 max-w-2xl leading-relaxed">
                From airport reception through the deal-room roundtables to a heritage excursion
              </p>
            </div>

            <div className="flex flex-col border-t border-line">
              {ITINERARY.map((item, index) => {
                const isOpen = openDay === index;
                return (
                  <div key={index} className="border-b border-line">
                    <button
                      onClick={() => setOpenDay(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="w-full py-6 text-left grid grid-cols-[80px_1fr_auto] sm:grid-cols-[120px_1fr_auto] items-start gap-4 cursor-pointer group"
                    >
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-fg">{item.day}</span>
                        <span className="ref-line">{item.date}</span>
                      </span>
                      <span className="font-serif font-medium text-lg sm:text-xl text-fg group-hover:text-fg-2 transition-colors">
                        {item.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 mt-1.5 text-fg-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        strokeWidth={1.5}
                      />
                    </button>

                    {isOpen && (
                      <div className="pb-6 sm:pl-[136px] pl-[96px] pr-8 flex flex-col gap-4 animate-fade-in">
                        <p className="text-sm text-fg-2 leading-relaxed">{item.desc}</p>
                        <ul className="flex flex-col gap-1">
                          {item.highlights.map((h, i) => (
                            <li key={i} className="text-sm text-fg-2 flex items-start gap-2">
                              <span className="mt-2 w-1 h-1 rounded-full bg-fg-3 shrink-0" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* Hotels and visa */}
        <section id="hotel-section" className="py-20 sm:py-24 bg-surface-1 border-t border-line scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">

            <div className="max-w-2xl mb-12">
              <h2 className="font-serif font-medium text-3xl sm:text-4xl text-fg mb-3">
                Partner hotels and visas
              </h2>
              <p className="text-[15px] text-fg-2 leading-relaxed">
                Negotiated rates at three 5-star hotels, each with a conclave shuttle to Yashobhoomi
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
              {HOTELS.map((hotel) => (
                <div key={hotel.name} className="surface-card rounded-2xl p-6 flex flex-col">
                  <span className="ref-line mb-2">{hotel.rating} · {hotel.minutes} to venue</span>
                  <h3 className="text-base font-medium text-fg mb-2">{hotel.name}</h3>
                  <p className="text-sm text-fg-2 leading-relaxed mb-6">{hotel.desc}</p>
                  <div className="mt-auto pt-4 border-t border-line flex items-center justify-between text-sm">
                    <span className="text-fg-3">Booking code</span>
                    <span className="font-mono text-fg">BHARATCONNECT26</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 rounded-2xl surface-card grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-8">
                <p className="text-sm text-fg-3 mb-2">Ministry of External Affairs clearance</p>
                <h3 className="font-serif font-medium text-2xl text-fg mb-3">
                  Conference e-Visa and facilitation desk
                </h3>
                <p className="text-sm text-fg-2 leading-relaxed">
                  Registered international attendees receive a Government of India conference clearance certificate and an IACCIA invitation letter within 48 hours, for an Indian Conference e-Visa processed in 3 to 5 working days.
                </p>
              </div>
              <div className="lg:col-span-4 flex lg:justify-end">
                <button onClick={onOpenRegister} className="btn-primary h-11 px-5 text-sm">
                  Request a visa letter
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
