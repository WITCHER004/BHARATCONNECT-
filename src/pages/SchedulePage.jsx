import { useState } from 'react';
import { AGENDA_DATA } from '../data/conclaveData';
import { Download, Bookmark, BookmarkCheck } from 'lucide-react';

const TRACKS = [
  'All tracks',
  'Plenary & Diplomacy',
  'Energy & Infrastructure',
  'Technology & AI',
  'Trade & Deal Rooms',
  'Healthcare & Agri',
  'Networking'
];

const DAYS = [
  { id: 'day1', label: 'Day 1', date: 'Fri 18 Dec', theme: 'Insights, dialogue and strategic partnerships' },
  { id: 'day2', label: 'Day 2', date: 'Sat 19 Dec', theme: 'Ideas to action and bilateral deal rooms' },
];

const formatTime = (time) => time.replace(/\s*-\s*/, '–');

export default function SchedulePage({ onNavigate, onOpenRegister }) {
  const [activeDay, setActiveDay] = useState('day1');
  const [activeTrack, setActiveTrack] = useState('All tracks');
  const [bookmarkedTitles, setBookmarkedTitles] = useState([]);

  const currentSchedule = AGENDA_DATA[activeDay].schedule;

  const filteredSessions = currentSchedule.filter((session) => {
    if (activeTrack === 'All tracks') return true;
    if (activeTrack === 'Networking') {
      return session.track.includes('Networking') || session.title.includes('Lunch') || session.title.includes('Gala');
    }
    return (
      session.track.toLowerCase().includes(activeTrack.toLowerCase()) ||
      (activeTrack === 'Energy & Infrastructure' &&
        (session.track.includes('Energy') || session.track.includes('Infrastructure')))
    );
  });

  const toggleBookmark = (title) => {
    if (bookmarkedTitles.includes(title)) {
      setBookmarkedTitles(bookmarkedTitles.filter(t => t !== title));
    } else {
      setBookmarkedTitles([...bookmarkedTitles, title]);
    }
  };

  const handleDownloadCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IACCIA//Bharat Connect 2026//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Bharat Connect 2026 (Bharat-Arab Business Conclave)
DESCRIPTION:Advancing Strategic Partnerships for a Resilient & Sustainable Economic Future | India & 22 Arab Countries.
LOCATION:Palash Hall (6th Floor), Yashobhoomi Convention Centre (IICC), New Delhi
DTSTART:20261218T033000Z
DTEND:20261219T133000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Bharat-Connect-2026-Schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeDayMeta = DAYS.find(d => d.id === activeDay);

  return (
    <div className="page-enter flex flex-col">

      {/* Page header */}
      <section className="pt-32 pb-12 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <p className="ref-line mb-4">18-19 Dec 2026 / Palash Hall, 6F / Yashobhoomi, New Delhi</p>
            <h1 className="font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em] mb-4">
              Programme
            </h1>
            <p className="text-[15px] sm:text-lg text-fg-2 max-w-2xl leading-relaxed">
              Ministerial plenaries, sector roundtables and G2B and B2B deal rooms over two days in New Delhi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {bookmarkedTitles.length > 0 && (
              <span className="ref-line flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4" strokeWidth={1.5} />
                {bookmarkedTitles.length} saved
              </span>
            )}
            <button
              onClick={handleDownloadCalendar}
              className="btn-secondary h-11 px-5 text-sm"
            >
              <Download className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
              Add to calendar (.ics)
            </button>
          </div>
        </div>
      </section>

      {/* Day switcher */}
      <section className="sticky top-[76px] sm:top-[88px] z-30 bg-surface-0/95 backdrop-blur-md border-b border-line shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2" role="tablist">
            {DAYS.map((day) => {
              const isActive = activeDay === day.id;
              return (
                <button
                  key={day.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveDay(day.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-left transition-colors duration-150 cursor-pointer min-h-[44px] flex flex-col justify-center ${
                    isActive
                      ? 'bg-surface-3 shadow-sm border border-gold-foil/30'
                      : 'hover:bg-surface-2'
                  }`}
                >
                  <span className={`block text-xs sm:text-sm font-semibold ${isActive ? 'text-fg' : 'text-fg-2'}`}>
                    {day.label}
                  </span>
                  <span className="block ref-line text-[10.5px] sm:text-xs">{day.date}</span>
                </button>
              );
            })}
          </div>

          <span className="hidden lg:block ref-line">08:30 to 22:30 IST / Palash Hall and Grand Ballroom</span>
        </div>
      </section>

      {/* Sessions */}
      <section className="theme-cream py-12 sm:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">

          <div className="mb-6 sm:mb-8">
            <h2 className="font-serif font-medium text-2xl sm:text-3xl text-fg mb-1">
              {activeDayMeta.theme}
            </h2>
            <p className="text-xs sm:text-sm text-fg-3">{AGENDA_DATA[activeDay].date}</p>
          </div>

          {/* Track filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-line -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none [-webkit-overflow-scrolling:touch]">
            <span className="text-xs sm:text-sm text-fg-3 shrink-0 pr-2 font-mono uppercase tracking-wider">Track:</span>
            {TRACKS.map((track) => {
              const isActive = activeTrack === track;
              return (
                <button
                  key={track}
                  onClick={() => setActiveTrack(track)}
                  aria-pressed={isActive}
                  className={`shrink-0 h-9 px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer select-none ${
                    isActive
                      ? 'bg-surface-3 text-gold-text border border-gold-foil/50 shadow-sm'
                      : 'text-fg-2 hover:text-fg hover:bg-surface-2 border border-line/60'
                  }`}
                >
                  {track}
                </button>
              );
            })}
          </div>

          {/* Timeline */}
          <ol className="flex flex-col">
            {filteredSessions.map((session, index) => {
              const isBookmarked = bookmarkedTitles.includes(session.title);

              return (
                <li
                  key={index}
                  className="grid grid-cols-1 lg:grid-cols-[200px_1fr_auto] gap-4 lg:gap-8 py-8 border-b border-line"
                >
                  {/* Time and place */}
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[15px] text-fg figure">{formatTime(session.time)}</span>
                    <span className="ref-line">{session.location}</span>
                  </div>

                  {/* Session */}
                  <div className="flex flex-col gap-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-fg-2 bg-surface-3 px-2 py-0.5 rounded-md">
                        {session.track}
                      </span>
                      {session.badge && (
                        <span className="text-xs text-coral-text">{session.badge}</span>
                      )}
                    </div>

                    <h3 className="font-serif font-medium text-lg sm:text-xl text-fg leading-snug">
                      {session.title}
                    </h3>

                    <p className="text-sm text-fg-2 leading-relaxed">
                      {session.description}
                    </p>

                    {session.speakers && session.speakers.length > 0 && (
                      <div className="pt-2">
                        <span className="block text-xs text-fg-3 mb-2">Chairs and panellists</span>
                        <ul className="flex flex-col gap-1">
                          {session.speakers.map((spk, i) => (
                            <li key={i} className="text-sm text-fg-2 flex items-start gap-2">
                              <span className="mt-2 w-1 h-1 rounded-full bg-fg-3 shrink-0" />
                              {spk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Save */}
                  <div className="flex lg:justify-end">
                    <button
                      onClick={() => toggleBookmark(session.title)}
                      aria-pressed={isBookmarked}
                      className={`h-9 px-3 rounded-lg text-sm flex items-center gap-2 border transition-colors duration-150 cursor-pointer ${
                        isBookmarked
                          ? 'bg-surface-3 text-fg border-line-strong'
                          : 'text-fg-2 border-line hover:bg-surface-2 hover:text-fg'
                      }`}
                      title={isBookmarked ? 'Saved to your programme' : 'Save session'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-coral-text" strokeWidth={1.5} />
                      ) : (
                        <Bookmark className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
                      )}
                      {isBookmarked ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>

          {filteredSessions.length === 0 && (
            <p className="py-12 text-sm text-fg-3">No sessions in this track on {activeDayMeta.label}</p>
          )}

          {/* Registration callout */}
          <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-surface-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
            <div>
              <h2 className="font-serif font-medium text-xl sm:text-2xl text-fg mb-2">
                Attend every plenary and deal room
              </h2>
              <p className="text-sm text-fg-2 max-w-2xl">
                Event registration covers both days, bilateral matchmaking, the official compendium and the Gala Dinner
              </p>
            </div>
            <button
              onClick={onOpenRegister}
              className="h-11 px-5 rounded-[10px] bg-fg text-surface-0 text-sm font-semibold shrink-0 whitespace-nowrap hover:opacity-90 active:scale-[0.98] transition-[opacity,transform] duration-150 cursor-pointer"
            >
              Register for the event
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
