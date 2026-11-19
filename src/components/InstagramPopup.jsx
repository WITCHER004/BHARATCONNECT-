import { useState, useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { InstagramIcon, INSTAGRAM_URL, INSTAGRAM_HANDLE } from './InstagramIcon';

const DISMISS_KEY = 'bc-instagram-popup-dismissed';
const SHOW_DELAY_MS = 6000;

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

// Floating Instagram button on the bottom-left, with a "follow us" card that pops up once per visit
export default function InstagramPopup() {
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
    <div
      className="fixed left-4 sm:left-6 z-40 flex flex-col items-start gap-3"
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Follow Bharat Connect on Instagram"
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
              <InstagramIcon className="w-5 h-5 text-gold-text" />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-fg leading-5">Follow us on Instagram</span>
              <span className="text-xs font-mono text-fg-3 leading-4 truncate">{INSTAGRAM_HANDLE}</span>
            </span>
          </div>

          <p className="mt-3 text-[13px] leading-5 text-fg-2">
            Speaker reveals, delegation news and live moments from Bharat Connect 2026.
          </p>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="mt-4 btn-secondary h-9 px-3 text-sm w-full justify-center"
          >
            Follow on Instagram
            <ArrowUpRight className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
          </a>
        </div>
      )}

      <button
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? 'Hide Instagram card' : 'Bharat Connect on Instagram'}
        aria-expanded={open}
        className="w-12 h-12 rounded-full bg-surface-0/95 backdrop-blur-md border border-gold-foil/40 text-gold-text shadow-xl hover:border-gold-foil flex items-center justify-center transition-colors duration-200 cursor-pointer motion-safe:active:scale-95 [-webkit-tap-highlight-color:transparent]"
      >
        <InstagramIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
