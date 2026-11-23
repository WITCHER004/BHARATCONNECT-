import { useState } from 'react';
import { Phone, MapPin, Download, ArrowUp, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const PAGES = [
  { id: 'home', label: 'Overview' },
  { id: 'schedule', label: 'Programme' },
  { id: 'exhibition', label: 'Exhibition and floorplan' },
  { id: 'experience', label: 'Venue and Delhi' },
  { id: 'register', label: 'Event registration' },
  { id: 'startup', label: 'Register a startup' },
  { id: 'startups', label: 'Registered startups' },
  { id: 'collaborate', label: 'Summit Collaboration' },
  { id: 'advisory', label: 'Advisory & Expert Panel' },
  { id: 'investor', label: 'Investor Panel' },
  { id: 'startup-panel', label: 'Startup Panel' },
  { id: 'partners', label: 'Strategic Partners' },
  { id: 'query', label: 'Inquiries and Helpdesk' },
];

const icon = 'w-4 h-4 text-fg-3 shrink-0';


export default function Footer({ onNavigate, onOpenRegister }) {
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmailSub('');
    }
  };

  const handleDownloadMediaKit = () => {
    const content = `========================================================================
BHARAT CONNECT 2026 — BHARAT-ARAB BUSINESS CONCLAVE
Official Media Kit, Executive Factsheet & Diplomatic Briefing
========================================================================

ORGANIZING AUTHORITY:
India & Arab Countries Chamber of Commerce, Industry & Agriculture (IACCIA)
In Strategic Association with: Eventz Unlimited
Under the Patronage of: Union of Arab Chambers & Ministry of Commerce & Industry

EVENT DETAILS:
- Dates: Friday & Saturday, 18–19 December 2026
- Venue: Palash Hall (6th Floor), Yashobhoomi Convention Centre (IICC), New Delhi
- Theme: "People. Partnerships. Prosperity."
- Strategic Scope: Advancing Partnerships across India and all 22 Member States of the Arab League

KEY ECONOMIC BENCHMARKS:
- Target Bilateral Trade Vision: $500 Billion by 2030 (via CEPA and GCC FTA frameworks)
- Confirmed Participating Arab Nations: 22 (GCC, North Africa, Levant, Horn of Africa)
- High-Level Accreditation: 500+ Ministerial, Sovereign Wealth & C-Suite Delegates
- Projected Footfall & Matchmaking: 10,000+ Business Executives & B2B/G2B Deal Rooms
- Exhibition Footprint: 34,065 sq. ft. Column-Free Hall with 100+ Stalls & Sovereign Pavilions
- Dedicated Matchmaking Facility: 7,000 sq. ft. Executive B2B Deal Lounge with 24 Meeting Rooms

STRATEGIC VERTICALS:
1. Clean Energy & Sustainability (Green Hydrogen, Solar Grids, Desalination)
2. Infrastructure, Construction & Smart Cities (IMEC Corridor, Deep-sea Ports)
3. Technology, AI & Innovation Village (FinTech, UPI-Jaywan, Bilingual LLMs)
4. Food Security, Agri-Business & Mining (Strategic Food Reserves, Agri-Tech)
5. Healthcare, Pharmaceuticals & Life Sciences (Generic Formulation, MedTech)
6. Tourism, Hospitality & Cultural Exchange (MICE Corridors, Heritage Diplomacy)

SECRETARIAT & ACCREDITATION:
- Office: 250, Ground Floor, Kailash Hills, East of Kailash, New Delhi, Delhi 110065
- Telephone: +91 92174 00624
- Official Portal: (Simulated Preview)
========================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Bharat-Connect-2026-Factsheet.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-surface-0 border-t border-line text-fg">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-line">

          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <BrandLogo variant="badge" className="py-1 px-3" />
              <span className="flex flex-col">
                <span className="text-[15px] font-semibold leading-5 text-fg">Bharat Connect 2026</span>
                <span className="text-xs text-fg-3 leading-4">Bharat-Arab Business Conclave</span>
              </span>
            </div>
            <p className="mt-6 text-sm leading-[22px] text-fg-2 max-w-sm">
              Strategic partnerships between India and 22 Arab countries. Organised by the India &amp; Arab Countries Chamber of Commerce, Industry &amp; Agriculture (IACCIA) with Eventz Unlimited.
            </p>
            <p className="mt-6 ref-line">18–19 Dec 2026 · Palash Hall, 6F · Yashobhoomi</p>
          </div>

          {/* Pages */}
          <nav className="lg:col-span-2" aria-label="Footer">
            <h4 className="text-sm font-medium text-fg">Conclave</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-fg-2">
              {PAGES.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onNavigate(p.id)}
                    className="hover:text-fg transition-colors duration-150 cursor-pointer text-left"
                  >
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Secretariat */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-medium text-fg">Secretariat</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-fg-2">
              <li className="flex items-start gap-3">
                <MapPin className={`${icon} mt-0.5`} strokeWidth={1.5} />
                <span>
                  250, Ground Floor, Kailash Hills<br />
                  East of Kailash, New Delhi<br />
                  Delhi 110065
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className={icon} strokeWidth={1.5} />
                <a href="tel:+919217400624" className="font-mono text-[13px] tabular-nums hover:text-fg transition-colors duration-150">
                  +91 92174 00624
                </a>
              </li>
            </ul>
            <button
              onClick={handleDownloadMediaKit}
              className="mt-6 btn-secondary h-9 px-3 text-sm"
            >
              <Download className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
              Media kit and factsheet
            </button>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-medium text-fg">Trade digest</h4>
            <p className="mt-4 text-sm leading-[22px] text-fg-2">
              India-Arab CEPA regulatory updates, sector papers and procurement briefs
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <label htmlFor="footer-email" className="sr-only">Email</label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="Email"
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                className="flex-1 min-w-0 h-9 px-3 rounded-[10px] bg-surface-3 border border-line text-sm text-fg placeholder:text-fg-3 transition-colors duration-150 focus:border-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
              />
              <button type="submit" className="btn-secondary h-9 px-3 text-sm shrink-0">
                Subscribe
              </button>
            </form>
            <p className="mt-2 h-5 text-sm text-fg-3" aria-live="polite">
              {subscribed ? 'Subscribed' : ''}
            </p>
            <button
              onClick={() => onNavigate('startup')}
              className="mt-2 inline-flex items-center gap-2 text-sm text-fg-2 hover:text-fg transition-colors duration-150 cursor-pointer"
            >
              Register a startup
              <ArrowRight className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="ref-line">© 2026 Bharat Connect · Organised by IACCIA with Eventz Unlimited</p>
          <div className="flex items-center gap-6 text-sm text-fg-3">
            <span className="hover:text-fg-2 transition-colors duration-150 cursor-pointer">Protocol rules</span>
            <span className="hover:text-fg-2 transition-colors duration-150 cursor-pointer">Visa clearance</span>
            <span className="hover:text-fg-2 transition-colors duration-150 cursor-pointer">Privacy</span>
            <button
              onClick={scrollToTop}
              className="w-9 h-9 rounded-lg text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center transition-colors duration-150 cursor-pointer"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
