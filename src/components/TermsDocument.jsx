import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TERMS_DOC, TERMS_PDF } from '../data/registrationTerms';

/*
  The Registration Terms and Conditions, set like the printed agreement: an ivory sheet, a serif
  text face, clause numbers hanging in the left margin. TermsDialog is the quiet window both
  terms pop-ups share (after sign-in, and on each registration portal).
*/

const INK = '#2a2620';
const MUTED = '#6b645a';
const PAPER = '#fbf8f1';
const RULE = 'rgba(42, 38, 32, 0.12)';
const SERIF = "Georgia, 'Times New Roman', serif";

// "2.1 Registration makes…" → ["2.1", "Registration makes…"]
const splitNumber = (clause) => {
  const m = clause.match(/^(\d+\.\d+)\s+(.*)$/s);
  return m ? [m[1], m[2]] : ['', clause];
};

export default function TermsDocument() {
  const d = TERMS_DOC;
  return (
    <article
      aria-label="Registration Terms and Conditions"
      className="rounded-xl px-5 sm:px-10 py-8 text-[14px] sm:text-[15px] leading-[1.65]"
      style={{ background: PAPER, color: INK, fontFamily: SERIF, boxShadow: `inset 0 0 0 1px ${RULE}` }}
    >
      <p className="text-center text-[13px]" style={{ color: MUTED }}>
        {d.address}
        <br />
        {d.contact}
      </p>
      <hr className="my-6 border-0 h-px" style={{ background: INK }} />

      {d.intro.map((t) => <p key={t.slice(0, 24)} className="mb-4">{t}</p>)}

      {d.sections.map((s) => (
        <section key={s.n} className="mt-8">
          <h3 className="grid grid-cols-[32px_1fr] sm:grid-cols-[40px_1fr] gap-x-2 text-[15px] sm:text-[16px] font-semibold">
            <span style={{ color: MUTED }}>{s.n}.</span>
            <span>{s.heading}</span>
          </h3>
          {s.clauses.map((c) => {
            const [num, text] = splitNumber(c);
            return (
              <p key={c.slice(0, 32)} className="mt-3 grid grid-cols-[32px_1fr] sm:grid-cols-[40px_1fr] gap-x-2">
                <span className="tabular-nums text-[13px] pt-px" style={{ color: MUTED }}>{num}</span>
                <span>{text}</span>
              </p>
            );
          })}
        </section>
      ))}

      <p className="mt-10 pt-4 text-center text-[12px]" style={{ color: MUTED, borderTop: `1px solid ${RULE}` }}>
        Bharat Mahotsav Festivals LLP · Registration Terms and Conditions · Version 1
      </p>
    </article>
  );
}

/* The shared window: title, the scrolling body, and the PDF link with the actions underneath. */
export function TermsDialog({ title, meta, children, actions }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    ref.current?.focus();
    return () => { document.documentElement.style.overflow = prev; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[105] flex items-end sm:items-center justify-center sm:p-6 bg-black/70 animate-fade-in">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-dialog-title"
        className="w-full sm:max-w-3xl max-h-[92dvh] flex flex-col bg-surface-0 border border-line rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up focus:outline-none"
      >
        <header className="px-5 sm:px-8 pt-6 pb-4">
          <h2 id="terms-dialog-title" className="font-serif text-2xl text-fg">{title}</h2>
          <p className="mt-1 text-sm text-fg-3">{meta}</p>
        </header>

        <div className="px-3 sm:px-6 overflow-y-auto flex-1 min-h-0">{children}</div>

        <footer className="px-5 sm:px-8 py-4 border-t border-line flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <a href={TERMS_PDF} target="_blank" rel="noopener noreferrer" className="text-sm text-fg-2 underline underline-offset-4 decoration-line-strong hover:text-fg hover:decoration-fg transition-colors text-center sm:text-left">
            Download the PDF
          </a>
          <div className="grid grid-cols-2 sm:flex gap-3">{actions}</div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
