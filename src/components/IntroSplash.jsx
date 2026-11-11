import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FilmStage, makeSeek, FILM_END } from './HeroFilm';

/*
  The teaser as an opening: plays the full film over the page, then the card glides into
  its place in the hero (targetRef) while the overlay fades, so the film settles into the site.
*/

const SETTLE_MS = 950;
const FADE_MS = 700;

export default function IntroSplash({ targetRef, onDone }) {
  const rootRef = useRef(null);
  const bgRef = useRef(null);
  const moverRef = useRef(null);
  const stageRef = useRef(null);
  const skipRef = useRef(null);
  const settleRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const stage = stageRef.current;
    const mover = moverRef.current;
    if (!stage || !mover) return;

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
    let alive = true; // false after cleanup, so a stale run (React dev double-mount) never starts

    const settle = () => {
      if (settling) return;
      settling = true;
      cancelAnimationFrame(raf);
      seek(FILM_END);
      if (skipRef.current) skipRef.current.style.opacity = '0';

      const from = stage.querySelector('[data-k="group"]')?.getBoundingClientRect();
      const to = targetRef?.current?.querySelector('[data-k="group"]')?.getBoundingClientRect();

      // the closing line and labels step aside so only the card travels
      const cta = stage.querySelector('[data-k="cta"]');
      if (cta) { cta.style.transition = 'opacity 250ms ease'; cta.style.opacity = '0'; }

      if (from && to && from.width > 0 && to.width > 0) {
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
      } else {
        mover.style.transition = `opacity ${FADE_MS}ms ease`;
        mover.style.opacity = '0';
      }

      bgRef.current.style.transition = `opacity ${FADE_MS}ms ease ${SETTLE_MS - FADE_MS}ms`;
      bgRef.current.style.opacity = '0';
      finishTimer = window.setTimeout(() => doneRef.current?.(), SETTLE_MS + 40);
    };

    const frame = (now) => {
      if (!alive) return;
      if (last !== null) t = Math.min(FILM_END, t + (now - last) / 1000);
      last = now;
      seek(t);
      if (t >= FILM_END) { settle(); return; }
      raf = requestAnimationFrame(frame);
    };

    const onKey = (e) => { if (e.key === 'Escape') settle(); };
    window.addEventListener('keydown', onKey);
    settleRef.current = settle;

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
      html.style.overflow = prevOverflow;
    };
  }, [targetRef]);

  // rendered into <body>: the page wrapper is transformed, which would trap a fixed overlay
  return createPortal(
    <div ref={rootRef} className="fixed inset-0 z-[100]" role="dialog" aria-label="Bharat Connect 2026 opening film">
      <div ref={bgRef} className="absolute inset-0 bg-royal" />
      <div ref={moverRef} className="babc-film absolute inset-0 overflow-visible">
        <FilmStage stageRef={stageRef} titles className="film-stage-intro" />
      </div>
      <button
        ref={skipRef}
        onClick={() => settleRef.current?.()}
        className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8 h-9 px-4 rounded-[10px] text-sm text-fg-2 hover:text-fg bg-surface-2/70 border border-line transition-[color,opacity] duration-200 cursor-pointer"
      >
        Skip intro
      </button>
    </div>,
    document.body
  );
}
