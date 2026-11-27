import { useEffect, useMemo, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowRight,
  Rocket, 
  Search, 
  Lock, 
  LogIn, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Building2,
  User,
  Bell,
  Calendar,
  Send,
  CalendarPlus,
  MapPin,
  Users,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
  Download,
  AlertCircle,
  FileText,
  Briefcase,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { watchMyStartups, watchMyEventApplications, submitEventApplication } from '../data/registry';
import { useAuth } from '../auth/AuthContext';
import SignInGate from '../auth/SignInGate';
import { EVENTS, eventStatus, calendarFile, googleCalendarUrl } from '../data/events';

/*
  Founder Dashboard & Confidential Portal.
  Features:
  1. Profile (General Founder details & Startup details)
  2. Announcements (Card & big tab design)
  3. Upcoming Events (Card & big tab design with calendar reminders)
  4. Apply For Events (Tabular view + clickable "Apply Now" + form pop-up modal)
*/

const href = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

const STATUS_VIEW = {
  pending: { label: 'Under review', Icon: Clock, cls: 'text-[#9A6B00] bg-[#FAB219]/15 border-[#FAB219]/40' },
  approved: { label: 'Approved', Icon: CheckCircle2, cls: 'text-[#0A7A0A] bg-[#0CA30C]/10 border-[#0CA30C]/35' },
  declined: { label: 'Declined', Icon: XCircle, cls: 'text-[#B02E2E] bg-[#D03B3B]/10 border-[#D03B3B]/35' },
};

/* ── Announcements Data ────────────────────────────── */

const ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    category: 'Pavilion & Stalls',
    priority: 'High Priority',
    date: '25 Nov 2026',
    title: 'Startup Pavilion: Booth Allocation & Shell Scheme Stall Manual Released',
    summary: 'The formal stall layout and shell scheme specifications for Hall 4 Startup Arena are now finalized. Each accredited startup receives a 3x3m prefabricated booth with official fascia name board, spot lighting, power supply, and standard presentation counter.',
    details: 'Stall handover and technical setup begin at 14:00 IST on 17 Dec 2026. Founder badges must be collected from the Hall 1 Protocol Reception Desk upon producing your BMF.BC-SEO Accreditation ID.',
    actionText: 'Download Stall Manual (PDF)',
    actionLink: '#',
    badgeCls: 'bg-coral/10 text-coral border-coral/30',
  },
  {
    id: 'ann-2',
    category: 'Investors & VCs',
    priority: 'Featured Opportunity',
    date: '22 Nov 2026',
    title: 'Bilateral Deal-Room: 35 Sovereign & VC Funds Confirmed for 1-on-1 Pitch Sessions',
    summary: 'Over 35 sovereign wealth investment arms, regional family offices, and leading Tier-1 VCs from the UAE, Saudi Arabia, Qatar, Oman, and India have confirmed participation in curated 20-minute speed-dating rounds.',
    details: 'Startups with working prototypes or commercial traction will be prioritized for bilateral meeting rooms. Ensure your pitch deck and valuation framework are up to date.',
    actionText: 'Apply for Deal-Room Matchmaking',
    actionTab: 'apply',
    badgeCls: 'bg-gold-foil/15 text-gold-text border-gold-foil/40',
  },
  {
    id: 'ann-3',
    category: 'Pitch Competitions',
    priority: 'Curatorial Selection',
    date: '18 Nov 2026',
    title: 'Grand Auditorium Pitch Finale: 15 Frontier Startups to Pitch Before Union & GCC Ministers',
    summary: 'The Conclave Curatorial Jury will select 15 finalists from the Startup Pavilion to deliver a 7-minute live pitch on the Grand Auditorium main stage on 19 Dec 2026.',
    details: 'Focus verticals include AgriTech & Food Security, CleanTech & Energy Transition, FinTech & Digital Corridors, and Generative AI / DeepTech.',
    actionText: 'Apply for Main Stage Pitch',
    actionTab: 'apply',
    badgeCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'ann-4',
    category: 'Protocol & VIP',
    priority: 'General Notice',
    date: '12 Nov 2026',
    title: 'Complimentary VIP All-Access Delegate Passes for Co-founders & Core Team',
    summary: 'In addition to the primary founder pass, each registered venture receives two complimentary All-Access E-Badges for co-founders or core technical leads.',
    details: 'Includes full access to the ministerial plenary keynotes, Yashobhoomi VIP networking lounge, and bilateral networking lunches across both days.',
    actionText: 'Apply for Team Passes',
    actionTab: 'apply',
    badgeCls: 'bg-surface-3 text-fg-2 border-line',
  },
];

/* ── Upcoming Events Data ──────────────────────────── */

const UPCOMING_EVENTS = [
  {
    id: 'evt-1',
    title: 'Bharat Connect 2026: Sovereign Conclave & Inaugural Plenary',
    track: 'Ministerial & Bilateral Summit',
    dates: '18–19 Dec 2026 · 08:30 – 18:30 IST',
    startIso: '2026-12-18T08:30:00+05:30',
    endIso: '2026-12-19T18:30:00+05:30',
    venue: 'Palash Hall (Level 6) & Grand Auditorium, Yashobhoomi, New Delhi',
    speakers: 'Union Ministers (India), Ministers of Trade (GCC States), IACCIA Leadership',
    summary: 'The grand inaugural ceremony uniting 22 Arab delegations, keynote addresses on CEPA bilateral corridors, sovereign deal rooms, and bilateral signing ceremonies.',
    capacity: '500 Accredited Passes',
    badge: 'Main Summit',
  },
  {
    id: 'evt-2',
    title: 'Startup Pavilion: Investor Speed-Dating & Live Demo Showcase',
    track: 'Pitch & Investment Matchmaking',
    dates: '18 Dec 2026 · 14:00 – 18:00 IST',
    startIso: '2026-12-18T14:00:00+05:30',
    endIso: '2026-12-18T18:00:00+05:30',
    venue: 'Hall 4 Startup Arena & Bilateral Deal Suites',
    speakers: '50+ Sovereign Wealth Funds, Tier-1 VCs & Angel Syndicates',
    summary: 'Curated 20-minute private deal-room pitch slots where accredited founders pitch directly to GCC & Indian investors.',
    capacity: '35 Pitch Slots',
    badge: 'High Impact',
  },
  {
    id: 'evt-3',
    title: 'Bilateral Founder-Investor Gala & Leadership Awards Dinner',
    track: 'High-Level Networking & Cultural Gala',
    dates: '18 Dec 2026 · 19:30 – 22:30 IST',
    startIso: '2026-12-18T19:30:00+05:30',
    endIso: '2026-12-18T22:30:00+05:30',
    venue: 'Open-Air Amphitheatre & Royal Banqueting Suite, Yashobhoomi',
    speakers: 'Arab Ambassadors, C-Suite Leaders, Prominent Founders',
    summary: 'An exclusive black-tie evening of Indo-Arab dining, symphonic orchestral fusion, and high-trust deal-making with chamber delegates.',
    capacity: '75 Founder Passes',
    badge: 'VIP Dinner',
  },
  {
    id: 'evt-4',
    title: 'GCC-India Cross-Corridor Market Expansion Masterclass',
    track: 'Regulatory & Dual-Licensing Workshop',
    dates: '19 Dec 2026 · 10:00 – 12:30 IST',
    startIso: '2026-12-19T10:00:00+05:30',
    endIso: '2026-12-19T12:30:00+05:30',
    venue: 'Bilateral Deal Suite B (Level 2), Yashobhoomi',
    speakers: 'DIFC, ADGM, Saudi Investment Ministry (MISA) & Invest India Officials',
    summary: 'Practical playbook for Indian startups expanding into the Gulf: corporate structuring, tax treaties, regulatory sandboxes, and government procurement.',
    capacity: '40 Founder Seats',
    badge: 'Masterclass',
  },
  {
    id: 'evt-5',
    title: 'Atal Innovation Multilateral Forum (AIMF) Creative Tech Plenary',
    track: 'Media, AI & Creative Economy',
    dates: '19 Dec 2026 · 14:00 – 17:00 IST',
    startIso: '2026-12-19T14:00:00+05:30',
    endIso: '2026-12-19T17:00:00+05:30',
    venue: 'Cultural Pavilion (Hall 4) & Grand Auditorium',
    speakers: 'Studio Heads & Media Authorities from Riyadh, Dubai, Mumbai, and Doha',
    summary: 'Cross-border opportunities in media co-production, gaming studios, AI VFX, and digital IP monetization between India and Arab corridors.',
    capacity: 'Open to Accredited Startups',
    badge: 'Creative Tech',
  },
];

/* ── Apply For Events Tabular Data ─────────────────── */

const APPLY_EVENTS_TABLE = [
  {
    id: 'app-evt-1',
    eventName: 'Startup Pavilion: Investor 1-on-1 Speed-Dating',
    track: 'Investor Deal-Room',
    date: '18 Dec 2026 · 14:00 IST',
    venue: 'Hall 4 Bilateral Deal Suites',
    eligibility: 'Accredited Startups · Seed to Series A',
    quota: '35 Slots (18 Remaining)',
    status: 'Accepting Applications',
    statusCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'app-evt-2',
    eventName: 'Main Stage Pitch Finale (Live Before Ministers)',
    track: 'Main Stage Pitching',
    date: '19 Dec 2026 · 15:00 IST',
    venue: 'Yashobhoomi Grand Auditorium',
    eligibility: 'Prototype+ or DPIIT Recognized',
    quota: '15 Curated Slots',
    status: 'Curatorial Selection',
    statusCls: 'bg-gold-foil/15 text-gold-text border-gold-foil/40',
  },
  {
    id: 'app-evt-3',
    eventName: 'Bilateral Founders & Investors Gala Dinner',
    track: 'VIP Networking Dinner',
    date: '18 Dec 2026 · 19:30 IST',
    venue: 'VIP Amphitheatre & Banquets',
    eligibility: 'Founder & Co-founder Passes',
    quota: '75 Passes (Limited Slots)',
    status: 'Limited Slots',
    statusCls: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
  {
    id: 'app-evt-4',
    eventName: 'GCC Market Access & Dual-Licensing Workshop',
    track: 'Corporate Structuring Masterclass',
    date: '19 Dec 2026 · 10:00 IST',
    venue: 'Bilateral Suite B (Level 2)',
    eligibility: 'All Registered Startups',
    quota: '40 Seats (Fast-Track)',
    status: 'Accepting Applications',
    statusCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'app-evt-5',
    eventName: 'AIMF Creative Tech & IP Co-Production Showcase',
    track: 'Creative Tech & Media',
    date: '19 Dec 2026 · 14:00 IST',
    venue: 'Hall 4 Cultural Pavilion Arena',
    eligibility: 'Media, AI, Gaming & IP Startups',
    quota: '25 Showcase Pods',
    status: 'Accepting Applications',
    statusCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'app-evt-6',
    eventName: 'Startup Pavilion Exhibition Stall Prime Pod Upgrade',
    track: 'Exhibition Stall Pod',
    date: '18–19 Dec 2026 · Full Conclave',
    venue: 'Palash Hall Main Concourse',
    eligibility: 'Confirmed Startup Exhibitors',
    quota: '10 Corner Pods',
    status: 'Fast-Track Desk',
    statusCls: 'bg-coral/10 text-coral border-coral/30',
  },
];

/* ── Calendar Helper ───────────────────────────────── */

function downloadIcs(e) {
  const item = {
    id: e.id,
    name: e.title,
    subtitle: e.track,
    start: e.startIso,
    end: e.endIso,
    venue: e.venue,
    summary: e.summary,
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([calendarFile(item)], { type: 'text/calendar;charset=utf-8' }));
  a.download = `${e.id}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function openGoogleCal(e) {
  const item = {
    id: e.id,
    name: e.title,
    subtitle: e.track,
    start: e.startIso,
    end: e.endIso,
    venue: e.venue,
    summary: e.summary,
  };
  window.open(googleCalendarUrl(item), '_blank', 'noopener,noreferrer');
}

export default function StartupsPage({ onNavigate }) {
  const { user, openAuth } = useAuth();
  const [startups, setStartups] = useState([]);
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');
  const [copiedId, setCopiedId] = useState('');

  // Horizontal Dashboard Navigation Tabs
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'announcements' | 'events' | 'apply'
  const [announcementFilter, setAnnouncementFilter] = useState('All');

  // Event Applications State
  const [appliedEvents, setAppliedEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bc_applied_events') || '{}');
    } catch {
      return {};
    }
  });

  // Modal State for "Apply for Events"
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalForm, setModalForm] = useState({
    startupId: '',
    startupName: '',
    applicantName: '',
    email: '',
    track: '1-on-1 Investor Deal Room (Speed dating)',
    fundingStage: 'Seed ($250k–$1M)',
    pitchDeck: '',
    objective: '',
    notes: '',
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalSuccessId, setModalSuccessId] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (!user) {
      setStartups([]);
      return;
    }

    const unsubStartups = watchMyStartups(user, (rawList) => {
      const formatted = rawList.map((r) => {
        const p = r.profile || {};
        const sectorsList = Array.isArray(p.sectors) && p.sectors.length > 0 
          ? p.sectors 
          : typeof r.sector === 'string' 
          ? r.sector.split(', ').filter(Boolean) 
          : [];

        return {
          id: r.id || r.ref,
          name: p.brand || r.organisation || r.name || 'Untitled Startup',
          stage: p.stage || r.stage || '',
          pitch: p.pitch || r.pitch || '',
          sectors: sectorsList,
          website: p.website || r.website || '',
          status: r.status || 'pending',
          submittedAt: r.submittedAt,
          email: r.email || r.accountEmail,
          phone: r.phone || '',
        };
      });
      setStartups(formatted);
    });

    const unsubApps = watchMyEventApplications(user, (list) => {
      const map = { ...appliedEvents };
      list.forEach((app) => {
        if (app.eventId) map[app.eventId] = app.id || app.ref || 'Applied';
      });
      setAppliedEvents(map);
    });

    return () => {
      unsubStartups();
      unsubApps();
    };
  }, [user]);

  const sectors = useMemo(
    () => ['All', ...new Set(startups.flatMap((s) => s.sectors || []))],
    [startups],
  );

  const shownStartups = startups.filter((s) => {
    const q = query.trim().toLowerCase();
    const inSector = sector === 'All' || (s.sectors || []).includes(sector);
    const matches = !q || [s.name, s.pitch, ...(s.sectors || [])].join(' ').toLowerCase().includes(q);
    return inSector && matches;
  });

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(''), 1800);
    } catch { /* blocked */ }
  };

  // Open the Apply Modal for a specific event
  const openApplyModal = (evt) => {
    if (!user) {
      openAuth({ mode: 'signin', reason: 'Sign in to submit your event participation application.' });
      return;
    }
    const defaultStartup = startups[0] || {};
    setSelectedEvent(evt);
    setModalForm({
      startupId: defaultStartup.id || '',
      startupName: defaultStartup.name || '',
      applicantName: user.displayName || defaultStartup.name || '',
      email: user.email || '',
      track: evt.track || 'Investor Deal-Room',
      fundingStage: 'Seed ($250k–$1M)',
      pitchDeck: defaultStartup.website || '',
      objective: '',
      notes: '',
    });
    setModalSuccessId('');
    setModalError('');
  };

  // Handle Form Submission inside Modal
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.startupName.trim()) {
      setModalError('Please specify your registered startup name.');
      return;
    }

    setModalSubmitting(true);
    setModalError('');

    try {
      const ref = await submitEventApplication({
        eventId: selectedEvent.id,
        eventName: selectedEvent.eventName,
        name: modalForm.applicantName || user.email,
        email: user.email,
        organisation: modalForm.startupName,
        track: modalForm.track,
        stage: modalForm.fundingStage,
        pitchDeck: modalForm.pitchDeck,
        objective: modalForm.objective,
        notes: modalForm.notes,
        status: 'pending',
      });

      // Update local storage and state
      const updated = { ...appliedEvents, [selectedEvent.id]: ref || 'Applied' };
      setAppliedEvents(updated);
      try {
        localStorage.setItem('bc_applied_events', JSON.stringify(updated));
      } catch { /* ignored */ }

      setModalSuccessId(ref || 'BMF.BC-EVA-00001');
    } catch (err) {
      console.error(err);
      setModalError('Could not submit application. Please check your network and try again.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Filtered announcements
  const filteredAnnouncements = ANNOUNCEMENTS.filter((ann) => {
    if (announcementFilter === 'All') return true;
    return ann.category.toLowerCase().includes(announcementFilter.toLowerCase());
  });

  const primaryStartup = startups[0] || null;

  return (
    <SignInGate
      title="Sign in to access Founder Portal"
      reason="The Founder Hub & Deal Room is reserved for registered startups. Sign in with your registered account to manage your venture, summit events, and passes."
      portalType="startup"
      onNavigate={onNavigate}
    >
      <div className="page-enter flex flex-col min-h-screen">
        {/* ── Top Header Banner (Obsidian Royal) ──────────── */}
        <section className="pt-32 pb-10 bg-royal border-b border-line text-fg">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <p className="ref-line mb-3 text-gold-text">Bharat Connect 2026 · Founder Portal</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em]">
                  Founder Hub &amp; Directory
                </h1>
                <p className="mt-2 text-sm sm:text-base text-fg-2 max-w-xl leading-relaxed">
                  {user ? (
                    <>
                      Active founder dashboard for <strong className="text-fg">{user.email}</strong>.
                    </>
                  ) : (
                    'Private showcase, official announcements & event accreditation for Bharat Connect 2026.'
                  )}
                </p>
              </div>

              {user && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-surface-2 border border-line">
                    <span className="block font-serif text-2xl text-gold-text tabular-nums">{startups.length}</span>
                    <span className="text-xs text-fg-3">Registered {startups.length === 1 ? 'Startup' : 'Startups'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('startup')}
                    className="btn-primary h-11 px-5 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    <span>Register Startup</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* If signed in but has no registered startups, display registration gate */}
        {startups.length === 0 ? (
          <section className="theme-cream py-16 sm:py-24 bg-surface-0 flex-1 flex items-center justify-center">
            <div className="max-w-xl mx-auto px-4 sm:px-6 w-full text-center animate-fade-in">
              <div className="surface-card rounded-3xl p-8 sm:p-12 border border-line shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center text-gold-text mb-6">
                  <Rocket className="w-8 h-8" strokeWidth={1.75} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-gold-foil/15 text-gold-text border border-gold-foil/30 mb-4">
                  Registration Required
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
                  Startup Registration Required
                </h2>
                <p className="mt-3 text-sm text-fg-2 leading-relaxed">
                  The Founder Hub, Deal Room &amp; Summit Passes are strictly reserved for registered ventures. No startup registration was found under <strong className="text-fg">{user?.email}</strong>.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('startup')}
                    className="btn-primary h-12 px-7 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] mx-auto"
                  >
                    <span>Register Your Startup Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* ── HORIZONTAL NAVIGATION BAR (Sticky Tabs) ─────── */}
      <div className="sticky top-[76px] sm:top-[88px] z-20 bg-surface-1/95 backdrop-blur-md border-b border-line shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-surface-3 text-gold-text font-semibold border border-gold-foil/40 shadow-sm'
                  : 'text-fg-3 hover:text-fg hover:bg-surface-2'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-surface-3 text-gold-text font-semibold border border-gold-foil/40 shadow-sm'
                  : 'text-fg-3 hover:text-fg hover:bg-surface-2'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Announcements</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === 'announcements' ? 'bg-gold-foil/20 text-gold-text' : 'bg-surface-3 text-fg-3'}`}>
                {ANNOUNCEMENTS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-surface-3 text-gold-text font-semibold border border-gold-foil/40 shadow-sm'
                  : 'text-fg-3 hover:text-fg hover:bg-surface-2'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Upcoming Events</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === 'events' ? 'bg-gold-foil/20 text-gold-text' : 'bg-surface-3 text-fg-3'}`}>
                {UPCOMING_EVENTS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('apply')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'apply'
                  ? 'bg-surface-3 text-gold-text font-semibold border border-gold-foil/40 shadow-sm'
                  : 'text-fg-3 hover:text-fg hover:bg-surface-2'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Apply For Events</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-coral/20 text-coral">
                Open
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN DASHBOARD CONTENT AREA ─────────────────── */}
      <section className="theme-cream py-10 sm:py-14 bg-surface-0 flex-1 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">

          {/* ══════════════════════════════════════════════
              TAB 1: PROFILE (General Details + Startup Details)
             ══════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-fade-in">
              {!user ? (
                /* Unauthenticated Protected State */
                <div className="surface-card rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-line shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center mx-auto text-gold-text mb-4">
                    <Lock className="w-7 h-7" strokeWidth={1.75} />
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
                    Sign in to view your profile
                  </h2>
                  <p className="mt-3 text-sm text-fg-2 leading-relaxed">
                    For confidentiality and security, founder profiles and startup accreditations are restricted to the registered account holder.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAuth({ mode: 'signin', reason: 'Sign in to access your founder profile.' })}
                    className="mt-6 btn-primary h-11 px-7 text-sm font-semibold flex items-center gap-2 mx-auto cursor-pointer shadow-md active:scale-[0.98]"
                  >
                    <LogIn className="w-4 h-4" strokeWidth={2} />
                    <span>Sign in with Email</span>
                  </button>
                  <div className="mt-8 pt-5 border-t border-line/60 text-xs text-fg-3">
                    Haven't registered your startup yet?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('startup')}
                      className="text-coral hover:underline font-medium cursor-pointer"
                    >
                      Register your venture
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* General Details Box */}
                  <div className="surface-card rounded-2xl p-6 sm:p-8 border border-line shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line/70">
                      <div className="flex items-center gap-4">
                        <span className="w-14 h-14 rounded-2xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center font-serif text-2xl text-gold-text shrink-0">
                          {(user.displayName || user.email || 'F').charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-serif text-2xl font-medium text-fg">
                              {user.displayName || primaryStartup?.name || 'Accredited Founder'}
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified Founder</span>
                            </span>
                          </div>
                          <p className="text-sm text-fg-3 mt-0.5 font-mono">{user.email}</p>
                        </div>
                      </div>

                      <div className="text-xs text-fg-3 font-mono bg-surface-2 px-3 py-2 rounded-xl border border-line self-start sm:self-auto">
                        <span className="block text-[11px] text-fg-3 uppercase tracking-wider">Account UID</span>
                        <span className="text-fg font-medium">{user.uid}</span>
                      </div>
                    </div>

                    {/* General Details Fields Grid */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                      <div>
                        <span className="text-xs text-fg-3 uppercase tracking-wider font-mono">Email Address</span>
                        <p className="mt-1 text-fg font-medium truncate">{user.email}</p>
                      </div>
                      <div>
                        <span className="text-xs text-fg-3 uppercase tracking-wider font-mono">Accreditation Pass</span>
                        <p className="mt-1 text-gold-text font-medium">Founder Delegate Pass (All-Access)</p>
                      </div>
                      <div>
                        <span className="text-xs text-fg-3 uppercase tracking-wider font-mono">Direct Contact Desk</span>
                        <p className="mt-1 text-fg font-medium">{primaryStartup?.phone || 'Linked via Application'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-fg-3 uppercase tracking-wider font-mono">Pass Validity</span>
                        <p className="mt-1 text-fg font-medium">2 Years · 5 Conclaves</p>
                      </div>
                    </div>
                  </div>

                  {/* Startup Details Section */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-medium text-fg">Startup Details</h3>
                        <p className="text-sm text-fg-3 mt-0.5">Showcase profiles and booth accreditation registered under this account.</p>
                      </div>

                      {startups.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onNavigate('startup')}
                          className="btn-secondary h-10 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Register Another Startup</span>
                        </button>
                      )}
                    </div>

                    {startups.length === 0 ? (
                      <div className="surface-card rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto border border-line shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-line flex items-center justify-center mx-auto text-gold-text mb-4">
                          <Rocket className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                        <h2 className="mt-4 font-serif text-2xl sm:text-3xl text-fg">
                          No startups registered yet
                        </h2>
                        <p className="mt-2 text-sm text-fg-2 leading-relaxed">
                          You are signed in as <strong className="text-fg">{user.email}</strong>. No startup registration was found linked to this email.
                        </p>
                        <button
                          type="button"
                          onClick={() => onNavigate('startup')}
                          className="mt-6 btn-primary h-11 px-6 text-sm font-semibold flex items-center gap-2 mx-auto cursor-pointer shadow-sm active:scale-[0.98]"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2} />
                          <span>Register your startup</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Search and sector filters */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                          <label className="relative flex-1 max-w-sm">
                            <span className="sr-only">Search your startups</span>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" strokeWidth={1.5} />
                            <input
                              type="search"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder="Search by brand, sector or stage"
                              className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-surface-3 border border-line text-sm text-fg placeholder:text-fg-3 focus:border-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
                            />
                          </label>
                          {sectors.length > 2 && (
                            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by sector">
                              {sectors.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setSector(s)}
                                  aria-pressed={sector === s}
                                  className={`h-9 px-3 rounded-full text-[13px] whitespace-nowrap border transition-colors cursor-pointer ${
                                    sector === s ? 'bg-fg text-surface-0 border-fg' : 'border-line text-fg-2 hover:text-fg hover:border-line-strong'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Startup Cards Grid */}
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {shownStartups.map((s, i) => {
                            const statusCfg = STATUS_VIEW[s.status] || STATUS_VIEW.pending;
                            const StatusIcon = statusCfg.Icon;
                            return (
                              <li
                                key={s.id}
                                className="surface-card rounded-2xl p-6 flex flex-col justify-between motion-safe:animate-slide-up border border-line hover:border-gold-foil/40 transition-all shadow-sm"
                                style={{ animationDelay: `${Math.min(i, 8) * 60}ms`, animationFillMode: 'backwards' }}
                              >
                                <div>
                                  {/* Card Top */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="w-11 h-11 rounded-xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center font-serif text-lg text-gold-text shrink-0">
                                        {(s.name || '?').trim().charAt(0).toUpperCase()}
                                      </span>
                                      <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-fg leading-tight truncate">{s.name}</h2>
                                        {s.stage && <p className="text-xs text-fg-3 mt-0.5">{s.stage}</p>}
                                      </div>
                                    </div>

                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusCfg.cls}`}>
                                      <StatusIcon className="w-3.5 h-3.5" strokeWidth={2} />
                                      <span>{statusCfg.label}</span>
                                    </span>
                                  </div>

                                  {/* Pitch */}
                                  {s.pitch && <p className="mt-4 text-[13px] leading-relaxed text-fg-2 line-clamp-3">{s.pitch}</p>}

                                  {/* Sectors */}
                                  {s.sectors?.length > 0 && (
                                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                                      {s.sectors.map((t) => (
                                        <span key={t} className="px-2 py-0.5 rounded-full bg-surface-3 border border-line text-[11px] text-fg-2">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Card Footer */}
                                <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => copyText(s.id)}
                                    className="font-mono text-[11px] text-gold-text hover:text-coral transition-colors flex items-center gap-1 tracking-wider cursor-pointer"
                                    title="Click to copy Accreditation ID"
                                  >
                                    {copiedId === s.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span>COPIED</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>{s.id}</span>
                                      </>
                                    )}
                                  </button>
                                  {s.website ? (
                                    <a
                                      href={href(s.website)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[13px] text-gold-text hover:underline shrink-0"
                                    >
                                      <span>Website</span>
                                      <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-fg-3 font-mono">Confidential Record</span>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 2: ANNOUNCEMENTS (Card format / big tab design)
             ══════════════════════════════════════════════ */}
          {activeTab === 'announcements' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-medium text-fg">Official Conclave Announcements</h2>
                  <p className="text-sm text-fg-3 mt-1">Live updates, stall allocations, and protocol briefings issued by the Secretariat.</p>
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Announcement categories">
                  {['All', 'Pavilion', 'Investors', 'Pitch', 'Protocol'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAnnouncementFilter(cat)}
                      className={`h-9 px-3.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer ${
                        announcementFilter === cat
                          ? 'bg-fg text-surface-0 border-fg'
                          : 'border-line text-fg-2 hover:text-fg hover:border-line-strong'
                      }`}
                    >
                      {cat === 'All' ? 'All Updates' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Card / Tab Design for Announcements */}
              <div className="space-y-6">
                {filteredAnnouncements.map((ann) => (
                  <article
                    key={ann.id}
                    className="surface-card rounded-2xl p-6 sm:p-8 border border-line hover:border-gold-foil/40 transition-all shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-medium border ${ann.badgeCls}`}>
                          {ann.priority}
                        </span>
                        <span className="text-xs text-fg-3 font-mono">· {ann.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-fg-3 font-mono">
                        <Clock className="w-3.5 h-3.5 text-gold-foil" />
                        <span>{ann.date}</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-2xl font-medium text-fg leading-snug">
                      {ann.title}
                    </h3>

                    <p className="mt-3 text-[15px] text-fg-2 leading-relaxed">
                      {ann.summary}
                    </p>

                    <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-line text-xs sm:text-sm text-fg-3 leading-relaxed">
                      {ann.details}
                    </div>

                    <div className="mt-6 pt-5 border-t border-line/60 flex flex-wrap items-center justify-between gap-4">
                      <span className="text-xs text-gold-text font-mono">Issued by Secretariat Protocol Office</span>
                      {ann.actionTab ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab(ann.actionTab)}
                          className="btn-primary h-10 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                        >
                          <span>{ann.actionText}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => alert('The official Pavilion & Stall Layout PDF will be dispatched directly to your registered email.')}
                          className="btn-secondary h-10 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{ann.actionText}</span>
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 3: UPCOMING EVENTS (Card format / big tab design)
             ══════════════════════════════════════════════ */}
          {activeTab === 'events' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-medium text-fg">Upcoming Conclave Events</h2>
                  <p className="text-sm text-fg-3 mt-1">Keynotes, investor speed-dating rounds, and networking galas scheduled for Bharat Connect 2026.</p>
                </div>

                <div className="text-xs font-mono text-gold-text bg-surface-2 px-3 py-1.5 rounded-lg border border-line self-start sm:self-auto">
                  18–19 December 2026 · Yashobhoomi
                </div>
              </div>

              {/* Big Event Cards */}
              <div className="space-y-6">
                {UPCOMING_EVENTS.map((evt) => (
                  <div
                    key={evt.id}
                    className="surface-card rounded-2xl p-6 sm:p-8 border border-line hover:border-gold-foil/40 transition-all shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-gold-foil/15 text-gold-text border border-gold-foil/30">
                            {evt.badge}
                          </span>
                          <span className="text-xs font-mono text-fg-3">· {evt.track}</span>
                        </div>

                        <h3 className="font-serif text-2xl font-medium text-fg leading-tight">
                          {evt.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-mono text-gold-text">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gold-foil" />
                            <span>{evt.dates}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gold-foil" />
                            <span>{evt.venue}</span>
                          </div>
                        </div>

                        <p className="text-sm text-fg-2 leading-relaxed pt-1">
                          {evt.summary}
                        </p>

                        <div className="pt-2 text-xs text-fg-3 font-mono flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-fg-3" />
                          <span>Featuring: <strong className="text-fg">{evt.speakers}</strong></span>
                        </div>
                      </div>

                      {/* Side Actions & Calendar */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 justify-end">
                        <button
                          type="button"
                          onClick={() => downloadIcs(evt)}
                          className="btn-secondary h-10 px-4 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>Add to Calendar (.ics)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openGoogleCal(evt)}
                          className="btn-secondary h-10 px-4 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Google Calendar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('apply');
                            const match = APPLY_EVENTS_TABLE.find((t) => t.eventName.toLowerCase().includes(evt.title.slice(0, 15).toLowerCase())) || APPLY_EVENTS_TABLE[0];
                            openApplyModal(match);
                          }}
                          className="btn-primary h-10 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                        >
                          <span>Apply for Event</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 4: APPLY FOR EVENTS (Tabular View + Clickable Apply Now)
             ══════════════════════════════════════════════ */}
          {activeTab === 'apply' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-medium text-fg">Apply For Conclave Events</h2>
                  <p className="text-sm text-fg-3 mt-1">Select an upcoming conclave session or speed-dating deal room to apply for stage pitch and participation slots.</p>
                </div>

                <div className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 self-start sm:self-auto">
                  Applications Open · Curated Slots
                </div>
              </div>

              {/* Tabular View */}
              <div className="surface-card rounded-2xl border border-line overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-line bg-surface-2/60 text-xs font-mono text-fg-3 uppercase tracking-wider">
                        <th className="py-4 px-5">Event &amp; Session</th>
                        <th className="py-4 px-4">Date &amp; Time</th>
                        <th className="py-4 px-4">Venue / Stage</th>
                        <th className="py-4 px-4">Eligibility / Quota</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60 text-sm">
                      {APPLY_EVENTS_TABLE.map((row) => {
                        const isApplied = !!appliedEvents[row.id];
                        return (
                          <tr key={row.id} className="hover:bg-surface-2/40 transition-colors">
                            {/* Event & Track */}
                            <td className="py-4 px-5">
                              <div className="font-medium text-fg">{row.eventName}</div>
                              <span className="inline-block mt-0.5 text-xs text-gold-text font-mono">{row.track}</span>
                            </td>

                            {/* Date & Time */}
                            <td className="py-4 px-4 whitespace-nowrap text-xs text-fg-2 font-mono">
                              {row.date}
                            </td>

                            {/* Venue */}
                            <td className="py-4 px-4 text-xs text-fg-3">
                              {row.venue}
                            </td>

                            {/* Eligibility */}
                            <td className="py-4 px-4">
                              <div className="text-xs text-fg">{row.eligibility}</div>
                              <div className="text-[11px] text-fg-3 font-mono">{row.quota}</div>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              {isApplied ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Applied ✓</span>
                                </span>
                              ) : (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.statusCls}`}>
                                  {row.status}
                                </span>
                              )}
                            </td>

                            {/* Action Button */}
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              {isApplied ? (
                                <span className="text-xs font-mono text-emerald-500 font-medium">Under Review</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openApplyModal(row)}
                                  className="btn-primary h-9 px-4 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                                >
                                  <span>Apply now</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Informational Guidance footer */}
              <div className="p-5 rounded-2xl bg-surface-2 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-fg-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gold-foil shrink-0" />
                  <span>Applications are reviewed sequentially by the Conclave Curatorial Jury &amp; IACCIA Protocol Secretariat.</span>
                </div>
                <span className="font-mono text-gold-text">Confirmation dispatched to verified account email</span>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FORM POP-UP MODAL (When Apply Now is clicked)
         ══════════════════════════════════════════════ */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-surface-1 border border-line-strong rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-fg-3 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {modalSuccessId ? (
              /* Success confirmation state inside modal */
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-3xl font-medium text-fg">Application Submitted</h3>
                <p className="text-sm text-fg-2 max-w-md mx-auto leading-relaxed">
                  Your event participation application for <strong className="text-fg">{selectedEvent.eventName}</strong> has been received by the Secretariat.
                </p>

                <div className="p-4 rounded-xl bg-surface-2 border border-line font-mono text-center max-w-xs mx-auto">
                  <span className="block text-xs text-fg-3">Application Reference ID</span>
                  <span className="text-base text-gold-text font-bold">{modalSuccessId}</span>
                </div>

                <p className="text-xs text-fg-3">
                  An official confirmation has been recorded under your founder profile.
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="mt-6 btn-primary h-11 px-8 text-sm font-semibold cursor-pointer active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Application Form inside Pop-Up */
              <form onSubmit={handleApplySubmit} className="space-y-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-gold-text">Conclave Event Application</span>
                  <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-fg leading-tight">
                    {selectedEvent.eventName}
                  </h3>
                  <p className="text-xs text-fg-3 font-mono mt-1">
                    {selectedEvent.date} · {selectedEvent.venue}
                  </p>
                </div>

                {modalError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4 text-sm">
                  {/* Registered Startup selection */}
                  <div>
                    <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                      Applying Venture / Startup <span className="text-coral">*</span>
                    </label>
                    {startups.length > 0 ? (
                      <select
                        value={modalForm.startupName}
                        onChange={(e) => {
                          const chosen = startups.find((s) => s.name === e.target.value) || {};
                          setModalForm((prev) => ({
                            ...prev,
                            startupName: e.target.value,
                            startupId: chosen.id || '',
                            pitchDeck: chosen.website || prev.pitchDeck,
                          }));
                        }}
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                        required
                      >
                        {startups.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.id})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={modalForm.startupName}
                        onChange={(e) => setModalForm({ ...modalForm, startupName: e.target.value })}
                        placeholder="e.g. Acme Robotics Technologies"
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                        required
                      />
                    )}
                  </div>

                  {/* Applicant Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                        Applicant / Representative <span className="text-coral">*</span>
                      </label>
                      <input
                        type="text"
                        value={modalForm.applicantName}
                        onChange={(e) => setModalForm({ ...modalForm, applicantName: e.target.value })}
                        placeholder="Founder Full Name"
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                        Registered Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || modalForm.email}
                        readOnly
                        className="w-full h-11 px-3 rounded-xl bg-surface-3 border border-line text-fg-3 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Participation Track Selection */}
                  <div>
                    <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                      Preferred Participation Track
                    </label>
                    <select
                      value={modalForm.track}
                      onChange={(e) => setModalForm({ ...modalForm, track: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                    >
                      <option value="1-on-1 Investor Deal Room (Speed dating)">1-on-1 Investor Deal Room (Speed dating)</option>
                      <option value="Main-Stage Pitch (7 min pitch + 3 min Q&A)">Main-Stage Pitch (7 min pitch + 3 min Q&A)</option>
                      <option value="Startup Pavilion Exhibition Pod (Demo Pod)">Startup Pavilion Exhibition Pod (Demo Pod)</option>
                      <option value="VIP Founder Delegate Access (Networking & Plenaries)">VIP Founder Delegate Access (Networking & Plenaries)</option>
                    </select>
                  </div>

                  {/* Funding Stage / Target Ask */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                        Current Funding Stage
                      </label>
                      <select
                        value={modalForm.fundingStage}
                        onChange={(e) => setModalForm({ ...modalForm, fundingStage: e.target.value })}
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                      >
                        <option value="Pre-Seed / Bootstrapped">Pre-Seed / Bootstrapped</option>
                        <option value="Seed ($250k–$1M)">Seed ($250k–$1M)</option>
                        <option value="Pre-Series A ($1M–$3M)">Pre-Series A ($1M–$3M)</option>
                        <option value="Series A+ ($3M+)">Series A+ ($3M+)</option>
                        <option value="Strategic Joint Venture / GCC Expansion">Strategic Joint Venture / GCC Expansion</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                        Pitch Deck / Portfolio Link
                      </label>
                      <input
                        type="url"
                        value={modalForm.pitchDeck}
                        onChange={(e) => setModalForm({ ...modalForm, pitchDeck: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                      />
                    </div>
                  </div>

                  {/* Objective & Specific Requests */}
                  <div>
                    <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                      Key Objective / Target Investors to Meet
                    </label>
                    <textarea
                      rows={2}
                      value={modalForm.objective}
                      onChange={(e) => setModalForm({ ...modalForm, objective: e.target.value })}
                      placeholder="e.g. Looking to connect with Gulf-based sovereign funds and strategic distributor partners in UAE and KSA."
                      className="w-full p-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil resize-none"
                    />
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="pt-4 border-t border-line/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="btn-secondary h-11 px-5 text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="btn-primary h-11 px-6 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50"
                  >
                    {modalSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

          </>
        )}
      </div>
    </SignInGate>
  );
}
