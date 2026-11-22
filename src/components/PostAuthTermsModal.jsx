import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck, Check, X, ExternalLink, ArrowRight, RotateCcw, AlertCircle, FileText, LogOut
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { recordTermsConsent } from '../data/registry';
import {
  TERMS_LINK, hasUserDecidedTerms, getUserTermsDecision, setUserTermsDecision
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
      portalTitle: 'Post-Login Account Activation',
      note: 'User accepted Conclave Terms & Protocol post-authentication.',
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
      portalTitle: 'Post-Login Account Activation',
      note: 'User selected Disagree on post-login terms screen.',
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
                Protocol &amp; Accreditations
              </span>
              <span className="text-[11px] font-mono text-fg-3">
                Account Activation · Step 2 of 2
              </span>
            </div>
            <h2 id="post-auth-terms-title" className="mt-1.5 font-serif text-xl sm:text-2xl text-fg font-medium">
              {declinedView
                ? 'Conclave Terms Declined'
                : `Welcome, ${user.name || user.email?.split('@')[0] || 'Delegate'}`}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-fg-2 leading-relaxed">
              {declinedView
                ? 'You have chosen to disagree with the Bharat Connect 2026 Protocol.'
                : 'Please review and accept the Conclave Terms & Protocol Note to activate your accreditation, passes, and deal-room access.'}
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
                  Notice: Access Restricted Without Protocol Consent
                </p>
                <p>
                  As an international bilateral business conclave hosting ministerial and diplomatic delegations,
                  issuance of sovereign accreditation IDs (BMF.BC-DGO-, -SEO-, -CBC-), security clearance badges, and private
                  B2B deal-room reservations strictly requires compliance with the Conclave Protocol.
                </p>
                <p className="mt-2 text-xs text-fg-3">
                  Your decision (Disagreed) has been logged with the Secretariat. You can re-review the protocol at any time to activate your account.
                </p>
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
            /* Active Consent View */
            <>
              <div className="rounded-xl border border-line bg-surface-1/50 p-4 space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-gold-text">
                  Conclave Code of Conduct &amp; Legal Framework
                </div>
                <ul className="space-y-2.5 text-xs sm:text-[13px] text-fg-2">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-gold-text shrink-0 mt-0.5" strokeWidth={2} />
                    <span>
                      <strong className="text-fg font-medium">Non-Transferable Credentials: </strong>
                      Official accreditation badges and unique IDs (BMF.BC-00001 onwards) are issued to registered individuals and cannot be transferred or shared without Secretariat approval.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-gold-text shrink-0 mt-0.5" strokeWidth={2} />
                    <span>
                      <strong className="text-fg font-medium">Diplomatic &amp; Bilateral Decorum: </strong>
                      Participants agree to maintain professional business conduct during ministerial plenaries, sector roundtables, and high-level Arab delegation meetings at Yashobhoomi.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-gold-text shrink-0 mt-0.5" strokeWidth={2} />
                    <span>
                      <strong className="text-fg font-medium">CEPA Corridor Confidentiality: </strong>
                      Discussions and documents shared inside private B2B deal rooms are protected under standard sovereign bilateral non-disclosure protocols.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-gold-text shrink-0 mt-0.5" strokeWidth={2} />
                    <span>
                      <strong className="text-fg font-medium">Data Protection &amp; Security: </strong>
                      Account information is securely processed in accordance with the Digital Personal Data Protection (DPDP) Act of India and conclave compliance standards.
                    </span>
                  </li>
                </ul>
              </div>

              {/* View Complete Legal PDF Link */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-line text-xs">
                <div className="flex items-center gap-2 text-fg-2">
                  <FileText className="w-4 h-4 text-gold-text shrink-0" strokeWidth={1.5} />
                  <span>Official Secretariat Terms &amp; Conditions Document</span>
                </div>
                <a
                  href={TERMS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gold-text hover:text-gold-light hover:underline font-mono text-[11px] font-medium"
                >
                  <span>Read PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!declinedView && (
          <div className="p-4 sm:p-5 border-t border-line bg-surface-1/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-fg-3 text-center sm:text-left">
              Your decision will be recorded with timestamp for conclave accreditation records.
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
                <span>{saving ? 'Recording…' : 'I Agree to Terms'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
