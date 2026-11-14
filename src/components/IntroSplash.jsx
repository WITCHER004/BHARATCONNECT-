import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { FilmStage, makeSeek, FILM_END } from './HeroFilm';

/*
  The Bharat Connect 2026 Opening Teaser:
  Plays the full invitation film over the page when the site is opening:
  - Golden routes travel from India and the Arab world, meeting at one point.
  - The point becomes the emblem, headline rises, and opens into the invitation card.
  - Once completed or skipped, the overlay smoothly fades out, revealing the
    black hero section with the golden building designs.
*/

const HOLD_AFTER_END = 0.9; // seconds to pause on the completed invitation card before fading
const FADE_MS = 650;

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
    let alive = true;

    // Fast skip: smoothly fades out the teaser overlay in 350ms
    const handleSkip = () => {
      if (settling) return;
      settling = true;
      alive = false;
      cancelAnimationFrame(raf);
      if (skipRef.current) {
        skipRef.current.style.opacity = '0';
        skipRef.current.style.pointerEvents = 'none';
      }
      root.style.transition = 'opacity 350ms ease';
      root.style.opacity = '0';
      root.style.pointerEvents = 'none';
      finishTimer = window.setTimeout(() => doneRef.current?.(), 380);
    };
    skipFnRef.current = handleSkip;

    // Natural smooth fade at the end of the teaser
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

      // Smooth fade of root overlay and mover
      root.style.transition = `opacity ${FADE_MS}ms ease`;
      root.style.opacity = '0';
      root.style.pointerEvents = 'none';
      mover.style.transition = `opacity ${FADE_MS}ms ease`;
      mover.style.opacity = '0';

      finishTimer = window.setTimeout(() => doneRef.current?.(), FADE_MS + 40);
    };
    settleRef.current = settle;

    const frame = (now) => {
      if (!alive) return;
      if (last !== null) {
        t = Math.min(FILM_END + HOLD_AFTER_END, t + (now - last) / 1000);
      }
      last = now;

      seek(Math.min(FILM_END, t));

      if (t >= FILM_END + HOLD_AFTER_END) {
        settle();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        skipFnRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);

    seek(0);
    // start immediately or within 300ms
    let started = false;
    const start = () => {
      if (started || !alive || settling) return;
      started = true;
      raf = requestAnimationFrame(frame);
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(start).catch(start);
    }
    const fontTimeout = window.setTimeout(start, 300);

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

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] will-change-[opacity]"
      role="dialog"
      aria-label="Bharat Connect 2026 opening teaser"
    >
      {/* Background layer */}
      <div ref={bgRef} className="absolute inset-0 bg-[#060908]" />

      {/* Brand Watermark / Conclave Tag */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
        <span className="font-mono text-xs uppercase tracking-widest text-gold-text">
          Bharat Connect 2026 · Official Teaser
        </span>
      </div>

      {/* The animated 1080x1080 stage */}
      <div ref={moverRef} className="babc-film absolute inset-0 overflow-visible">
        <FilmStage stageRef={stageRef} titles className="film-stage-intro" />
      </div>

      {/* Skip Button */}
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
