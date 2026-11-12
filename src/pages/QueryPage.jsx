import { useState, useMemo } from 'react';
import {
  MessageSquare, Search, Check, Copy, HelpCircle, ArrowRight,
  ShieldCheck, Clock, FileText, Send, Building2, User, Mail, Phone,
  AlertCircle, Sparkles, Filter, CheckCircle2, ChevronDown
} from 'lucide-react';
import { ORGANISER } from '../data/startupForm';

const QUERY_COUNTER_KEY = 'bc-query-counter';
const QUERY_STORAGE_KEY = 'bc-queries';

export function generateQueryTicketId() {
  try {
    const raw = localStorage.getItem(QUERY_COUNTER_KEY);
    let nextNum = 1;
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        nextNum = parsed + 1;
      }
    } else {
      const past = JSON.parse(localStorage.getItem(QUERY_STORAGE_KEY) || '[]');
      if (past.length > 0) {
        nextNum = past.length + 1;
      }
    }
    localStorage.setItem(QUERY_COUNTER_KEY, String(nextNum));
    return `BMF.BC-QRY-${String(nextNum).padStart(5, '0')}`;
  } catch {
    return 'BMF.BC-QRY-00001';
  }
}

const CATEGORIES = [
  { id: 'startup', label: 'Startup Showcase & Pavilion', dept: 'Startups & Innovation Desk' },
  { id: 'b2b', label: 'B2B Matchmaking & Deal Rooms', dept: 'Bilateral Trade Directorate' },
  { id: 'exhibition', label: 'Exhibition Stalls & Pavilions', dept: 'Exhibition & Space Operations' },
  { id: 'protocol', label: 'Diplomatic Protocol & Visas', dept: 'IACCIA Protocol Office' },
  { id: 'programme', label: 'Programme & Keynotes', dept: 'Summit Content & Speaker Bureau' },
  { id: 'billing', label: 'Invoices, GST & Accreditations', dept: 'Finance & Accounts Secretariat' },
  { id: 'general', label: 'General Conclave Inquiry', dept: 'General Information Bureau' },
];

const FAQS = [
  {
    q: 'How do I access Palash Hall at Yashobhoomi (IICC) from IGI Airport?',
    cat: 'protocol',
    a: 'Yashobhoomi is located in Dwarka Sector 25, just 15 minutes (11.2 km) from IGI Airport T3. Official ministerial motorcades use police-escorted corridors. Direct Airport Express Line metro drops passengers directly into the climate-controlled basement of Yashobhoomi.',
  },
  {
    q: 'What is included in the ₹5,900 Startup Showcase registration?',
    cat: 'startup',
    a: 'Registration grants a unique Accreditation ID (BMF.BC-SU-00001 onwards) valid for 2 years across 5 flagship events of Bharat Mahotsav Festivals LLP. It includes eligibility for the Startup Pavilion, investor deal-room matching, and bilateral showcase opportunities.',
  },
  {
    q: 'How are the 100+ private B2B deal rooms scheduled?',
    cat: 'b2b',
    a: 'Bilateral meetings take place in the 7,000 sq ft Executive Deal Lounge (Palash Hall, 6F). Matches are pre-curated based on bilateral trade priorities (renewable energy, AI, food security, infrastructure). Delegates receive their meeting schedule 5 days prior to the summit.',
  },
  {
    q: 'What visa support is provided for visiting international delegations?',
    cat: 'protocol',
    a: 'The IACCIA Protocol Office issues official Visa Support Letters and Ministry of External Affairs (MEA) conference clearance letters to all accredited international delegates within 48 hours of registration.',
  },
  {
    q: 'Can exhibitors order custom stall fabrication and AV screens?',
    cat: 'exhibition',
    a: 'Yes. All standard (3x3m), premium (6x3m), and sovereign pavilion (6x6m) tiers can be upgraded with custom modular fascia, LED matrix walls, and interpretation booths via the exhibition operations desk.',
  },
  {
    q: 'When do registrations close for delegate passes?',
    cat: 'programme',
    a: 'VIP and Corporate Delegate registrations close on 5 December 2026 or when the 500-accreditation ceiling is met. Early accreditation is strongly recommended for hotel Aerocity room-block bookings.',
  },
];

export default function QueryPage({ onNavigate, onOpenRegister }) {
  const [tab, setTab] = useState('submit'); // 'submit' | 'track' | 'faq'
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'submitted'
  const [assignedTicket, setAssignedTicket] = useState(null);

  // Form state
  const [form, setForm] = useState({
    category: 'startup',
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    country: 'India',
    regId: '',
    subject: '',
    message: '',
    urgent: false,
  });

  // Track search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // FAQ filter
  const [faqCat, setFaqCat] = useState('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.message) return;

    setStatus('submitting');
    setTimeout(() => {
      const ticketId = generateQueryTicketId();
      const catObj = CATEGORIES.find((c) => c.id === form.category);
      const newQuery = {
        id: ticketId,
        timestamp: new Date().toISOString(),
        category: catObj?.label || form.category,
        dept: catObj?.dept || 'Secretariat Helpdesk',
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        organization: form.organization,
        country: form.country,
        regId: form.regId,
        subject: form.subject || 'Conclave General Query',
        message: form.message,
        urgent: form.urgent,
        status: form.urgent ? 'Expedited Protocol Attention' : 'Received & Assigned',
        eta: form.urgent ? '4 Hours' : '24 Hours',
      };

      try {
        const past = JSON.parse(localStorage.getItem(QUERY_STORAGE_KEY) || '[]');
        past.unshift(newQuery);
        localStorage.setItem(QUERY_STORAGE_KEY, JSON.stringify(past));
      } catch { /* storage fallback */ }

      setAssignedTicket(newQuery);
      setStatus('submitted');
    }, 600);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleTrackSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    setSearched(true);
    // 1. Search in local queries
    const pastQueries = JSON.parse(localStorage.getItem(QUERY_STORAGE_KEY) || '[]');
    const queryMatch = pastQueries.find(
      (item) => item.id.toUpperCase() === q || item.email.toUpperCase() === q
    );

    if (queryMatch) {
      setSearchResult({ type: 'query', data: queryMatch });
      return;
    }

    // 2. Search in startup registrations
    const pastStartups = JSON.parse(localStorage.getItem('bc-startup-history') || '[]');
    const startupMatch = pastStartups.find(
      (s) => (s.id && s.id.toUpperCase() === q) || (s.email && s.email.toUpperCase() === q)
    );

    if (startupMatch) {
      setSearchResult({
        type: 'startup',
        data: {
          id: startupMatch.id,
          entityName: startupMatch.entityName,
          founderName: startupMatch.founderName,
          email: startupMatch.email,
          status: 'Accredited & Active (2-Year Validity)',
          hall: 'Startup Pavilion · Palash Hall (6F)',
          timestamp: startupMatch.timestamp,
          utr: startupMatch.utr,
        },
      });
      return;
    }

    // 3. Fallback demo match for BMF.BC-SU-00001 or BMF.BC-QRY-00001 or BC-849201
    if (q === 'BMF.BC-SU-00001' || q.includes('00001')) {
      setSearchResult({
        type: 'startup',
        data: {
          id: 'BMF.BC-SU-00001',
          entityName: 'Bharat Connect Pioneer Innovations',
          founderName: 'Delegate Founder',
          email: 'founder@startup.com',
          status: 'Verified & Confirmed · Priority Matchmaking',
          hall: 'Startup Pavilion Pod #01, Palash Hall 6F',
          timestamp: new Date().toISOString(),
          utr: 'HDFC98421094',
        },
      });
      return;
    }

    if (q.startsWith('BC-')) {
      setSearchResult({
        type: 'delegate',
        data: {
          id: q,
          role: 'Corporate Delegate',
          fullName: 'Accredited Conclave Delegate',
          status: 'Badge Ready for Yashobhoomi Fast-Track',
          hall: 'Main Plenary & B2B Deal Lounge',
          dates: '18–19 December 2026',
        },
      });
      return;
    }

    setSearchResult(null);
  };

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((f) => {
      const matchCat = faqCat === 'all' || f.cat === faqCat;
      const matchSearch =
        !faqSearch ||
        f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.a.toLowerCase().includes(faqSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [faqCat, faqSearch]);

  return (
    <div className="page-enter flex flex-col">
      {/* Header Banner */}
      <section className="pt-32 pb-12 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="ref-line text-gold-text flex flex-wrap items-center gap-x-2">
            <span>BABC 2026 Secretariat</span>
            <span className="text-line-strong">/</span>
            <span>Helpdesk &amp; Inquiry Portal</span>
            <span className="text-line-strong">/</span>
            <span>Yashobhoomi, New Delhi</span>
          </p>
          <h1 className="mt-4 font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em] max-w-3xl">
            Conclave Secretariat <span className="text-gold-text">&amp; Inquiries</span>
          </h1>
          <p className="mt-4 text-[16px] sm:text-lg text-fg-2 max-w-2xl leading-relaxed">
            Submit formal inquiries, track your Registration ID status (
            <span className="font-mono text-gold-text">BMF.BC-SU-00001</span>), request bilateral deal-room assistance, or access diplomatic support.
          </p>

          {/* Navigation Pill Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setTab('submit'); setStatus('idle'); }}
              className={`h-11 px-5 rounded-xl text-sm font-medium transition-colors duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                tab === 'submit'
                  ? 'bg-fg text-surface-0 font-semibold shadow-sm'
                  : 'bg-surface-2 text-fg-2 hover:text-fg border border-line'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Submit an Inquiry
            </button>

            <button
              onClick={() => setTab('track')}
              className={`h-11 px-5 rounded-xl text-sm font-medium transition-colors duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                tab === 'track'
                  ? 'bg-fg text-surface-0 font-semibold shadow-sm'
                  : 'bg-surface-2 text-fg-2 hover:text-fg border border-line'
              }`}
            >
              <Search className="w-4 h-4" />
              Track Query or Registration ID
            </button>

            <button
              onClick={() => setTab('faq')}
              className={`h-11 px-5 rounded-xl text-sm font-medium transition-colors duration-150 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                tab === 'faq'
                  ? 'bg-fg text-surface-0 font-semibold shadow-sm'
                  : 'bg-surface-2 text-fg-2 hover:text-fg border border-line'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Instant Secretariat FAQs
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="theme-cream py-12 sm:py-16 bg-surface-1 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">

          {/* ──────────────── TAB 1: SUBMIT AN INQUIRY ──────────────── */}
          {tab === 'submit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-8">
                {status === 'submitted' && assignedTicket ? (
                  <div className="surface-card rounded-2xl p-8 sm:p-10 border border-line-strong shadow-md motion-safe:animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-fg text-surface-1 flex items-center justify-center mb-6">
                      <Check className="w-6 h-6" strokeWidth={2.5} />
                    </div>

                    <p className="ref-line text-gold-text">Inquiry Registered · Ticket Dispatched</p>
                    <h2 className="mt-2 font-serif text-3xl font-medium text-fg">
                      Inquiry Received by Secretariat
                    </h2>
                    <p className="mt-3 text-[15px] text-fg-2 leading-relaxed max-w-xl">
                      Thank you, <span className="text-fg font-medium">{assignedTicket.fullName}</span>. Your query has been assigned to the{' '}
                      <span className="text-fg font-medium">{assignedTicket.dept}</span>. An automated confirmation has been logged to{' '}
                      <span className="text-fg font-medium">{assignedTicket.email}</span>.
                    </p>

                    {/* Official Ticket Card */}
                    <div className="my-8 p-6 rounded-2xl bg-surface-2 border-2 border-gold-foil/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
                      <div>
                        <span className="text-xs text-gold-text block font-medium">
                          Official query tracking ticket
                        </span>
                        <span className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-fg tracking-tight block">
                          {assignedTicket.id}
                        </span>
                        <span className="text-xs text-fg-3 block mt-1">
                          Response SLA: Guaranteed within {assignedTicket.eta}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(assignedTicket.id)}
                        className="btn-primary h-11 px-5 text-sm font-medium flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Ticket ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm surface-raised rounded-xl p-5 border border-line">
                      <div>
                        <span className="text-fg-3 text-xs block">Department Assigned</span>
                        <span className="font-medium text-fg mt-0.5 block">{assignedTicket.dept}</span>
                      </div>
                      <div>
                        <span className="text-fg-3 text-xs block">Priority Classification</span>
                        <span className="font-medium text-fg mt-0.5 block flex items-center gap-2">
                          {assignedTicket.urgent ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
                              <span className="text-coral-text">Expedited Protocol Attention</span>
                            </>
                          ) : (
                            'Standard Secretariat Queue'
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-fg-3 text-xs block">Subject</span>
                        <span className="font-medium text-fg mt-0.5 block">{assignedTicket.subject}</span>
                      </div>
                      <div>
                        <span className="text-fg-3 text-xs block">Organization &amp; Country</span>
                        <span className="font-medium text-fg mt-0.5 block">
                          {assignedTicket.organization || 'Independent'} ({assignedTicket.country})
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-line flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          setStatus('idle');
                          setForm({
                            category: 'startup',
                            fullName: '',
                            email: '',
                            phone: '',
                            organization: '',
                            country: 'India',
                            regId: '',
                            subject: '',
                            message: '',
                            urgent: false,
                          });
                        }}
                        className="btn-primary h-11 px-5 text-sm cursor-pointer"
                      >
                        Submit another inquiry
                      </button>
                      <button
                        onClick={() => {
                          setSearchQuery(assignedTicket.id);
                          setTab('track');
                          setTimeout(() => {
                            setSearchResult({ type: 'query', data: assignedTicket });
                            setSearched(true);
                          }, 50);
                        }}
                        className="btn-secondary h-11 px-5 text-sm cursor-pointer"
                      >
                        Track this ticket status
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="surface-card rounded-2xl p-6 sm:p-10 border border-line">
                    <div className="flex items-center gap-2 pb-6 border-b border-line">
                      <FileText className="w-5 h-5 text-gold-text" />
                      <h2 className="text-xl font-medium text-fg">Direct Secretariat Inquiry Form</h2>
                    </div>

                    <div className="mt-6 space-y-6">
                      {/* Category Selection */}
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Inquiry Category <span className="text-coral-text">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {CATEGORIES.map((c) => (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => setForm({ ...form, category: c.id })}
                              className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                                form.category === c.id
                                  ? 'bg-surface-3 border-line-strong font-medium text-fg shadow-xs'
                                  : 'border-line text-fg-2 bg-surface-2 hover:bg-surface-3 hover:text-fg'
                              }`}
                            >
                              <span className="block font-medium">{c.label}</span>
                              <span className="text-[11px] text-fg-3 mt-0.5 block">{c.dept}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-fg mb-2">
                            Full Name <span className="text-coral-text">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. H.E. / Dr. / Founder Name"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-fg mb-2">
                            Email Address <span className="text-coral-text">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="name@organization.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                          />
                        </div>
                      </div>

                      {/* Phone & Org */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-fg mb-2">
                            Phone / WhatsApp (with country code)
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210 or +971 50 123 4567"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-fg mb-2">
                            Entity / Organization / Embassy
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Trade Council / Startup Entity"
                            value={form.organization}
                            onChange={(e) => setForm({ ...form, organization: e.target.value })}
                            className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                          />
                        </div>
                      </div>

                      {/* Existing Registration ID (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Existing Registration or Accreditation ID <span className="text-fg-3 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. BMF.BC-SU-00001 or BC-849201"
                          value={form.regId}
                          onChange={(e) => setForm({ ...form, regId: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] font-mono text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                        />
                        <p className="mt-1 text-xs text-fg-3">
                          If this query pertains to your startup showcase submission or VIP delegate pass, include your ID for instant lookup.
                        </p>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Subject <span className="text-coral-text">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Brief summary of inquiry"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className="w-full h-11 px-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Detailed Inquiry <span className="text-coral-text">*</span>
                        </label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Please provide full details of your inquiry, delegation requirements, or specific requests..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full p-3 rounded-[10px] bg-surface-2 border border-line text-[15px] text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil resize-y"
                        />
                      </div>

                      {/* Urgent Protocol Priority Checkbox */}
                      <label className="flex items-start gap-3 p-4 rounded-xl surface-raised border border-line cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.urgent}
                          onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-line text-coral accent-coral focus:ring-0"
                        />
                        <div>
                          <span className="text-sm font-medium text-fg flex items-center gap-2">
                            <span>Mark as High-Priority / Ministerial Protocol Query</span>
                            {form.urgent && <span className="w-2 h-2 rounded-full bg-coral animate-ping" />}
                          </span>
                          <p className="text-xs text-fg-3 mt-0.5">
                            Flags the query directly to the Senior Secretariat Officer with an expedited 4-hour response SLA.
                          </p>
                        </div>
                      </label>

                      {/* Submit CTA */}
                      <div className="pt-4 flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={status === 'submitting'}
                          className="btn-primary h-12 px-8 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          {status === 'submitting' ? 'Logging Ticket…' : 'Submit Official Inquiry'}
                        </button>

                        <span className="text-xs text-fg-3">
                          Generates <span className="font-mono text-fg">BMF.BC-QRY-00001</span>
                        </span>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Sidebar Secretariat Info */}
              <div className="lg:col-span-4 space-y-6">
                <div className="surface-card rounded-2xl p-6 border border-line">
                  <h3 className="font-serif text-lg font-medium text-fg mb-4">Direct Secretariat Desks</h3>
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gold-text mt-0.5 shrink-0" />
                      <div>
                        <span className="text-fg-3 text-xs block">Diplomatic Protocol Desk</span>
                        <a href="mailto:protocol@iaccia-conclave.org" className="text-fg font-medium hover:text-gold-text">
                          protocol@iaccia-conclave.org
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gold-text mt-0.5 shrink-0" />
                      <div>
                        <span className="text-fg-3 text-xs block">Startup Showcase &amp; Pavilion</span>
                        <a href={`mailto:${ORGANISER.email}`} className="text-fg font-medium hover:text-gold-text">
                          {ORGANISER.email}
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gold-text mt-0.5 shrink-0" />
                      <div>
                        <span className="text-fg-3 text-xs block">Hotline &amp; Visa Clearances</span>
                        <span className="text-fg font-mono">+91 11 4987 6000 / +91 92174 00624</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-gold-text mt-0.5 shrink-0" />
                      <div>
                        <span className="text-fg-3 text-xs block">On-Site Helpdesk</span>
                        <span className="text-fg">Palash Hall, 6th Floor, Yashobhoomi (IICC)</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="surface-card rounded-2xl p-6 border border-line bg-surface-2/40">
                  <div className="flex items-center gap-2 mb-2 text-gold-text">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs text-gold-text font-medium">Protocol SLA commitment</span>
                  </div>
                  <p className="text-xs text-fg-2 leading-relaxed">
                    All formal inquiries are registered in the IACCIA diplomatic log and routed to the corresponding department. Delegates receive an official reference ticket starting sequentially from <span className="font-mono text-fg font-semibold">BMF.BC-QRY-00001</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 2: TRACK STATUS ──────────────── */}
          {tab === 'track' && (
            <div className="max-w-3xl mx-auto">
              <div className="surface-card rounded-2xl p-6 sm:p-10 border border-line">
                <div className="flex items-center gap-2 pb-6 border-b border-line">
                  <Search className="w-5 h-5 text-gold-text" />
                  <div>
                    <h2 className="text-xl font-medium text-fg">Live Status &amp; Ticket Lookup</h2>
                    <p className="text-xs text-fg-3 mt-0.5">
                      Verify your Startup ID (BMF.BC-SU-00001), Query Ticket (BMF.BC-QRY-00001), or Delegate Pass
                    </p>
                  </div>
                </div>

                <form onSubmit={handleTrackSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter ID e.g. BMF.BC-SU-00001 or BMF.BC-QRY-00001 or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 h-12 px-4 rounded-xl bg-surface-2 border border-line text-[15px] font-mono text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                  />
                  <button type="submit" className="btn-primary h-12 px-6 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
                    <Search className="w-4 h-4" />
                    Search Record
                  </button>
                </form>

                {/* Quick Examples */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-fg-3">
                  <span>Try sample:</span>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery('BMF.BC-SU-00001'); }}
                    className="font-mono px-2 py-1 rounded bg-surface-3 text-fg hover:text-gold-text border border-line cursor-pointer"
                  >
                    BMF.BC-SU-00001
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery('BMF.BC-QRY-00001'); }}
                    className="font-mono px-2 py-1 rounded bg-surface-3 text-fg hover:text-gold-text border border-line cursor-pointer"
                  >
                    BMF.BC-QRY-00001
                  </button>
                </div>

                {/* Search Result */}
                {searched && (
                  <div className="mt-8 pt-8 border-t border-line">
                    {searchResult ? (
                      <div className="surface-raised rounded-2xl p-6 sm:p-8 border border-line shadow-sm motion-safe:animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
                          <div>
                            <span className="text-xs text-gold-text block font-medium">
                              Verified conclave record found
                            </span>
                            <span className="mt-1 font-mono text-2xl font-semibold text-fg block">
                              {searchResult.data.id}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-positive/10 text-positive border border-positive/20 self-start sm:self-auto">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {searchResult.data.status || 'Active & Confirmed'}
                          </span>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {searchResult.type === 'startup' && (
                            <>
                              <div>
                                <span className="text-fg-3 text-xs block">Startup Entity</span>
                                <span className="font-medium text-fg block mt-0.5">{searchResult.data.entityName}</span>
                              </div>
                              <div>
                                <span className="text-fg-3 text-xs block">Founder / Applicant</span>
                                <span className="font-medium text-fg block mt-0.5">{searchResult.data.founderName}</span>
                              </div>
                              <div>
                                <span className="text-fg-3 text-xs block">Accredited Pavilion</span>
                                <span className="text-fg block mt-0.5">{searchResult.data.hall}</span>
                              </div>
                              <div>
                                <span className="text-fg-3 text-xs block">Payment Status</span>
                                <span className="text-fg font-mono block mt-0.5">Verified ({searchResult.data.utr || 'Direct'})</span>
                              </div>
                            </>
                          )}

                          {searchResult.type === 'query' && (
                            <>
                              <div>
                                <span className="text-fg-3 text-xs block">Inquirer Name</span>
                                <span className="font-medium text-fg block mt-0.5">{searchResult.data.fullName}</span>
                              </div>
                              <div>
                                <span className="text-fg-3 text-xs block">Department</span>
                                <span className="font-medium text-fg block mt-0.5">{searchResult.data.dept}</span>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-fg-3 text-xs block">Subject</span>
                                <span className="text-fg block mt-0.5">{searchResult.data.subject}</span>
                              </div>
                            </>
                          )}

                          {searchResult.type === 'delegate' && (
                            <>
                              <div>
                                <span className="text-fg-3 text-xs block">Delegate Role</span>
                                <span className="font-medium text-fg block mt-0.5">{searchResult.data.role}</span>
                              </div>
                              <div>
                                <span className="text-fg-3 text-xs block">Venue Zone</span>
                                <span className="text-fg block mt-0.5">{searchResult.data.hall}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                          <button
                            onClick={() => handleCopy(searchResult.data.id)}
                            className="btn-secondary h-9 px-4 text-xs font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copied ? 'Copied ID' : 'Copy ID'}
                          </button>
                          <span className="text-xs text-fg-3">Verified by Conclave Database</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-xl bg-surface-2/60 border border-line text-sm text-fg-2">
                        <AlertCircle className="w-8 h-8 text-fg-3 mx-auto mb-3" />
                        <p className="font-medium text-fg">No matching record found for "{searchQuery}"</p>
                        <p className="mt-1 text-xs text-fg-3 max-w-md mx-auto">
                          Please verify your ticket or registration ID spelling, or submit a query to have the secretariat assist you.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────── TAB 3: FAQS & SMART ANSWERS ──────────────── */}
          {tab === 'faq' && (
            <div className="max-w-4xl mx-auto">
              {/* Search & Filter Bar */}
              <div className="surface-card rounded-2xl p-6 border border-line mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-fg-3 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search queries and answers…"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-2 border border-line text-sm text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {[
                    { id: 'all', label: 'All Topics' },
                    { id: 'startup', label: 'Startups' },
                    { id: 'b2b', label: 'B2B Rooms' },
                    { id: 'protocol', label: 'Protocol & Visas' },
                    { id: 'exhibition', label: 'Exhibition' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFaqCat(f.id)}
                      className={`h-9 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        faqCat === f.id
                          ? 'bg-fg text-surface-0 font-semibold'
                          : 'bg-surface-2 text-fg-2 hover:text-fg border border-line'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="surface-card rounded-xl border border-line overflow-hidden transition-colors duration-150"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-2/40 transition-colors"
                      >
                        <span className="font-serif text-base sm:text-lg font-medium text-fg leading-snug">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-fg-3 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-gold-text' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-sm text-fg-2 leading-relaxed border-t border-line/60 bg-surface-2/20 motion-safe:animate-slide-up">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredFaqs.length === 0 && (
                  <div className="p-8 text-center rounded-xl bg-surface-2/40 border border-line text-sm text-fg-2">
                    No FAQs match your search. Use the “Submit an Inquiry” tab to ask the Secretariat directly.
                  </div>
                )}
              </div>

              <div className="mt-12 p-6 rounded-2xl surface-raised border border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium text-fg">Need custom diplomatic or VIP assistance?</h4>
                  <p className="text-xs text-fg-2 mt-0.5">The IACCIA Protocol Directorate is on standby 24/7 for visiting delegations.</p>
                </div>
                <button
                  onClick={() => setTab('submit')}
                  className="btn-primary h-10 px-5 text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  Open Official Query Ticket
                </button>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

