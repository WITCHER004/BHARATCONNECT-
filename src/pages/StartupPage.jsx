import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, FileText, Mail, Phone, Globe, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  GOOGLE_FORM, TERMS_URL, ORGANISER, EVENT, DOCUMENTS, FEE,
  DESIGNATIONS, ENTITY_TYPES, SECTORS, STAGES, DPIIT_STATUS, PAYMENT_MODES, HEARD_FROM,
  TERMS_TEXT, DECLARATION_AUTHORITY, DECLARATION_DATA, ENTRY, VALIDATION,
} from '../data/startupForm';
import SignInGate from '../auth/SignInGate';
import ApplicationGate from '../components/ApplicationGate';
import { useAuth } from '../auth/AuthContext';
import StartupHub from '../components/StartupHub';
import { submitRegistration } from '../data/registry';

const DRAFT_KEY = 'bc-startup-draft';
const ICON = { className: 'w-4 h-4', strokeWidth: 1.5 };

const STEPS = [
  { id: 'event', label: 'The event' },
  { id: 'founder', label: 'Applicant details' },
  { id: 'startup', label: 'Startup details' },
  { id: 'legal', label: 'Legal and compliance' },
  { id: 'pitch', label: 'Pitch materials' },
  { id: 'terms', label: 'Terms and conditions' },
  { id: 'payment', label: 'Registration fee' },
  { id: 'declaration', label: 'Declaration' },
  { id: 'review', label: 'Review and submit' },
];

const EMPTY = {
  email: '',
  fullName: '', designation: '', designationOther: '', commEmail: '', phone: '', address: '',
  entityName: '', brandNames: '', entityType: '', incorporationDate: '', sectors: [], sectorOther: '',
  stage: '', website: '', pitch: '', description: '',
  pan: '', regNumber: '', gstin: '', dpiitStatus: '', dpiitNumber: '', dpiitCertificate: '',
  pitchDeck: '', demoVideo: '', productImages: '', ipHeld: '', ipDetails: '',
  terms: false,
  paymentMode: '', transactionId: '', paymentDate: '', amountPaid: String(FEE.total), payerName: '', invoiceAddress: '',
  declAuthority: false, declData: false, heardFrom: '',
};

const today = () => new Date().toISOString().slice(0, 10);
const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

/* ── validation, per step ───────────────────────────── */

function validateStep(step, v) {
  const e = {};
  const req = (k, msg = 'This field is required') => { if (!String(v[k] ?? '').trim()) e[k] = msg; };
  const url = (k) => { if (v[k].trim() && !VALIDATION.url.test(v[k].trim())) e[k] = 'Please enter a valid link starting with https://'; };

  switch (STEPS[step].id) {
    case 'event':
      req('email');
      if (v.email && !VALIDATION.email.test(v.email.trim())) e.email = 'Please enter a valid email address';
      break;
    case 'founder':
      req('fullName');
      req('designation', 'Please choose a designation');
      if (v.designation === '__other' && !v.designationOther.trim()) e.designationOther = 'Please enter your designation';
      req('commEmail');
      if (v.commEmail && !VALIDATION.email.test(v.commEmail.trim())) e.commEmail = 'Please enter a valid email address';
      req('phone');
      if (v.phone && !VALIDATION.phone.test(v.phone.trim())) e.phone = 'Please enter a valid phone number';
      req('address');
      break;
    case 'startup':
      req('entityName');
      req('brandNames');
      req('entityType', 'Please choose the type of entity');
      req('incorporationDate');
      if (v.incorporationDate > today()) e.incorporationDate = 'The date cannot be in the future';
      if (!v.sectors.length) e.sectors = 'Please tick at least one sector';
      if (v.sectors.includes('__other') && !v.sectorOther.trim()) e.sectorOther = 'Please describe your sector';
      req('stage', 'Please choose a stage');
      url('website');
      req('description');
      if (v.description.length > VALIDATION.descriptionMaxChars) e.description = 'Your response is too long. Please shorten it';
      break;
    case 'legal':
      req('pan');
      if (v.pan && !VALIDATION.pan.test(v.pan.trim())) e.pan = 'Please enter a valid 10-character PAN';
      req('regNumber');
      if (v.gstin.trim() && !VALIDATION.gstin.test(v.gstin.trim())) e.gstin = 'Please enter a valid 15-character GSTIN';
      req('dpiitStatus', 'Please choose an option');
      url('dpiitCertificate');
      break;
    case 'pitch':
      url('pitchDeck');
      url('demoVideo');
      url('productImages');
      req('ipHeld', 'Please choose an option');
      break;
    case 'terms':
      if (!v.terms) e.terms = 'Please accept the terms to continue';
      break;
    case 'payment':
      req('paymentMode', 'Please choose a mode of payment');
      req('transactionId');
      req('paymentDate');
      if (v.paymentDate > today()) e.paymentDate = 'The date cannot be in the future';
      req('amountPaid');
      if (v.amountPaid && !/^\d+(\.\d{1,2})?$/.test(v.amountPaid.replace(/,/g, '').trim())) e.amountPaid = 'Please enter the amount in numbers';
      req('payerName');
      break;
    case 'declaration':
      if (!v.declAuthority) e.declAuthority = 'This declaration is mandatory';
      if (!v.declData) e.declData = 'This declaration is mandatory';
      break;
    default:
  }
  return e;
}

/* ── submission to the Google Form ──────────────────── */

function buildPayload(v) {
  const p = new URLSearchParams();
  const put = (k, val) => { if (val !== undefined && val !== null && String(val).trim() !== '') p.append(`entry.${ENTRY[k]}`, String(val).trim()); };
  const putDate = (k, iso) => {
    if (!iso) return;
    const [y, m, d] = iso.split('-');
    p.append(`entry.${ENTRY[k]}_year`, y);
    p.append(`entry.${ENTRY[k]}_month`, String(Number(m)));
    p.append(`entry.${ENTRY[k]}_day`, String(Number(d)));
  };

  p.append('emailAddress', v.email.trim());
  put('fullName', v.fullName);
  if (v.designation === '__other') {
    p.append(`entry.${ENTRY.designation}`, '__other_option__');
    p.append(`entry.${ENTRY.designation}.other_option_response`, v.designationOther.trim());
  } else put('designation', v.designation);
  put('commEmail', v.commEmail);
  put('phone', v.phone);
  put('address', v.address);

  put('entityName', v.entityName);
  put('brandNames', v.brandNames);
  put('entityType', v.entityType);
  putDate('incorporationDate', v.incorporationDate);
  v.sectors.filter((s) => s !== '__other').forEach((s) => p.append(`entry.${ENTRY.sectors}`, s));
  if (v.sectors.includes('__other')) {
    p.append(`entry.${ENTRY.sectors}`, '__other_option__');
    p.append(`entry.${ENTRY.sectors}.other_option_response`, v.sectorOther.trim());
  }
  put('stage', v.stage);
  put('website', v.website);
  put('pitch', v.pitch);
  put('description', v.description);

  put('pan', v.pan.toUpperCase());
  put('regNumber', v.regNumber);
  put('gstin', v.gstin.toUpperCase());
  put('dpiitStatus', v.dpiitStatus);
  if (v.dpiitStatus !== 'Not applied') {
    put('dpiitNumber', v.dpiitNumber);
    put('dpiitCertificate', v.dpiitCertificate);
  }

  put('pitchDeck', v.pitchDeck);
  put('demoVideo', v.demoVideo);
  put('productImages', v.productImages);
  put('ipHeld', v.ipHeld);
  if (v.ipHeld === 'Yes') put('ipDetails', v.ipDetails);

  if (v.terms) p.append(`entry.${ENTRY.terms}`, TERMS_TEXT);

  put('paymentMode', v.paymentMode);
  put('transactionId', v.transactionId);
  putDate('paymentDate', v.paymentDate);
  put('amountPaid', v.amountPaid.replace(/,/g, ''));
  put('payerName', v.payerName);
  put('invoiceAddress', v.invoiceAddress);

  if (v.declAuthority) p.append(`entry.${ENTRY.declAuthority}`, DECLARATION_AUTHORITY);
  if (v.declData) p.append(`entry.${ENTRY.declData}`, DECLARATION_DATA);
  put('heardFrom', v.heardFrom);

  p.append('pageHistory', Array.from({ length: GOOGLE_FORM.pageCount }, (_, i) => i).join(','));
  return p;
}

/* ── fields ─────────────────────────────────────────── */

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

function OptionalImage({ src, alt, className, fallback = null }) {
  const [ok, setOk] = useState(true);
  if (!ok) return fallback;
  return <img src={src} alt={alt} className={className} onError={() => setOk(false)} loading="lazy" />;
}

/* ── the portal ─────────────────────────────────────── */

export default function StartupPage({ onNavigate }) {
  const { user } = useAuth();
  // the form opens on request, or straight away if there is an unfinished draft
  const [formOpen, setFormOpen] = useState(() => !!loadDraft());
  const [values, setValues] = useState(() => loadDraft() ?? EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [copied, setCopied] = useState(false);
  const [assignedId, setAssignedId] = useState(() => {
    try {
      return localStorage.getItem('bc-startup-last-id') || '';
    } catch {
      return '';
    }
  });
  const [copiedId, setCopiedId] = useState(false);
  const [hasDraft] = useState(() => { const d = loadDraft(); return !!(d && (d.email || d.fullName || d.entityName)); });
  const panelRef = useRef(null);

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

  // save progress as they type
  useEffect(() => {
    if (status === 'sent') return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values)); } catch { /* storage unavailable */ }
  }, [values, status]);

  // carry the first email into the communication email
  useEffect(() => {
    if (step === 1 && !values.commEmail && values.email) setValues((v) => ({ ...v, commEmail: v.email }));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (i) => {
    setStep(i);
    setErrors({});
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const next = () => {
    const e = validateStep(step, values);
    if (Object.keys(e).length) {
      setErrors(e);
      requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector(`[data-field="${Object.keys(e)[0]}"]`);
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first?.querySelector('input, textarea, select')?.focus({ preventScroll: true });
      });
      return;
    }
    goTo(Math.min(step + 1, STEPS.length - 1));
  };

  // the furthest step the applicant may jump to: every earlier step must be valid
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
    const sectors = values.sectors.map((s) => (s === 'Other' && values.sectorOther ? values.sectorOther : s));
    let uniqueId;
    try {
      // the database record is the one the admin panel and "Your startup" read
      uniqueId = await submitRegistration('startup', {
        name: values.fullName,
        email: values.commEmail || values.email,
        organisation: values.entityName || values.brandNames,
        country: 'India',
        detail: values.brandNames ? `Brand: ${values.brandNames}` : 'Startup showcase',
        sector: sectors.join(', '),
        phone: values.phone,
        payment: values.amountPaid ? `₹${values.amountPaid} · UTR ${values.transactionId || '—'}` : '',
        // public profile, shown in the startup directory once approved
        profile: { brand: values.brandNames || values.entityName, sectors, stage: values.stage, website: values.website, pitch: values.pitch },
        details: values,
      });
    } catch {
      setStatus('failed');
      return;
    }
    // copy to the organiser's Google Form as before; the registration is already saved if this fails
    fetch(GOOGLE_FORM.responseUrl, { method: 'POST', mode: 'no-cors', body: buildPayload(values) }).catch(() => {});
    setAssignedId(uniqueId);
    setStatus('sent');
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ }
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const clearForm = () => {
    if (!window.confirm('Clear every answer in this registration?')) return;
    setValues(EMPTY);
    setErrors({});
    setStep(0);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ }
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(FEE.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked */ }
  };

  const upiLink = `upi://pay?pa=${encodeURIComponent(FEE.upiId)}&pn=${encodeURIComponent(FEE.payee)}&tr=${FEE.upiRef}&am=${FEE.total}&cu=INR&tn=${encodeURIComponent('Bharat Connect startup registration')}`;
  const v = values;
  const descWords = words(v.description);

  /* ── step bodies ── */

  const body = () => {
    switch (STEPS[step].id) {
      case 'event':
        return (
          <>
            <StepTitle title="The upcoming event" intro={EVENT.byline} />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-3 surface-card rounded-2xl p-6">
                <h3 className="font-serif text-xl font-medium text-fg leading-snug">{EVENT.title}</h3>
                <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-fg-3">Venue</dt><dd className="mt-1 text-fg">{EVENT.venue}</dd></div>
                  <div><dt className="text-fg-3">Dates</dt><dd className="mt-1 text-fg">{EVENT.dates}</dd></div>
                  <div><dt className="text-fg-3">Where</dt><dd className="mt-1 text-fg">{EVENT.pavilion}</dd></div>
                  <div><dt className="text-fg-3">Organiser</dt><dd className="mt-1 text-fg">{ORGANISER.name}</dd></div>
                </dl>
                <p className="mt-6 text-sm text-fg-2 leading-relaxed">
                  Registered startups receive full details of this event and of other upcoming events of {ORGANISER.name}.
                  Each event has its own participation criteria, terms and admission fee, shared after successful registration.
                </p>
              </div>
              <OptionalImage
                src={FEE.posterSrc}
                alt="Bharat Connect Startup Showcase event poster"
                className="md:col-span-2 w-full rounded-2xl border border-line object-cover"
              />
            </div>

            <h3 className="mt-10 text-sm font-medium text-fg">Keep these ready</h3>
            <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENTS.map((d, i) => (
                <li key={d.title} className="surface-card rounded-xl p-4 flex gap-3">
                  <span className="ref-line text-gold-text pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="block text-[15px] text-fg">{d.title}</span>
                    <span className="block mt-1 text-sm text-fg-2">{d.text}</span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-sm text-fg-2 leading-relaxed">
              Registration is subject to the{' '}
              <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="text-fg underline underline-offset-4 decoration-line-strong hover:decoration-fg">
                Registration Terms and Conditions
              </a>{' '}
              of {ORGANISER.name}. Please read them before you begin.
            </p>

            <div className="mt-10 max-w-md">
              <Text id="email" label="Email" required type="email" autoComplete="email" placeholder="you@startup.com"
                hint="Your email address" value={v.email} onChange={set('email')} error={errors.email} />
            </div>
          </>
        );

      case 'founder':
        return (
          <>
            <StepTitle title="Applicant / founder details" intro="Please give the details of the person submitting this registration." />
            <div className="grid grid-cols-1 gap-6">
              <Text id="fullName" label="Full name" required autoComplete="name" value={v.fullName} onChange={set('fullName')} error={errors.fullName} />
              <Choice
                id="designation" label="Designation" required columns={2}
                options={[...DESIGNATIONS, { value: '__other', label: 'Other' }]}
                value={v.designation} onChange={set('designation')} error={errors.designation}
                other={v.designation === '__other' && (
                  <div className="mt-3 max-w-md">
                    <input aria-label="Your designation" value={v.designationOther} onChange={(e) => set('designationOther')(e.target.value)}
                      placeholder="Your designation" className={inputCls(errors.designationOther)} />
                    {errors.designationOther && <p className="mt-2 text-sm text-negative">{errors.designationOther}</p>}
                  </div>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Text id="commEmail" label="Email address for communication" required type="email" autoComplete="email"
                  hint="Your unique Registration ID (BMF.BC-SEO-numbers) and all official communications will be sent to this address"
                  value={v.commEmail} onChange={set('commEmail')} error={errors.commEmail} />
                <Text id="phone" label="Phone / WhatsApp number" required type="tel" autoComplete="tel" placeholder="+91 98765 43210"
                  hint="Include the country code if outside India" value={v.phone} onChange={set('phone')} error={errors.phone} />
              </div>
              <Area id="address" label="Address" required rows={3} autoComplete="street-address"
                hint="Your complete business address, including city, state and country"
                value={v.address} onChange={set('address')} error={errors.address} />
            </div>
          </>
        );

      case 'startup':
        return (
          <>
            <StepTitle title="Startup details" />
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Text id="entityName" label="Business entity name" required autoComplete="organization"
                  hint="As it appears in your certificate of incorporation or registration"
                  value={v.entityName} onChange={set('entityName')} error={errors.entityName} />
                <Text id="brandNames" label="Brand name(s) under the business entity" required
                  hint="If the brand name is the same as the entity name, please repeat it"
                  value={v.brandNames} onChange={set('brandNames')} error={errors.brandNames} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field id="entityType" label="Type of entity" required error={errors.entityType}>
                  <select id="entityType" value={v.entityType} onChange={(e) => set('entityType')(e.target.value)}
                    aria-invalid={!!errors.entityType} className={`${inputCls(errors.entityType)} cursor-pointer`}>
                    <option value="">Choose</option>
                    {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Text id="incorporationDate" label="Date of incorporation / registration" required type="date" max={today()}
                  value={v.incorporationDate} onChange={set('incorporationDate')} error={errors.incorporationDate} />
              </div>

              <fieldset data-field="sectors">
                <legend className="text-sm font-medium text-fg">Sector / industry<span className="text-coral-text"> *</span></legend>
                <p className="mt-1 text-sm text-fg-2">Tick all that apply</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[...SECTORS, { value: '__other', label: 'Other' }].map((s) => {
                    const on = v.sectors.includes(s.value);
                    return (
                      <label key={s.value} className={`min-h-11 px-3 py-2 rounded-[10px] border flex items-start gap-3 cursor-pointer transition-colors ${
                        on ? 'bg-surface-3 border-fg' : 'bg-surface-2 border-line-strong hover:border-fg-3'}`}>
                        <input type="checkbox" checked={on} className="accent-teal-deep w-4 h-4 mt-1 shrink-0"
                          onChange={() => set('sectors')(on ? v.sectors.filter((x) => x !== s.value) : [...v.sectors, s.value])} />
                        <span>
                          <span className="block text-[15px] text-fg">{s.label}</span>
                          {s.hint && <span className="block text-sm text-fg-2">{s.hint}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {v.sectors.includes('__other') && (
                  <div className="mt-3 max-w-md" data-field="sectorOther">
                    <input aria-label="Other sector" value={v.sectorOther} onChange={(e) => set('sectorOther')(e.target.value)}
                      placeholder="Your sector" className={inputCls(errors.sectorOther)} />
                    {errors.sectorOther && <p className="mt-2 text-sm text-negative">{errors.sectorOther}</p>}
                  </div>
                )}
                {errors.sectors && <p className="mt-2 text-sm text-negative" role="alert">{errors.sectors}</p>}
              </fieldset>

              <Choice id="stage" label="Stage of the startup" required columns={3} options={STAGES}
                value={v.stage} onChange={set('stage')} error={errors.stage} />

              <Text id="website" label="Website / app link" type="url" placeholder="https://"
                value={v.website} onChange={set('website')} error={errors.website} />
              <Text id="pitch" label="One-line pitch (elevator pitch)"
                hint="Describe your business, product or solution in one clear sentence: what you do, for whom, and the problem you solve"
                value={v.pitch} onChange={set('pitch')} error={errors.pitch} />
              <Area
                id="description" label="Brief description (50 to 100 words)" required rows={6}
                maxLength={VALIDATION.descriptionMaxChars}
                hint="What you offer, the problem you address, your target customers or users, and what makes your business distinctive"
                value={v.description} onChange={set('description')} error={errors.description}
                counter={
                  <span className={`font-mono text-xs figure ${descWords && (descWords < 50 || descWords > 100) ? 'text-coral-text' : 'text-fg-3'}`}>
                    {descWords} words · {v.description.length}/{VALIDATION.descriptionMaxChars}
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
              title="Legal and compliance"
              intro="This information is used only to verify your startup registration and to generate the applicable GST invoice. Please do not provide any personal identity numbers or sensitive identification details of the founders."
            />
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Text id="pan" label="PAN of the business entity" required hint="Format: ABCDE1234F" maxLength={10}
                  className={`${inputCls(errors.pan)} font-mono uppercase`}
                  value={v.pan} onChange={(x) => set('pan')(x.toUpperCase())} error={errors.pan} />
                <Text id="regNumber" label="CIN / LLPIN / registration number" required
                  className={`${inputCls(errors.regNumber)} font-mono`}
                  value={v.regNumber} onChange={set('regNumber')} error={errors.regNumber} />
              </div>
              <Text id="gstin" label="GSTIN (if registered)" maxLength={15}
                hint="Required for a GST invoice in the name of your business. Leave blank if you are not registered under GST"
                className={`${inputCls(errors.gstin)} font-mono uppercase`}
                value={v.gstin} onChange={(x) => set('gstin')(x.toUpperCase())} error={errors.gstin} />
              <Choice id="dpiitStatus" label="Startup India / DPIIT recognition" required columns={3} options={DPIIT_STATUS}
                value={v.dpiitStatus} onChange={set('dpiitStatus')} error={errors.dpiitStatus} />
              {v.dpiitStatus && v.dpiitStatus !== 'Not applied' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 motion-safe:animate-fade-in">
                  <Text id="dpiitNumber" label="Startup India / DPIIT recognition number"
                    hint="Leave blank if you are not yet recognised"
                    className={`${inputCls(errors.dpiitNumber)} font-mono`}
                    value={v.dpiitNumber} onChange={set('dpiitNumber')} error={errors.dpiitNumber} />
                  <Text id="dpiitCertificate" label="DPIIT recognition certificate (Google Drive link)" type="url" placeholder="https://drive.google.com/…"
                    hint='Upload it to Google Drive, set sharing to "Anyone with the link can view", and paste the link'
                    value={v.dpiitCertificate} onChange={set('dpiitCertificate')} error={errors.dpiitCertificate} />
                </div>
              )}
            </div>
          </>
        );

      case 'pitch':
        return (
          <>
            <StepTitle title="Pitch materials" intro="These help us present your startup to investors at the right event. For Google Drive links, set sharing to “Anyone with the link can view”." />
            <div className="grid grid-cols-1 gap-6">
              <Text id="pitchDeck" label="Pitch deck (Google Drive link)" type="url" placeholder="https://drive.google.com/…"
                value={v.pitchDeck} onChange={set('pitchDeck')} error={errors.pitchDeck} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Text id="demoVideo" label="Demo video link" type="url" placeholder="https://" hint="YouTube, Google Drive or a similar link"
                  value={v.demoVideo} onChange={set('demoVideo')} error={errors.demoVideo} />
                <Text id="productImages" label="Product / prototype images (Google Drive link)" type="url" placeholder="https://drive.google.com/…"
                  value={v.productImages} onChange={set('productImages')} error={errors.productImages} />
              </div>
              <Choice id="ipHeld" label="Patents or other intellectual property held" required columns={2} options={['Yes', 'No']}
                value={v.ipHeld} onChange={set('ipHeld')} error={errors.ipHeld} />
              {v.ipHeld === 'Yes' && (
                <div className="animate-fade-in">
                  <Area id="ipDetails" label="Brief details" rows={3}
                    hint="For example: patent granted or filed, registered trademark, copyright, design"
                    value={v.ipDetails} onChange={set('ipDetails')} error={errors.ipDetails} />
                </div>
              )}
            </div>
          </>
        );

      case 'terms':
        return (
          <>
            <StepTitle title="Terms and conditions" intro={`Please read the Registration Terms and Conditions of ${ORGANISER.name} carefully before making the payment.`} />
            <a href={TERMS_URL} target="_blank" rel="noopener noreferrer"
              className="surface-card rounded-xl p-4 flex items-center gap-4 max-w-xl hover:border-line-strong transition-colors">
              <FileText {...ICON} className="w-5 h-5 text-fg-3 shrink-0" strokeWidth={1.5} />
              <span className="flex-1">
                <span className="block text-[15px] text-fg">Registration Terms and Conditions</span>
                <span className="block text-sm text-fg-2">{ORGANISER.name} · opens in Google Drive</span>
              </span>
              <ExternalLink {...ICON} className="w-4 h-4 text-fg-3" />
            </a>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              <li className="surface-card rounded-xl p-4"><span className="block text-sm text-fg-3">Registration fee</span><span className="block mt-1 text-fg">{inr(FEE.base)} plus GST</span></li>
              <li className="surface-card rounded-xl p-4"><span className="block text-sm text-fg-3">Valid for</span><span className="block mt-1 text-fg">2 years or 5 events</span></li>
              <li className="surface-card rounded-xl p-4"><span className="block text-sm text-fg-3">Each event</span><span className="block mt-1 text-fg">Separate terms and admission fee</span></li>
            </ul>
            <div className="mt-8">
              <Agree id="terms" label="Acceptance of terms and conditions" checked={v.terms} onChange={set('terms')} error={errors.terms}>
                {TERMS_TEXT}
              </Agree>
            </div>
          </>
        );

      case 'payment':
        return (
          <>
            <StepTitle title="Payment of registration fee" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 surface-card rounded-2xl p-6">
                <p className="text-sm text-fg-3">Registration fee, including GST</p>
                <p className="mt-2 font-serif text-5xl font-medium text-fg figure">{inr(FEE.total)}</p>
                <p className="mt-1 text-sm text-fg-2">{FEE.words}, payable to {FEE.payee}</p>
                <p className="mt-6 text-sm text-fg-2 leading-relaxed">
                  Non-refundable except as stated in the Terms and Conditions. It does not include the admission fee of any event.
                </p>
                <div className="mt-6 pt-6 border-t border-line">
                  <p className="text-sm text-fg-3">Official UPI ID</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-base sm:text-lg text-fg break-all">{FEE.upiId}</span>
                    <button type="button" onClick={copyUpi} className="btn-secondary h-9 px-3 text-sm">
                      {copied ? <Check {...ICON} /> : <Copy {...ICON} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <a href={upiLink} className="btn-secondary h-9 px-3 text-sm sm:hidden">Pay in UPI app</a>
                  </div>
                </div>
                <p className="mt-6 text-sm text-fg-2 leading-relaxed">
                  Please pay only through the official QR code or the UPI ID above ({FEE.payee}). The organisers cannot accept
                  responsibility for payments made to any other account.
                </p>
              </div>
              <div className="lg:col-span-2 surface-card rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                <OptionalImage
                  src={FEE.qrSrc}
                  alt={`Official payment QR code of ${FEE.payee}`}
                  className="w-full max-w-[280px] rounded-xl bg-white p-3"
                  fallback={
                    <p className="text-sm text-fg-2 text-center leading-relaxed">
                      Pay with the UPI ID shown. The official QR code is also on the{' '}
                      <a href={GOOGLE_FORM.viewUrl} target="_blank" rel="noopener noreferrer" className="text-fg underline underline-offset-4">original form</a>
                    </p>
                  }
                />
                <p className="text-xs text-fg-3 text-center leading-relaxed">
                  Scan with any UPI app (BHIM, Google Pay, PhonePe, Paytm, CRED).<br />
                  Payee shown: <span className="text-fg-2">M/S. Bharat Mahotsav Festivals LLP</span> · ICICI Bank
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-sm font-medium text-fg">Payment details</h3>
            <div className="mt-4 grid grid-cols-1 gap-6">
              <Choice id="paymentMode" label="Mode of payment" required columns={2} options={PAYMENT_MODES}
                value={v.paymentMode} onChange={set('paymentMode')} error={errors.paymentMode} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Text id="transactionId" label="Transaction ID / UTR number" required
                  className={`${inputCls(errors.transactionId)} font-mono`}
                  value={v.transactionId} onChange={set('transactionId')} error={errors.transactionId} />
                <Text id="paymentDate" label="Date of payment" required type="date" max={today()}
                  value={v.paymentDate} onChange={set('paymentDate')} error={errors.paymentDate} />
                <Text id="amountPaid" label="Amount paid (₹)" required inputMode="decimal"
                  className={`${inputCls(errors.amountPaid)} font-mono`}
                  value={v.amountPaid} onChange={set('amountPaid')} error={errors.amountPaid} />
              </div>
              <Text id="payerName" label="Name of the person or account from which payment was made" required
                value={v.payerName} onChange={set('payerName')} error={errors.payerName} />
              <Area id="invoiceAddress" label="Name and address for the GST invoice" rows={3}
                hint="Only if different from the address given earlier"
                value={v.invoiceAddress} onChange={set('invoiceAddress')} error={errors.invoiceAddress} />
            </div>
          </>
        );

      case 'declaration':
        return (
          <>
            <StepTitle title="Declaration" intro="Both declarations below are mandatory." />
            <div className="grid grid-cols-1 gap-6">
              <Agree id="declAuthority" label="Authority and accuracy" checked={v.declAuthority} onChange={set('declAuthority')} error={errors.declAuthority}>
                {DECLARATION_AUTHORITY}
              </Agree>
              <Agree id="declData" label="Data and communications" checked={v.declData} onChange={set('declData')} error={errors.declData}>
                {DECLARATION_DATA}
              </Agree>
              <Choice id="heardFrom" label="How did you hear about us?" columns={3} options={HEARD_FROM}
                value={v.heardFrom} onChange={set('heardFrom')} />
            </div>
          </>
        );

      case 'review': {
        const designation = v.designation === '__other' ? v.designationOther : v.designation;
        const sectors = v.sectors.map((s) => (s === '__other' ? v.sectorOther : SECTORS.find((x) => x.value === s)?.label ?? s));
        const groups = [
          { step: 0, title: 'Contact', rows: [['Email', v.email]] },
          { step: 1, title: 'Applicant', rows: [['Name', v.fullName], ['Designation', designation], ['Email for communication', v.commEmail], ['Phone', v.phone], ['Address', v.address]] },
          { step: 2, title: 'Startup', rows: [['Entity', v.entityName], ['Brands', v.brandNames], ['Type', v.entityType], ['Incorporated', v.incorporationDate], ['Sectors', sectors.join(', ')], ['Stage', v.stage], ['Website', v.website], ['Pitch', v.pitch], ['Description', v.description]] },
          { step: 3, title: 'Legal', rows: [['PAN', v.pan], ['CIN / LLPIN', v.regNumber], ['GSTIN', v.gstin], ['DPIIT', v.dpiitStatus], ['DPIIT number', v.dpiitStatus !== 'Not applied' ? v.dpiitNumber : ''], ['DPIIT certificate', v.dpiitStatus !== 'Not applied' ? v.dpiitCertificate : '']] },
          { step: 4, title: 'Pitch materials', rows: [['Pitch deck', v.pitchDeck], ['Demo video', v.demoVideo], ['Product images', v.productImages], ['IP held', v.ipHeld], ['IP details', v.ipHeld === 'Yes' ? v.ipDetails : '']] },
          { step: 6, title: 'Payment', rows: [['Mode', v.paymentMode], ['Transaction ID / UTR', v.transactionId], ['Date', v.paymentDate], ['Amount', v.amountPaid && inr(v.amountPaid.replace(/,/g, ''))], ['Paid by', v.payerName], ['GST invoice to', v.invoiceAddress]] },
        ];
        return (
          <>
            <StepTitle title="Review and submit" intro="Check your answers. Use Edit to change a section; your progress is kept." />
            <div className="grid grid-cols-1 gap-4">
              {groups.map((g) => (
                <section key={g.title} className="surface-card rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-medium text-fg">{g.title}</h3>
                    <button type="button" onClick={() => goTo(g.step)} className="text-sm text-fg-2 hover:text-fg underline underline-offset-4 decoration-line-strong cursor-pointer">Edit</button>
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
              <section className="surface-card rounded-2xl p-6 text-sm text-fg-2">
                Terms accepted and both declarations confirmed
              </section>

              <section className="surface-card rounded-2xl p-6 border-2 border-gold-foil/30 bg-gold-foil/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-foil/20 flex items-center justify-center text-gold-text shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-fg">Official Registration ID Allocation</h4>
                    <p className="mt-1 text-xs text-fg-2 leading-relaxed">
                      Upon submission, your venture will be instantly assigned a permanent alphanumeric Accreditation ID formatted as{' '}
                      <span className="font-mono text-gold-text font-semibold">[BMF.BC-SEO-numbers]</span> (starting sequentially from{' '}
                      <span className="font-mono text-fg font-semibold">BMF.BC-SEO-00001</span>). This ID remains valid for 2 years across 5 flagship events of Bharat Mahotsav Festivals LLP.
                    </p>
                  </div>
                </div>
              </section>
            </div>
            {status === 'failed' && (
              <p className="mt-6 text-sm text-negative" role="alert">
                The registration could not be sent. Check your connection and try again, or use the{' '}
                <a href={GOOGLE_FORM.viewUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">original Google Form</a>.
              </p>
            )}
          </>
        );
      }
      default:
        return null;
    }
  };

  /* ── page ── */

  return (
    <div className="page-enter">
      <section className="pt-32 pb-12 bg-royal border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="ref-line text-gold-text flex flex-wrap items-center gap-x-2">
            <span>18 to 19 Dec 2026</span>
            <span className="text-line-strong">/</span>
            <span>Startup Pavilion</span>
            <span className="text-line-strong">/</span>
            <span>Yashobhoomi, New Delhi</span>
          </p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-medium text-fg tracking-[-0.02em] max-w-3xl">
            Register your startup for the <span className="text-gold-text">Bharat Connect Startup Showcase</span>
          </h1>
          <p className="mt-4 text-[17px] text-fg-2 leading-relaxed max-w-2xl">
            Registration makes your startup eligible for invitations to upcoming events of {ORGANISER.name}, including the
            Startup Pavilion at the Bharat-Arab Business Conclave, where you may present your venture to investors and key stakeholders.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div><dt className="text-fg-3">Registration fee</dt><dd className="mt-1 text-fg font-mono figure">{inr(FEE.total)} incl. GST</dd></div>
            <div><dt className="text-fg-3">Valid for</dt><dd className="mt-1 text-fg">2 years or 5 events</dd></div>
            <div><dt className="text-fg-3">Takes about</dt><dd className="mt-1 text-fg">10 minutes</dd></div>
          </dl>
        </div>
      </section>

      <section className="theme-ivory py-12 sm:py-16">
        <SignInGate
          title="Sign in to register your startup"
          reason="Startup registration needs an account (Google or email), so your application, payment details and unique Registration ID [BMF.BC-SEO-numbers] stay tied to you."
        >
        <StartupHub
          uid={user?.uid}
          formOpen={formOpen}
          onRegister={() => {
            setFormOpen(true);
            requestAnimationFrame(() => document.getElementById('startup-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
          }}
        />
        <ApplicationGate type="startup" onAnother={() => setFormOpen(true)}>
        {formOpen && (
        <div id="startup-form" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          {/* steps */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="lg:hidden mb-4">
              <div className="flex items-center justify-between text-xs sm:text-sm text-fg-2 mb-2">
                <span>Step {step + 1} of {STEPS.length} · <strong className="text-fg">{STEPS[step].label}</strong></span>
                <span className="font-mono text-gold-text">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gold-foil to-coral transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>

              {/* Touch-Friendly Mobile & Tablet Step Chip Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 mt-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none [-webkit-overflow-scrolling:touch]">
                {STEPS.map((s, i) => {
                  const active = i === step && status !== 'sent';
                  const done = i < reachable || status === 'sent';
                  const can = i <= reachable && status !== 'sent';
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
                        active ? 'bg-surface-2 text-fg border border-line-strong' : can ? 'text-fg-2 hover:text-fg hover:bg-surface-2 cursor-pointer' : 'text-fg-3 cursor-not-allowed'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[11px] ${done && !active ? 'bg-fg text-surface-1' : 'border border-line-strong'}`}>
                        {done && !active ? <Check className="w-3 h-3" strokeWidth={2} /> : i + 1}
                      </span>
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="hidden lg:block mt-8 pt-6 border-t border-line text-sm text-fg-2 space-y-2">
              <p className="text-fg font-medium">Questions</p>
              <a href={`mailto:${ORGANISER.email}`} className="flex items-center gap-2 hover:text-fg"><Mail {...ICON} />{ORGANISER.email}</a>
              <a href={ORGANISER.phoneHref} className="flex items-center gap-2 hover:text-fg font-mono"><Phone {...ICON} />{ORGANISER.phone}</a>
              <a href={ORGANISER.websiteHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-fg"><Globe {...ICON} />{ORGANISER.website}</a>
            </div>
          </aside>

          {/* form */}
          <div ref={panelRef} className="scroll-mt-24 min-w-0">
            {status === 'sent' ? (
              <div className="surface-card rounded-2xl p-8 sm:p-12 motion-safe:animate-fade-in border border-line-strong shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-fg text-surface-1 flex items-center justify-center">
                      <Check className="w-6 h-6" strokeWidth={2.5} />
                    </span>
                    <div>
                      <span className="ref-line text-gold-text">Official Registration Confirmed</span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
                        Startup Accredited
                      </h2>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-fg-3 block">Organiser</span>
                    <span className="text-sm font-medium text-fg">{ORGANISER.name}</span>
                  </div>
                </div>

                {/* Unique Registration ID Highlight Badge */}
                <div className="my-8 p-6 sm:p-8 rounded-2xl bg-surface-0 border-2 border-gold-foil/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
                      <span className="text-xs text-gold-text font-medium">
                        Startup accreditation ID
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-3xl sm:text-4xl font-semibold text-fg tracking-tight flex items-center gap-3">
                      <span>{assignedId || 'BMF.BC-SEO-00001'}</span>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-fg-3">
                      Your unique alphanumeric identifier [BMF.BC-SEO-numbers] for the Bharat Connect Startup Showcase.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyId(assignedId || 'BMF.BC-SEO-00001')}
                      className="btn-primary h-11 px-5 text-sm font-medium flex items-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Accreditation summary grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm surface-raised rounded-xl p-5 border border-line">
                  <div>
                    <span className="text-fg-3 block text-xs">Registered Entity</span>
                    <span className="font-medium text-fg block mt-0.5">{v.entityName || 'Startup Entity'}</span>
                    {v.brandNames && <span className="text-xs text-fg-2">({v.brandNames})</span>}
                  </div>
                  <div>
                    <span className="text-fg-3 block text-xs">Founder / Applicant</span>
                    <span className="font-medium text-fg block mt-0.5">{v.fullName}</span>
                    <span className="text-xs text-fg-2">{v.designation === '__other' ? v.designationOther : v.designation}</span>
                  </div>
                  <div>
                    <span className="text-fg-3 block text-xs">UTR / Payment Ref</span>
                    <span className="font-mono text-fg block mt-0.5">{v.transactionId || 'Verified'}</span>
                    <span className="text-xs text-coral-text">{v.amountPaid && inr(v.amountPaid.replace(/,/g, ''))} Verified</span>
                  </div>
                  <div>
                    <span className="text-fg-3 block text-xs">Key Sectors</span>
                    <span className="text-fg block mt-0.5 text-xs line-clamp-1">
                      {v.sectors.length ? v.sectors.filter(s => s !== '__other').join(', ') : 'Innovation'}
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-3 block text-xs">Accreditation Validity</span>
                    <span className="text-fg block mt-0.5 font-medium">2 Years / 5 Events</span>
                  </div>
                  <div>
                    <span className="text-fg-3 block text-xs">Pavilion & Venue</span>
                    <span className="text-fg block mt-0.5">Startup Pavilion · Palash Hall, 6F</span>
                  </div>
                </div>

                <p className="mt-6 text-[14px] text-fg-2 leading-relaxed">
                  Thank you, <span className="text-fg font-medium">{v.fullName}</span>. An official confirmation with your assigned registration ID{' '}
                  <span className="font-mono font-semibold text-gold-text">{assignedId || 'BMF.BC-SEO-00001'}</span> has been recorded and transmitted to{' '}
                  <span className="text-fg font-medium">{v.commEmail || v.email}</span>. Please quote this ID for stall allocations, bilateral deal room entry, and fast-track badge issuance at Yashobhoomi.
                </p>

                <div className="mt-8 pt-6 border-t border-line flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('home')}
                    className="btn-primary h-11 px-5 text-sm"
                  >
                    Back to the conclave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValues(EMPTY);
                      setStep(0);
                      setStatus('idle');
                      setAssignedId('');
                    }}
                    className="btn-secondary h-11 px-5 text-sm"
                  >
                    Register another startup
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="h-11 px-4 text-sm text-fg-2 hover:text-fg border border-line-strong rounded-xl transition-colors cursor-pointer sm:ml-auto"
                  >
                    Print confirmation
                  </button>
                </div>
              </div>
            ) : (
              <>
                {hasDraft && step === 0 && (
                  <p className="mb-6 text-sm text-fg-2 surface-card rounded-xl px-4 py-3">Your saved progress has been restored</p>
                )}
                <div key={step} className="animate-fade-in">{body()}</div>

                <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-3">
                  {step > 0 && (
                    <button type="button" onClick={() => goTo(step - 1)} className="btn-secondary h-11 px-5 text-sm">
                      <ArrowLeft {...ICON} /> Back
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button type="button" onClick={next} className="btn-primary h-11 px-6 text-sm">
                      Next <ArrowRight {...ICON} />
                    </button>
                  ) : (
                    <button type="button" onClick={submit} disabled={status === 'sending'} className="btn-primary h-11 px-6 text-sm">
                      {status === 'sending' ? 'Sending…' : 'Submit registration'}
                    </button>
                  )}
                  <span className="flex-1" />
                  <span className="hidden sm:inline text-sm text-fg-3">Progress saves automatically</span>
                  <button type="button" onClick={clearForm} className="h-11 px-3 text-sm text-fg-2 hover:text-fg cursor-pointer">Clear form</button>
                </div>
              </>
            )}
          </div>
        </div>
        )}
        </ApplicationGate>
        </SignInGate>
      </section>
    </div>
  );
}
