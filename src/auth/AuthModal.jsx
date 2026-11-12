import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { BrandMark } from '../components/Navbar';
import DemoAuthForm from './DemoAuthForm';

/*
  The sign in / sign up window. Opened with openAuth({ mode, reason, then }) from anywhere.
  Accounts are Google accounts: signing up creates the account the first time someone continues with Google.
*/

const COPY = {
  signin: {
    title: 'Welcome back',
    body: 'Sign in with the Google account you used before to continue.',
    demoBody: 'Sign in to your Bharat Connect account to continue.',
    button: 'signin_with',
  },
  signup: {
    title: 'Create your account',
    body: 'Sign up with your Google account. It takes a few seconds and keeps your registrations in one place.',
    demoBody: 'It takes a few seconds and keeps your registrations in one place.',
    button: 'signup_with',
  },
};

export default function AuthModal() {
  const { authRequest, closeAuth, setAuthMode, ready, error, configured, renderButton, demo } = useAuth();
  const buttonRef = useRef(null);
  const dialogRef = useRef(null);
  const mode = authRequest?.mode === 'signup' ? 'signup' : 'signin';

  // draw Google's button for the current tab
  useEffect(() => {
    if (authRequest && ready && !demo) renderButton(buttonRef.current, { text: COPY[mode].button });
  }, [authRequest, ready, mode, renderButton, demo]);

  // Escape closes; focus moves into the window; the page behind stops scrolling
  useEffect(() => {
    if (!authRequest) return;
    const onKey = (e) => { if (e.key === 'Escape') closeAuth(); };
    document.addEventListener('keydown', onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [authRequest, closeAuth]);

  if (!authRequest) return null;
  const copy = COPY[mode];

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={closeAuth} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative w-full max-w-md bg-surface-2 border border-line-strong rounded-2xl p-6 sm:p-8 shadow-2xl animate-slide-up focus:outline-none"
      >
        <button
          onClick={closeAuth}
          aria-label="Close"
          className="absolute right-4 top-4 w-9 h-9 rounded-lg flex items-center justify-center text-fg-3 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3 text-fg">
          <BrandMark />
          <span className="text-[15px] font-semibold">Bharat Connect 2026</span>
        </div>

        {/* Sign in | Sign up */}
        <div role="tablist" aria-label="Sign in or sign up" className="mt-6 grid grid-cols-2 p-1 rounded-xl bg-surface-1 border border-line">
          {[
            ['signin', 'Sign in'],
            ['signup', 'Sign up'],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              onClick={() => setAuthMode(id)}
              className={`h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                mode === id ? 'bg-surface-3 text-fg shadow-sm' : 'text-fg-2 hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <h2 id="auth-title" className="mt-6 font-serif text-2xl font-medium text-fg">{copy.title}</h2>
        {authRequest.reason && <p className="mt-2 text-sm text-gold-text">{authRequest.reason}</p>}
        <p className="mt-2 text-[15px] text-fg-2 leading-relaxed">{demo ? copy.demoBody : copy.body}</p>

        {demo ? (
          <div className="mt-6">
            <DemoAuthForm key={mode} mode={mode} />
          </div>
        ) : configured ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div ref={buttonRef} className="w-full max-w-[320px] min-h-11 flex justify-center" />
            {!ready && !error && <p className="text-sm text-fg-3">Loading Google sign-in…</p>}
            {error && <p className="text-sm text-negative" role="alert">{error}</p>}
          </div>
        ) : (
          <div className="mt-6 surface-raised rounded-xl p-4 text-sm text-fg-2 leading-relaxed">
            <p className="text-fg font-medium">Sign-in is not set up yet</p>
            <p className="mt-2">
              Add a Google OAuth client ID to <span className="font-mono text-fg">.env.local</span> as{' '}
              <span className="font-mono text-fg">VITE_GOOGLE_CLIENT_ID</span> and restart the dev server.
            </p>
          </div>
        )}

        <p className="mt-6 text-sm text-fg-3 text-center">
          {mode === 'signin' ? (
            <>New here? <button onClick={() => setAuthMode('signup')} className="text-fg underline underline-offset-4 decoration-line-strong hover:decoration-fg cursor-pointer">Create an account</button></>
          ) : (
            <>Already registered? <button onClick={() => setAuthMode('signin')} className="text-fg underline underline-offset-4 decoration-line-strong hover:decoration-fg cursor-pointer">Sign in</button></>
          )}
        </p>
        {!demo && (
          <p className="mt-4 text-xs text-fg-3 text-center leading-relaxed">
            We see only your name, email address and profile photo from Google.
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
