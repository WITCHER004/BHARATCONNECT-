import { ExternalLink, FileText } from 'lucide-react';
import { TERMS_DOC, TERMS_PDF } from '../data/registrationTerms';

/* The full Registration Terms and Conditions, readable in a scrolling box, with the official PDF. */
export default function TermsDocument({ className = '' }) {
  const d = TERMS_DOC;
  return (
    <div className={className}>
      <div className="rounded-xl border border-line bg-surface-1/60 max-h-[46dvh] overflow-y-auto px-4 sm:px-6 py-5 text-[13px] leading-relaxed text-fg-2" tabIndex={0} aria-label="Registration Terms and Conditions">
        <header className="text-center border-b border-line pb-4 mb-4">
          <p className="font-serif text-base font-semibold text-fg tracking-wide">{d.organisation}</p>
          <p className="mt-1 font-semibold text-fg">{d.title}</p>
          <p className="italic">{d.subtitle}</p>
          <p className="mt-2 text-xs text-fg-3">{d.address}</p>
          <p className="text-xs text-fg-3">{d.contact}</p>
        </header>
        {d.intro.map((t) => <p key={t.slice(0, 30)} className="mb-3">{t}</p>)}
        {d.sections.map((s) => (
          <section key={s.n} className="mt-5">
            <h3 className="font-semibold text-fg underline underline-offset-4 decoration-line-strong">{s.n}. {s.heading}</h3>
            {s.clauses.map((c) => <p key={c.slice(0, 40)} className="mt-2">{c}</p>)}
          </section>
        ))}
        <p className="mt-6 pt-3 border-t border-line text-[11px] text-fg-3 text-center">
          Bharat Mahotsav Festivals LLP | Registration Terms and Conditions | Version 1
        </p>
      </div>
      <a
        href={TERMS_PDF}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-2 border border-line text-xs text-fg-2 hover:border-line-strong"
      >
        <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-gold-text shrink-0" strokeWidth={1.5} /> Official document (PDF, Version 1, 04 Nov 2026)</span>
        <span className="inline-flex items-center gap-1 text-gold-text font-medium">Open PDF <ExternalLink className="w-3.5 h-3.5" /></span>
      </a>
    </div>
  );
}
