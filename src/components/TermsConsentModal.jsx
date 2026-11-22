import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck, Check, X, ExternalLink, ArrowRight, RotateCcw, Home, AlertCircle, FileText
} from 'lucide-react';
import { PORTAL_TERMS, TERMS_LINK, hasAccepted, accept, decline } from '../data/terms';

export default function TermsConsentModal({
  portalId = 'global',
  isOpen = false,
  onAgree,
  onDisagree,
  onNavigate,
}) {
  const [agreed, setAgreed] = useState(() => hasAccepted(portalId));
  const [declinedState, setDeclinedState] = useState(false);

  useEffect(() => {
    setAgreed(hasAccepted(portalId));
    setDeclinedState(false);
  }, [portalId, isOpen]);

  // If already agreed and not forced open, nothing to render
  if (!isOpen || (agreed && !declinedState)) {
    return null;
  }

  const terms = PORTAL_TERMS[portalId] || PORTAL_TERMS.global;

  const handleAgree = () => {
    accept(portalId);
    setAgreed(true);
    setDeclinedState(false);
    if (onAgree) onAgree();
  };

  const handleDisagree = () => {
    decline(portalId);
    setDeclinedState(true);
    if (onDisagree) onDisagree();
  };

  const handleReviewAgain = () => {
    setDeclinedState(false);
  };

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.hash = 'home';
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="relative w-full max-w-2xl bg-surface-0 border border-line-strong rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85),0_0_0_1px_rgba(217,179,106,0.2)] overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-gold-foil via-coral to-gold-text" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-line flex items-start gap-4 bg-surface-1/70">
          <div className="w-11 h-11 rounded-xl bg-gold-foil/15 border border-gold-foil/30 flex items-center justify-center text-gold-text shrink-0 mt-0.5">
            {declinedState ? (
              <AlertCircle className="w-5 h-5 text-coral" strokeWidth={1.75} />
            ) : (
              <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-gold-text bg-surface-3 px-2 py-0.5 rounded-full border border-line">
                Protocol &amp; Accreditations
              </span>
              <span className="text-[11px] font-mono text-fg-3">
                Palash Hall, Yashobhoomi
              </span>
            </div>
            <h2 id="terms-title" className="mt-1.5 font-serif text-xl sm:text-2xl text-fg font-medium">
              {declinedState ? 'Terms & Conditions Declined' : terms.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-fg-2 leading-relaxed">
              {declinedState
                ? 'You have chosen to decline the conclave terms for this portal.'
                : terms.subtitle}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {declinedState ? (
            /* Declined View */
            <div className="py-4 space-y-4 text-center sm:text-left">
              <div className="p-4 rounded-xl border border-coral/30 bg-coral/10 text-fg-2 text-xs sm:text-sm leading-relaxed">
                <p className="font-medium text-fg mb-1">Agreement Required for Portal Access</p>
                Participation in the Bharat Connect Conclave, sovereign networking plenaries, startup accreditation, and deal-room scheduling requires accepting the official Conclave Protocol &amp; Security Terms.
              </div>

              <p className="text-xs text-fg-3 leading-relaxed">
                If you made a mistake or wish to review the policy details again, click <strong className="text-fg">"Review &amp; Accept Terms"</strong> below. Otherwise, you may safely return to the main summit overview page.
              </p>
            </div>
          ) : (
            /* Standard Terms Bullets View */
            <>
              <div className="text-xs font-mono uppercase tracking-wider text-fg-3 mb-1">
                Key Accreditations &amp; Compliance Clauses
              </div>

              <ul className="space-y-3">
                {terms.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2/60 border border-line/60">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-gold-foil/20 text-gold-text flex items-center justify-center shrink-0 text-[10px] font-mono font-bold">
                      {i + 1}
                    </span>
                    <span className="text-xs sm:text-[13px] text-fg-2 leading-relaxed">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Master Terms External Document Link */}
              <div className="pt-2 flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-3/50 border border-line text-xs">
                <div className="flex items-center gap-2 text-fg-2">
                  <FileText className="w-4 h-4 text-gold-text shrink-0" />
                  <span>Full Legal Master Terms (Bharat Mahotsav Festivals LLP)</span>
                </div>
                <a
                  href={TERMS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gold-text hover:text-fg font-medium hover:underline shrink-0"
                >
                  <span>View PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-[11px] text-fg-3 leading-relaxed italic border-t border-line/60 pt-3">
                {terms.legalNotice}
              </p>
            </>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-5 border-t border-line bg-surface-1 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          {declinedState ? (
            <>
              <button
                type="button"
                onClick={handleGoHome}
                className="btn-secondary h-11 px-5 w-full sm:w-auto text-xs sm:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-fg-3" />
                <span>Return to Summit Overview</span>
              </button>

              <button
                type="button"
                onClick={handleReviewAgain}
                className="btn-primary h-11 px-6 w-full sm:w-auto text-xs sm:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review &amp; Accept Terms</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDisagree}
                className="h-11 px-5 rounded-xl border border-line text-fg-3 hover:text-fg hover:bg-surface-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Disagree</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAgree}
                  className="btn-primary h-11 px-7 rounded-xl text-xs sm:text-sm font-medium flex-1 sm:flex-initial flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  <span>I Agree &amp; Continue</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
