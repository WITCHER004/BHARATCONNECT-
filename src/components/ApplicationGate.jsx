import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Mail, RotateCcw, XCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { watchMyRegistrations } from '../data/registry';

/*
  Wraps a registration portal. Once the signed-in person has applied on this portal, their latest
  application decides what they see, live:
    pending  → a "waiting for approval" screen instead of the form (until an admin decides)
    approved → a confirmation, with the option to submit another
    declined → an explanation, with the option to apply again
  With no application yet, the portal (children) shows as normal.
*/

const LABEL = { delegate: 'event registration', startup: 'startup registration', aimf: 'AIMF accreditation', collaboration: 'collaboration request' };

const fmt = (iso) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });

export default function ApplicationGate({ type, onAnother, children }) {
  const { user } = useAuth();
  const [latest, setLatest] = useState(undefined); // undefined = still loading
  const [another, setAnother] = useState(false);

  useEffect(() => watchMyRegistrations(user?.uid, (list) => {
    const mine = list.filter((r) => r.type === type).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    setLatest(mine[0] || null);
  }), [user?.uid, type]);

  if (latest === undefined) return <div className="min-h-[320px]" aria-busy="true" />;
  if (!latest || (another && latest.status !== 'pending')) return children;

  const what = LABEL[type];
  const card = 'max-w-2xl mx-auto surface-card rounded-2xl p-8 sm:p-10 text-center';
  const ref = (
    <div className="mt-6 inline-flex flex-col items-center px-5 py-3 rounded-xl bg-surface-3 border border-line">
      <span className="text-xs text-fg-3">Reference</span>
      <span className="font-mono text-lg font-semibold text-gold-text">{latest.id}</span>
    </div>
  );

  if (latest.status === 'approved') {
    return (
      <div className={card} role="status">
        <CheckCircle2 className="w-12 h-12 mx-auto text-[#0CA30C]" strokeWidth={1.5} />
        <h2 className="mt-4 font-serif text-3xl text-fg">Your {what} is approved</h2>
        <p className="mt-2 text-fg-2 leading-relaxed">
          Approved {latest.decidedAt ? `on ${fmt(latest.decidedAt)}` : ''}. A confirmation has been sent to {latest.email}.
        </p>
        {ref}
        <div className="mt-8">
          <button onClick={() => { setAnother(true); onAnother?.(); }} className="btn-secondary h-10 px-4 text-sm">Submit another {what}</button>
        </div>
      </div>
    );
  }

  if (latest.status === 'declined') {
    return (
      <div className={card} role="status">
        <XCircle className="w-12 h-12 mx-auto text-[#D03B3B]" strokeWidth={1.5} />
        <h2 className="mt-4 font-serif text-3xl text-fg">Your {what} was not approved</h2>
        <p className="mt-2 text-fg-2 leading-relaxed">
          {latest.note || 'The Secretariat could not approve this application.'} For details, write to the Secretariat quoting your reference.
        </p>
        {ref}
        <div className="mt-8">
          <button onClick={() => { setAnother(true); onAnother?.(); }} className="btn-primary h-10 px-4 text-sm">
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} /> Apply again
          </button>
        </div>
      </div>
    );
  }

  // pending: no new application until this one is decided
  return (
    <div className={card} role="status" aria-live="polite">
      <span className="relative mx-auto w-16 h-16 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-[#FAB219]/30 motion-safe:animate-ping" aria-hidden="true" />
        <Clock className="relative w-12 h-12 text-[#FAB219]" strokeWidth={1.5} />
      </span>
      <h2 className="mt-4 font-serif text-3xl text-fg">Waiting for approval</h2>
      <p className="mt-2 text-fg-2 leading-relaxed">
        We received your {what} on {fmt(latest.submittedAt)}. The Secretariat is reviewing it, and this page updates
        on its own as soon as a decision is made.
      </p>
      {ref}
      <ol className="mt-8 grid grid-cols-3 gap-2 text-xs text-left">
        {[['Submitted', true], ['Under review', true], ['Decision', false]].map(([label, done], i) => (
          <li key={label} className={`p-3 rounded-xl border ${done ? 'border-[#FAB219]/50 bg-[#FAB219]/[0.08] text-fg' : 'border-line text-fg-3'}`}>
            <span className="block font-mono text-[11px] text-fg-3">0{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-fg-3 flex items-center justify-center gap-2">
        <Mail className="w-4 h-4" strokeWidth={1.5} /> We'll also email {latest.email} with the decision.
      </p>
    </div>
  );
}
