import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

/*
  The Bharat Connect launch film: 300 rendered frames (public/film/000–299.webp, 1280×720)
  played on a canvas at 30 fps. India lights up, routes run to Dubai and London, and the
  film ends holding on the Bharat Connect logo.
*/

export const FRAME_COUNT = 300;
const FPS = 30;
const BUFFER_AHEAD = 45; // frames that must be decoded before playback starts
const frameSrc = (i) => `${import.meta.env.BASE_URL}film/${String(i).padStart(3, '0')}.webp`;
export const POSTER_SRC = frameSrc(FRAME_COUNT - 1);

// one shared cache, so the hero and the opening never download a frame twice
let cache = null;
export function loadFrames() {
  if (cache) return cache;
  cache = Array.from({ length: FRAME_COUNT }, (_, i) => {
    const img = new Image();
    img.decoding = 'async';
    const entry = { img, ready: false };
    img.onload = () => { entry.ready = true; };
    img.src = frameSrc(i);
    return entry;
  });
  return cache;
}

// draws an image into the canvas, filling it ("cover") or fitting it ("contain")
function draw(ctx, canvas, img, fit) {
  const cw = canvas.width;
  const ch = canvas.height;
  const s = fit === 'cover'
    ? Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    : Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

/* Plays the film once into a canvas, then calls onEnd while holding on the last frame. */
function FilmCanvas({ fit = 'cover', onEnd, className = '' }) {
  const canvasRef = useRef(null);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frames = loadFrames();
    let shown = -1;
    let raf = 0;
    let clock = 0;
    let last = null;
    let started = false;
    let alive = true;

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      if (shown >= 0) draw(ctx, canvas, frames[shown].img, fit);
    };
    size();
    window.addEventListener('resize', size);

    const tick = (now) => {
      if (!alive) return;
      if (!started) {
        // wait until the opening stretch is decoded, so the first seconds never stutter
        const buffered = frames.slice(0, BUFFER_AHEAD).every((f) => f.ready);
        if (!buffered) { raf = requestAnimationFrame(tick); return; }
        started = true;
      }
      const target = Math.min(FRAME_COUNT - 1, Math.floor(clock * FPS));
      if (frames[target].ready) {
        if (target !== shown) { draw(ctx, canvas, frames[target].img, fit); shown = target; }
        if (last !== null) clock += (now - last) / 1000;
      }
      // a frame still downloading pauses the clock instead of skipping ahead
      last = now;
      if (shown === FRAME_COUNT - 1) { endRef.current?.(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, [fit]);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} aria-hidden="true" />;
}

const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

/*
  The hero panel: plays the film in place on the page, then rests on its closing logo
  with a replay button. `autoPlay` starts it once it turns true (after the opening teaser).
*/
export default function FilmPanel({ autoPlay = false }) {
  const [playing, setPlaying] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    loadFrames(); // start downloading while the teaser plays
  }, []);

  useEffect(() => {
    if (!autoPlay || startedRef.current || prefersReducedMotion()) return;
    startedRef.current = true;
    setPlaying(true);
  }, [autoPlay]);

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl border border-[#B8893A]/40 bg-[#0b0b0b] shadow-[0_2px_6px_rgb(0_0_0/0.08),0_24px_60px_-12px_rgb(0_0_0/0.35)]">
      {playing ? (
        <FilmCanvas fit="cover" onEnd={() => setPlaying(false)} />
      ) : (
        <>
          <img
            src={POSTER_SRC}
            alt="Bharat Connect, Business & Investment Summit: gold trade routes linking India, Dubai and London across a dark globe"
            className="block w-full h-full object-cover"
          />
          <button
            onClick={() => setPlaying(true)}
            className="absolute left-3 bottom-3 inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] text-sm text-white/85 hover:text-white bg-black/45 border border-white/15 backdrop-blur-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" strokeWidth={1.75} />
            Play film
          </button>
        </>
      )}
    </div>
  );
}
