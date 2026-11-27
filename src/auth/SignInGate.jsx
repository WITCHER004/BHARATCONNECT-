import { useEffect, useState } from 'react';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';
import { watchMyRegistrationsForUser } from '../data/registry';

/*
  Shows children only to signed-in visitors. Everyone else sees a sign-in panel in its place.
  `title` and `reason` describe what they are signing in for.
  `portalType` can be 'startup' or 'aimf' to enforce mutual exclusion:
    - Users registered with AIMF cannot access or log in to the Startups portal.
    - Users registered with Startups cannot access or log in to the AIMF portal.
*/
export default function SignInGate({ title, reason, portalType, onNavigate, children }) {
  const { user, ready, signOut } = useAuth();
  const [registrations, setRegistrations] = useState(null);

  useEffect(() => {
    if (!user) {
      setRegistrations([]);
      return undefined;
    }
    return watchMyRegistrationsForUser(user, (list) => {
      setRegistrations(list);
    });
  }, [user]);

  // until Firebase has restored the session, don't flash the sign-in panel at a signed-in visitor
  if (!ready) return <div className="min-h-[320px]" aria-busy="true" />;

  // Not signed in yet: show sign-in panel
  if (!user) {
    return (
      <div className="px-4 sm:px-0">
        <div className="max-w-xl mx-auto surface-card rounded-2xl p-8 sm:p-10 text-center">
          <span className="ornament justify-center" aria-hidden="true">
            <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" fill="currentColor" /></svg>
          </span>
          <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-medium text-fg">{title}</h2>
          <p className="mt-3 text-[15px] text-fg-2 leading-relaxed">{reason}</p>

          <div className="mt-8 text-left">
            <AuthForm mode="signin" />
          </div>

          <p className="mt-8 text-sm text-fg-3 leading-relaxed">
            Your account keeps your accreditations, passes, and deal rooms securely in one place.
          </p>
        </div>
      </div>
    );
  }

  // If user is signed in but registrations are still loading and portalType check is required
  if (portalType && registrations === null) {
    return <div className="min-h-[320px] flex items-center justify-center text-sm text-fg-3" aria-busy="true">Verifying credentials…</div>;
  }

  // Mutual exclusion check 1: AIMF registered user trying to access Startup portal
  if (portalType === 'startup') {
    const aimfReg = (registrations || []).find((r) => r.type === 'aimf');
    if (aimfReg) {
      return (
        <div className="px-4 sm:px-0 animate-fade-in">
          <div className="max-w-xl mx-auto surface-card rounded-2xl p-8 sm:p-10 text-center border border-line-strong shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D03B3B]/10 border border-[#D03B3B]/30 flex items-center justify-center text-[#D03B3B] mb-5">
              <ShieldAlert className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#FAB219]/15 text-[#FAB219] border border-[#FAB219]/30 mb-3">
              Portal Access Restricted
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
              AIMF Account Cannot Access Startups
            </h2>
            <p className="mt-3 text-[15px] text-fg-2 leading-relaxed">
              Your account (<span className="font-mono text-xs text-fg">{user.email}</span>) is already registered under the <strong className="text-fg">AIMF Cultural & Creative Portal</strong>.
            </p>
            <div className="mt-5 p-4 rounded-xl bg-surface-3 border border-line inline-block text-left w-full max-w-sm">
              <div className="text-xs text-fg-3">Your AIMF Accreditation Reference</div>
              <div className="font-mono text-base font-semibold text-gold-text mt-0.5">{aimfReg.id || aimfReg.ref}</div>
              {aimfReg.organisation && <div className="text-xs text-fg-2 mt-1 truncate">{aimfReg.organisation}</div>}
            </div>
            <p className="mt-4 text-xs text-fg-3 leading-relaxed">
              Per Bharat Connect guidelines, a person registered with the AIMF portal cannot log in to or register in the Startups portal.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate('aimf');
                  else window.location.hash = 'aimf';
                }}
                className="btn-primary h-11 px-6 text-sm w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to AIMF Cultural Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="btn-secondary h-11 px-5 text-sm w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer text-coral"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out / Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Mutual exclusion check 2: Startup registered user trying to access AIMF portal
  if (portalType === 'aimf') {
    const startupReg = (registrations || []).find((r) => r.type === 'startup');
    if (startupReg) {
      return (
        <div className="px-4 sm:px-0 animate-fade-in">
          <div className="max-w-xl mx-auto surface-card rounded-2xl p-8 sm:p-10 text-center border border-line-strong shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D03B3B]/10 border border-[#D03B3B]/30 flex items-center justify-center text-[#D03B3B] mb-5">
              <ShieldAlert className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#FAB219]/15 text-[#FAB219] border border-[#FAB219]/30 mb-3">
              Portal Access Restricted
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-fg">
              Startup Account Cannot Access AIMF
            </h2>
            <p className="mt-3 text-[15px] text-fg-2 leading-relaxed">
              Your account (<span className="font-mono text-xs text-fg">{user.email}</span>) is already registered under the <strong className="text-fg">Startup Showcase Portal</strong>.
            </p>
            <div className="mt-5 p-4 rounded-xl bg-surface-3 border border-line inline-block text-left w-full max-w-sm">
              <div className="text-xs text-fg-3">Your Startup Registration Reference</div>
              <div className="font-mono text-base font-semibold text-gold-text mt-0.5">{startupReg.id || startupReg.ref}</div>
              {startupReg.organisation && <div className="text-xs text-fg-2 mt-1 truncate">{startupReg.organisation}</div>}
            </div>
            <p className="mt-4 text-xs text-fg-3 leading-relaxed">
              Per Bharat Connect guidelines, a person registered with the Startups portal cannot log in to or register in the AIMF portal.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate('startup');
                  else window.location.hash = 'startup';
                }}
                className="btn-primary h-11 px-6 text-sm w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Startup Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => signOut()}
                className="btn-secondary h-11 px-5 text-sm w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer text-coral"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out / Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
