import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { ARAB_NATIONS, STRATEGIC_VERTICALS } from '../data/conclaveData';

const inputClass =
  'w-full h-11 px-3 rounded-[10px] bg-surface-3 border border-line text-sm text-fg placeholder:text-fg-3 transition-colors duration-150 focus:border-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60';

const labelClass = 'block text-sm text-fg-2 mb-2';

const INITIAL_FORM = {
  name: '',
  email: '',
  organization: '',
  country: 'United Arab Emirates',
  vertical: 'Clean Energy & Sustainability',
};

export default function QuickRegisterModal({ isOpen, onClose, onNavigateToFullRegister }) {
  const [submitted, setSubmitted] = useState(false);
  const [passId, setPassId] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!isOpen) return null;

  const update = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setPassId(`BC-FT-${Math.floor(1000 + Math.random() * 9000)}`);
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-register-title"
        className="w-full max-w-lg bg-surface-2 border border-line rounded-2xl shadow-2xl animate-slide-up"
      >
        <div className="px-6 h-16 flex items-center justify-between border-b border-line">
          <div>
            <h3 id="quick-register-title" className="text-base font-medium text-fg leading-5">
              Quick delegate registration
            </h3>
            <p className="ref-line mt-1">18-19 Dec 2026 / Palash Hall, 6F</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-9 h-9 rounded-lg text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center transition-colors duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Tariq Al-Mansoor"
                  value={formData.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Work email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <label className={labelClass}>Organisation</label>
                  <input
                    type="text"
                    required
                    placeholder="Company or ministry"
                    value={formData.organization}
                    onChange={(e) => update({ organization: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => update({ country: e.target.value })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="India">India</option>
                    {ARAB_NATIONS.map((n) => (
                      <option key={n.code} value={n.name}>{n.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Sector</label>
                <select
                  value={formData.vertical}
                  onChange={(e) => update({ vertical: e.target.value })}
                  className={`${inputClass} cursor-pointer`}
                >
                  {STRATEGIC_VERTICALS.map((v) => (
                    <option key={v.id} value={v.title}>{v.title}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="mt-1 w-full btn-primary h-11 text-sm">
                Register
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <p className="text-sm text-fg-3 text-center">
                Need deal-room matchmaking or a visa letter?{' '}
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onNavigateToFullRegister();
                  }}
                  className="text-fg-2 underline underline-offset-4 decoration-line-strong hover:text-fg transition-colors cursor-pointer"
                >
                  Use full registration
                </button>
              </p>
            </form>
          ) : (
            <div className="animate-fade-in">
              <h4 className="font-serif font-medium text-2xl text-fg">You are registered</h4>
              <p className="mt-2 text-sm leading-[22px] text-fg-2">
                Your details are with the IACCIA secretariat. Your badge will be sent to{' '}
                <span className="text-fg">{formData.email}</span>.
              </p>

              <dl className="mt-6 rounded-xl bg-surface-3 border border-line divide-y divide-line text-sm">
                {[
                  ['Pass ID', passId, true],
                  ['Delegate', formData.name],
                  ['Organisation', formData.organization],
                  ['Country', formData.country],
                ].map(([k, v, mono]) => (
                  <div key={k} className="px-4 h-11 flex items-center justify-between gap-4">
                    <dt className="text-fg-3">{k}</dt>
                    <dd className={`text-fg truncate ${mono ? 'font-mono tabular-nums' : ''}`}>{v}</dd>
                  </div>
                ))}
              </dl>

              <button onClick={handleClose} className="mt-6 w-full btn-secondary h-11 text-sm">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
