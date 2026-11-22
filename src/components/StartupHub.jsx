import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BellRing, CalendarDays, CalendarPlus, CheckCircle2, Clock, MapPin, Radio, Rocket, XCircle,
} from 'lucide-react';
import { listRegistrations, subscribe } from '../data/registry';
import { AGENDA_DATA } from '../data/conclaveData';
import { EVENTS, eventStatus, currentEvent, istParts, calendarFile, googleCalendarUrl } from '../data/events';

/*
  What a signed-in visitor sees at the top of the startup page:
  their registered startup (or a way to register), the live panel for the current event,
  reminders for upcoming events, and Bharat Connect's upcoming and previous events.
*/

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
const startsIn = (iso, now) => {
  const days = Math.floor((Date.parse(iso) - now) / 86400000);
  return days >= 2 ? `in ${days} days` : days === 1 ? 'tomorrow' : 'within a day';
};
const eventDates = (e) => (fmtDate(e.start) === fmtDate(e.end) ? fmtDate(e.start) : `${fmtDate(e.start)} to ${fmtDate(e.end)}`);

const STATUS_VIEW = {
  pending: { label: 'Under review', Icon: Clock, cls: 'text-[#9A6B00] bg-[#FAB219]/15 border-[#FAB219]/40' },
  approved: { label: 'Approved', Icon: CheckCircle2, cls: 'text-[#0A7A0A] bg-[#0CA30C]/10 border-[#0CA30C]/35' },
  declined: { label: 'Declined', Icon: XCircle, cls: 'text-[#B02E2E] bg-[#D03B3B]/10 border-[#D03B3B]/35' },
};

function useNow(ms = 30000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

function myStartups(email) {
  const me = (email || '').toLowerCase();
  if (!me) return [];
  return listRegistrations().filter(
    (r) => r.type === 'startup' && [r.accountEmail, r.email].some((e) => (e || '').toLowerCase() === me),
  );
}

function downloadCalendar(e) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([calendarFile(e)], { type: 'text/calendar;charset=utf-8' }));
  a.download = `${e.id}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function ReminderButtons({ event }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => downloadCalendar(event)} className="btn-secondary h-9 px-3 text-sm">
        <CalendarPlus className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
        Add reminder to calendar
      </button>
      <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="btn-secondary h-9 px-3 text-sm">
        Google Calendar
      </a>
    </div>
  );
}

function Countdown({ to, now }) {
  const ms = Math.max(0, Date.parse(to) - now);
  const parts = [
    [Math.floor(ms / 86400000), 'days'],
    [Math.floor(ms / 3600000) % 24, 'hours'],
    [Math.floor(ms / 60000) % 60, 'min'],
  ];
  return (
    <div className="flex gap-3">
      {parts.map(([n, l]) => (
        <div key={l} className="min-w-[64px] px-3 py-2 rounded-xl bg-surface-3 border border-line text-center">
          <span className="block font-serif text-2xl text-fg tabular-nums">{String(n).padStart(2, '0')}</span>
          <span className="text-[11px] text-fg-3">{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 1. Your startup ───────────────────────────────── */

function YourStartup({ regs, event, now, onRegister, formOpen }) {
  if (!regs.length) {
    return (
      <div className="surface-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
        <span className="w-12 h-12 rounded-xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center shrink-0">
          <Rocket className="w-5 h-5 text-gold-text" strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-2xl text-fg">You haven't registered a startup yet</h2>
          <p className="mt-1 text-sm text-fg-2 leading-relaxed">
            Register once to get your Registration ID and become eligible for the Startup Pavilion and upcoming Bharat Connect events.
          </p>
        </div>
        {!formOpen && (
          <button type="button" onClick={onRegister} className="btn-primary h-11 px-5 text-sm shrink-0">
            Register your startup
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {regs.map((r) => {
        const s = STATUS_VIEW[r.status] || STATUS_VIEW.pending;
        const p = r.profile || {};
        return (
          <article key={r.id} className="surface-card rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-mono text-gold-text">{r.id}</p>
                <h2 className="mt-1 font-serif text-3xl text-fg leading-tight">{p.brand || r.organisation}</h2>
                {p.brand && r.organisation && p.brand !== r.organisation && <p className="mt-0.5 text-sm text-fg-3">{r.organisation}</p>}
              </div>
              <span className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-sm font-medium ${s.cls}`}>
                <s.Icon className="w-4 h-4" strokeWidth={1.75} />
                {s.label}
              </span>
            </div>

            <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm">
              <div><dt className="text-fg-3 text-xs">Founder</dt><dd className="mt-0.5 text-fg">{r.name || '—'}</dd></div>
              <div><dt className="text-fg-3 text-xs">Stage</dt><dd className="mt-0.5 text-fg">{p.stage || '—'}</dd></div>
              <div><dt className="text-fg-3 text-xs">Registered on</dt><dd className="mt-0.5 text-fg">{fmtDate(r.submittedAt)}</dd></div>
              <div><dt className="text-fg-3 text-xs">Valid until</dt><dd className="mt-0.5 text-fg">{fmtDate(new Date(Date.parse(r.submittedAt) + 2 * 365 * 86400000).toISOString())}</dd></div>
              {p.sectors?.length > 0 && (
                <div className="col-span-2 sm:col-span-4"><dt className="text-fg-3 text-xs">Sectors</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.sectors.map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-surface-3 border border-line text-xs text-fg-2">{t}</span>)}
                  </dd>
                </div>
              )}
              {p.pitch && <div className="col-span-2 sm:col-span-4"><dt className="text-fg-3 text-xs">Pitch</dt><dd className="mt-0.5 text-fg-2 leading-relaxed">{p.pitch}</dd></div>}
            </dl>

            {event && eventStatus(event, now) === 'upcoming' && (
              <div className="mt-6 p-4 rounded-xl bg-surface-3 border border-gold-foil/30 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <p className="text-sm text-fg flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-gold-text shrink-0" strokeWidth={1.5} />
                  {event.name} starts {startsIn(event.start, now)}. Set a reminder so you don't miss it.
                </p>
                <ReminderButtons event={event} />
              </div>
            )}
          </article>
        );
      })}
      {!formOpen && (
        <button type="button" onClick={onRegister} className="self-start text-sm text-fg-2 hover:text-fg underline underline-offset-4 cursor-pointer">
          Register another startup
        </button>
      )}
    </div>
  );
}

/* ── 2. Live panel ─────────────────────────────────── */

function LivePanel({ event, now }) {
  if (!event) return null;
  const status = eventStatus(event, now);
  const { date, minutes } = istParts(now);
  const day = AGENDA_DATA[event.agenda?.[date]];
  const toMin = (t) => { const [h, m] = t.trim().split(':').map(Number); return h * 60 + m; };
  const sessions = day?.schedule || [];
  const nowSession = sessions.find((s) => { const [a, b] = s.time.split('-'); return minutes >= toMin(a) && minutes < toMin(b); });
  const nextSession = sessions.find((s) => toMin(s.time.split('-')[0]) > minutes);

  return (
    <section className="surface-card rounded-2xl p-6 sm:p-8" aria-live="polite">
      <div className="flex items-center gap-2">
        {status === 'live' ? (
          <span className="inline-flex items-center gap-2 h-7 px-2.5 rounded-full bg-[#D03B3B] text-white text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-white motion-safe:animate-pulse" /> LIVE
          </span>
        ) : (
          <Radio className="w-4 h-4 text-gold-text" strokeWidth={1.5} />
        )}
        <h2 className="text-sm font-medium text-fg">Live updates · {event.name}</h2>
      </div>

      {status === 'upcoming' && (
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-fg-2 text-sm">Starts {fmtDate(event.start)} at {fmtTime(event.start)} IST. The running programme and announcements will appear here during the event.</p>
            <div className="mt-4"><Countdown to={event.start} now={now} /></div>
          </div>
          <ReminderButtons event={event} />
        </div>
      )}

      {status === 'live' && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            {nowSession ? (
              <div className="p-4 rounded-xl bg-surface-3 border border-gold-foil/40">
                <p className="text-xs text-gold-text font-mono">NOW · {nowSession.time}</p>
                <p className="mt-1 text-fg font-medium leading-snug">{nowSession.title}</p>
                <p className="mt-1 text-xs text-fg-3 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />{nowSession.location}</p>
              </div>
            ) : (
              <p className="text-sm text-fg-2">No session is running right now.</p>
            )}
            {nextSession && (
              <div className="p-4 rounded-xl border border-line">
                <p className="text-xs text-fg-3 font-mono">NEXT · {nextSession.time}</p>
                <p className="mt-1 text-sm text-fg leading-snug">{nextSession.title}</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xs font-medium text-fg-3">Announcements</h3>
            {event.updates.length ? (
              <ol className="mt-2 flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                {event.updates.map((u) => (
                  <li key={u.at + u.text} className="text-sm text-fg-2 leading-relaxed border-l-2 border-gold-foil/50 pl-3">
                    <span className="block text-xs font-mono text-fg-3">{fmtTime(u.at)}</span>
                    {u.text}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-fg-3">Announcements from the Secretariat will appear here.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ── 3. Events ─────────────────────────────────────── */

function EventCard({ e, status }) {
  return (
    <li className="surface-card rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-gold-text">{eventDates(e)}</span>
        {status === 'live' && <span className="text-[11px] font-semibold text-[#D03B3B]">● Live now</span>}
      </div>
      <h3 className="mt-2 font-serif text-xl text-fg leading-tight">{e.name}</h3>
      {e.subtitle && <p className="text-sm text-fg-3">{e.subtitle}</p>}
      <p className="mt-2 text-xs text-fg-3 flex items-start gap-1"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />{e.venue}</p>
      {e.summary && <p className="mt-3 text-sm text-fg-2 leading-relaxed">{e.summary}</p>}
      {status !== 'previous' && e.startupNote && <p className="mt-2 text-sm text-fg leading-relaxed">{e.startupNote}</p>}
      {status === 'upcoming' && <div className="mt-auto pt-4"><ReminderButtons event={e} /></div>}
    </li>
  );
}

function Events({ now }) {
  const withStatus = EVENTS.map((e) => ({ e, status: eventStatus(e, now) }));
  const upcoming = withStatus.filter((x) => x.status !== 'previous').sort((a, b) => Date.parse(a.e.start) - Date.parse(b.e.start));
  const previous = withStatus.filter((x) => x.status === 'previous').sort((a, b) => Date.parse(b.e.start) - Date.parse(a.e.start));

  return (
    <section>
      <h2 className="font-serif text-2xl text-fg flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-gold-text" strokeWidth={1.5} /> Bharat Connect events
      </h2>
      <h3 className="mt-5 text-xs font-medium text-fg-3">Upcoming</h3>
      {upcoming.length ? (
        <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">{upcoming.map((x) => <EventCard key={x.e.id} {...x} />)}</ul>
      ) : (
        <p className="mt-2 text-sm text-fg-3">New events will be announced here.</p>
      )}
      {previous.length > 0 && (
        <>
          <h3 className="mt-8 text-xs font-medium text-fg-3">Previous events and summits</h3>
          <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">{previous.map((x) => <EventCard key={x.e.id} {...x} />)}</ul>
        </>
      )}
    </section>
  );
}

export default function StartupHub({ email, onRegister, formOpen, refreshKey }) {
  const now = useNow();
  const [version, setVersion] = useState(0);
  useEffect(() => subscribe(() => setVersion((v) => v + 1)), []);
  const regs = useMemo(() => myStartups(email), [email, version, refreshKey]);
  const event = currentEvent(now);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-8 mb-12">
      <YourStartup regs={regs} event={event} now={now} onRegister={onRegister} formOpen={formOpen} />
      <LivePanel event={event} now={now} />
      <Events now={now} />
    </div>
  );
}
