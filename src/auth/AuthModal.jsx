import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { BrandMark } from '../components/Navbar';
import AuthForm from './AuthForm';

/*
  The dedicated login window. Opened with openAuth({ mode: 'signin', reason, then }) from anywhere.
  Accounts are Firebase accounts: Google, Apple, or email and password.
*/

export default function AuthModal() {
  const { authRequest, closeAuth } = useAuth();
  const dialogRef = useRef(null);

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

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={closeAuth} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain bg-surface-2 border border-line-strong rounded-2xl p-5 sm:p-8 shadow-2xl animate-slide-up focus:outline-none"
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

        <h2 id="auth-title" className="mt-6 font-serif text-2xl font-medium text-fg">Login to Bharat Connect</h2>
        {authRequest.reason && <p className="mt-2 text-sm text-gold-text">{authRequest.reason}</p>}
        <p className="mt-2 text-[15px] text-fg-2 leading-relaxed">
          Sign in to access your accreditations, passes, and deal rooms.
        </p>

        <div className="mt-6">
          <AuthForm mode="signin" />
        </div>
      </div>
    </div>,
    document.body
  );
}
