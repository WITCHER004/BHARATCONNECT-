import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Music, 
  Globe2, 
  Sparkles, 
  Film, 
  Compass, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink,
  Award,
  Mic2,
  Tv,
  Palette,
  Check,
  Copy,
  FileText,
  Clock,
  Printer,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { 
  ORGANISER, 
  EVENT, 
  DOCUMENTS, 
  DESIGNATIONS, 
  ENTITY_TYPES, 
  COUNTRIES, 
  SECTORS, 
  PARTICIPATION_TRACKS, 
  REPRESENTATION_STATUS, 
  HEARD_FROM, 
  TERMS_TEXT, 
  DECLARATION_AUTHORITY, 
  DECLARATION_DATA, 
  VALIDATION,
  TERMS_URL 
} from '../data/aimfForm';
import SignInGate from '../auth/SignInGate';
import ApplicationGate from '../components/ApplicationGate';
import { useAuth } from '../auth/AuthContext';
import AimfHub from '../components/AimfHub';
import { submitRegistration } from '../data/registry';

const DRAFT_KEY = 'bc-aimf-draft';
const ICON = { className: 'w-4 h-4', strokeWidth: 1.5 };

const STEPS = [
  { id: 'event', label: 'The event' },
  { id: 'founder', label: 'Applicant details' },
  { id: 'startup', label: 'Entity & showcase' },
  { id: 'legal', label: 'Accreditation' },
  { id: 'pitch', label: 'Showcase materials' },
  { id: 'terms', label: 'Guidelines & terms' },
  { id: 'declaration', label: 'Declaration' },
  { id: 'review', label: 'Review and submit' },
];

const EMPTY = {
  email: '',
  fullName: '', designation: '', designationOther: '', commEmail: '', phone: '', address: '',
  entityName: '', brandNames: '', entityType: '', country: 'India', incorporationDate: '', sectors: [], sectorOther: '',
  track: '', website: '', pitch: '', description: '',
  pan: '', regNumber: '', representationStatus: '', ministryEndorsement: '',
  pitchDeck: '', demoVideo: '', productImages: '', ipHeld: '', ipDetails: '',
  terms: false,
  declAuthority: false, declData: false, heardFrom: '',
};

const today = () => new Date().toISOString().slice(0, 10);
const words = (s) => (s?.trim() ? s.trim().split(/\s+/).length : 0);

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

/* ── validation, per step ───────────────────────────── */

function validateStep(stepIndex, v) {
  const e = {};
  const req = (k, msg = 'This field is required') => { if (!String(v[k] ?? '').trim()) e[k] = msg; };
  const url = (k) => { if (v[k]?.trim() && !VALIDATION.url.test(v[k].trim())) e[k] = 'Please enter a valid link starting with https://'; };

  switch (STEPS[stepIndex].id) {
    case 'event':
      req('email');
      if (v.email && !VALIDATION.email.test(v.email.trim())) e.email = 'Please enter a valid email address';
      break;
    case 'founder':
      req('fullName');
      req('designation', 'Please choose a designation');
      if (v.designation === '__other' && !v.designationOther?.trim()) e.designationOther = 'Please enter your designation';
      req('commEmail');
      if (v.commEmail && !VALIDATION.email.test(v.commEmail.trim())) e.commEmail = 'Please enter a valid email address';
      req('phone');
      if (v.phone && !VALIDATION.phone.test(v.phone.trim())) e.phone = 'Please enter a valid phone number';
      req('address');
      break;
    case 'startup':
      req('entityName', 'Please enter your cultural entity or troupe name');
      req('brandNames', 'Please enter your brand or performing name');
      req('entityType', 'Please choose the type of organization');
      req('country', 'Please choose your country of origin');
      if (!v.sectors?.length) e.sectors = 'Please choose at least one creative sector';
      if (v.sectors?.includes('__other') && !v.sectorOther?.trim()) e.sectorOther = 'Please describe your sector';
      req('track', 'Please choose your participation track');
      url('website');
      req('description');
      if (v.description?.length > VALIDATION.descriptionMaxChars) e.description = 'Your description is too long. Please shorten it';
      break;
    case 'legal':
      req('pan', 'Please enter your registration, Tax ID, or PAN number');
      req('representationStatus', 'Please choose your representation status');
      break;
    case 'pitch':
      url('pitchDeck');
      url('demoVideo');
      url('productImages');
      req('ipHeld', 'Please choose an option');
      break;
    case 'terms':
      if (!v.terms) e.terms = 'Please accept the participation guidelines to continue';
      break;
    case 'declaration':
      if (!v.declAuthority) e.declAuthority = 'This declaration is mandatory';
      if (!v.declData) e.declData = 'This declaration is mandatory';
      break;
    default:
  }
  return e;
}

/* ── input wrappers ─────────────────────────────────── */

const inputCls = (err) =>
  `w-full h-11 px-3 rounded-[10px] bg-surface-2 border text-[15px] text-fg placeholder:text-fg-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 ${
    err ? 'border-negative' : 'border-line-strong hover:border-fg-3'
  }`;

function Field({ id, label, hint, required, error, children, counter }) {
  return (
    <div data-field={id}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="block text-sm font-medium text-fg">
          {label}
          {required ? <span className="text-coral-text"> *</span> : <span className="text-fg-3 font-normal"> (optional)</span>}
        </label>
        {counter}
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-fg-2">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && <p id={`${id}-err`} className="mt-2 text-sm text-negative" role="alert">{error}</p>}
    </div>
  );
}

function described(id, hint, error) {
  return [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
}

function Text({ id, label, hint, required, value, onChange, error, type = 'text', ...rest }) {
  return (
    <Field id={id} label={label} hint={hint} required={required} error={error}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={described(id, hint, error)}
        className={inputCls(error)}
        {...rest}
      />
    </Field>
  );
}

function Area({ id, label, hint, required, value, onChange, error, rows = 4, counter, ...rest }) {
  return (
    <Field id={id} label={label} hint={hint} required={required} error={error} counter={counter}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={described(id, hint, error)}
        className={`${inputCls(error)} h-auto py-3 leading-relaxed resize-y`}
        {...rest}
      />
    </Field>
  );
}

function Choice({ id, label, hint, required, options, value, onChange, error, columns = 2, other }) {
  return (
    <fieldset data-field={id}>
      <legend className="text-sm font-medium text-fg">
        {label}
        {required ? <span className="text-coral-text"> *</span> : <span className="text-fg-3 font-normal"> (optional)</span>}
      </legend>
      {hint && <p className="mt-1 text-sm text-fg-2">{hint}</p>}
      <div className={`mt-3 grid grid-cols-1 ${columns === 3 ? 'sm:grid-cols-3' : columns === 2 ? 'sm:grid-cols-2' : ''} gap-2`}>
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const text = typeof opt === 'string' ? opt : opt.label;
          const on = value === val;
          return (
            <label
              key={val}
              className={`min-h-11 px-3 py-2 rounded-[10px] border flex items-center gap-3 text-[15px] cursor-pointer transition-colors ${
                on ? 'bg-surface-3 border-fg text-fg' : 'bg-surface-2 border-line-strong text-fg hover:border-fg-3'
              }`}
            >
              <input type="radio" name={id} value={val} checked={on} onChange={() => onChange(val)} className="accent-teal-deep w-4 h-4" />
              {text}
            </label>
          );
        })}
      </div>
      {other}
      {error && <p className="mt-2 text-sm text-negative" role="alert">{error}</p>}
    </fieldset>
  );
}

function Agree({ id, label, checked, onChange, error, children }) {
  return (
    <div data-field={id}>
      {label && <p className="text-sm font-medium text-fg mb-3">{label}<span className="text-coral-text"> *</span></p>}
      <label
        className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
          checked ? 'bg-surface-3 border-fg' : error ? 'bg-surface-2 border-negative' : 'bg-surface-2 border-line-strong hover:border-fg-3'
        }`}
      >
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-teal-deep w-4 h-4 mt-1 shrink-0" />
        <span className="text-[15px] text-fg leading-relaxed">{children}</span>
      </label>
      {error && <p className="mt-2 text-sm text-negative" role="alert">{error}</p>}
    </div>
  );
}

function StepTitle({ title, intro }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">{title}</h2>
      {intro && <p className="mt-3 text-[15px] text-fg-2 leading-relaxed max-w-2xl">{intro}</p>}
    </div>
  );
}

/* ── MAIN AIMF REGISTRATION PORTAL COMPONENT ─────────── */

export default function AimfRegistrationPage({ onNavigate, onOpenRegister }) {
  const { user } = useAuth();

  // Form State
  const [formOpen, setFormOpen] = useState(true);
  const [values, setValues] = useState(() => loadDraft() ?? EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [assignedId, setAssignedId] = useState(() => {
    try {
      return localStorage.getItem('bc-aimf-last-id') || '';
    } catch {
      return '';
    }
  });
  const [copiedId, setCopiedId] = useState(false);
  const formRef = useRef(null);

  const copyId = async (idText) => {
    try {
      await navigator.clipboard.writeText(idText);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  const set = (k) => (val) => {
    setValues((v) => ({ ...v, [k]: val }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  // Save progress as they type
  useEffect(() => {
    if (status === 'sent') return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)); } catch { /* storage unavailable */ }
  }, [values, status]);

  // Carry first email into communication email
  useEffect(() => {
    if (step === 1 && !values.commEmail && values.email) {
      setValues((v) => ({ ...v, commEmail: v.email }));
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (i) => {
    setStep(i);
    setErrors({});
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const next = () => {
    const e = validateStep(step, values);
    if (Object.keys(e).length) {
      setErrors(e);
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector(`[data-field="${Object.keys(e)[0]}"]`);
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first?.querySelector('input, textarea, select')?.focus({ preventScroll: true });
      });
      return;
    }
    goTo(Math.min(step + 1, STEPS.length - 1));
  };

  const reachable = useMemo(() => {
    let i = 0;
    while (i < STEPS.length - 1 && !Object.keys(validateStep(i, values)).length) i++;
    return i;
  }, [values]);

  const submit = async () => {
    for (let i = 0; i < STEPS.length - 1; i++) {
      const e = validateStep(i, values);
      if (Object.keys(e).length) { setStep(i); setErrors(e); return; }
    }
    setStatus('sending');
    const sectors = values.sectors.map((s) => (s === '__other' && values.sectorOther ? values.sectorOther : s));
    let uniqueId;
    try {
      uniqueId = await submitRegistration('aimf', {
        name: values.fullName,
        email: values.commEmail || values.email,
        organisation: values.entityName || values.brandNames,
        country: values.country || 'India',
        detail: values.brandNames ? `Showcase: ${values.brandNames} · ${values.track || 'AIMF'}` : 'AIMF Cultural Accreditation',
        sector: sectors.join(', '),
        phone: values.phone,
        payment: 'Complimentary Accreditation · ₹0 (No Fee)',
        profile: {
          brand: values.brandNames || values.entityName,
          sectors,
          track: values.track,
          country: values.country,
          website: values.website,
          pitch: values.pitch,
        },
        details: values,
      });
    } catch {
      setStatus('failed');
      return;
    }

    setAssignedId(uniqueId);
    try { localStorage.setItem('bc-aimf-last-id', uniqueId); } catch { /* storage unavailable */ }
    setStatus('sent');
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ }
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const clearForm = () => {
    if (!window.confirm('Clear every response in this AIMF application?')) return;
    setValues(EMPTY);
    setErrors({});
    setStep(0);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ }
  };

  const v = values;
  const descWords = words(v.description);

  /* ── Form Step Bodies (Payment completely omitted) ── */

  const renderStepBody = () => {
    switch (STEPS[step].id) {
      case 'event':
        return (
          <>
            <StepTitle title="The upcoming event" intro={EVENT.byline} />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-5 surface-card rounded-2xl p-6 border border-line-strong">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface-3 text-gold-text border border-gold-foil/30">
                    Complimentary Accreditation · No Payment
                  </span>
                  <span className="text-xs font-mono text-fg-3">Hall 4 & Grand Auditorium</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-fg leading-snug">{EVENT.title}</h3>
                <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><dt className="text-fg-3">Venue</dt><dd className="mt-1 text-fg">{EVENT.venue}</dd></div>
                  <div><dt className="text-fg-3">Dates</dt><dd className="mt-1 text-fg">{EVENT.dates}</dd></div>
                  <div><dt className="text-fg-3">Where</dt><dd className="mt-1 text-fg">{EVENT.pavilion}</dd></div>
                  <div><dt className="text-fg-3">Admission</dt><dd className="mt-1 text-gold-text font-semibold">{EVENT.admission}</dd></div>
                </dl>
                <p className="mt-6 text-sm text-fg-2 leading-relaxed border-t border-line/60 pt-4">
                  Accredited artists, cultural troupes, and creative delegations receive access badges for plenary sessions, auditorium galas, and bilateral deal rooms at Yashobhoomi, New Delhi.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-sm font-medium text-fg">Keep these ready</h3>
            <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENTS.map((d, i) => (
                <li key={d.title} className="surface-card rounded-xl p-4 flex gap-3 border border-line">
                  <span className="ref-line text-gold-text pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="block text-[15px] text-fg font-medium">{d.title}</span>
                    <span className="block mt-1 text-sm text-fg-2">{d.text}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 max-w-md">
              <Text id="email" label="Email" required type="email" autoComplete="email" placeholder="you@cultural-corridor.com"
                hint="Your official email address" value={v.email} onChange={set('email')} error={errors.email} />
            </div>
          </>
        );

      case 'founder':
        return (
          <>
            <StepTitle title="Applicant & lead delegate details" intro="Please provide details of the lead artist, artistic director, or authorized representative submitting this application." />
            <div className="grid grid-cols-1 gap-6">
              <Text id="fullName" label="Full name" required autoComplete="name" value={v.fullName} onChange={set('fullName')} error={errors.fullName} />
              <Choice
                id="designation" label="Designation / Role" required columns={2}
                options={[...DESIGNATIONS, { value: '__other', label: 'Other' }]}
                value={v.designation} onChange={set('designation')} error={errors.designation}
                other={v.designation === '__other' && (
                  <div className="mt-3 max-w-md">
                    <input aria-label="Your designation" value={v.designationOther} onChange={(e) => set('designationOther')(e.target.value)}
                      placeholder="Your role / designation" className={inputCls(errors.designationOther)} />
                    {errors.designationOther && <p className="mt-2 text-sm text-negative">{errors.designationOther}</p>}
                  </div>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Text id="commEmail" label="Email address for communication" required type="email" autoComplete="email"
                  hint="Your official Accreditation ID [BC.AIMF-numbers] and passes will be sent here"
                  value={v.commEmail} onChange={set('commEmail')} error={errors.commEmail} />
                <Text id="phone" label="Phone / WhatsApp number" required type="tel" autoComplete="tel" placeholder="+91 98765 43210"
                  hint="Include the international country code" value={v.phone} onChange={set('phone')} error={errors.phone} />
              </div>
              <Area id="address" label="Official address" required rows={3} autoComplete="street-address"
                hint="Complete address of your cultural body, troupe, or organization"
                value={v.address} onChange={set('address')} error={errors.address} />
            </div>
          </>
        );

      case 'startup':
        return (
          <>
            <StepTitle title="Cultural entity & showcase details" intro="Describe your troupe, production house, artistic studio, or cultural enterprise." />
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Text id="entityName" label="Cultural entity / Organisation / Troupe name" required
                  hint="Official or registered name of your organization or ensemble"
                  value={v.entityName} onChange={set('entityName')} error={errors.entityName} />
                <Text id="brandNames" label="Performing name / Brand / Title of showcase" required
                  hint="Stage name, project title, or brand under this entity"
                  value={v.brandNames} onChange={set('brandNames')} error={errors.brandNames} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field id="entityType" label="Type of entity" required error={errors.entityType}>
                  <select id="entityType" value={v.entityType} onChange={(e) => set('entityType')(e.target.value)}
                    aria-invalid={!!errors.entityType} className={`${inputCls(errors.entityType)} cursor-pointer`}>
                    <option value="">Choose organization type</option>
                    {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field id="country" label="Country of origin / Delegation corridor" required error={errors.country}>
                  <select id="country" value={v.country} onChange={(e) => set('country')(e.target.value)}
                    aria-invalid={!!errors.country} className={`${inputCls(errors.country)} cursor-pointer`}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <fieldset data-field="sectors">
                <legend className="text-sm font-medium text-fg">Creative sector / Art discipline<span className="text-coral-text"> *</span></legend>
                <p className="mt-1 text-sm text-fg-2">Tick all that apply to your showcase</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[...SECTORS, { value: '__other', label: 'Other' }].map((s) => {
                    const on = v.sectors?.includes(s.value);
                    return (
                      <label key={s.value} className={`min-h-11 px-3 py-2 rounded-[10px] border flex items-start gap-3 cursor-pointer transition-colors ${
                        on ? 'bg-surface-3 border-fg' : 'bg-surface-2 border-line-strong hover:border-fg-3'}`}>
                        <input type="checkbox" checked={on} className="accent-teal-deep w-4 h-4 mt-1 shrink-0"
                          onChange={() => set('sectors')(on ? v.sectors.filter((x) => x !== s.value) : [...(v.sectors || []), s.value])} />
                        <span>
                          <span className="block text-[15px] text-fg">{s.label}</span>
                          {s.hint && <span className="block text-sm text-fg-2">{s.hint}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {v.sectors?.includes('__other') && (
                  <div className="mt-3 max-w-md" data-field="sectorOther">
                    <input aria-label="Other sector" value={v.sectorOther} onChange={(e) => set('sectorOther')(e.target.value)}
                      placeholder="Describe your creative discipline" className={inputCls(errors.sectorOther)} />
                    {errors.sectorOther && <p className="mt-2 text-sm text-negative">{errors.sectorOther}</p>}
                  </div>
                )}
                {errors.sectors && <p className="mt-2 text-sm text-negative" role="alert">{errors.sectors}</p>}
              </fieldset>

              <Choice id="track" label="Preferred showcase format / Participation track" required columns={2} options={PARTICIPATION_TRACKS}
                value={v.track} onChange={set('track')} error={errors.track} />

              <Text id="website" label="Website / Portfolio / Social handle" type="url" placeholder="https://"
                value={v.website} onChange={set('website')} error={errors.website} />
              
              <Text id="pitch" label="One-line elevator summary"
                hint="Summarize your artistic showcase, performance, or bilateral co-production project in one clear sentence"
                value={v.pitch} onChange={set('pitch')} error={errors.pitch} />

              <Area
                id="description" label="Detailed showcase description (50 to 100 words)" required rows={5}
                maxLength={VALIDATION.descriptionMaxChars}
                hint="Describe the historical themes, performance lineup, technical requirements, or bilateral co-production objectives"
                value={v.description} onChange={set('description')} error={errors.description}
                counter={
                  <span className={`font-mono text-xs figure ${descWords && (descWords < 40 || descWords > 120) ? 'text-coral-text' : 'text-fg-3'}`}>
                    {descWords} words · {v.description?.length || 0}/{VALIDATION.descriptionMaxChars}
                  </span>
                }
              />
            </div>
          </>
        );

      case 'legal':
        return (
          <>
            <StepTitle
              title="Accreditation & institutional profile"
              intro="This information is used to authenticate your cultural or sovereign representation and facilitate protocol access at Yashobhoomi."
            />
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Text id="pan" label="PAN / Tax ID / Passport / Registration number" required
                  hint="Official ID of entity or lead delegate"
                  className={`${inputCls(errors.pan)} font-mono uppercase`}
                  value={v.pan} onChange={(x) => set('pan')(x.toUpperCase())} error={errors.pan} />
                <Text id="regNumber" label="CIN / NGO Darpan / Society / License number"
                  hint="Leave blank if registering as an independent artist"
                  className={`${inputCls(errors.regNumber)} font-mono`}
                  value={v.regNumber} onChange={set('regNumber')} error={errors.regNumber} />
              </div>

              <Choice id="representationStatus" label="Representation status" required columns={3} options={REPRESENTATION_STATUS}
                value={v.representationStatus} onChange={set('representationStatus')} error={errors.representationStatus} />

              <Text id="ministryEndorsement" label="Government or institutional affiliation (if any)"
                hint="E.g., Ministry of Culture, ICCR, Embassy of UAE/Saudi Arabia/Egypt, Film Commission"
                value={v.ministryEndorsement} onChange={set('ministryEndorsement')} error={errors.ministryEndorsement} />
            </div>
          </>
        );

      case 'pitch':
        return (
          <>
            <StepTitle title="Showcase materials & media links" intro="These assist the curatorial committee in scheduling performances and pavilion placements. For cloud links, set sharing to 'Anyone with the link can view'." />
            <div className="grid grid-cols-1 gap-6">
              <Text id="pitchDeck" label="Portfolio deck / Lookbook / Project profile (Google Drive link)" type="url" placeholder="https://drive.google.com/…"
                value={v.pitchDeck} onChange={set('pitchDeck')} error={errors.pitchDeck} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Text id="demoVideo" label="Showreel / Performance video link" type="url" placeholder="https://" hint="YouTube, Vimeo, Google Drive or similar link"
                  value={v.demoVideo} onChange={set('demoVideo')} error={errors.demoVideo} />
                <Text id="productImages" label="High-res photos / Artwork / Prototype images (Google Drive link)" type="url" placeholder="https://drive.google.com/…"
                  value={v.productImages} onChange={set('productImages')} error={errors.productImages} />
              </div>
              <Choice id="ipHeld" label="Original music, script, patent or performance copyright held" required columns={2} options={['Yes', 'No']}
                value={v.ipHeld} onChange={set('ipHeld')} error={errors.ipHeld} />
              {v.ipHeld === 'Yes' && (
                <div className="animate-fade-in">
                  <Area id="ipDetails" label="Brief copyright / IP details" rows={3}
                    hint="For example: original compositions registered with IPRS, theatrical copyright, trademark"
                    value={v.ipDetails} onChange={set('ipDetails')} error={errors.ipDetails} />
                </div>
              )}
            </div>
          </>
        );

      case 'terms':
        return (
          <>
            <StepTitle title="Participation guidelines & terms" intro="Please review the official AIMF Guidelines of Bharat Mahotsav Festivals LLP & IACCIA Secretariat." />
            <a href={TERMS_URL} target="_blank" rel="noopener noreferrer"
              className="surface-card rounded-xl p-4 flex items-center gap-4 max-w-xl hover:border-line-strong transition-colors border border-line">
              <FileText {...ICON} className="w-5 h-5 text-gold-text shrink-0" strokeWidth={1.5} />
              <span className="flex-1">
                <span className="block text-[15px] text-fg font-medium">AIMF Registration & Protocol Guidelines</span>
                <span className="block text-sm text-fg-2">{ORGANISER.name} · opens PDF</span>
              </span>
              <ExternalLink {...ICON} className="w-4 h-4 text-fg-3" />
            </a>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              <li className="surface-card rounded-xl p-4 border border-line">
                <span className="block text-xs font-mono uppercase tracking-wider text-fg-3">Accreditation</span>
                <span className="block mt-1 font-semibold text-gold-text">Complimentary (₹0 Fee)</span>
              </li>
              <li className="surface-card rounded-xl p-4 border border-line">
                <span className="block text-xs font-mono uppercase tracking-wider text-fg-3">Valid For</span>
                <span className="block mt-1 text-fg">18–19 Dec 2026</span>
              </li>
              <li className="surface-card rounded-xl p-4 border border-line">
                <span className="block text-xs font-mono uppercase tracking-wider text-fg-3">Venue Access</span>
                <span className="block mt-1 text-fg">Pavilion & Grand Auditorium</span>
              </li>
            </ul>

            <div className="mt-8">
              <Agree id="terms" label="Acceptance of guidelines" checked={v.terms} onChange={set('terms')} error={errors.terms}>
                {TERMS_TEXT}
              </Agree>
            </div>
          </>
        );

      case 'declaration':
        return (
          <>
            <StepTitle title="Declaration" intro="Both declarations below are mandatory for official accreditation." />
            <div className="grid grid-cols-1 gap-6">
              <Agree id="declAuthority" label="Authority & authenticity" checked={v.declAuthority} onChange={set('declAuthority')} error={errors.declAuthority}>
                {DECLARATION_AUTHORITY}
              </Agree>
              <Agree id="declData" label="Data and delegation communications" checked={v.declData} onChange={set('declData')} error={errors.declData}>
                {DECLARATION_DATA}
              </Agree>
              <Choice id="heardFrom" label="How did you hear about the Atal Innovation Multilateral Forum?" columns={3} options={HEARD_FROM}
                value={v.heardFrom} onChange={set('heardFrom')} />
            </div>
          </>
        );

      case 'review': {
        const designation = v.designation === '__other' ? v.designationOther : v.designation;
        const sectors = v.sectors?.map((s) => (s === '__other' ? v.sectorOther : SECTORS.find((x) => x.value === s)?.label ?? s));
        const groups = [
          { step: 0, title: 'Contact', rows: [['Email', v.email]] },
          { step: 1, title: 'Lead Delegate', rows: [['Name', v.fullName], ['Designation', designation], ['Email for communication', v.commEmail], ['Phone', v.phone], ['Address', v.address]] },
          { step: 2, title: 'Cultural Entity & Showcase', rows: [['Entity name', v.entityName], ['Showcase title', v.brandNames], ['Type', v.entityType], ['Origin country', v.country], ['Creative sectors', sectors?.join(', ')], ['Track', v.track], ['Website', v.website], ['Pitch', v.pitch], ['Description', v.description]] },
          { step: 3, title: 'Accreditation', rows: [['Registration / ID', v.pan], ['CIN / NGO number', v.regNumber], ['Status', v.representationStatus], ['Affiliation', v.ministryEndorsement]] },
          { step: 4, title: 'Materials & Media', rows: [['Deck / Profile', v.pitchDeck], ['Showreel video', v.demoVideo], ['Images', v.productImages], ['IP held', v.ipHeld], ['IP details', v.ipHeld === 'Yes' ? v.ipDetails : '']] },
        ];
        return (
          <>
            <StepTitle title="Review and submit" intro="Check your answers. Use Edit to change any section; your answers are preserved." />
            <div className="grid grid-cols-1 gap-4">
              {groups.map((g) => (
                <section key={g.title} className="surface-card rounded-2xl p-6 border border-line">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-medium text-fg">{g.title}</h3>
                    <button type="button" onClick={() => goTo(g.step)} className="text-sm text-gold-text hover:text-gold-foil underline underline-offset-4 cursor-pointer">Edit</button>
                  </div>
                  <dl className="mt-4 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-6 gap-y-2 text-sm">
                    {g.rows.filter(([, val]) => val).map(([k, val]) => (
                      <div key={k} className="contents">
                        <dt className="text-fg-3">{k}</dt>
                        <dd className="text-fg break-words whitespace-pre-line">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}

              <section className="surface-card rounded-2xl p-6 text-sm text-fg-2 border border-line">
                Participation guidelines accepted and mandatory declarations confirmed.
              </section>

              <section className="surface-card rounded-2xl p-6 border-2 border-gold-foil/30 bg-gold-foil/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-foil/20 flex items-center justify-center text-gold-text shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-fg">Official Accreditation ID Allocation</h4>
                    <p className="mt-1 text-xs text-fg-2 leading-relaxed">
                      Upon submission, you will be assigned an alphanumeric Accreditation ID formatted as{' '}
                      <span className="font-mono text-gold-text font-semibold">[BC.AIMF-numbers]</span> (starting sequentially from{' '}
                      <span className="font-mono text-fg font-semibold">BC.AIMF-00001</span>). This accreditation is complimentary and guarantees consideration for auditorium stage programming and pavilion showcase spaces.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {status === 'failed' && (
              <p className="mt-6 text-sm text-negative" role="alert">
                The accreditation application could not be sent. Please check your internet connection and try again.
              </p>
            )}
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="page-enter flex flex-col min-h-screen">
      {/* Registration Header Banner */}
      <section className="pt-32 pb-12 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="ref-line text-gold-text flex flex-wrap items-center gap-x-2">
            <span>18 to 19 Dec 2026</span>
            <span className="text-line-strong">/</span>
            <span>Cultural Pavilion (Hall 4 &amp; Grand Auditorium)</span>
            <span className="text-line-strong">/</span>
            <span>Yashobhoomi, New Delhi</span>
          </p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-medium text-fg tracking-[-0.02em] max-w-3xl">
            Register for <span className="text-gold-text">AIMF Cultural &amp; Creative Accreditation</span>
          </h1>
          <p className="mt-4 text-[17px] text-fg-2 leading-relaxed max-w-2xl">
            Complimentary accreditation for artists, cultural ensembles, cinema studios, and creative economy leaders from India and 22 Arab nations.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div><dt className="text-fg-3">Accreditation</dt><dd className="mt-1 text-gold-text font-medium">Complimentary (₹0)</dd></div>
            <div><dt className="text-fg-3">Corridors</dt><dd className="mt-1 text-fg">India + 22 Arab Nations</dd></div>
            <div><dt className="text-fg-3">Reference Prefix</dt><dd className="mt-1 text-fg font-mono text-gold-text">BC.AIMF</dd></div>
            <div><dt className="text-fg-3">Takes about</dt><dd className="mt-1 text-fg">8 minutes</dd></div>
          </dl>
        </div>
      </section>

      {/* Main Body Section in Ivory Theme (matching all Conclave pages) */}
      <section className="theme-ivory flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="space-y-8 animate-fade-in">
              {/* Sign in gate protects the portal */}
              <SignInGate
                title="Sign in to apply for AIMF accreditation"
                reason="AIMF registration needs an account (Google, Apple, or email), so your creative showcase, credentials, and unique Accreditation ID [BC.AIMF-numbers] stay tied to you."
              >
                <AimfHub
                  uid={user?.uid}
                  formOpen={formOpen}
                  onRegister={() => {
                    setFormOpen(true);
                    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                  }}
                />

                <ApplicationGate type="aimf" onAnother={() => setFormOpen(true)}>
                  {formOpen && (
                    <div ref={formRef} id="aimf-form" className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
                      {/* Sidebar Steps */}
                      <aside className="lg:sticky lg:top-28 self-start">
                        {/* Mobile progress indicator */}
                        <div className="lg:hidden mb-4">
                          <div className="flex items-center justify-between text-xs sm:text-sm text-fg-2 mb-2">
                            <span>Step {step + 1} of {STEPS.length} · <strong className="text-fg">{STEPS[step].label}</strong></span>
                            <span className="font-mono text-gold-text">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-gold-foil to-coral transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 mt-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
                            {STEPS.map((s, i) => {
                              const active = i === step;
                              const done = i < reachable;
                              const can = i <= reachable;
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  disabled={!can}
                                  onClick={() => goTo(i)}
                                  className={`shrink-0 min-h-[36px] px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                                    active
                                      ? 'bg-surface-3 text-gold-text border border-gold-foil shadow-sm'
                                      : done
                                      ? 'bg-surface-2 text-fg border border-line-strong hover:bg-surface-3'
                                      : 'bg-surface-1 text-fg-3 border border-line/40 opacity-60 cursor-not-allowed'
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[10px] ${
                                    done && !active ? 'bg-gold-foil/20 text-gold-text font-bold' : 'border border-current'
                                  }`}>
                                    {done && !active ? '✓' : i + 1}
                                  </span>
                                  <span>{s.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Desktop Sidebar List */}
                        <ol className="hidden lg:flex flex-col gap-1">
                          {STEPS.map((s, i) => {
                            const active = i === step && status !== 'sent';
                            const done = i < reachable || status === 'sent';
                            const can = i <= reachable && status !== 'sent';
                            return (
                              <li key={s.id}>
                                <button
                                  type="button"
                                  disabled={!can}
                                  onClick={() => goTo(i)}
                                  aria-current={active ? 'step' : undefined}
                                  className={`w-full h-9 px-3 rounded-lg flex items-center gap-3 text-sm text-left transition-colors ${
                                    active
                                      ? 'bg-surface-2 text-fg border border-line-strong font-medium shadow-sm'
                                      : can
                                      ? 'text-fg-2 hover:text-fg hover:bg-surface-2 cursor-pointer'
                                      : 'text-fg-3 cursor-not-allowed opacity-60'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[11px] ${
                                    done && !active ? 'bg-fg text-surface-1' : 'border border-line-strong'
                                  }`}>
                                    {done && !active ? <Check className="w-3 h-3" strokeWidth={2} /> : i + 1}
                                  </span>
                                  <span>{s.label}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ol>

                        {/* Questions / Assistance Box */}
                        <div className="hidden lg:block mt-8 pt-6 border-t border-line text-sm text-fg-2 space-y-2">
                          <p className="text-fg font-medium">Questions</p>
                          <a href={`mailto:${ORGANISER.email}`} className="flex items-center gap-2 hover:text-fg transition-colors">
                            <Mail className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
                            <span>{ORGANISER.email}</span>
                          </a>
                          <a href={ORGANISER.phoneHref} className="flex items-center gap-2 hover:text-fg font-mono transition-colors">
                            <Phone className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
                            <span>{ORGANISER.phone}</span>
                          </a>
                          <a href={ORGANISER.websiteHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-fg transition-colors">
                            <Globe className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
                            <span>{ORGANISER.website}</span>
                          </a>
                        </div>
                      </aside>

                      {/* Main Form Card or Success Screen */}
                      <div className="surface-card rounded-2xl p-6 sm:p-10 border border-line shadow-sm min-w-0">
                        {status === 'sent' ? (
                          /* Success Screen */
                          <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                              <Check className="w-8 h-8" strokeWidth={2} />
                            </div>

                            <div>
                              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Application Confirmed</span>
                              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-medium text-fg">
                                AIMF Accreditation Submitted
                              </h2>
                              <p className="mt-3 text-sm sm:text-base text-fg-2 leading-relaxed">
                                Your accreditation application for the Atal Innovation Multilateral Forum has been recorded by the Secretariat. Admission is complimentary. A copy has been dispatched to <strong className="text-fg">{values.commEmail || values.email}</strong>.
                              </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-surface-3 border border-gold-foil/30 inline-flex flex-col items-center gap-1.5 min-w-[280px]">
                              <span className="text-xs font-mono uppercase tracking-wider text-fg-3">Your Accreditation ID</span>
                              <span className="font-mono text-2xl font-bold text-gold-text">{assignedId}</span>
                              <button
                                type="button"
                                onClick={() => copyId(assignedId)}
                                className="btn-secondary !rounded-lg h-8 px-3 text-xs flex items-center gap-1 mt-2 cursor-pointer"
                              >
                                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedId ? 'Copied ID' : 'Copy ID'}</span>
                              </button>
                            </div>

                            <div className="pt-6 border-t border-line/60 flex flex-wrap items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="btn-secondary !rounded-xl h-11 px-5 text-sm flex items-center gap-2 cursor-pointer"
                              >
                                <Printer className="w-4 h-4" />
                                <span>Print Confirmation</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setStatus('idle');
                                  setValues(EMPTY);
                                  setStep(0);
                                }}
                                className="btn-primary !rounded-xl h-11 px-5 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                              >
                                <span>Submit Another Application</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {renderStepBody()}

                            {/* Navigation Buttons */}
                            <div className="mt-12 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {step > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => goTo(step - 1)}
                                    className="btn-secondary !rounded-xl h-11 px-4 text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Previous</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={clearForm}
                                  className="text-xs text-fg-3 hover:text-coral transition-colors cursor-pointer py-2 px-1"
                                >
                                  Clear form
                                </button>
                              </div>

                              <div>
                                {step < STEPS.length - 1 ? (
                                  <button
                                    type="button"
                                    onClick={next}
                                    className="btn-primary !rounded-xl h-11 px-6 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                                  >
                                    <span>Continue</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={status === 'sending'}
                                    onClick={submit}
                                    className="btn-primary !rounded-xl h-11 px-7 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 active:scale-[0.98]"
                                  >
                                    {status === 'sending' ? (
                                      <>
                                        <Clock className="w-4 h-4 animate-spin" />
                                        <span>Transmitting application…</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>Submit AIMF Application</span>
                                        <ArrowRight className="w-4 h-4" />
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </ApplicationGate>
              </SignInGate>
            </div>
        </div>
      </section>
    </div>
  );
}
