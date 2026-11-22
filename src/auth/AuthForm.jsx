import { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth, lastMethod } from './AuthContext';
import { hasAccepted, accept, decline, TERMS_LINK } from '../data/terms';

/*
  Sign in / sign up with three options: Google, Apple, or email and password (Firebase Authentication).
  The one-tap providers come first; email sits below a divider. The method used last time is marked.
*/

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const inputCls = (err) =>
  `w-full h-12 px-3.5 rounded-xl bg-surface-1 border text-[15px] text-fg placeholder:text-fg-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 ${
    err ? 'border-negative' : 'border-line-strong hover:border-fg-3'
  }`;

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M16.37 1.43c0 1.14-.49 2.27-1.18 3.08-.74.9-1.99 1.57-2.99 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.57-2.27 1.21-2.98.8-.94 2.14-1.64 3.25-1.68.03.13.05.28.05.43zm4.56 15.71c-.03.07-.46 1.58-1.52 3.12-.94 1.34-1.94 2.71-3.43 2.71-1.52 0-1.9-.88-3.63-.88-1.7 0-2.3.91-3.67.91-1.38 0-2.33-1.26-3.43-2.8C3.96 18.38 2.93 15.57 2.93 12.92c0-4.28 2.8-6.55 5.55-6.55 1.45 0 2.68.95 3.6.95.87 0 2.22-1.01 3.9-1.01.61 0 2.89.06 4.37 2.19-.13.09-2.38 1.37-2.38 4.19 0 3.26 2.85 4.42 2.96 4.45z" />
    </svg>
  );
}

// 0–4: length, letters + numbers, mixed case, a symbol
function strength(pw) {
  if (!pw) return 0;
  return [pw.length >= 8, /[a-z]/i.test(pw) && /\d/.test(pw), /[a-z]/.test(pw) && /[A-Z]/.test(pw), /[^a-z0-9]/i.test(pw)]
    .filter(Boolean).length;
}
const STRENGTH = [
  { label: '', cls: '' },
  { label: 'Weak', cls: 'bg-[#D03B3B]' },
  { label: 'Fair', cls: 'bg-[#FAB219]' },
  { label: 'Good', cls: 'bg-[#2FA58C]' },
  { label: 'Strong', cls: 'bg-[#0CA30C]' },
];

function ProviderButton({ name, onClick, busy, disabled, last, signup }) {
  const apple = name === 'Apple';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy}
      className={`relative w-full h-12 rounded-xl text-[15px] font-medium flex items-center justify-center gap-3 transition-[background-color,box-shadow,opacity] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 ${
        apple
          ? 'bg-black text-white ring-1 ring-white/15 hover:bg-[#1c1c1e]'
          : 'bg-white text-[#1F1F1F] border border-[#DADCE0] hover:bg-[#F8F9FA] hover:shadow-sm'
      }`}
    >
      {busy ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} /> : apple ? <AppleLogo /> : <GoogleLogo />}
      {busy ? `Connecting to ${name}…` : `${signup ? 'Sign up' : 'Continue'} with ${name}`}
      {last && !busy && (
        <span className={`absolute right-3 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md ${apple ? 'bg-white/15 text-white' : 'bg-[#E8F0FE] text-[#1A56DB]'}`}>
          Last used
        </span>
      )}
    </button>
  );
}

export default function AuthForm({ mode = 'signin' }) {
  const { signInWith, emailAuth, resetPassword } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [providerError, setProviderError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(''); // '' | 'Google' | 'Apple' | 'Email'
  const [termsConsent, setTermsConsent] = useState(() => (hasAccepted('auth') ? 'agree' : 'none'));
  const [termsError, setTermsError] = useState('');
  const signup = mode === 'signup';
  const last = lastMethod();
  const score = strength(password);

  const viaProvider = async (p) => {
    if (termsConsent !== 'agree') {
      setTermsError('Please select "I Agree" to the Conclave Terms & Protocol Note below.');
      return;
    }
    setProviderError('');
    setBusy(p);
    accept('auth');
    const msg = await signInWith(p);
    setBusy('');
    setProviderError(msg);
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (signup && !name.trim()) err.name = 'Please enter your full name';
    if (!EMAIL.test(email.trim())) err.email = 'Please enter a valid email address';
    if (signup ? password.length < 8 : !password) err.password = signup ? 'Use at least 8 characters' : 'Please enter your password';
    if (termsConsent !== 'agree') {
      setTermsError('Please select "I Agree" to the Conclave Terms & Protocol Note to proceed.');
      err.terms = true;
    }
    setErrors(err);
    setFormError('');
    setNote('');
    if (Object.keys(err).length) return;
    setBusy('Email');
    accept('auth');
    const msg = await emailAuth({ mode, name, email, password });
    setBusy('');
    setFormError(msg);
  };

  const forgot = async () => {
    setNote('');
    setFormError('');
    if (!EMAIL.test(email.trim())) { setErrors({ email: 'Enter your email first, then choose "Forgot password?"' }); return; }
    const msg = await resetPassword(email);
    setFormError(msg);
    if (!msg) setNote(`If an account exists for ${email.trim()}, a reset link is on its way.`);
  };

  return (
    <div className="text-left">
      {/* Conclave Terms & Conditions Agreement Note */}
      <div className="mb-5 p-3.5 rounded-xl bg-surface-1 border border-line-strong text-xs space-y-2.5">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-gold-text shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="leading-relaxed text-fg-2">
            <span className="font-semibold text-fg">Terms &amp; Protocol Note: </span>
            {signup
              ? 'Creating an account grants access to official delegate passes, startup accreditation, and sovereign B2B deal rooms subject to Yashobhoomi security and conclave terms.'
              : 'Signing in confirms adherence to the Bharat Connect 2026 Protocol, non-disclosure standards, and official accreditation rules.'}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-line/60">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-fg select-none">
              <input
                type="radio"
                name="auth-terms"
                checked={termsConsent === 'agree'}
                onChange={() => {
                  setTermsConsent('agree');
                  setTermsError('');
                  accept('auth');
                }}
                className="accent-gold-text w-3.5 h-3.5"
              />
              <span>I Agree</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-fg-3 hover:text-fg-2 select-none">
              <input
                type="radio"
                name="auth-terms"
                checked={termsConsent === 'disagree'}
                onChange={() => {
                  setTermsConsent('disagree');
                  setTermsError('You have selected "Disagree". Conclave services and accreditation require accepting terms.');
                  decline('auth');
                }}
                className="accent-coral w-3.5 h-3.5"
              />
              <span>Disagree</span>
            </label>
          </div>

          <a
            href={TERMS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gold-text hover:underline inline-flex items-center gap-1 font-mono shrink-0"
          >
            <span>Read PDF</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {termsError && (
          <p className="text-[11px] text-coral font-medium pt-0.5" role="alert">
            {termsError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {['Google', 'Apple'].map((p) => (
          <ProviderButton
            key={p}
            name={p}
            signup={signup}
            last={last === p}
            busy={busy === p}
            disabled={!!busy}
            onClick={() => viaProvider(p)}
          />
        ))}
      </div>
      {providerError && <p className="mt-3 text-sm text-negative" role="alert">{providerError}</p>}

      <div className="my-6 flex items-center gap-3 text-xs text-fg-3">
        <span className="h-px flex-1 bg-line" />
        <span className="inline-flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" strokeWidth={1.5} /> or use your email
          {last === 'Email' && <span className="ml-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md bg-surface-3 text-fg-2">Last used</span>}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {signup && (
          <div>
            <label htmlFor="auth-name" className="block text-sm text-fg-2 mb-1.5">Full name</label>
            <input id="auth-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name} aria-describedby={errors.name ? 'auth-name-err' : undefined} className={inputCls(errors.name)} />
            {errors.name && <p id="auth-name-err" className="mt-1.5 text-sm text-negative">{errors.name}</p>}
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="block text-sm text-fg-2 mb-1.5">Email</label>
          <input id="auth-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'auth-email-err' : undefined} className={inputCls(errors.email)} />
          {errors.email && <p id="auth-email-err" className="mt-1.5 text-sm text-negative">{errors.email}</p>}
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="auth-password" className="block text-sm text-fg-2">Password</label>
            {!signup && (
              <button type="button" onClick={forgot} className="text-xs text-fg-2 hover:text-fg underline underline-offset-2 cursor-pointer">
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input id="auth-password" type={show ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password} aria-describedby={signup ? 'auth-pw-help' : errors.password ? 'auth-pw-err' : undefined}
              className={`${inputCls(errors.password)} pr-12`} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1.5 w-9 h-9 rounded-lg flex items-center justify-center text-fg-3 hover:text-fg cursor-pointer">
              {show ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
            </button>
          </div>
          {signup && (
            <div id="auth-pw-help" className="mt-2" aria-live="polite">
              <div className="grid grid-cols-4 gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={`h-1 rounded-full transition-colors ${i <= score ? STRENGTH[score].cls : 'bg-surface-3'}`} />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-fg-3">
                {score ? <span className="text-fg-2 font-medium">{STRENGTH[score].label}. </span> : null}
                At least 8 characters; mixing letters, numbers and a symbol makes it stronger.
              </p>
            </div>
          )}
          {errors.password && <p id="auth-pw-err" className="mt-1.5 text-sm text-negative">{errors.password}</p>}
        </div>

        {formError && <p className="text-sm text-negative" role="alert">{formError}</p>}
        {note && <p className="text-sm text-fg-2" role="status">{note}</p>}

        <button type="submit" disabled={!!busy} className="btn-primary h-12 text-[15px] mt-1 rounded-xl">
          {busy === 'Email' ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : null}
          {busy === 'Email' ? (signup ? 'Creating account…' : 'Signing in…') : signup ? 'Create account' : 'Sign in with email'}
        </button>
      </form>

      <p className="mt-5 flex items-start gap-2 text-xs text-fg-3 leading-relaxed">
        <ShieldCheck className="w-4 h-4 shrink-0 text-gold-text" strokeWidth={1.5} />
        <span>
          Secured by Firebase &amp; DPDP compliance. Credentials and communications are strictly encrypted.
        </span>
      </p>
    </div>
  );
}
