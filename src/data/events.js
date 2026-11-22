/*
  Bharat Connect events, shown to signed-in startups on the startup page.

  - Whether an event is upcoming, live or previous is worked out from `start` / `end` (IST).
  - Add past editions to EVENTS with their real dates; nothing is shown for "Previous events" until one exists.
  - `agenda` maps each date to a day in AGENDA_DATA (conclaveData.js), so the live panel can show
    the session running right now.
  - `updates` is the live feed during the event: newest first, `at` in IST.
    shortcut: edited in this file and published with a deploy; move to the database
    (an "updates" collection the admin panel writes) when Firebase is connected.
*/

export const EVENTS = [
  {
    id: 'bc-2026',
    name: 'Bharat Connect 2026',
    subtitle: 'Bharat-Arab Business Conclave',
    start: '2026-12-18T08:30:00+05:30',
    end: '2026-12-19T18:30:00+05:30',
    venue: 'Palash Hall (6th floor), Yashobhoomi (IICC), Dwarka, New Delhi',
    summary: 'Two days of ministerial plenaries, sector roundtables, B2B deal rooms and the Startup Pavilion, with delegations from India and 22 Arab countries.',
    startupNote: 'Registered startups are eligible for the Startup Pavilion and investor matchmaking.',
    agenda: { '2026-12-18': 'day1', '2026-12-19': 'day2' },
    updates: [
      // { at: '2026-12-18T09:35:00+05:30', text: 'Inaugural plenary is under way on the main stage.' },
    ],
  },
];

export function eventStatus(e, now = Date.now()) {
  if (now < Date.parse(e.start)) return 'upcoming';
  if (now > Date.parse(e.end)) return 'previous';
  return 'live';
}

// the event happening now, else the next one coming up
export function currentEvent(now = Date.now()) {
  const byStart = [...EVENTS].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  return byStart.find((e) => eventStatus(e, now) === 'live') || byStart.find((e) => eventStatus(e, now) === 'upcoming') || null;
}

// IST calendar date (YYYY-MM-DD) and minutes since midnight, whatever the visitor's own timezone
export function istParts(now = Date.now()) {
  const d = new Date(now + 5.5 * 3600000);
  return { date: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

const ics = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (s) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

// a calendar file with two alerts: one day before and one hour before
export function calendarFile(e) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bharat Connect//Events//EN', 'BEGIN:VEVENT',
    `UID:${e.id}@bharatconnect`, `DTSTAMP:${ics(new Date().toISOString())}`,
    `DTSTART:${ics(e.start)}`, `DTEND:${ics(e.end)}`,
    `SUMMARY:${icsText(`${e.name}: ${e.subtitle}`)}`, `LOCATION:${icsText(e.venue)}`, `DESCRIPTION:${icsText(e.summary)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Bharat Connect starts tomorrow', 'TRIGGER:-P1D', 'END:VALARM',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Bharat Connect starts in 1 hour', 'TRIGGER:-PT1H', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export function googleCalendarUrl(e) {
  const p = new URLSearchParams({
    action: 'TEMPLATE', text: `${e.name}: ${e.subtitle}`, dates: `${ics(e.start)}/${ics(e.end)}`, details: e.summary, location: e.venue,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
