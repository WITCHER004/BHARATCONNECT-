import { useState, useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';

// shortcut: placeholder number, replace with the real WhatsApp bot number (country code, digits only)
export const WHATSAPP_NUMBER = '910000000000';

const DISMISS_KEY = 'bc-whatsapp-popup-dismissed';
const SHOW_DELAY_MS = 12000; // after the Instagram card, so the two don't appear at once

// Quick questions: each opens WhatsApp with the message already typed for the bot
const QUICK = [
  'Register as a delegate',
  'Programme and timings',
  'Venue and travel',
  'Startup showcase',
];

const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

// Floating WhatsApp bot button, stacked above the Instagram one, with a quick-question card
export default function WhatsAppPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (wasDismissed()) return undefined;
    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* storage unavailable: the card just closes for now */
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Bharat Connect on WhatsApp"
          className="relative w-[min(300px,calc(100vw-2rem))] p-4 rounded-2xl bg-surface-0/98 backdrop-blur-xl border border-line-strong shadow-2xl motion-safe:animate-slide-up"
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg text-fg-3 hover:text-fg hover:bg-surface-3 flex items-center justify-center transition-colors duration-150 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <span className="w-10 h-10 rounded-xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-5 h-5 text-gold-text" />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-fg leading-5">Ask our WhatsApp bot</span>
              <span className="text-xs text-fg-3 leading-4">Instant answers, any time</span>
            </span>
          </div>

          <p className="mt-3 text-[13px] leading-5 text-fg-2">Pick a question to start the chat.</p>

          <ul className="mt-3 flex flex-col gap-1.5">
            {QUICK.map((q) => (
              <li key={q}>
                <a
                  href={waLink(q)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="flex items-center justify-between gap-2 h-9 px-3 rounded-[10px] bg-surface-3 border border-line text-[13px] text-fg-2 hover:text-fg hover:border-line-strong transition-colors duration-150"
                >
                  {q}
                  <ArrowUpRight className="w-3.5 h-3.5 text-fg-3 shrink-0" strokeWidth={1.5} />
                </a>
              </li>
            ))}
          </ul>

          <a
            href={waLink('Hello Bharat Connect')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="mt-3 btn-secondary h-9 px-3 text-sm w-full justify-center"
          >
            Open WhatsApp
            <ArrowUpRight className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
          </a>
        </div>
      )}

      <button
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? 'Hide WhatsApp card' : 'Chat with Bharat Connect on WhatsApp'}
        aria-expanded={open}
        className="w-12 h-12 rounded-full bg-surface-0/95 backdrop-blur-md border border-gold-foil/40 text-gold-text shadow-xl hover:border-gold-foil flex items-center justify-center transition-colors duration-200 cursor-pointer motion-safe:active:scale-95 [-webkit-tap-highlight-color:transparent]"
      >
        <WhatsAppIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
