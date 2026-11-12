import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ARAB_NATIONS, STRATEGIC_VERTICALS } from '../data/conclaveData';

const TIME_SLOTS = ['11:45–12:30', '14:00–14:45', '15:00–15:45', '16:00–16:45'];

const DAYS = [
  { value: 'Fri 18 Dec', label: 'Day 1 · Friday 18 December' },
  { value: 'Sat 19 Dec', label: 'Day 2 · Saturday 19 December' },
];

const FORMATS = [
  'B2B, company to company',
  'G2B, ministry to company',
  'Sovereign fund co-investment pitch',
  'Export supply and procurement offtake',
];

const fieldClass =
  'w-full h-11 px-3 rounded-[10px] bg-surface-3 border border-line text-sm text-fg placeholder:text-fg-3 outline-none transition-colors hover:border-line-strong focus:border-line-strong focus-visible:ring-2 focus-visible:ring-coral/60';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm text-fg-2 block mb-2">{label}</span>
      {children}
    </label>
  );
}

export default function BilateralMatchmakerModal({ isOpen, onClose }) {
  const [targetNation, setTargetNation] = useState('Saudi Arabia');
  const [selectedVertical, setSelectedVertical] = useState(STRATEGIC_VERTICALS[0]?.title || '');
  const [meetingFormat, setMeetingFormat] = useState(FORMATS[0]);
  const [preferredDay, setPreferredDay] = useState(DAYS[0].value);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [orgName, setOrgName] = useState('');
  const [repName, setRepName] = useState('');
  const [email, setEmail] = useState('');
  const [meetingConfirmed, setMeetingConfirmed] = useState(false);
  const [meetingId, setMeetingId] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    setMeetingId(`B2B-${Math.floor(100 + Math.random() * 900)}`);
    setMeetingConfirmed(true);
  };

  const handleReset = () => {
    setMeetingConfirmed(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && handleReset()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="matchmaker-title"
        className="w-full max-w-2xl bg-surface-2 border border-line rounded-2xl text-fg max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 h-16 border-b border-line flex items-center justify-between gap-4 shrink-0">
          <div>
            <h3 id="matchmaker-title" className="text-base font-medium text-fg leading-5">
              Book a private deal room
            </h3>
            <span className="ref-line">Zone D / B2B lounge / Palash Hall, 6F</span>
          </div>
          <button
            onClick={handleReset}
            aria-label="Close"
            className="w-9 h-9 rounded-lg text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!meetingConfirmed ? (
            <form onSubmit={handleConfirm} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Partner country">
                  <select value={targetNation} onChange={(e) => setTargetNation(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {ARAB_NATIONS.map((n) => (
                      <option key={n.code} value={n.name}>{n.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Sector">
                  <select value={selectedVertical} onChange={(e) => setSelectedVertical(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {STRATEGIC_VERTICALS.map((v) => (
                      <option key={v.id} value={v.title}>{v.title}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Meeting format">
                  <select value={meetingFormat} onChange={(e) => setMeetingFormat(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Day">
                  <select value={preferredDay} onChange={(e) => setPreferredDay(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <fieldset>
                <legend className="text-sm text-fg-2 mb-2">Time slot, IST</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const active = timeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setTimeSlot(slot)}
                        className={`h-10 rounded-lg border text-sm font-mono figure transition-colors cursor-pointer ${
                          active
                            ? 'bg-surface-4 border-coral text-fg'
                            : 'bg-surface-3 border-line text-fg-2 hover:border-line-strong hover:text-fg'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-line">
                <Field label="Organisation">
                  <input type="text" required placeholder="Company or ministry" value={orgName} onChange={(e) => setOrgName(e.target.value)} className={fieldClass} />
                </Field>
                <Field label="Representative">
                  <input type="text" required placeholder="Full name" value={repName} onChange={(e) => setRepName(e.target.value)} className={fieldClass} />
                </Field>
                <Field label="Email">
                  <input type="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
                </Field>
              </div>

              <p className="text-sm text-fg-3 leading-5">
                Each room is sound-isolated with a 6-seat table, Wi-Fi and beverage service. An Arabic-English interpreter is available on request.
              </p>

              <button type="submit" className="w-full btn-primary h-11 text-sm">
                Request this slot
              </button>
            </form>
          ) : (
            <div className="motion-safe:animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-positive">
                <Check className="w-4 h-4" strokeWidth={1.5} />
                <span>Room requested</span>
              </div>
              <h4 className="font-serif text-2xl font-medium text-fg mt-2">
                Your deal room is held
              </h4>
              <p className="text-sm text-fg-2 leading-6 mt-2 max-w-md">
                The IACCIA matchmaking secretariat will notify the commercial attaché of {targetNation} and send the confirmation to {email}.
              </p>

              <dl className="mt-6 rounded-xl bg-surface-3 border border-line divide-y divide-line text-sm">
                {[
                  ['Reference', <span className="font-mono text-coral-text">{meetingId}</span>],
                  ['Meeting with', `${targetNation} trade envoy`],
                  ['Sector', selectedVertical],
                  ['Format', meetingFormat],
                  ['When', <span className="font-mono figure">{preferredDay} · {timeSlot} IST</span>],
                  ['Where', 'B2B suite, Palash Hall, 6th floor, Yashobhoomi'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-3">
                    <dt className="text-fg-3 shrink-0">{k}</dt>
                    <dd className="text-fg text-right truncate">{v}</dd>
                  </div>
                ))}
              </dl>

              <button onClick={handleReset} className="mt-6 btn-secondary h-10 px-5 text-sm">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
