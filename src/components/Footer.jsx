import { Phone, MapPin, Download, ArrowUp, ExternalLink } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const icon = 'w-4 h-4 text-fg-3 shrink-0';
const OFFICE_MAP_URL =
  'https://www.google.com/maps/dir//Bharat+Mahotsav+Festivals+LLP,+Ground+Floor,+250,+Kailash+Hills,+East+of+Kailash,+New+Delhi,+Delhi+110065/@23.0785024,76.8475136,7349m/data=!3m2!1e3!4b1!4m8!4m7!1m0!1m5!1m1!1s0x390ce3a5d2dd8fcf:0x5dea26df6b4735f7!2m2!1d77.2584755!2d28.5577284?entry=ttu&g_ep=EgoyMDI2MTEyMy4wIKXMDSoASAFQAw%3D%3D';
const OFFICE_MAP_EMBED_URL =
  'https://maps.google.com/maps?q=28.5577284,77.2584755+(Bharat%20Mahotsav%20Festivals%20LLP)&z=17&output=embed';


export default function Footer({ onNavigate, onOpenRegister }) {
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
- Target Bilateral Trade Vision: ₹100 Crore+ by 2030 (via CEPA and GCC FTA frameworks)
- Confirmed Participating Arab Nations: 22 (GCC, North Africa, Levant, Horn of Africa)
- High-Level Accreditation: 22+ Ministerial, Sovereign Wealth & C-Suite Delegates
- Projected Footfall & Matchmaking: 1,000+ Business Executives & B2B/G2B Deal Rooms
- Exhibition Footprint: 34,065 sq. ft. Column-Free Hall with 50+ Stalls & Sovereign Pavilions
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
          <div className="lg:col-span-7">
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

          {/* Official Office Address */}
          <div className="lg:col-span-5">
            <h4 className="text-sm font-medium text-fg">Official Office Address</h4>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-fg-2">
              <li>
                <a
                  href={OFFICE_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 hover:text-fg transition-colors duration-150"
                >
                  <MapPin className={`${icon} mt-0.5 group-hover:text-gold-text transition-colors duration-150`} strokeWidth={1.5} />
                  <span>
                    Bharat Mahotsav Festivals LLP<br />
                    250, Ground Floor, Kailash Hills<br />
                    East of Kailash, New Delhi, Delhi 110065
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className={icon} strokeWidth={1.5} />
                <a href="tel:+919217400624" className="font-mono text-[13px] tabular-nums hover:text-fg transition-colors duration-150">
                  +91 92174 00624
                </a>
              </li>
            </ul>

            <div className="mt-4 rounded-xl overflow-hidden border border-line bg-surface-2 max-w-sm">
              <iframe
                src={OFFICE_MAP_EMBED_URL}
                title="Bharat Mahotsav Festivals LLP — Official Office Address Map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-36 border-0 block"
              />
              <a
                href={OFFICE_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-gold-text hover:text-fg hover:bg-surface-3 border-t border-line transition-colors duration-150"
              >
                <span className="truncate">Open directions in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              </a>
            </div>

            <button
              onClick={handleDownloadMediaKit}
              className="mt-5 btn-secondary h-9 px-3 text-sm"
            >
              <Download className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
              Media kit and factsheet
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
