import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Play } from 'lucide-react';
import { loadFrames, FRAME_COUNT, POSTER_SRC } from './LaunchFilm';

const FPS = 30;
const BUFFER_AHEAD = 15;

export default function IntroSplash({ onDone }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const progressRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const finishRef = useRef(null);

  const [fading, setFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const frames = loadFrames();
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = 48;
    blurCanvas.height = 27;
    const blurCtx = blurCanvas.getContext('2d');

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    let shown = -1;
    let raf = 0;
    let startTime = null;
    let alive = true;
    let finished = false;
    let holdTimer = 0;
    let doneTimer = 0;
    // Safety net: never leave the visitor stuck behind the overlay (e.g. a backgrounded tab)
    const failsafe = setTimeout(() => finish(), (FRAME_COUNT / FPS) * 1000 + 5000);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
      if (shown >= 0) {
        draw(shown);
      } else {
        draw(0);
      }
    };

    const draw = (frameIndex) => {
      const frame = frames[frameIndex];
      const img = frame?.img;
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch) return;

      const natW = img.naturalWidth || 1280;
      const natH = img.naturalHeight || 720;
      const cover = Math.max(cw / natW, ch / natH);
      const contain = Math.min(cw / natW, ch / natH);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#050706';
      ctx.fillRect(0, 0, cw, ch);
      try {
        // Near 16:9, fill the screen. On phones / ultra-wide screens "cover" would blow the
        // 1280×720 frame up and crop it, which pixelates badly: show the whole frame sharp
        // over a soft blurred fill instead.
        if (cover / contain <= 1.3) {
          const w = natW * cover;
          const h = natH * cover;
          ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
        } else {
          const bw = natW * cover;
          const bh = natH * cover;
          // cheap, cross-browser blur: shrink to a tiny canvas, then stretch it back up
          blurCtx.drawImage(img, 0, 0, blurCanvas.width, blurCanvas.height);
          ctx.drawImage(blurCanvas, (cw - bw) / 2, (ch - bh) / 2, bw, bh);
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(0, 0, cw, ch);
          const w = natW * contain;
          const h = natH * contain;
          ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
        }
      } catch {
        /* frame not ready to draw yet */
      }
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setFading(true);
      doneTimer = setTimeout(() => {
        doneRef.current?.();
      }, 700);
    };
    finishRef.current = finish;

    resize();
    // Immediate draw frame 0
    draw(0);
    if (frames[0] && !frames[0].ready) {
      frames[0].img.onload = () => {
        if (shown <= 0 && alive) {
          draw(0);
        }
      };
    }
    window.addEventListener('resize', resize);

    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        finish();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const tick = (now) => {
      if (!alive || finished) return;

      if (startTime === null) {
        startTime = now;
      }

      const elapsed = (now - startTime) / 1000;
      const target = Math.min(FRAME_COUNT - 1, Math.floor(elapsed * FPS));

      // Pick the best available frame: exact target or most recent loaded frame
      let frameToDraw = -1;
      for (let i = target; i >= 0; i--) {
        const f = frames[i];
        if (f && (f.ready || (f.img && f.img.complete && f.img.naturalWidth > 0))) {
          frameToDraw = i;
          break;
        }
      }

      if (frameToDraw >= 0 && frameToDraw !== shown) {
        draw(frameToDraw);
        shown = frameToDraw;
      }

      if (progressRef.current) {
        const pct = Math.min(100, (elapsed / (FRAME_COUNT / FPS)) * 100);
        progressRef.current.style.width = `${pct}%`;
      }

      // Film is over (300 frames at 30fps = 10s): hold on the closing emblem, then fade out.
      // Stop the loop here; `finish` sets `finished` itself, so it must not be set first.
      if (elapsed >= (FRAME_COUNT / FPS)) {
        holdTimer = setTimeout(finish, 1200);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
      clearTimeout(failsafe);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      html.style.overflow = prevOverflow;
    };
  }, []);

  const handleSkip = () => finishRef.current?.();

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

      {/* Sleek golden progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 pointer-events-none z-20">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-gold-foil via-coral to-gold-text"
          style={{ width: '0%' }}
        />
      </div>
    </div>,
    document.body
  );
}
