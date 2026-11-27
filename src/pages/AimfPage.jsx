import { useEffect, useMemo, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowRight,
  Music, 
  Search, 
  Lock, 
  LogIn, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronRight, 
  X, 
  Download, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Tag, 
  User, 
  Bell, 
  Calendar, 
  Send, 
  CalendarPlus, 
  MapPin, 
  Users, 
  Building2, 
  Palette, 
  Film 
} from 'lucide-react';
import { watchMyAimfAccreditations, watchMyEventApplications, submitEventApplication } from '../data/registry';
import { useAuth } from '../auth/AuthContext';
import SignInGate from '../auth/SignInGate';
import { calendarFile, googleCalendarUrl } from '../data/events';

/*
  AIMF Cultural & Creative Delegate Dashboard & Confidential Portal.
  Features:
  1. Profile (General Cultural Delegate details & AIMF Accreditation details)
  2. Announcements (Staging, soundcheck, ministerial rehearsals & notices)
  3. Upcoming Events (Cultural galas, symphonies, IP roundtables & calendar reminders)
  4. Apply For Events (Main-stage slots, bilateral deal rooms + clickable "Apply Now" modal)
*/

const href = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

const STATUS_VIEW = {
  pending: { label: 'Under review', Icon: Clock, cls: 'text-[#9A6B00] bg-[#FAB219]/15 border-[#FAB219]/40' },
  approved: { label: 'Accreditation Approved', Icon: CheckCircle2, cls: 'text-[#0A7A0A] bg-[#0CA30C]/10 border-[#0CA30C]/35' },
  declined: { label: 'Application Declined', Icon: XCircle, cls: 'text-[#B02E2E] bg-[#D03B3B]/10 border-[#D03B3B]/35' },
};

/* ── AIMF Announcements Data ───────────────────────── */

const AIMF_ANNOUNCEMENTS = [
  {
    id: 'ann-aimf-1',
    category: 'Pavilion & Staging',
    priority: 'High Priority',
    date: '25 Nov 2026',
    title: 'AIMF Cultural Pavilion: Hall 5 Booth Allocation & Acoustic Staging Manual Released',
    summary: 'The formal stall layout and acoustic shell scheme specifications for Hall 5 Cultural & Media Pavilion are now finalized. Each accredited cultural troupe, creative enterprise, or media studio receives allocated showcase staging, AV infrastructure, and standard presentation space.',
    details: 'Staging setup and technical soundchecks begin at 14:00 IST on 17 Dec 2026. Artist and delegate credentials must be collected from the Hall 1 Cultural Protocol Reception Desk upon producing your BC.AIMF Accreditation Reference.',
    actionText: 'Download Staging Manual (PDF)',
    actionLink: '#',
    badgeCls: 'bg-coral/10 text-coral border-coral/30',
  },
  {
    id: 'ann-aimf-2',
    category: 'Performing Arts',
    priority: 'Featured Showcase',
    date: '22 Nov 2026',
    title: 'Indo-Arab Cultural Gala: Ministerial Symphony & Folk Troupe Rehearsals Confirmed',
    summary: 'Cultural troupes from 12 Indian states and 8 Arab nations will participate in curated symphonic and classical performances on the Grand Auditorium main stage on 18 Dec 2026.',
    details: 'Selected troupes will perform before visiting Arab trade ministers and cultural attachés. Rehearsal slots will be notified individually through the portal.',
    actionText: 'Apply for Main Stage Slot',
    actionTab: 'apply',
    badgeCls: 'bg-gold-foil/15 text-gold-text border-gold-foil/40',
  },
  {
    id: 'ann-aimf-3',
    category: 'Creative Economy',
    priority: 'Curatorial Selection',
    date: '18 Nov 2026',
    title: 'Bilateral Creative Tech & Media Pitch: 15 Frontier Studios to Present Before GCC Delegations',
    summary: 'The AIMF Curatorial Committee will select 15 creative technology, animation, gaming, and IP studios to pitch bilateral co-productions and distribution deals.',
    details: 'Focus verticals include Immersive AR/VR, Film & OTT Co-productions, Heritage Digitization, and Generative Media.',
    actionText: 'Apply for Deal Room Pitch',
    actionTab: 'apply',
    badgeCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'ann-aimf-4',
    category: 'Protocol & VIP',
    priority: 'General Notice',
    date: '14 Nov 2026',
    title: 'Complimentary VIP All-Access Cultural Passes for Troupe Leads & Creative Directors',
    summary: 'In addition to the primary accredited delegate pass, each registered enterprise receives two complimentary All-Access E-Badges for creative directors or performing leads.',
    details: 'Includes full access to the ministerial plenary keynotes, Yashobhoomi VIP networking lounge, and bilateral gala dinners across both days.',
    actionText: 'Apply for VIP Passes',
    actionTab: 'apply',
    badgeCls: 'bg-surface-3 text-fg-2 border-line',
  },
];

/* ── AIMF Upcoming Events Data ─────────────────────── */

const AIMF_UPCOMING_EVENTS = [
  {
    id: 'evt-aimf-1',
    title: 'Bharat Connect 2026: Sovereign Conclave & Inaugural Plenary',
    track: 'Ministerial & Bilateral Summit',
    dates: '18–19 Dec 2026 · 08:30 – 18:30 IST',
    startIso: '2026-12-18T08:30:00+05:30',
    endIso: '2026-12-19T18:30:00+05:30',
    venue: 'Palash Hall (Level 6) & Grand Auditorium, Yashobhoomi, New Delhi',
    speakers: 'Union Ministers (India), Ministers of Culture & Trade (GCC States), IACCIA Leadership',
    summary: 'The grand inaugural ceremony uniting 22 Arab delegations, keynote addresses on cultural corridors, and bilateral accord signings.',
    capacity: '500 Accredited Passes',
    badge: 'Main Summit',
  },
  {
    id: 'evt-aimf-2',
    title: 'AIMF Cultural Gala & Symphony of Civilizations Plenary',
    track: 'Performing Arts & Cultural Symphony',
    dates: '18 Dec 2026 · 18:30 – 21:30 IST',
    startIso: '2026-12-18T18:30:00+05:30',
    endIso: '2026-12-18T21:30:00+05:30',
    venue: 'Grand Auditorium & Open-Air Amphitheatre, Yashobhoomi',
    speakers: 'Eminent Classical Maestros, Arab Cultural Envoys, Ministerial Delegations',
    summary: 'A magnificent evening uniting classical Indian and Arab orchestral traditions, followed by diplomatic networking.',
    capacity: '120 Artist Passes',
    badge: 'Cultural Gala',
  },
  {
    id: 'evt-aimf-3',
    title: 'Indo-Arab Performing Arts & Folk Heritage Showcase',
    track: 'Live Performing Arts & Dance',
    dates: '19 Dec 2026 · 11:00 – 14:00 IST',
    startIso: '2026-12-19T11:00:00+05:30',
    endIso: '2026-12-19T14:00:00+05:30',
    venue: 'Hall 5 Cultural Pavilion Main Amphitheatre',
    speakers: 'Sovereign Cultural Troupes & Master Artisans',
    summary: 'Vibrant regional folk dances, heritage recitals, and traditional artisan demonstrations from across the Arab world and India.',
    capacity: '80 Troupe Slots',
    badge: 'Live Showcase',
  },
  {
    id: 'evt-aimf-4',
    title: 'Creative Economy & Digital IP Co-Production Roundtable',
    track: 'Media, Film & OTT Co-Production',
    dates: '19 Dec 2026 · 14:00 – 16:30 IST',
    startIso: '2026-12-19T14:00:00+05:30',
    endIso: '2026-12-19T16:30:00+05:30',
    venue: 'Bilateral Deal Suite C (Level 2), Yashobhoomi',
    speakers: 'Film Commissions (UAE, Saudi, India), Studio Executives, Creative Tech Leaders',
    summary: 'Roundtable on bilateral co-production incentives, IP licensing, and distribution frameworks across the India-GCC corridor.',
    capacity: '40 Studio Seats',
    badge: 'Bilateral Roundtable',
  },
  {
    id: 'evt-aimf-5',
    title: 'Heritage Crafts & Visual Arts Pavilion Vernissage',
    track: 'Visual Arts, Crafts & Textile Heritage',
    dates: '18–19 Dec 2026 · 10:00 – 18:00 IST',
    startIso: '2026-12-18T10:00:00+05:30',
    endIso: '2026-12-19T18:00:00+05:30',
    venue: 'Hall 5 Gallery Concourse, Yashobhoomi',
    speakers: 'National Awardee Master Craftsmen & Arab Contemporary Artists',
    summary: 'Curated exposition of traditional handicrafts, calligraphy, haute couture textiles, and digital art installations.',
    capacity: 'Open to All AIMF Delegates',
    badge: 'Vernissage',
  },
];

/* ── AIMF Apply Opportunities ──────────────────────── */

const AIMF_APPLY_EVENTS = [
  {
    id: 'app-aimf-1',
    eventName: 'AIMF Main Stage Cultural Gala Performance Slot',
    track: 'Main Stage Performing Arts',
    date: '18 Dec 2026 · 19:00 IST',
    venue: 'Grand Auditorium Stage',
    eligibility: 'Accredited Troupes & Ensembles',
    quota: '8 Curated Slots',
    status: 'Curatorial Selection',
    statusCls: 'bg-gold-foil/15 text-gold-text border-gold-foil/40',
  },
  {
    id: 'app-aimf-2',
    eventName: 'Bilateral Creative IP & Co-Production Deal Room',
    track: 'Studio & Distributor Matchmaking',
    date: '19 Dec 2026 · 14:30 IST',
    venue: 'Bilateral Suite C (Level 2)',
    eligibility: 'Media Studios, Animation, Film & Gaming',
    quota: '20 Pitch Slots',
    status: 'Accepting Applications',
    statusCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'app-aimf-3',
    eventName: 'Indo-Arab Ministerial Cultural Dinner VIP Pass',
    track: 'VIP Diplomatic Dinner',
    date: '18 Dec 2026 · 20:00 IST',
    venue: 'VIP Banqueting Hall, Yashobhoomi',
    eligibility: 'Lead Artists, Directors & Delegates',
    quota: '50 Reserved Passes',
    status: 'Limited Slots',
    statusCls: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
  {
    id: 'app-aimf-4',
    eventName: 'AIMF Cultural Pavilion Exhibition Pod Upgrade',
    track: 'Showcase Pod & Staging Booth',
    date: '18–19 Dec 2026 · Full Conclave',
    venue: 'Hall 5 Cultural Concourse',
    eligibility: 'Accredited AIMF Enterprises',
    quota: '15 Premium Pods',
    status: 'Accepting Applications',
    statusCls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  {
    id: 'app-aimf-5',
    eventName: 'Heritage Masterclass & Interactive Workshop Slot',
    track: 'Workshop & Artisan Demo',
    date: '19 Dec 2026 · 11:30 IST',
    venue: 'Hall 5 Workshop Arena',
    eligibility: 'Master Artisans & Cultural Educators',
    quota: '6 Workshop Slots',
    status: 'Fast-Track Desk',
    statusCls: 'bg-coral/10 text-coral border-coral/30',
  },
];

/* ── Calendar Helpers ──────────────────────────────── */

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

/* ── Main AIMF Page Component ──────────────────────── */

export default function AimfPage({ onNavigate }) {
  const { user, openAuth } = useAuth();
  const [accreditations, setAccreditations] = useState([]);
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('All');
  const [copiedId, setCopiedId] = useState('');

  // Horizontal Dashboard Navigation Tabs: 'profile' | 'announcements' | 'events' | 'apply'
  const [activeTab, setActiveTab] = useState('profile');
  const [announcementFilter, setAnnouncementFilter] = useState('All');

  // Applied Events State
  const [appliedEvents, setAppliedEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bc_aimf_applied_events') || '{}');
    } catch {
      return {};
    }
  });

  // Modal State for "Apply for Events"
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalForm, setModalForm] = useState({
    aimfId: '',
    aimfName: '',
    applicantName: '',
    email: '',
    track: 'Main Stage Performing Arts',
    genreCategory: 'Classical / Folk Music & Dance',
    portfolioLink: '',
    objective: '',
    notes: '',
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalSuccessId, setModalSuccessId] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (!user) {
      setAccreditations([]);
      return undefined;
    }

    const unsubAccred = watchMyAimfAccreditations(user, (rawList) => {
      const formatted = rawList.map((r) => {
        const p = r.profile || {};
        const sectorsList = Array.isArray(p.sectors) && p.sectors.length > 0 
          ? p.sectors 
          : typeof r.sector === 'string' 
          ? r.sector.split(', ').filter(Boolean) 
          : [];

        return {
          id: r.id || r.ref,
          name: p.brand || r.organisation || r.name || 'Untitled AIMF Showcase',
          track: p.track || r.detail || 'AIMF Cultural Accreditation',
          pitch: p.pitch || r.pitch || '',
          sectors: sectorsList,
          country: p.country || r.country || 'India',
          website: p.website || r.website || '',
          status: r.status || 'pending',
          submittedAt: r.submittedAt,
          email: r.email || r.accountEmail,
          phone: r.phone || '',
        };
      });
      setAccreditations(formatted);
    });

    const unsubApps = watchMyEventApplications(user, (list) => {
      const aimfApps = list.filter((a) => (a.detail || '').includes('AIMF') || (a.ref || '').includes('BC.AIMF'));
      if (aimfApps.length > 0) {
        setAppliedEvents((prev) => {
          const next = { ...prev };
          aimfApps.forEach((app) => {
            if (app.eventId) next[app.eventId] = { ref: app.id || app.ref, status: app.status };
          });
          return next;
        });
      }
    });

    return () => {
      unsubAccred();
      unsubApps();
    };
  }, [user]);

  const primaryAimf = accreditations[0] || null;

  const sectors = useMemo(
    () => ['All', ...new Set(accreditations.flatMap((s) => s.sectors || []))],
    [accreditations],
  );

  const shown = accreditations.filter((s) => {
    const q = query.trim().toLowerCase();
    const inSector = sector === 'All' || (s.sectors || []).includes(sector);
    const matches = !q || [s.name, s.track, s.pitch, s.country, ...(s.sectors || [])].join(' ').toLowerCase().includes(q);
    return inSector && matches;
  });

  const copyId = async (idText) => {
    try {
      await navigator.clipboard.writeText(idText);
      setCopiedId(idText);
      setTimeout(() => setCopiedId(''), 1800);
    } catch { /* blocked */ }
  };

  const handleOpenApplyModal = (evt) => {
    if (!user) {
      openAuth({ mode: 'signin', reason: `Sign in to apply for ${evt.eventName}.` });
      return;
    }
    setSelectedEvent(evt);
    setModalSuccessId('');
    setModalError('');
    setModalForm({
      aimfId: primaryAimf?.id || '',
      aimfName: primaryAimf?.name || '',
      applicantName: user?.displayName || user?.name || '',
      email: user?.email || '',
      track: evt.track || 'Cultural Gala Performance',
      genreCategory: 'Classical / Folk Troupe',
      portfolioLink: primaryAimf?.website || '',
      objective: '',
      notes: '',
    });
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setModalSubmitting(true);
    setModalError('');

    try {
      const appRecord = {
        type: 'event_app',
        eventId: selectedEvent.id,
        eventName: selectedEvent.eventName,
        track: modalForm.track,
        aimfId: modalForm.aimfId,
        aimfName: modalForm.aimfName,
        applicantName: modalForm.applicantName,
        email: modalForm.email,
        phone: primaryAimf?.phone || '',
        genreCategory: modalForm.genreCategory,
        portfolioLink: modalForm.portfolioLink,
        objective: modalForm.objective,
        notes: modalForm.notes,
        submittedAt: new Date().toISOString(),
      };

      const ref = await submitEventApplication(appRecord);
      setModalSuccessId(ref);

      const next = { ...appliedEvents, [selectedEvent.id]: { ref, status: 'pending' } };
      setAppliedEvents(next);
      try {
        localStorage.setItem('bc_aimf_applied_events', JSON.stringify(next));
      } catch { /* storage full */ }
    } catch (err) {
      setModalError(err.message || 'Submission failed. Please try again.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <SignInGate
      title="Sign in to access AIMF Cultural Portal"
      reason="The AIMF Cultural & Creative Portal is reserved for accredited delegates. Sign in with your registered account to manage your showcase, pavilion staging, and performance applications."
      portalType="aimf"
      onNavigate={onNavigate}
    >
      <div className="page-enter flex flex-col min-h-screen">
        {/* ── HEADER BANNER ─────────────────────────────────── */}
        <section className="pt-32 pb-12 bg-royal border-b border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <p className="ref-line mb-4">Bharat Connect 2026 · Atal Innovation Multilateral Forum</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em]">
                  AIMF Cultural &amp; Creative Portal
                </h1>
                <p className="mt-2 text-sm sm:text-base text-fg-2 max-w-2xl leading-relaxed">
                  {user ? (
                    <>
                      Accreditation hub, pavilion staging, and bilateral cultural showcases registered under <strong className="text-fg">{user.email}</strong>.
                    </>
                  ) : (
                    'Private cultural & creative accreditation hub for Atal Innovation Multilateral Forum 2026.'
                  )}
                </p>
              </div>

              {user && (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="px-4 py-2 rounded-xl bg-surface-2 border border-line">
                    <span className="block font-serif text-2xl text-gold-text tabular-nums">{accreditations.length}</span>
                    <span className="text-xs text-fg-3">Registered {accreditations.length === 1 ? 'Accreditation' : 'Accreditations'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('aimf-register')}
                    className="btn-primary h-11 px-5 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    <span>Register for AIMF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* If signed in but has no registered AIMF accreditations, display accreditation gate */}
        {accreditations.length === 0 ? (
          <section className="theme-cream py-16 sm:py-24 bg-surface-0 flex-1 flex items-center justify-center">
            <div className="max-w-xl mx-auto px-4 sm:px-6 w-full text-center animate-fade-in">
              <div className="surface-card rounded-3xl p-8 sm:p-12 border border-line shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center text-gold-text mb-6">
                  <Palette className="w-8 h-8" strokeWidth={1.75} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-gold-foil/15 text-gold-text border border-gold-foil/30 mb-4">
                  Accreditation Required
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
                  AIMF Accreditation Required
                </h2>
                <p className="mt-3 text-sm text-fg-2 leading-relaxed">
                  The AIMF Cultural &amp; Creative Portal, Pavilion Staging &amp; Bilateral Media Deals are strictly reserved for accredited delegates. No AIMF accreditation was found under <strong className="text-fg">{user?.email}</strong>.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('aimf-register')}
                    className="btn-primary h-12 px-7 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] mx-auto"
                  >
                    <span>Apply for AIMF Accreditation Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* ── STICKY HORIZONTAL TAB NAVIGATION BAR ──────────── */}
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
                {AIMF_ANNOUNCEMENTS.length}
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
                {AIMF_UPCOMING_EVENTS.length}
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
              TAB 1: PROFILE (General Details + AIMF Details)
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
                    Sign in to view your AIMF profile
                  </h2>
                  <p className="mt-3 text-sm text-fg-2 leading-relaxed">
                    For protocol confidentiality and security, cultural accreditation profiles and troupe allocations are restricted to the registered account holder.
                  </p>
                  <button
                    type="button"
                    onClick={() => openAuth({ mode: 'signin', reason: 'Sign in to access your AIMF accreditation profile.' })}
                    className="mt-6 btn-primary h-11 px-7 text-sm font-semibold flex items-center gap-2 mx-auto cursor-pointer shadow-md active:scale-[0.98]"
                  >
                    <LogIn className="w-4 h-4" strokeWidth={2} />
                    <span>Sign in with Email</span>
                  </button>
                  <div className="mt-8 pt-5 border-t border-line/60 text-xs text-fg-3">
                    Haven't applied for AIMF accreditation yet?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('aimf-register')}
                      className="text-coral hover:underline font-medium cursor-pointer"
                    >
                      Apply for accreditation
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* General Details Box (Exact section as in founder portal) */}
                  <div className="surface-card rounded-2xl p-6 sm:p-8 border border-line shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line/70">
                      <div className="flex items-center gap-4">
                        <span className="w-14 h-14 rounded-2xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center font-serif text-2xl text-gold-text shrink-0">
                          {(user.displayName || user.email || 'A').charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-serif text-2xl font-medium text-fg">
                              {user.displayName || primaryAimf?.name || 'Accredited Cultural Delegate'}
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified AIMF Delegate</span>
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
                        <p className="mt-1 text-gold-text font-medium">AIMF Cultural Delegate Pass (All-Access)</p>
                      </div>
                      <div>
                        <span className="text-xs text-fg-3 uppercase tracking-wider font-mono">Direct Contact Desk</span>
                        <p className="mt-1 text-fg font-medium">{primaryAimf?.phone || 'Linked via Application'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-fg-3 uppercase tracking-wider font-mono">Pass Validity</span>
                        <p className="mt-1 text-fg font-medium">Complimentary · Yashobhoomi 2026</p>
                      </div>
                    </div>
                  </div>

                  {/* AIMF Accreditation Details Section */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-medium text-fg">AIMF Accreditation Details</h3>
                        <p className="text-sm text-fg-3 mt-0.5">Showcase profiles, performing arts troupes, and media accreditations registered under this account.</p>
                      </div>

                      {accreditations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onNavigate('aimf-register')}
                          className="btn-secondary h-10 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Register Another Showcase</span>
                        </button>
                      )}
                    </div>

                    {accreditations.length === 0 ? (
                      <div className="surface-card rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto border border-line shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-line flex items-center justify-center mx-auto text-gold-text mb-4">
                          <Music className="w-7 h-7" strokeWidth={1.5} />
                        </div>
                        <h2 className="mt-4 font-serif text-2xl sm:text-3xl text-fg">
                          No AIMF accreditations registered yet
                        </h2>
                        <p className="mt-2 text-sm text-fg-2 leading-relaxed">
                          You are signed in as <strong className="text-fg">{user.email}</strong>. No cultural or creative accreditation was found linked to this account.
                        </p>
                        <button
                          type="button"
                          onClick={() => onNavigate('aimf-register')}
                          className="mt-6 btn-primary h-11 px-6 text-sm font-semibold flex items-center gap-2 mx-auto cursor-pointer shadow-sm active:scale-[0.98]"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2} />
                          <span>Apply for AIMF accreditation</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Search and sector filters */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                          <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3 pointer-events-none" />
                            <input
                              type="text"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              placeholder="Search your troupes, tracks, keywords…"
                              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-1 border border-line text-sm text-fg placeholder:text-fg-3 focus:outline-none focus:border-gold-foil"
                            />
                          </div>

                          {sectors.length > 1 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                              {sectors.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setSector(s)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                                    sector === s ? 'bg-surface-3 text-fg font-semibold border border-line' : 'text-fg-3 hover:text-fg hover:bg-surface-2'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Accreditations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {shown.map((s, i) => {
                            const statusCfg = STATUS_VIEW[s.status] || STATUS_VIEW.pending;
                            const StatusIcon = statusCfg.Icon;

                            return (
                              <div
                                key={s.id}
                                className="surface-card rounded-2xl p-6 flex flex-col justify-between motion-safe:animate-slide-up border border-line hover:border-gold-foil/40 transition-all shadow-sm"
                                style={{ animationDelay: `${Math.min(i, 8) * 60}ms`, animationFillMode: 'backwards' }}
                              >
                                <div>
                                  {/* Top header row */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="w-11 h-11 rounded-xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center font-serif text-lg text-gold-text shrink-0">
                                        {(s.name || '?').trim().charAt(0).toUpperCase()}
                                      </span>
                                      <div className="min-w-0">
                                        <h2 className="text-base font-semibold text-fg leading-tight truncate">{s.name}</h2>
                                        <p className="text-xs text-gold-text mt-0.5 truncate">{s.track}</p>
                                      </div>
                                    </div>

                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusCfg.cls}`}>
                                      <StatusIcon className="w-3.5 h-3.5" strokeWidth={2} />
                                      <span>{statusCfg.label}</span>
                                    </span>
                                  </div>

                                  {/* Pitch / Summary */}
                                  {s.pitch && <p className="mt-4 text-[13px] leading-relaxed text-fg-2 line-clamp-3">{s.pitch}</p>}

                                  {/* Sectors / Tracks */}
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

                                {/* Bottom Footer bar */}
                                <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => copyId(s.id)}
                                    className="font-mono text-[11px] text-gold-text hover:text-coral transition-colors flex items-center gap-1 tracking-wider cursor-pointer"
                                    title="Click to copy ID"
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
                                      className="text-xs text-fg-3 hover:text-fg flex items-center gap-1 transition-colors"
                                    >
                                      <span>Portfolio</span>
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-fg-3 font-mono">{s.country}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 2: ANNOUNCEMENTS
             ══════════════════════════════════════════════ */}
          {activeTab === 'announcements' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
                    Official AIMF Announcements &amp; Protocol Notices
                  </h2>
                  <p className="text-sm text-fg-3 mt-1">
                    Live updates regarding cultural pavilion allocations, soundchecks, ministerial rehearsals, and bilateral showcases.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {['All', 'Pavilion & Staging', 'Performing Arts', 'Creative Economy', 'Protocol & VIP'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAnnouncementFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        announcementFilter === cat ? 'bg-surface-3 text-fg font-semibold border border-line' : 'text-fg-3 hover:text-fg hover:bg-surface-2'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Announcement Cards List */}
              <div className="space-y-4">
                {AIMF_ANNOUNCEMENTS
                  .filter((a) => announcementFilter === 'All' || a.category === announcementFilter)
                  .map((ann) => (
                    <div key={ann.id} className="surface-card rounded-2xl p-6 sm:p-7 border border-line hover:border-gold-foil/30 transition-all shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${ann.badgeCls}`}>
                            {ann.priority}
                          </span>
                          <span className="text-xs text-fg-3 font-mono">{ann.category}</span>
                        </div>
                        <span className="text-xs font-mono text-fg-3">{ann.date}</span>
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl font-medium text-fg">{ann.title}</h3>
                      <p className="mt-2 text-sm text-fg-2 leading-relaxed">{ann.summary}</p>
                      <p className="mt-2 text-xs text-fg-3 leading-relaxed border-l-2 border-gold-foil/40 pl-3 py-0.5">{ann.details}</p>

                      <div className="mt-4 pt-4 border-t border-line/60 flex items-center justify-between">
                        {ann.actionTab ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab(ann.actionTab)}
                            className="text-xs font-semibold text-gold-text hover:text-coral transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>{ann.actionText}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <a
                            href={ann.actionLink}
                            className="text-xs font-semibold text-gold-text hover:text-coral transition-colors flex items-center gap-1"
                          >
                            <span>{ann.actionText}</span>
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <span className="text-[11px] font-mono text-fg-3">Bharat Connect Secretariat · Protocol Desk</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 3: UPCOMING EVENTS
             ══════════════════════════════════════════════ */}
          {activeTab === 'events' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
                  AIMF Cultural Sessions &amp; Conclave Calendar
                </h2>
                <p className="text-sm text-fg-3 mt-1">
                  Confirmed plenaries, cultural galas, IP co-production roundtables, and VIP banquets at Yashobhoomi, New Delhi.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {AIMF_UPCOMING_EVENTS.map((evt) => (
                  <div key={evt.id} className="surface-card rounded-2xl p-6 sm:p-7 border border-line hover:border-gold-foil/30 transition-all flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-gold-text bg-surface-2 px-2.5 py-1 rounded-lg border border-line">
                          {evt.badge}
                        </span>
                        <span className="text-xs font-mono text-fg-3">{evt.capacity}</span>
                      </div>

                      <h3 className="font-serif text-xl font-medium text-fg">{evt.title}</h3>
                      <p className="text-xs text-gold-text font-mono mt-0.5">{evt.track}</p>

                      <div className="mt-4 space-y-2 text-xs text-fg-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-fg-3 shrink-0" />
                          <span className="font-mono">{evt.dates}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-fg-3 shrink-0" />
                          <span>{evt.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-fg-3 shrink-0" />
                          <span>{evt.speakers}</span>
                        </div>
                      </div>

                      <p className="mt-4 text-xs sm:text-sm text-fg-3 leading-relaxed border-t border-line/60 pt-3">
                        {evt.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => downloadIcs(evt)}
                          className="btn-secondary h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                          title="Download calendar event (.ics)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.ICS File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openGoogleCal(evt)}
                          className="btn-secondary h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5 text-gold-text" />
                          <span>Google Calendar</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('apply');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="btn-primary h-9 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Apply For Slot</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              TAB 4: APPLY FOR EVENTS
             ══════════════════════════════════════════════ */}
          {activeTab === 'apply' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
                    Apply for Curated AIMF Showcases &amp; Sessions
                  </h2>
                  <p className="text-sm text-fg-3 mt-1">
                    Direct access to bilateral deal rooms, ministerial plenary slots, and premium cultural pavilion pods.
                  </p>
                </div>
              </div>

              {/* Table of Open Applications */}
              <div className="surface-card rounded-2xl border border-line overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[700px]">
                    <thead className="bg-surface-2 border-b border-line text-xs font-mono text-fg-3 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Event Opportunity</th>
                        <th className="py-3.5 px-4">Track / Category</th>
                        <th className="py-3.5 px-4">Date &amp; Venue</th>
                        <th className="py-3.5 px-4">Quota / Eligibility</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {AIMF_APPLY_EVENTS.map((item) => {
                        const isApplied = !!appliedEvents[item.id];
                        const appInfo = appliedEvents[item.id];

                        return (
                          <tr key={item.id} className="hover:bg-surface-2/50 transition-colors">
                            <td className="py-4 px-4 font-medium text-fg">
                              <span className="block text-[15px]">{item.eventName}</span>
                              <span className={`inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.statusCls}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs text-fg-2">
                              {item.track}
                            </td>
                            <td className="py-4 px-4 text-xs font-mono text-fg-3">
                              <div className="text-fg-2">{item.date}</div>
                              <div className="text-fg-3 mt-0.5">{item.venue}</div>
                            </td>
                            <td className="py-4 px-4 text-xs text-fg-2">
                              <div className="font-medium text-fg">{item.quota}</div>
                              <div className="text-fg-3 mt-0.5">{item.eligibility}</div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {isApplied ? (
                                <div className="inline-flex flex-col items-end">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Applied</span>
                                  </span>
                                  {appInfo?.ref && (
                                    <span className="text-[10px] font-mono text-gold-text mt-1">
                                      Ref: {appInfo.ref}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenApplyModal(item)}
                                  className="btn-primary h-9 px-4 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                                >
                                  <span>Apply Now</span>
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
            </div>
          )}

        </div>
      </section>

      {/* ── APPLY POP-UP MODAL ────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="surface-card w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-line-strong shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-fg-3 hover:text-fg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {modalSuccessId ? (
              /* Success Confirmation inside Pop-Up */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-fg">
                  Application Received!
                </h3>
                <p className="text-sm text-fg-2 max-w-sm mx-auto leading-relaxed">
                  Your application for <strong className="text-fg">{selectedEvent.eventName}</strong> has been logged with the Secretariat Curatorial Board.
                </p>

                <div className="p-4 rounded-xl bg-surface-2 border border-line inline-block font-mono text-sm text-gold-text">
                  Application Ref: <span className="font-bold">{modalSuccessId}</span>
                </div>

                <p className="text-xs text-fg-3">
                  A confirmation has been recorded under your registered email ({user?.email}).
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
                  <span className="text-xs font-mono uppercase tracking-wider text-gold-text">AIMF Opportunity Application</span>
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
                  {/* Registered AIMF showcase selection */}
                  <div>
                    <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                      Applying Troupe / Creative Enterprise <span className="text-coral">*</span>
                    </label>
                    {accreditations.length > 0 ? (
                      <select
                        value={modalForm.aimfName}
                        onChange={(e) => {
                          const chosen = accreditations.find((s) => s.name === e.target.value) || {};
                          setModalForm((prev) => ({
                            ...prev,
                            aimfName: e.target.value,
                            aimfId: chosen.id || '',
                            portfolioLink: chosen.website || prev.portfolioLink,
                          }));
                        }}
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                        required
                      >
                        {accreditations.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.id})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={modalForm.aimfName}
                        onChange={(e) => setModalForm({ ...modalForm, aimfName: e.target.value })}
                        placeholder="e.g. Sangeet Academy / Fusion Troupe"
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                        required
                      />
                    )}
                  </div>

                  {/* Applicant Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                        Representative / Lead Artist <span className="text-coral">*</span>
                      </label>
                      <input
                        type="text"
                        value={modalForm.applicantName}
                        onChange={(e) => setModalForm({ ...modalForm, applicantName: e.target.value })}
                        placeholder="Lead Director / Artist Name"
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
                      <option value="Main-Stage Performing Arts (Classical / Folk Showcase)">Main-Stage Performing Arts (Classical / Folk Showcase)</option>
                      <option value="Bilateral Creative IP & Co-Production Pitch">Bilateral Creative IP &amp; Co-Production Pitch</option>
                      <option value="VIP Diplomatic Gala Dinner & Plenary Seating">VIP Diplomatic Gala Dinner &amp; Plenary Seating</option>
                      <option value="AIMF Cultural Pavilion Staging Pod Upgrade">AIMF Cultural Pavilion Staging Pod Upgrade</option>
                      <option value="Artisan Masterclass & Live Demonstration">Artisan Masterclass &amp; Live Demonstration</option>
                    </select>
                  </div>

                  {/* Genre / Category & Portfolio link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                        Artistic Genre / Medium
                      </label>
                      <select
                        value={modalForm.genreCategory}
                        onChange={(e) => setModalForm({ ...modalForm, genreCategory: e.target.value })}
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                      >
                        <option value="Classical / Folk Music & Dance">Classical / Folk Music &amp; Dance</option>
                        <option value="Visual Arts, Crafts & Textile Heritage">Visual Arts, Crafts &amp; Textile Heritage</option>
                        <option value="Digital Media, Animation, Gaming & VFX">Digital Media, Animation, Gaming &amp; VFX</option>
                        <option value="Film, Cinema & OTT Co-Production">Film, Cinema &amp; OTT Co-Production</option>
                        <option value="Haute Couture, Jewellery & Design">Haute Couture, Jewellery &amp; Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                        Portfolio / Video Showcase Link
                      </label>
                      <input
                        type="url"
                        value={modalForm.portfolioLink}
                        onChange={(e) => setModalForm({ ...modalForm, portfolioLink: e.target.value })}
                        placeholder="https://youtube.com/... or https://drive.google.com/..."
                        className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-line text-fg text-sm focus:outline-none focus:border-gold-foil"
                      />
                    </div>
                  </div>

                  {/* Specific Objectives / Requirements */}
                  <div>
                    <label className="block text-xs font-mono text-fg-3 uppercase tracking-wider mb-1">
                      Stage / AV Requirements or Matchmaking Objectives
                    </label>
                    <textarea
                      rows={2}
                      value={modalForm.objective}
                      onChange={(e) => setModalForm({ ...modalForm, objective: e.target.value })}
                      placeholder="e.g. 6 wireless lavalier microphones, 15x10m stage space, or looking to meet GCC cultural foundations and film co-producers."
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
            </div>
          </>
        )}
      </div>
    </SignInGate>
  );
}
