import { useState, useMemo, useEffect } from 'react';
import {
  Handshake,
  Building2,
  Globe2,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Send,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Download,
  Phone,
  Mail,
  Users,
  Award,
  TrendingUp,
  Briefcase,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ARAB_NATIONS } from '../data/conclaveData';
import { useAuth } from '../auth/AuthContext';
import SignInGate from '../auth/SignInGate';
import { submitRegistration } from '../data/registry';

const COLLAB_TRACKS = [
  {
    id: 'country-pavilion',
    title: 'Country & State Sovereign Pavilion',
    badge: 'Government & Embassy Track',
    desc: 'Official national or state trade pavilion with dedicated ministerial bilateral deal-rooms and cultural exhibition footprint.',
    deliverables: ['Dedicated 100–300 sq. m pavilion space', 'Ministerial VIP lounge accreditation', 'Bilateral MOU plenary signing slot'],
  },
  {
    id: 'sector-anchor',
    title: 'Industry Sector Anchor Co-Host',
    badge: 'Economic Corridors',
    desc: 'Anchor partner for one of the six priority sectors: Clean Energy, AI/DeepTech, Sovereign Wealth, Healthcare, Food Security, or Infrastructure.',
    deliverables: ['Keynote stage presentation slot', 'Curated B2B buyer delegations', 'Sector roundtable co-chairing rights'],
  },
  {
    id: 'dealroom-partner',
    title: 'B2B Deal-Room & Roundtable Partner',
    badge: 'Commercial Matchmaking',
    desc: 'Co-sponsor private bilateral negotiation suites with 24 dedicated meeting rooms and pre-vetted corporate matchings.',
    deliverables: ['Private branded 8-seat meeting suite', 'Pre-scheduled buyer-seller meetings', 'Executive deal-concierge support'],
  },
  {
    id: 'knowledge-partner',
    title: 'Knowledge, Policy & Think-Tank Partner',
    badge: 'Research & Academia',
    desc: 'Co-author official bilateral policy whitepapers, trade flow reports, and academic panel sessions with multilateral leaders.',
    deliverables: ['Whitepaper launch on plenary stage', 'Research compendium distribution', 'Panel moderator & speaker slots'],
  },
  {
    id: 'corporate-sponsor',
    title: 'Corporate Sponsor & Leadership Gala Host',
    badge: 'Brand & Patronage',
    desc: 'Summit title sponsor, inaugural banquet co-host, or leadership awards presenter with highest brand prominence.',
    deliverables: ['Inaugural Gala Dinner table hosting', 'Global summit media kit branding', 'VIP delegation pass allocation (15+)'],
  },
  {
    id: 'media-broadcast',
    title: 'Media, Broadcast & Communications Partner',
    badge: 'Global Media Network',
    desc: 'Official television, digital, or print broadcast partnership with on-site studio access and ministerial interview exclusives.',
    deliverables: ['Dedicated broadcast press room booth', 'Priority ministerial interview access', 'Global syndication partner status'],
  },
];

const ENTITY_TYPES = [
  'Government Ministry / Sovereign Department',
  'Diplomatic Mission / Embassy / Consulate',
  'Chamber of Commerce / Bilateral Trade Council',
  'Multinational Conglomerate / Corporate Entity',
  'Sovereign Wealth Fund / Private Equity / VC',
  'Academic Institution / Research Think-Tank',
  'Industry Association / Export Promotion Council',
  'Media Network / International Press',
];

const DELEGATION_SIZES = [
  '1–5 Executive Delegates',
  '6–15 Ministerial / Corporate Delegates',
  '16–30 Bilateral Trade Mission Delegates',
  '30+ Sovereign Delegation / Large Contingent',
];

export default function CollaborationPage({ onNavigate }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    orgName: '',
    orgType: ENTITY_TYPES[2],
    country: 'United Arab Emirates',
    liaisonName: user?.name || '',
    liaisonTitle: '',
    email: user?.email || '',
    phone: '',
    track: 'country-pavilion',
    delegationSize: DELEGATION_SIZES[1],
    objectives: '',
    mouSigning: true,
    urgentProtocol: false,
  });

  const [status, setStatus] = useState('idle');
  const [assignedTicket, setAssignedTicket] = useState(null);
  const [copied, setCopied] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [termsError, setTermsError] = useState('');

  // fill in the liaison's name and email once they sign in, without overwriting what they typed
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, liaisonName: f.liaisonName || user.name || '', email: f.email || user.email || '' }));
  }, [user]);

  const selectedTrackData = useMemo(() => {
    return COLLAB_TRACKS.find((t) => t.id === form.track) || COLLAB_TRACKS[0];
  }, [form.track]);

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAgreed) {
      setTermsError('Please agree to the Bilateral Collaboration & Sovereign Directorate Terms.');
      setStatus('idle');
      return;
    }
    setTermsError('');
    setStatus('submitting');
    const trackObj = COLLAB_TRACKS.find((t) => t.id === form.track);
    const trackTitle = trackObj?.title || 'Summit Strategic Collaboration';
    try {
      const newId = await submitRegistration('collaboration', {
        name: form.liaisonName,
        email: form.email,
        organisation: form.orgName,
        country: form.country,
        detail: trackTitle,
        sector: form.orgType,
        phone: form.phone,
        details: { ...form, trackTitle },
      });
      setAssignedTicket({
        id: newId,
        ...form,
        trackTitle,
        createdAt: new Date().toISOString(),
        status: 'Under Review by Directorate',
        assignedDesk: 'Directorate of Strategic Alliances & Partnerships',
        eta: form.urgentProtocol ? '12 Hours (Fast-Track Protocol)' : '24 Hours (Standard Review)',
      });
      setStatus('submitted');
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } catch {
      setStatus('failed');
    }
  };

  const handleDownloadProspectus = () => {
    const text = `========================================================================
BHARAT CONNECT 2026 — BHARAT-ARAB BUSINESS CONCLAVE
Official Business Summit Collaboration & Partnership Prospectus
========================================================================

VENUE & DATES:
- Dates: 18–19 December 2026
- Venue: Yashobhoomi Convention Centre (IICC), New Delhi
- Host: India & Arab Countries Chamber of Commerce, Industry & Agriculture (IACCIA)
- Strategic Partner: Eventz Unlimited
- Patronage: Union of Arab Chambers & Ministry of Commerce and Industry

COLLABORATION CATEGORIES:
1. Country & State Sovereign Pavilion (100–300 sq. m, ministerial deal-rooms)
2. Industry Sector Anchor Co-Host (6 economic corridors)
3. B2B Deal-Room & Executive Roundtable Partner (24 meeting suites)
4. Knowledge, Policy & Think-Tank Partner (Whitepapers & research)
5. Corporate Sponsor & Leadership Gala Dinner Host
6. Media, Broadcast & Global Communications Partner

GUARANTEED STRATEGIC BENEFITS:
- Priority slot on main plenary stage for bilateral MoU signings
- Access to 7,000 sq. ft. Yashobhoomi Executive Lounge & Private Meeting Suites
- Direct introductory diplomatic protocol with visiting Ministers & Ambassadors
- Permanent listing in the BABC 2026 Summit Compendium & Global Media Kit

PARTNERSHIP DIRECTORATE:
- Email: partnerships@iaccia-conclave.org / protocol@iaccia-conclave.org
- Direct Hotline: +91 11 4987 6000 / +91 92174 00624
========================================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bharat-Connect-2026-Collaboration-Prospectus.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="page-enter flex flex-col">
      {/* ── Top Header Banner (Obsidian Black) ──────────────────────── */}
      <section className="pt-32 pb-14 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="ref-line text-gold-text">
              BABC 2026 Directorate · Strategic Alliances &amp; Summit Partnerships
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-positive/10 text-positive border border-positive/20">
              <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
              Partnership Intake Active
            </span>
          </div>

          <h1 className="mt-4 font-serif font-medium text-3xl sm:text-5xl text-fg tracking-[-0.02em] max-w-4xl leading-tight">
            Collaboration through <span className="text-gold-text">Bharat Connect</span>
          </h1>

          <p className="mt-4 text-[15px] sm:text-lg text-fg-2 max-w-3xl leading-relaxed">
            A dedicated portal for governments, bilateral chambers of commerce, industry conglomerates, sovereign wealth funds,
            and research think-tanks to co-curate pavilions, sponsor B2B deal rooms, and execute bilateral accords at the conclave.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl surface-raised rounded-xl p-4 border border-line">
            <div>
              <span className="text-xs text-fg-3 block font-mono">Participating Nations</span>
              <span className="text-base sm:text-lg font-medium text-fg mt-0.5 block">22 Arab States + India</span>
            </div>
            <div>
              <span className="text-xs text-fg-3 block font-mono">Target Trade Framework</span>
              <span className="text-base sm:text-lg font-medium text-gold-text font-mono mt-0.5 block">$500 Billion</span>
            </div>
            <div>
              <span className="text-xs text-fg-3 block font-mono">Deal Suites &amp; Lounges</span>
              <span className="text-base sm:text-lg font-medium text-fg mt-0.5 block">24 Private Suites</span>
            </div>
            <div>
              <span className="text-xs text-fg-3 block font-mono">Reference Format</span>
              <span className="text-base sm:text-lg font-mono text-gold-text mt-0.5 block font-semibold">BMF.BC-CBC</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Portal Workspace (Warm Editorial Surface) ──────────── */}
      <section className="theme-cream py-12 sm:py-16 bg-surface-1 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* SUCCESS TICKET VIEW */}
          {status === 'submitted' && assignedTicket ? (
            <div className="max-w-3xl mx-auto surface-card rounded-2xl p-8 sm:p-10 border border-line-strong shadow-2xl animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-fg text-surface-1 flex items-center justify-center mb-6">
                <Check className="w-7 h-7" strokeWidth={2.5} />
              </div>

              <p className="ref-line text-gold-text">Strategic Partnership Docket Dispatched · Protocol Registered</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-medium text-fg">
                Collaboration Proposal Received
              </h2>
              <p className="mt-3 text-[15px] text-fg-2 leading-relaxed">
                Thank you, <span className="text-fg font-medium">{assignedTicket.liaisonName}</span>. Your institutional
                collaboration request on behalf of <span className="text-fg font-medium">{assignedTicket.orgName}</span> has been
                logged into the IACCIA Directorate diplomatic register.
              </p>

              {/* Official Ticket Card */}
              <div className="my-8 p-6 sm:p-8 rounded-2xl bg-surface-2 border-2 border-gold-foil/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_6px_30px_rgba(184,137,58,0.15)]">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-gold-text block">
                    Official Summit Collaboration Reference ID
                  </span>
                  <span className="mt-1 font-mono text-3xl sm:text-4xl font-semibold text-fg tracking-tight block">
                    {assignedTicket.id}
                  </span>
                  <span className="text-xs text-fg-3 block mt-2">
                    Priority Response SLA: Guaranteed within <span className="font-medium text-fg">{assignedTicket.eta}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(assignedTicket.id)}
                  className="btn-primary h-12 px-6 text-sm font-medium flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Reference ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Submitted Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm surface-raised rounded-xl p-5 border border-line">
                <div>
                  <span className="text-fg-3 text-xs block font-mono">Organization / Entity</span>
                  <span className="font-medium text-fg mt-0.5 block">{assignedTicket.orgName}</span>
                </div>
                <div>
                  <span className="text-fg-3 text-xs block font-mono">Country / Jurisdiction</span>
                  <span className="font-medium text-fg mt-0.5 block">{assignedTicket.country}</span>
                </div>
                <div>
                  <span className="text-fg-3 text-xs block font-mono">Collaboration Track</span>
                  <span className="font-medium text-fg mt-0.5 block text-gold-text">{assignedTicket.trackTitle}</span>
                </div>
                <div>
                  <span className="text-fg-3 text-xs block font-mono">Delegation Scale</span>
                  <span className="font-medium text-fg mt-0.5 block">{assignedTicket.delegationSize}</span>
                </div>
                <div>
                  <span className="text-fg-3 text-xs block font-mono">Direct Liaison Contact</span>
                  <span className="font-medium text-fg mt-0.5 block">{assignedTicket.liaisonName} ({assignedTicket.liaisonTitle || 'Delegate'})</span>
                </div>
                <div>
                  <span className="text-fg-3 text-xs block font-mono">Dispatch Email</span>
                  <span className="font-medium text-fg mt-0.5 block">{assignedTicket.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-line flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setAssignedTicket(null);
                  }}
                  className="btn-primary h-11 px-5 text-sm cursor-pointer"
                >
                  Submit another proposal
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('query')}
                  className="btn-secondary h-11 px-5 text-sm cursor-pointer"
                >
                  Track in Secretariat Desk
                </button>
                <button
                  type="button"
                  onClick={handleDownloadProspectus}
                  className="h-11 px-4 rounded-[10px] border border-gold-foil text-gold-text text-sm font-medium hover:bg-gold-foil/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Prospectus
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Form Section */}
              <div className="lg:col-span-8">
                <SignInGate
                  title="Sign in to submit your collaboration request"
                  reason="Collaboration requests need an account, so your docket, protocol requests and Secretariat replies stay tied to you."
                >
                <form
                  onSubmit={handleSubmit}
                  className="surface-card rounded-2xl p-6 sm:p-10 border border-line shadow-sm"
                >
                  <div className="flex items-center justify-between pb-6 border-b border-line gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-foil/10 border border-gold-foil/30 flex items-center justify-center text-gold-text">
                        <Handshake className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-medium text-fg">Institutional Collaboration Intake</h2>
                        <p className="text-xs text-fg-3 mt-0.5">
                          Direct registration with the Senior Secretariat Officer for Conclave Alliances
                        </p>
                      </div>
                    </div>

                    <span className="hidden sm:inline-flex text-xs font-mono text-gold-text border border-gold-foil/40 px-3 py-1 rounded-full bg-gold-foil/5">
                      Accreditation: [BMF.BC-CBC]
                    </span>
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Track Selection */}
                    <div>
                      <label className="block text-sm font-medium text-fg mb-2">
                        Select Preferred Collaboration Track <span className="text-coral-text">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {COLLAB_TRACKS.map((track) => {
                          const isSelected = form.track === track.id;
                          return (
                            <button
                              type="button"
                              key={track.id}
                              onClick={() => setForm({ ...form, track: track.id })}
                              className={`p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? 'bg-surface-3 border-line-strong shadow-xs ring-1 ring-[#B8893A]/50'
                                  : 'bg-surface-2 border-line hover:bg-surface-3 text-fg-2'
                              }`}
                            >
                              <span className="text-[11px] font-mono text-gold-text uppercase tracking-wider block">
                                {track.badge}
                              </span>
                              <span className="font-serif text-base font-medium text-fg block mt-1">
                                {track.title}
                              </span>
                              <span className="text-xs text-fg-3 mt-1 block leading-relaxed line-clamp-2">
                                {track.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Track Selected Deliverables Highlight */}
                    <div className="p-4 rounded-xl bg-gold-foil/5 border border-gold-foil/30">
                      <span className="text-xs font-mono text-gold-text uppercase tracking-wider block mb-2">
                        Key Entitlements for {selectedTrackData.title}:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-fg-2">
                        {selectedTrackData.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-gold-text shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Organization Name & Entity Classification */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Organization / Mission / Institution Name <span className="text-coral-text">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dubai Chamber / Ministry of Commerce / Abu Dhabi Ports"
                          value={form.orgName}
                          onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Entity Classification <span className="text-coral-text">*</span>
                        </label>
                        <select
                          value={form.orgType}
                          onChange={(e) => setForm({ ...form, orgType: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[14px] text-fg focus:outline-none focus:border-gold-foil"
                        >
                          {ENTITY_TYPES.map((type) => (
                            <option key={type} value={type} className="bg-surface-2 text-fg">
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Country & Delegation Scale */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Country of Origin / Mission <span className="text-coral-text">*</span>
                        </label>
                        <select
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[14px] text-fg focus:outline-none focus:border-gold-foil"
                        >
                          <option value="India">India</option>
                          <optgroup label="22 Arab League Partner Nations">
                            {ARAB_NATIONS.map((nation) => (
                              <option key={nation.name} value={nation.name}>
                                {nation.name}
                              </option>
                            ))}
                          </optgroup>
                          <option value="Other International Jurisdiction">Other International Jurisdiction</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Anticipated Delegation Size <span className="text-coral-text">*</span>
                        </label>
                        <select
                          value={form.delegationSize}
                          onChange={(e) => setForm({ ...form, delegationSize: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[14px] text-fg focus:outline-none focus:border-gold-foil"
                        >
                          {DELEGATION_SIZES.map((size) => (
                            <option key={size} value={size} className="bg-surface-2 text-fg">
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Liaison Representative Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Primary Liaison / Delegate Full Name <span className="text-coral-text">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. H.E. Amb. / Director General / VP"
                          value={form.liaisonName}
                          onChange={(e) => setForm({ ...form, liaisonName: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Official Designation / Title <span className="text-coral-text">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Head of International Trade / Minister Advisor"
                          value={form.liaisonTitle}
                          onChange={(e) => setForm({ ...form, liaisonTitle: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Official Institutional Email <span className="text-coral-text">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="liaison@ministry.gov or exec@corporation.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Direct Telephone / WhatsApp (with country code) <span className="text-coral-text">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+971 50 123 4567 or +91 98765 43210"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                        />
                      </div>
                    </div>

                    {/* Objectives & Scope */}
                    <div>
                      <label className="block text-sm font-medium text-fg mb-2">
                        Proposed Scope of Collaboration &amp; Specific Initiatives <span className="text-coral-text">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Please describe your planned commercial delegation, bilateral MoU signing intention, targeted sector focus (e.g. Renewables, Deeptech, Agritech), or desired pavilion space footprint..."
                        value={form.objectives}
                        onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                        className="w-full p-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil resize-y"
                      />
                    </div>

                    {/* MoU and Priority Protocol Checkboxes */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 p-4 rounded-xl surface-raised border border-line cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.mouSigning}
                          onChange={(e) => setForm({ ...form, mouSigning: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-line text-coral accent-coral focus:ring-0"
                        />
                        <div>
                          <span className="text-sm font-medium text-fg block">
                            Request Plenary Stage Slot for Bilateral MoU / Commercial Agreement Signing
                          </span>
                          <span className="text-xs text-fg-3 mt-0.5 block">
                            Allocates official time slot before ministerial dignitaries and press corps at Yashobhoomi.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 rounded-xl surface-raised border border-line cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.urgentProtocol}
                          onChange={(e) => setForm({ ...form, urgentProtocol: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-line text-coral accent-coral focus:ring-0"
                        />
                        <div>
                          <span className="text-sm font-medium text-fg flex items-center gap-2">
                            <span>High-Priority Diplomatic Routing (Ambassadorial / Ministerial Delegation)</span>
                            {form.urgentProtocol && <span className="w-2 h-2 rounded-full bg-coral animate-ping" />}
                          </span>
                          <span className="text-xs text-fg-3 mt-0.5 block">
                            Fast-tracks dossier directly to the Senior Secretariat Officer with a 12-hour response window.
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Collaboration Terms Agreement Box */}
                    <div className="p-4 rounded-xl bg-surface-2 border border-line space-y-2 mt-4 mb-2">
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-gold-text shrink-0 mt-0.5" />
                        <span className="text-xs text-fg-2 leading-relaxed">
                          <strong className="text-fg">Bilateral Directorate Terms: </strong>
                          Partnership inquiries are registered as official letters of intent (LOI). Pavilion spaces and ministerial meetings are allocated pursuant to bilateral quota clearances.
                        </span>
                      </div>
                      <div className="flex items-center gap-5 pt-1 border-t border-line/60">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-fg select-none">
                          <input
                            type="radio"
                            name="collab-terms"
                            checked={termsAgreed === true}
                            onChange={() => {
                              setTermsAgreed(true);
                              setTermsError('');
                            }}
                            className="accent-gold-text w-3.5 h-3.5"
                          />
                          <span>I Agree</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-fg-3 hover:text-fg-2 select-none">
                          <input
                            type="radio"
                            name="collab-terms"
                            checked={termsAgreed === false}
                            onChange={() => {
                              setTermsAgreed(false);
                              setTermsError('You must agree to the Directorate Terms to submit a collaboration docket.');
                            }}
                            className="accent-coral w-3.5 h-3.5"
                          />
                          <span>Disagree</span>
                        </label>
                      </div>
                      {termsError && (
                        <p className="text-[11px] text-coral pt-0.5" role="alert">
                          {termsError}
                        </p>
                      )}
                    </div>

                    {/* Submit CTA */}
                    <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="btn-primary h-12 px-8 text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        {status === 'submitting' ? 'Registering Docket…' : 'Submit Collaboration Docket'}
                      </button>
                      {status === 'failed' && (
                        <p className="text-sm text-negative" role="alert">We could not submit your docket. Check your connection and try again.</p>
                      )}

                      <div className="text-xs text-fg-3 font-mono text-center sm:text-right">
                        <span>Generates verified ID: </span>
                        <span className="text-gold-text font-semibold">[BMF.BC-CBC-00001]</span>
                      </div>
                    </div>
                  </div>
                </form>
                </SignInGate>
              </div>

              {/* Sidebar: Benefits & Directorate Desks */}
              <div className="lg:col-span-4 space-y-6">
                {/* Protocol Commitment Card */}
                <div className="surface-card rounded-2xl p-6 border border-line shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-gold-text">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                      Institutional Guarantees
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-fg mb-2">
                    Collaboration Entitlements
                  </h3>
                  <p className="text-xs text-fg-2 leading-relaxed mb-6">
                    Approved collaborators are formally integrated into the IACCIA diplomatic and commercial programme for Bharat Connect 2026:
                  </p>

                  <ul className="space-y-3.5 text-xs text-fg-2">
                    <li className="flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-gold-text shrink-0 mt-0.5" />
                      <span><strong>Bilateral MoU Plenary Stage:</strong> Priority ceremonial slot with state flag protocol.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Users className="w-4 h-4 text-gold-text shrink-0 mt-0.5" />
                      <span><strong>VIP Deal Suites:</strong> Reserved access to 7,000 sq. ft. Yashobhoomi Executive Lounge.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <TrendingUp className="w-4 h-4 text-gold-text shrink-0 mt-0.5" />
                      <span><strong>Curated Matchmaking:</strong> Direct introductions to sovereign wealth funds and apex trade bodies.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Globe2 className="w-4 h-4 text-gold-text shrink-0 mt-0.5" />
                      <span><strong>Summit Compendium Feature:</strong> Double-page institutional profile distributed to all 22 Arab delegations.</span>
                    </li>
                  </ul>
                </div>

                {/* Direct Secretariat Contacts */}
                <div className="surface-card rounded-2xl p-6 border border-line">
                  <h3 className="font-serif text-lg font-medium text-fg mb-4">Direct Directorate Contacts</h3>
                  <ul className="space-y-4 text-xs sm:text-sm">
                    <li className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gold-text mt-0.5 shrink-0" />
                      <div>
                        <span className="text-fg-3 text-xs block font-mono">Partnerships Directorate</span>
                        <a href="mailto:partnerships@iaccia-conclave.org" className="text-fg font-medium hover:text-gold-text">
                          partnerships@iaccia-conclave.org
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gold-text mt-0.5 shrink-0" />
                      <div>
                        <span className="text-fg-3 text-xs block font-mono">Direct Liaison Desk</span>
                        <span className="text-fg font-mono">+91 11 4987 6000 / +91 92174 00624</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-gold-text mt-0.5 shrink-0" />
                      <div>
                        <span className="text-fg-3 text-xs block font-mono">Secretariat Headquarters</span>
                        <span className="text-fg">Palash Hall, 6th Floor, Yashobhoomi (IICC), New Delhi</span>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-6 pt-5 border-t border-line">
                    <button
                      type="button"
                      onClick={handleDownloadProspectus}
                      className="btn-secondary w-full h-11 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download Partnership Prospectus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

