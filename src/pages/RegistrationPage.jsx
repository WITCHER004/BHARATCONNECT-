import { useState } from 'react';
import { ARAB_NATIONS, STRATEGIC_VERTICALS } from '../data/conclaveData';
import HolographicSummitPass from '../components/HolographicSummitPass';
import { Check, ArrowLeft, ArrowRight, Printer, RotateCcw, ShieldCheck } from 'lucide-react';
import SignInGate from '../auth/SignInGate';
import { submitRegistration } from '../data/registry';

const INITIAL_FORM = {
  role: 'Corporate Delegate',
  fullName: '',
  email: '',
  phone: '',
  organization: '',
  designation: '',
  country: 'United Arab Emirates',
  vertical: 'Clean Energy & Sustainability',
  interestedInB2B: true,
  requiresVisaLetter: true,
  dealSize: '$5M – $25M',
};

const ROLES = [
  {
    id: 'Corporate Delegate',
    title: 'Business leader or corporate executive',
    desc: 'All plenaries, sector sessions, B2B deal rooms and networking lunches',
  },
  {
    id: 'Sovereign Wealth / Investor',
    title: 'Sovereign wealth or institutional investor',
    desc: 'Closed-door sovereign fund roundtables and pre-matched investment rooms',
  },
  {
    id: 'Exhibitor Representative',
    title: 'Exhibitor or company representative',
    desc: 'Stall credentials, booth management and buyer matchmaking',
  },
  {
    id: 'Government / Diplomatic Official',
    title: 'Government or diplomatic official',
    desc: 'Protocol escort, diplomatic holding rooms and official bilateral seating',
  },
  {
    id: 'Accredited Media',
    title: 'Accredited media and press',
    desc: 'Press room, live feed and ministerial media briefings',
  },
];

const STEPS = [
  { num: 1, label: 'Role' },
  { num: 2, label: 'Details' },
  { num: 3, label: 'Matchmaking' },
];

const EXTRA_COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', note: 'Arab-British Chamber' },
  { code: 'DE', name: 'Germany', note: 'Arab-German Ghorfa' },
  { code: 'FR', name: 'France', note: 'Chambre Franco-Arabe' },
  { code: 'US', name: 'United States', note: 'NUSACC' },
];

const inputClass =
  'w-full h-11 px-3 rounded-[10px] bg-surface-3 border border-line text-sm text-fg placeholder:text-fg-3 transition-colors duration-150 focus:border-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60';

const labelClass = 'block text-sm text-fg-2 mb-2';

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export default function RegistrationPage({ defaultRole = 'Corporate Delegate' }) {
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedPassId, setGeneratedPassId] = useState('BMF.BC-DGO-•••••');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [formData, setFormData] = useState({ ...INITIAL_FORM, role: defaultRole });

  const update = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const getCountryCode = (countryName) => {
    if (countryName === 'India') return 'IN';
    const arab = ARAB_NATIONS.find((n) => n.name === countryName);
    if (arab) return arab.code;
    const extra = EXTRA_COUNTRIES.find((c) => c.name === countryName);
    return extra ? extra.code : '';
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!termsAgreed) {
        setSaveError('Please select "I Agree" to the terms to confirm and issue your badge.');
        return;
      }
      setSaving(true);
      setSaveError('');
      let passId;
      try {
        passId = await submitRegistration('delegate', {
        name: formData.fullName,
        email: formData.email,
        organisation: formData.organization,
        country: formData.country,
        detail: formData.role,
        sector: formData.vertical,
        designation: formData.designation,
        phone: formData.phone,
        dealSize: formData.dealSize,
        b2b: formData.interestedInB2B,
        visaLetter: formData.requiresVisaLetter,
        details: formData,
        });
      } catch {
        setSaveError('We could not save your registration. Check your connection and try again.');
        return;
      } finally {
        setSaving(false);
      }
      setGeneratedPassId(passId);
      setIsCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setIsCompleted(false);
    setStep(1);
    setFormData(INITIAL_FORM);
  };

  return (
    <div className="page-enter flex flex-col">

      {/* Page header */}
      <section className="pt-32 pb-12 sm:pt-40 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="ref-line mb-4">18-19 Dec 2026 / Palash Hall, 6F / Yashobhoomi, New Delhi</p>
          <h1 className="font-serif font-medium text-4xl sm:text-5xl md:text-6xl leading-[1.08] tracking-[-0.02em] text-fg max-w-3xl">
            Event registration
          </h1>
          <p className="mt-4 text-lg leading-[28px] text-fg-2 max-w-xl">
            Register your delegation, request a visa letter and reserve B2B deal-room slots. Your badge is drawn as you fill in the form.
          </p>
        </div>
      </section>

      {/* Form and badge */}
      <section className="theme-cream py-16 sm:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <SignInGate
            title="Sign in to register"
            reason="Event registration needs an account, so your badge, visa letter request and deal-room bookings are tied to you."
          >

          {!isCompleted ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

              {/* Form */}
              <div className="lg:col-span-7 surface-card rounded-2xl p-6 sm:p-8">

                {/* Stepper */}
                <ol className="flex items-center gap-6 pb-6 mb-8 border-b border-line">
                  {STEPS.map((s) => {
                    const isCurrent = step === s.num;
                    const isDone = step > s.num;
                    return (
                      <li key={s.num} className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono tabular-nums transition-colors duration-150 ${
                            isCurrent
                              ? 'bg-fg text-surface-0'
                              : isDone
                              ? 'bg-surface-3 text-fg-2'
                              : 'border border-line-strong text-fg-3'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : s.num}
                        </span>
                        <span className={`text-sm ${isCurrent ? 'text-fg font-medium' : 'text-fg-3'}`}>
                          {s.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <form onSubmit={handleNext}>

                  {/* Step 1: role */}
                  {step === 1 && (
                    <fieldset className="animate-fade-in">
                      <legend className="font-serif font-medium text-2xl text-fg">Your role at the conclave</legend>
                      <p className="mt-2 mb-6 text-sm text-fg-2">
                        Sets your access, deal-room booking rights and gala invitation
                      </p>

                      <div className="flex flex-col gap-2">
                        {ROLES.map((r) => {
                          const selected = formData.role === r.id;
                          return (
                            <label
                              key={r.id}
                              className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors duration-150 ${
                                selected
                                  ? 'bg-surface-3 border-line-strong shadow-sm'
                                  : 'bg-surface-2 border-line hover:bg-surface-3'
                              }`}
                            >
                              <input
                                type="radio"
                                name="role"
                                checked={selected}
                                onChange={() => update({ role: r.id })}
                                className="mt-0.5 w-4 h-4 accent-coral cursor-pointer"
                              />
                              <span>
                                <span className="block text-sm font-medium text-fg">{r.title}</span>
                                <span className="block mt-1 text-sm text-fg-3">{r.desc}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}

                  {/* Step 2: details */}
                  {step === 2 && (
                    <fieldset className="animate-fade-in">
                      <legend className="font-serif font-medium text-2xl text-fg">Personal and organisation details</legend>
                      <p className="mt-2 mb-6 text-sm text-fg-2">
                        These appear on your badge exactly as entered
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                        <Field label="Full name">
                          <input
                            type="text"
                            required
                            placeholder="Dr. Tariq Al-Mansoor"
                            value={formData.fullName}
                            onChange={(e) => update({ fullName: e.target.value })}
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Work email">
                          <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={(e) => update({ email: e.target.value })}
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Organisation or ministry">
                          <input
                            type="text"
                            required
                            placeholder="Emirates Investment Board"
                            value={formData.organization}
                            onChange={(e) => update({ organization: e.target.value })}
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Designation">
                          <input
                            type="text"
                            required
                            placeholder="Managing Director"
                            value={formData.designation}
                            onChange={(e) => update({ designation: e.target.value })}
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Country or national chamber">
                          <select
                            value={formData.country}
                            onChange={(e) => update({ country: e.target.value })}
                            className={`${inputClass} cursor-pointer`}
                          >
                            <option value="India">India</option>
                            {ARAB_NATIONS.map((n) => (
                              <option key={n.code} value={n.name}>
                                {n.name} · {n.region}
                              </option>
                            ))}
                            {EXTRA_COUNTRIES.map((c) => (
                              <option key={c.code} value={c.name}>
                                {c.name} · {c.note}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Phone, with country code">
                          <input
                            type="tel"
                            required
                            placeholder="+971 50 123 4567"
                            value={formData.phone}
                            onChange={(e) => update({ phone: e.target.value })}
                            className={`${inputClass} font-mono tabular-nums`}
                          />
                        </Field>
                      </div>
                    </fieldset>
                  )}

                  {/* Step 3: matchmaking */}
                  {step === 3 && (
                    <fieldset className="animate-fade-in">
                      <legend className="font-serif font-medium text-2xl text-fg">Sector and deal rooms</legend>
                      <p className="mt-2 mb-6 text-sm text-fg-2">
                        We pair you with ministers and buyers from the sector you choose
                      </p>

                      <p className={labelClass}>Primary sector</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {STRATEGIC_VERTICALS.map((vert) => {
                          const selected = formData.vertical === vert.title;
                          return (
                            <label
                              key={vert.id}
                              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors duration-150 ${
                                selected
                                  ? 'bg-surface-3 border-line-strong'
                                  : 'bg-surface-2 border-line hover:bg-surface-3'
                              }`}
                            >
                              <input
                                type="radio"
                                name="vertical"
                                checked={selected}
                                onChange={() => update({ vertical: vert.title })}
                                className="mt-0.5 w-4 h-4 accent-coral cursor-pointer"
                              />
                              <span>
                                <span className="block text-sm font-medium text-fg leading-5">{vert.title}</span>
                                <span className="block mt-1 ref-line">{vert.targetInvestment}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="mt-6 pt-6 border-t border-line flex flex-col gap-2">
                        <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-2 border border-line cursor-pointer hover:bg-surface-3 transition-colors duration-150">
                          <input
                            type="checkbox"
                            checked={formData.interestedInB2B}
                            onChange={(e) => update({ interestedInB2B: e.target.checked })}
                            className="mt-0.5 w-4 h-4 accent-coral"
                          />
                          <span>
                            <span className="block text-sm font-medium text-fg">Book pre-matched B2B and G2B deal rooms</span>
                            <span className="block mt-1 text-sm text-fg-3">
                              Two reserved slots in the 7,000 sq ft private lounge, Palash Hall
                            </span>
                          </span>
                        </label>

                        <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-2 border border-line cursor-pointer hover:bg-surface-3 transition-colors duration-150">
                          <input
                            type="checkbox"
                            checked={formData.requiresVisaLetter}
                            onChange={(e) => update({ requiresVisaLetter: e.target.checked })}
                            className="mt-0.5 w-4 h-4 accent-coral"
                          />
                          <span>
                            <span className="block text-sm font-medium text-fg">Request an Indian conference e-visa letter</span>
                            <span className="block mt-1 text-sm text-fg-3">
                              Issued by MEA and IACCIA within 48 hours of registration
                            </span>
                          </span>
                        </label>

                        {/* Delegate Terms Agreement Note */}
                        <div className="p-4 rounded-xl bg-surface-2 border border-line space-y-2 mt-2">
                          <div className="flex items-start gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-gold-text shrink-0 mt-0.5" />
                            <span className="text-xs text-fg-2 leading-relaxed">
                              <strong className="text-fg">Delegate Terms &amp; Security Protocol: </strong>
                              Passes are strictly non-transferable and subject to Yashobhoomi security screening. Admission requires presenting valid photo identification at Gate 3.
                            </span>
                          </div>
                          <div className="flex items-center gap-5 pt-1 border-t border-line/60">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-fg select-none">
                              <input
                                type="radio"
                                name="delegate-terms"
                                checked={termsAgreed === true}
                                onChange={() => {
                                  setTermsAgreed(true);
                                  setSaveError('');
                                }}
                                className="accent-gold-text w-3.5 h-3.5"
                              />
                              <span>I Agree</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-fg-3 hover:text-fg-2 select-none">
                              <input
                                type="radio"
                                name="delegate-terms"
                                checked={termsAgreed === false}
                                onChange={() => {
                                  setTermsAgreed(false);
                                  setSaveError('You must agree to the Conclave Terms to issue your badge.');
                                }}
                                className="accent-coral w-3.5 h-3.5"
                              />
                              <span>Disagree</span>
                            </label>
                          </div>
                          {!termsAgreed && (
                            <p className="text-[11px] text-coral pt-0.5">
                              You have selected "Disagree". Agreement to the terms is mandatory for summit pass issuance.
                            </p>
                          )}
                        </div>
                      </div>
                    </fieldset>
                  )}

                  {/* Actions */}
                  <div className="mt-8 pt-6 border-t border-line flex items-center justify-between gap-4">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="btn-secondary h-11 px-4 text-sm"
                      >
                        <ArrowLeft className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
                        Back
                      </button>
                    ) : (
                      <span className="ref-line">Step 1 of 3</span>
                    )}

                    {saveError && <p className="text-sm text-negative" role="alert">{saveError}</p>}
                    <button type="submit" disabled={saving} className="btn-primary h-11 px-5 text-sm">
                      {step === 3 ? (saving ? 'Issuing badge…' : 'Confirm and issue badge') : 'Continue'}
                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Live badge */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 flex justify-center lg:justify-start lg:pl-8">
                <HolographicSummitPass
                  name={formData.fullName || 'Your name'}
                  organization={formData.organization || 'Organisation'}
                  designation={formData.designation || 'Designation'}
                  country={formData.country}
                  flag={getCountryCode(formData.country)}
                  vertical={formData.vertical}
                  passId={generatedPassId}
                  role={formData.role}
                />
              </div>

            </div>
          ) : (

            /* Confirmation */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-fade-in">
              <div className="lg:col-span-6">
                <p className="ref-line mb-4">Registration confirmed · {generatedPassId}</p>
                <h2 className="font-serif font-medium text-3xl sm:text-4xl leading-[1.15] text-fg">
                  Your badge is issued
                </h2>
                <p className="mt-4 text-base leading-[26px] text-fg-2 max-w-md">
                  Confirmation details{formData.requiresVisaLetter ? ' and your visa letter' : ''} will be sent to{' '}
                  <span className="text-fg">{formData.email}</span>. Bring the printed badge or show it on your phone at the Palash Hall entrance.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button onClick={() => window.print()} className="btn-primary h-11 px-5 text-sm">
                    <Printer className="w-4 h-4" strokeWidth={1.5} />
                    Print badge
                  </button>
                  <button onClick={handleReset} className="btn-secondary h-11 px-4 text-sm">
                    <RotateCcw className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
                    Register another delegate
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 flex justify-center">
                <HolographicSummitPass
                  name={formData.fullName}
                  organization={formData.organization}
                  designation={formData.designation}
                  country={formData.country}
                  flag={getCountryCode(formData.country)}
                  vertical={formData.vertical}
                  passId={generatedPassId}
                  role={formData.role}
                />
              </div>
            </div>
          )}
          </SignInGate>

        </div>
      </section>
    </div>
  );
}
