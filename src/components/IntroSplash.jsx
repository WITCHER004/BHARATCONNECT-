import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { FilmStage, makeSeek, FILM_END } from './HeroFilm';

/*
  The teaser as an opening: plays the full film over the page, then the card glides into
  its place in the hero (targetRef) while the overlay fades out smoothly, so the film settles
  into the site gracefully.
*/

const HOLD_AFTER_END = 0.8; // seconds to pause on the completed invitation card before settling
const SETTLE_MS = 950;
const FADE_MS = 750;

export default function IntroSplash({ targetRef, onDone }) {
  const rootRef = useRef(null);
  const bgRef = useRef(null);
  const moverRef = useRef(null);
  const stageRef = useRef(null);
  const skipRef = useRef(null);
  const settleRef = useRef(null);
  const skipFnRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const stage = stageRef.current;
    const mover = moverRef.current;
    const root = rootRef.current;
    const bg = bgRef.current;
    if (!stage || !mover || !root || !bg) return;

    const seek = makeSeek(stage, { full: true });
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const fit = () => {
      const s = (Math.min(window.innerWidth, window.innerHeight) / 1080) * 0.94;
      stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    fit();
    window.addEventListener('resize', fit);

    let t = 0;
    let last = null;
    let raf = 0;
    let settling = false;
    let finishTimer = 0;
    let alive = true; // false after cleanup

    // Fast skip: smoothly fades out the teaser overlay in 400ms
    const handleSkip = () => {
      if (settling) return;
      settling = true;
      alive = false;
      cancelAnimationFrame(raf);
      if (skipRef.current) {
        skipRef.current.style.opacity = '0';
        skipRef.current.style.pointerEvents = 'none';
      }
      root.style.transition = 'opacity 400ms ease';
      root.style.opacity = '0';
      root.style.pointerEvents = 'none';
      finishTimer = window.setTimeout(() => doneRef.current?.(), 420);
    };
    skipFnRef.current = handleSkip;

    // Natural settle & fade at the end of the teaser
    const settle = () => {
      if (settling) return;
      settling = true;
      cancelAnimationFrame(raf);
      seek(FILM_END);

      if (skipRef.current) {
        skipRef.current.style.transition = 'opacity 250ms ease';
        skipRef.current.style.opacity = '0';
        skipRef.current.style.pointerEvents = 'none';
      }

      // Fade out ancillary teaser elements so only the card and background transition
      const cta = stage.querySelector('[data-k="cta"]');
      if (cta) { cta.style.transition = 'opacity 250ms ease'; cta.style.opacity = '0'; }
      const headline = stage.querySelector('[data-k="headline"]');
      if (headline) { headline.style.transition = 'opacity 250ms ease'; headline.style.opacity = '0'; }
      const routes = stage.querySelector('.film-routes');
      if (routes) { routes.style.transition = 'opacity 250ms ease'; routes.style.opacity = '0'; }
      const labelI = stage.querySelector('[data-k="labelIndia"]');
      if (labelI) { labelI.style.transition = 'opacity 250ms ease'; labelI.style.opacity = '0'; }
      const labelA = stage.querySelector('[data-k="labelArab"]');
      if (labelA) { labelA.style.transition = 'opacity 250ms ease'; labelA.style.opacity = '0'; }

      const from = stage.querySelector('[data-k="group"]')?.getBoundingClientRect();
      const to = targetRef?.current?.querySelector('[data-k="group"]')?.getBoundingClientRect();

      // Only glide if hero target card is in the visible desktop viewport
      if (from && to && from.width > 0 && to.width > 0 && to.top < window.innerHeight && to.bottom > 0) {
        const fx = from.left + from.width / 2;
        const fy = from.top + from.height / 2;
        const dx = to.left + to.width / 2 - fx;
        const dy = to.top + to.height / 2 - fy;
        const k = to.width / from.width;
        mover.style.transformOrigin = `${fx}px ${fy}px`;
        mover.style.transition = `transform ${SETTLE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
        requestAnimationFrame(() => {
          mover.style.transform = `translate(${dx}px, ${dy}px) scale(${k})`;
        });

        // Graceful fade of background and root overlay as the card glides home
        bg.style.transition = `opacity ${FADE_MS}ms ease ${SETTLE_MS - FADE_MS}ms`;
        bg.style.opacity = '0';
        root.style.transition = `opacity ${FADE_MS}ms ease ${SETTLE_MS - FADE_MS}ms`;
        root.style.opacity = '0';
        root.style.pointerEvents = 'none';

        finishTimer = window.setTimeout(() => doneRef.current?.(), SETTLE_MS + 40);
      } else {
        // Full smooth fade for mobile or off-screen hero
        root.style.transition = `opacity ${FADE_MS}ms ease`;
        root.style.opacity = '0';
        root.style.pointerEvents = 'none';
        mover.style.transition = `opacity ${FADE_MS}ms ease`;
        mover.style.opacity = '0';

        finishTimer = window.setTimeout(() => doneRef.current?.(), FADE_MS + 40);
      }
    };
    settleRef.current = settle;

    const frame = (now) => {
      if (!alive) return;
      if (last !== null) {
        t = Math.min(FILM_END + HOLD_AFTER_END, t + (now - last) / 1000);
      }
      last = now;

      // Keep seek clamped at FILM_END during the hold period
      seek(Math.min(FILM_END, t));

      if (t >= FILM_END + HOLD_AFTER_END) {
        settle();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') {
        skipFnRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);

    seek(0);
    // start once fonts are in, but never wait more than 1.2 s for them
    let started = false;
    const start = () => {
      if (started || !alive || settling) return;
      started = true;
      raf = requestAnimationFrame(frame);
    };
    document.fonts.ready.then(start);
    const fontTimeout = window.setTimeout(start, 1200);

    return () => {
      alive = false;
      clearTimeout(fontTimeout);
      cancelAnimationFrame(raf);
      clearTimeout(finishTimer);
      window.removeEventListener('resize', fit);
      window.removeEventListener('keydown', onKey);
      settleRef.current = null;
      skipFnRef.current = null;
      html.style.overflow = prevOverflow;
    };
  }, [targetRef]);

  // rendered into <body>: the page wrapper is transformed, which would trap a fixed overlay
  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] will-change-[opacity]"
      role="dialog"
      aria-label="Bharat Connect 2026 opening teaser"
    >
      <div ref={bgRef} className="absolute inset-0 bg-royal" />

      {/* Brand Watermark / Conclave Tag */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
        <span className="font-mono text-xs uppercase tracking-widest text-gold-text">
          Bharat Connect 2026
        </span>
      </div>

      <div ref={moverRef} className="babc-film absolute inset-0 overflow-visible">
        <FilmStage stageRef={stageRef} titles className="film-stage-intro" />
      </div>

      <button
        ref={skipRef}
        onClick={() => skipFnRef.current?.()}
        className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8 z-20 h-10 px-5 rounded-full text-xs font-mono uppercase tracking-wider text-fg-2 hover:text-fg bg-surface-2/80 hover:bg-surface-3 border border-line hover:border-gold-foil/60 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
        aria-label="Skip teaser to conclave"
      >
        <span>Skip intro</span>
        <ArrowRight className="w-3.5 h-3.5 text-gold-text" />
      </button>
    </div>,
    document.body
  );
}
