import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import TermsDocument, { TermsDialog } from './TermsDocument';
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

  if (declinedView) {
    return (
      <TermsDialog
        title="You haven’t accepted the terms"
        meta="Registration Terms and Conditions · Version 1, 4 November 2026"
        actions={(
          <>
            <button type="button" onClick={() => { setOpen(false); signOut(); }} className="btn-secondary h-11 px-5 text-sm justify-center">Sign out</button>
            <button type="button" onClick={() => setDeclinedView(false)} className="btn-primary h-11 px-5 text-sm justify-center">Read the terms again</button>
          </>
        )}
      >
        <p className="px-2 pb-6 max-w-xl text-[15px] leading-relaxed text-fg-2">
          You can’t register with Bharat Mahotsav Festivals LLP, including for Bharat Connect, without accepting its
          Registration Terms and Conditions. Your decision has been recorded, and you can read the terms again and
          accept them at any time.
        </p>
      </TermsDialog>
    );
  }

  return (
    <TermsDialog
      title="Registration Terms and Conditions"
      meta={`Signed in as ${user.email} · Please read and accept to continue · Version 1, 4 November 2026`}
      actions={(
        <>
          <button type="button" onClick={handleDisagree} disabled={saving} className="btn-secondary h-11 px-5 text-sm justify-center">Disagree</button>
          <button type="button" onClick={handleAgree} disabled={saving} className="btn-primary h-11 px-6 text-sm justify-center">
            {saving ? 'Saving…' : 'I agree'}
          </button>
        </>
      )}
    >
      <TermsDocument />
      <p className="px-2 pt-3 pb-4 text-xs text-fg-3">
        Your decision is recorded with the date, time and your email address, as clause 18.3 describes.
      </p>
    </TermsDialog>
  );
}
