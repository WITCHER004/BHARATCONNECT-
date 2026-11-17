import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { loadFrames, bufferedCount, FRAME_COUNT } from './LaunchFilm';
import { FILM_CROP, FILM_FOCUS } from './filmFocus';

const FPS = 30;
const FILM_SECONDS = FRAME_COUNT / FPS;
const BUFFER_FRAMES = 45; // ~1.5s decoded before playback starts, so the opening never stutters
const MAX_BUFFER_WAIT = 4000; // on a slow connection, start anyway after this long
const HOLD_ON_LOGO = 1200; // rest on the closing emblem before fading into the site
const MAX_STEP = 1 / 20; // never advance more than one 20fps step at once, so a hitch can't skip ahead

/*
  Opening film, played full-screen on a canvas before the site.
  Playback is frame-accurate rather than wall-clock: the clock only moves when the next frame
  is decoded and ready, so a slow network makes the film wait a beat instead of jumping.
*/
export default function IntroSplash({ onDone }) {
  const canvasRef = useRef(null);
  const progressRef = useRef(null);
  const bufferRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const finishRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: false });
    const frames = loadFrames();
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = 48;
    blurCanvas.height = 27;
    const blurCtx = blurCanvas.getContext('2d');
    // portrait phones: the reframed film is drawn here first, then feathered at top and bottom
    const band = document.createElement('canvas');
    const bandCtx = band.getContext('2d');

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    let shown = -1;
    let raf = 0;
    let alive = true;
    let finished = false;
    let started = false;
    let clock = 0;
    let last = null;
    let bufferStart = null;
    let holdTimer = 0;
    let doneTimer = 0;
    // Safety net: never leave a visitor stuck behind the overlay (backgrounded tab, very slow network)
    const failsafe = setTimeout(() => finish(), FILM_SECONDS * 1000 + MAX_BUFFER_WAIT + 12000);

    const draw = (i) => {
      const img = frames[i]?.img;
      if (!img || !img.naturalWidth) return false;
      const cw = canvas.width;
      const ch = canvas.height;
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      const cover = Math.max(cw / natW, ch / natH);
      const contain = Math.min(cw / natW, ch / natH);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (ch > cw * 1.15) {
        // Portrait phone: show a tall window of the frame that pans with the action
        // (see filmFocus.js), instead of shrinking the whole 16:9 frame to a thin strip.
        const sw = natW * FILM_CROP;
        const sx = Math.min(natW - sw, Math.max(0, (FILM_FOCUS[i] ?? 0.5) * natW - sw / 2));
        const dw = cw;
        const dh = Math.round(natH * (cw / sw));
        const dy = Math.round((ch - dh) * 0.46);

        // backdrop: the same window, blurred and dimmed, filling the screen
        blurCtx.drawImage(img, sx, 0, sw, natH, 0, 0, blurCanvas.width, blurCanvas.height);
        const bs = Math.max(cw / blurCanvas.width, ch / blurCanvas.height);
        const bw = blurCanvas.width * bs;
        const bh = blurCanvas.height * bs;
        ctx.drawImage(blurCanvas, (cw - bw) / 2, (ch - bh) / 2, bw, bh);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, cw, ch);

        // the film window, feathered into the backdrop at top and bottom
        if (band.width !== dw || band.height !== dh) {
          band.width = dw;
          band.height = dh;
        }
        bandCtx.globalCompositeOperation = 'source-over';
        bandCtx.imageSmoothingEnabled = true;
        bandCtx.imageSmoothingQuality = 'high';
        bandCtx.drawImage(img, sx, 0, sw, natH, 0, 0, dw, dh);
        bandCtx.globalCompositeOperation = 'destination-in';
        const fade = bandCtx.createLinearGradient(0, 0, 0, dh);
        fade.addColorStop(0, 'rgba(0,0,0,0)');
        fade.addColorStop(0.12, 'rgba(0,0,0,1)');
        fade.addColorStop(0.88, 'rgba(0,0,0,1)');
        fade.addColorStop(1, 'rgba(0,0,0,0)');
        bandCtx.fillStyle = fade;
        bandCtx.fillRect(0, 0, dw, dh);
        ctx.drawImage(band, 0, dy);
        return true;
      }

      if (cover / contain <= 1.3) {
        // close to 16:9: fill the screen
        const w = natW * cover;
        const h = natH * cover;
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      } else {
        // phones / ultra-wide: the whole frame, sharp, over a soft blurred fill
        const bw = natW * cover;
        const bh = natH * cover;
        blurCtx.drawImage(img, 0, 0, blurCanvas.width, blurCanvas.height);
        ctx.drawImage(blurCanvas, (cw - bw) / 2, (ch - bh) / 2, bw, bh);
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, cw, ch);
        const w = natW * contain;
        const h = natH * contain;
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      }
      return true;
    };

    let sizeKey = '';
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(window.innerWidth * dpr));
      const h = Math.max(1, Math.round(window.innerHeight * dpr));
      const key = `${w}x${h}`;
      if (key === sizeKey) return; // mobile browsers fire resize as the address bar moves
      sizeKey = key;
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = '#050706';
      ctx.fillRect(0, 0, w, h);
      if (shown >= 0) draw(shown);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setFading(true);
      doneTimer = setTimeout(() => doneRef.current?.(), 800);
    };
    finishRef.current = finish;

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') finish();
    };
    window.addEventListener('keydown', onKeyDown);

    const tick = (now) => {
      if (!alive || finished) return;

      if (!started) {
        if (bufferStart === null) bufferStart = now;
        const have = bufferedCount(frames);
        if (bufferRef.current) {
          bufferRef.current.style.transform = `scaleX(${Math.min(1, have / BUFFER_FRAMES)})`;
        }
        if (have < BUFFER_FRAMES && now - bufferStart < MAX_BUFFER_WAIT) {
          raf = requestAnimationFrame(tick);
          return;
        }
        started = true;
        if (draw(0)) shown = 0;
        setPlaying(true); // fades the canvas in
        last = now;
      }

      const target = Math.min(FRAME_COUNT - 1, Math.floor(clock * FPS));
      const frame = frames[target];

      if (frame.ready) {
        if (target !== shown) {
          if (draw(target)) shown = target; // a failed frame keeps the previous one on screen
        }
        // advance only while frames are arriving; cap the step so a hitch can't skip ahead
        clock += Math.min((now - last) / 1000, MAX_STEP);
      }
      last = now;

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.min(1, clock / FILM_SECONDS)})`;
      }

      if (target >= FRAME_COUNT - 1 && frame.ready) {
        holdTimer = setTimeout(finish, HOLD_ON_LOGO);
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
      window.removeEventListener('orientationchange', resize);
      window.removeEventListener('keydown', onKeyDown);
      html.style.overflow = prevOverflow;
    };
  }, []);

  const handleSkip = () => finishRef.current?.();

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] bg-black overflow-hidden transition-opacity duration-[800ms] ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ height: '100dvh' }}
      role="dialog"
      aria-label="Bharat Connect opening film"
    >
      {/* film */}
      <canvas
        ref={canvasRef}
        className={`block absolute inset-0 w-full h-full transition-[opacity,transform] duration-[1200ms] ease-out will-change-[opacity,transform] ${
          playing ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
        }`}
        aria-hidden="true"
      />

      {/* vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.85)_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* loading line, shown only while the opening seconds buffer */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 flex flex-col items-center gap-3 transition-opacity duration-500 ${
          playing ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden={playing}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-text/80">Bharat Connect</span>
        <span className="block w-full h-px bg-white/10 overflow-hidden">
          <span ref={bufferRef} className="block h-full bg-gold-foil origin-left transition-transform duration-200" style={{ transform: 'scaleX(0)' }} />
        </span>
      </div>

      {/* top label */}
      <div
        className="absolute z-10 flex items-center gap-2 left-5 sm:left-8"
        style={{ top: 'max(1.25rem, calc(env(safe-area-inset-top) + 0.75rem))' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gold-foil animate-pulse" />
        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gold-text">
          Bharat Connect<span className="hidden sm:inline"> · Official Launch Film</span>
        </span>
      </div>

      {/* skip */}
      <button
        onClick={handleSkip}
        className="absolute z-10 right-4 sm:right-8 h-11 px-5 rounded-full text-xs font-mono text-white/90 hover:text-white bg-black/60 hover:bg-black/85 border border-gold-foil/30 hover:border-gold-foil/70 backdrop-blur-md transition-colors duration-200 cursor-pointer flex items-center gap-2 shadow-2xl active:scale-95 [-webkit-tap-highlight-color:transparent]"
        style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}
      >
        <span>Skip intro</span>
        <ArrowRight className="w-3.5 h-3.5 text-gold-text" />
      </button>

      {/* progress */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 pointer-events-none z-20">
        <div
          ref={progressRef}
          className="h-full origin-left bg-gradient-to-r from-gold-foil to-gold-text will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>,
    document.body
  );
}
