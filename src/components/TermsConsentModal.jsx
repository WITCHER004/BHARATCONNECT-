import { useState, useEffect } from 'react';
import { hasAccepted, accept, decline } from '../data/terms';
import TermsDocument, { TermsDialog } from './TermsDocument';

/* Shown on a registration portal until the visitor accepts the Registration Terms and Conditions. */
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

  if (!isOpen || (agreed && !declinedState)) return null;

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

  const handleGoHome = () => {
    if (onNavigate) onNavigate('home');
    else window.location.hash = 'home';
  };

  if (declinedState) {
    return (
      <TermsDialog
        title="You haven’t accepted the terms"
        meta="Registration Terms and Conditions · Version 1, 4 November 2026"
        actions={(
          <>
            <button type="button" onClick={handleGoHome} className="btn-secondary h-11 px-5 text-sm justify-center">Go to home</button>
            <button type="button" onClick={() => setDeclinedState(false)} className="btn-primary h-11 px-5 text-sm justify-center">Read the terms again</button>
          </>
        )}
      >
        <p className="px-2 pb-6 max-w-xl text-[15px] leading-relaxed text-fg-2">
          Registering with Bharat Mahotsav Festivals LLP, including for Bharat Connect, requires accepting its
          Registration Terms and Conditions. You can read them again and accept them whenever you’re ready.
        </p>
      </TermsDialog>
    );
  }

  return (
    <TermsDialog
      title="Registration Terms and Conditions"
      meta="Bharat Mahotsav Festivals LLP · Version 1, 4 November 2026 · Please read and accept to continue"
      actions={(
        <>
          <button type="button" onClick={handleDisagree} className="btn-secondary h-11 px-5 text-sm justify-center">Disagree</button>
          <button type="button" onClick={handleAgree} className="btn-primary h-11 px-6 text-sm justify-center">I agree</button>
        </>
      )}
    >
      <TermsDocument />
      <div className="h-4" aria-hidden="true" />
    </TermsDialog>
  );
}
