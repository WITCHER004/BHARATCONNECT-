import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import DemoAuthForm from './DemoAuthForm';

/*
  Shows children only to signed-in visitors. Everyone else sees a sign-in panel in its place.
  `title` and `reason` describe what they are signing in for.
*/
export default function SignInGate({ title, reason, children }) {
  const { user, ready, error, configured, renderButton, demo } = useAuth();
  const buttonRef = useRef(null);
  const [mode, setMode] = useState('signin');

  useEffect(() => {
    if (!user && ready && !demo) renderButton(buttonRef.current);
  }, [user, ready, renderButton, demo]);

  if (user) return children;

  return (
    <div className="px-4 sm:px-0">
    <div className="max-w-xl mx-auto surface-card rounded-2xl p-8 sm:p-10 text-center">
      <span className="ornament justify-center" aria-hidden="true">
        <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="currentColor" /></svg>
      </span>
      <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-medium text-fg">{title}</h2>
      <p className="mt-3 text-[15px] text-fg-2 leading-relaxed">{reason}</p>

      {demo ? (
        <div className="mt-8">
          <div role="tablist" aria-label="Sign in or sign up" className="mb-6 grid grid-cols-2 p-1 rounded-xl bg-surface-1 border border-line">
            {[['signin', 'Sign in'], ['signup', 'Sign up']].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={mode === id}
                onClick={() => setMode(id)}
                className={`h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  mode === id ? 'bg-surface-3 text-fg' : 'text-fg-2 hover:text-fg'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <DemoAuthForm key={mode} mode={mode} />
        </div>
      ) : configured ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div ref={buttonRef} className="w-full max-w-[320px] min-h-11 flex justify-center" />
          {!ready && !error && <p className="text-sm text-fg-3">Loading Google sign-in…</p>}
          {error && <p className="text-sm text-negative" role="alert">{error}</p>}
        </div>
      ) : (
        <div className="mt-8 text-left surface-raised rounded-xl p-4 text-sm text-fg-2 leading-relaxed">
          <p className="text-fg font-medium">Sign-in is not set up yet</p>
          <p className="mt-2">
            Add a Google OAuth client ID to <span className="font-mono text-fg">.env.local</span> as{' '}
            <span className="font-mono text-fg">VITE_GOOGLE_CLIENT_ID</span>, then restart the dev server. See{' '}
            <span className="font-mono text-fg">.env.example</span>.
          </p>
        </div>
      )}

      <p className="mt-8 text-sm text-fg-3 leading-relaxed">
        {demo
          ? 'Your account keeps your registrations in one place.'
          : 'We use your Google account only to confirm who is registering. We see your name, email address and profile photo.'}
      </p>
    </div>
    </div>
  );
}
