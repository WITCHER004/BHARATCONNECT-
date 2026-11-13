import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Play } from 'lucide-react';
import { loadFrames, FRAME_COUNT, POSTER_SRC } from './LaunchFilm';

const FPS = 30;
const BUFFER_AHEAD = 45;

export default function IntroSplash({ onDone }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const [fading, setFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const frames = loadFrames();

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    let shown = -1;
    let raf = 0;
    let clock = 0;
    let last = null;
    let started = false;
    let alive = true;
    let finished = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
      if (shown >= 0 && frames[shown]?.img) {
        draw(shown);
      }
    };

    const draw = (frameIndex) => {
      const img = frames[frameIndex]?.img;
      if (!img || !img.naturalWidth) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;

      ctx.fillStyle = '#050706';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      setFading(true);
      setTimeout(() => {
        doneRef.current?.();
      }, 700);
    };

    resize();
    window.addEventListener('resize', resize);

    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        finish();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const tick = (now) => {
      if (!alive || finished) return;

      if (!started) {
        const buffered = frames.slice(0, BUFFER_AHEAD).every((f) => f.ready);
        if (!buffered) {
          raf = requestAnimationFrame(tick);
          return;
        }
        started = true;
      }

      const target = Math.min(FRAME_COUNT - 1, Math.floor(clock * FPS));

      if (frames[target]?.ready) {
        if (target !== shown) {
          draw(target);
          shown = target;
        }
        if (last !== null) {
          clock += (now - last) / 1000;
        }
      }

      last = now;

      if (shown === FRAME_COUNT - 1) {
        setTimeout(finish, 1000);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      html.style.overflow = prevOverflow;
    };
  }, []);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      doneRef.current?.();
    }, 700);
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="Bharat Connect 2026 Opening Film"
    >
      {/* Fullscreen Canvas Film */}
      <canvas
        ref={canvasRef}
        className="block absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />

      {/* Cinematic Vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.85)_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Banner Tag */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
        <span className="font-mono text-xs uppercase tracking-widest text-gold-text">
          Bharat Connect 2026 · Official Launch Film
        </span>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute right-6 bottom-6 sm:right-8 sm:bottom-8 z-10 h-10 px-5 rounded-full text-xs font-mono text-white/90 hover:text-white bg-black/60 hover:bg-black/85 border border-gold-foil/30 hover:border-gold-foil/70 backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-2xl active:scale-95"
      >
        <span>Skip to Conclave</span>
        <ArrowRight className="w-3.5 h-3.5 text-gold-text" />
      </button>
    </div>,
    document.body
  );
}
