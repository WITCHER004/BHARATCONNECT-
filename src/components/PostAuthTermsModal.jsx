import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck, Check, X, RotateCcw, AlertCircle, LogOut
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import TermsDocument from './TermsDocument';
import { recordTermsConsent } from '../data/registry';
import {
  getUserTermsDecision, setUserTermsDecision
} from '../data/terms';

export default function PostAuthTermsModal() {
  const { user, signOut } = useAuth();
  const [decision, setDecision] = useState(() => (user ? getUserTermsDecision(user.uid || user.email) : null));
  const [open, setOpen] = useState(false);
  const [declinedView, setDeclinedView] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setOpen(false);
      setDecision(null);
      setDeclinedView(false);
      return;
    }

    const currentDecision = getUserTermsDecision(user.uid || user.email);
    setDecision(currentDecision);

    // If user hasn't made a decision yet, prompt them immediately after sign in / sign up!
    if (!currentDecision) {
      setOpen(true);
      setDeclinedView(false);
    } else if (currentDecision === 'disagreed') {
      // If user previously disagreed, keep the modal closed unless user reopens it, or display the restriction
      setOpen(false);
    } else {
      setOpen(false);
    }
  }, [user]);

  // Listen for terms change events
  useEffect(() => {
    const handler = (e) => {
      if (user && e.detail?.uidOrEmail === (user.uid || user.email)) {
        setDecision(e.detail.decision);
      }
    };
    window.addEventListener('babc-user-terms-change', handler);
    return () => window.removeEventListener('babc-user-terms-change', handler);
  }, [user]);

  if (!user || !open) return null;

  const handleAgree = async () => {
    setSaving(true);
    await recordTermsConsent({
      uid: user.uid,
      userName: user.name || user.displayName || user.email?.split('@')[0] || 'Conclave Delegate',
      userEmail: user.email,
      decision: 'agreed',
      portal: 'post-login',
      portalTitle: 'Registration Terms and Conditions v1 (after sign-in)',
      note: 'Accepted the Registration Terms and Conditions (v1, 04 Nov 2026) after sign-in.',
    });
    setUserTermsDecision(user.uid || user.email, 'agreed');
    setDecision('agreed');
    setSaving(false);
    setOpen(false);
  };

  const handleDisagree = async () => {
    setSaving(true);
    await recordTermsConsent({
      uid: user.uid,
      userName: user.name || user.displayName || user.email?.split('@')[0] || 'Conclave Delegate',
      userEmail: user.email,
      decision: 'disagreed',
      portal: 'post-login',
      portalTitle: 'Registration Terms and Conditions v1 (after sign-in)',
      note: 'Declined the Registration Terms and Conditions (v1, 04 Nov 2026) after sign-in.',
    });
    setUserTermsDecision(user.uid || user.email, 'disagreed');
    setDecision('disagreed');
    setSaving(false);
    setDeclinedView(true);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-auth-terms-title"
    >
      <div className="relative w-full max-w-2xl bg-surface-0 border border-line-strong rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85),0_0_0_1px_rgba(217,179,106,0.25)] overflow-hidden flex flex-col max-h-[min(92dvh,760px)] animate-slide-up">
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold-foil via-coral to-gold-text" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-line flex items-start gap-4 bg-surface-1/80">
          <div className="w-12 h-12 rounded-xl bg-gold-foil/15 border border-gold-foil/30 flex items-center justify-center text-gold-text shrink-0 mt-0.5">
            {declinedView ? (
              <AlertCircle className="w-6 h-6 text-coral" strokeWidth={1.75} />
            ) : (
              <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-gold-text bg-surface-3 px-2.5 py-0.5 rounded-full border border-line">
                Terms and Conditions
              </span>
              <span className="text-[11px] font-mono text-fg-3">
                Account Activation · Step 2 of 2
              </span>
            </div>
            <h2 id="post-auth-terms-title" className="mt-1.5 font-serif text-xl sm:text-2xl text-fg font-medium">
              {declinedView
                ? 'Terms and Conditions declined'
                : `Welcome, ${user.name || user.email?.split('@')[0] || 'Delegate'}`}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-fg-2 leading-relaxed">
              {declinedView
                ? 'You chose not to accept the Registration Terms and Conditions.'
                : 'Before you continue, please read and accept the Registration Terms and Conditions of Bharat Mahotsav Festivals LLP.'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {declinedView ? (
            /* Declined View */
            <div className="py-4 space-y-4 text-center sm:text-left">
              <div className="p-4 rounded-xl border border-coral/30 bg-coral/10 text-fg-2 text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold text-coral text-sm mb-1.5">
                  You can't register until you accept the Terms
                </p>
                <p>
                  Registering with Bharat Mahotsav Festivals LLP, including for Bharat Connect, requires acceptance of its
                  Registration Terms and Conditions. You can read them again and accept them at any time.
                </p>
                <p className="mt-2 text-xs text-fg-3">Your decision has been recorded.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeclinedView(false)}
                  className="w-full sm:w-auto btn-primary h-11 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
                  <span>Review &amp; Agree to Terms</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="w-full sm:w-auto h-11 px-4 text-sm text-fg-3 hover:text-coral transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Consent View: the official document, in full */
            <TermsDocument />
          )}
        </div>

        {/* Modal Footer */}
        {!declinedView && (
          <div className="p-4 sm:p-5 border-t border-line bg-surface-1/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-fg-3 text-center sm:text-left">
              Your decision is recorded with the date and time, as clause 18.3 describes.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={handleDisagree}
                disabled={saving}
                className="flex-1 sm:flex-none h-11 px-4 rounded-xl border border-coral/40 text-coral hover:bg-coral/10 text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
                <span>Disagree</span>
              </button>

              <button
                type="button"
                onClick={handleAgree}
                disabled={saving}
                className="flex-1 sm:flex-none btn-primary h-11 px-6 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Check className="w-4 h-4" strokeWidth={2.25} />
                <span>{saving ? 'Recording…' : 'I agree'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
