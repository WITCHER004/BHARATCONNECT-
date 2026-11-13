import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Sparkles } from 'lucide-react';
import { loadFrames, FRAME_COUNT, POSTER_SRC } from './LaunchFilm';

const FPS = 30;
const BUFFER_AHEAD = 45;
const HOLD_SECONDS_ON_LOGO = 4; // hold on the final logo frame before cycling

/* Ambient floating golden dust / bokeh particles */
class AmbientParticle {
  constructor(w, h) {
    this.reset(w, h, true);
  }

  reset(w, h, randomY = false) {
    this.x = Math.random() * w;
    this.y = randomY ? Math.random() * h : h + Math.random() * 20;
    this.radius = Math.random() * 2 + 0.8;
    this.speedY = Math.random() * 0.4 + 0.15;
    this.speedX = (Math.random() - 0.5) * 0.25;
    this.alpha = Math.random() * 0.6 + 0.2;
    this.maxAlpha = this.alpha;
    this.fadeSpeed = Math.random() * 0.005 + 0.003;
    this.growing = Math.random() > 0.5;
  }

  update(w, h) {
    this.y -= this.speedY;
    this.x += this.speedX;

    if (this.growing) {
      this.alpha += this.fadeSpeed;
      if (this.alpha >= this.maxAlpha) this.growing = false;
    } else {
      this.alpha -= this.fadeSpeed;
      if (this.alpha <= 0.1) this.growing = true;
    }

    if (this.y < -10 || this.x < -10 || this.x > w + 10) {
      this.reset(w, h);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(217, 179, 106, ${this.alpha})`;
    ctx.shadowColor = 'rgba(217, 179, 106, 0.8)';
    ctx.shadowBlur = this.radius * 3;
    ctx.fill();
    ctx.restore();
  }
}

export default function HeroBackgroundFilm({
  active = true,
  className = '',
}) {
  const canvasRef = useRef(null);
  const particleCanvasRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Main film canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const frames = loadFrames();

    let shown = -1;
    let raf = 0;
    let clock = 0;
    let last = null;
    let started = false;
    let alive = true;
    let holdTimer = 0;

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));

      if (shown >= 0 && frames[shown]?.img) {
        drawFrame(shown);
      }
    };

    const drawFrame = (frameIndex) => {
      const img = frames[frameIndex]?.img;
      if (!img || !img.naturalWidth) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const isDesktop = cw >= 1024 * (window.devicePixelRatio || 1);

      // Scale to cover
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;

      // On desktop, bias placement toward the right side so the 3D globe sits proudly in the right viewport
      const x = isDesktop ? (cw - w) * 0.76 : (cw - w) / 2;
      const y = (ch - h) / 2;

      ctx.fillStyle = '#050706';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, x, y, w, h);
    };

    const restartFilm = () => {
      clock = 0;
      shown = -1;
      clearTimeout(holdTimer);
      setIsPlaying(true);
    };

    size();
    window.addEventListener('resize', size);

    const tick = (now) => {
      if (!alive) return;

      if (!started) {
        const buffered = frames.slice(0, BUFFER_AHEAD).every((f) => f.ready);
        if (!buffered) {
          raf = requestAnimationFrame(tick);
          return;
        }
        started = true;
      }

      if (isPlayingRef.current) {
        const target = Math.min(FRAME_COUNT - 1, Math.floor(clock * FPS));

        if (frames[target]?.ready) {
          if (target !== shown) {
            drawFrame(target);
            shown = target;
            setCurrentFrame(target);
          }
          if (last !== null) {
            clock += (now - last) / 1000;
          }
        }

        // When the film reaches the final frame (frame 299: the Bharat Connect emblem with all routes lit)
        if (target === FRAME_COUNT - 1 && shown === FRAME_COUNT - 1) {
          // Hold on the emblem for HOLD_SECONDS_ON_LOGO, then cycle smoothly back
          if (!holdTimer) {
            holdTimer = window.setTimeout(() => {
              holdTimer = 0;
              clock = 0; // restart cycle
            }, HOLD_SECONDS_ON_LOGO * 1000);
          }
        }
      }

      last = now;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
      window.removeEventListener('resize', size);
    };
  }, []);

  // Ambient floating particle canvas
  useEffect(() => {
    const pCanvas = particleCanvasRef.current;
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    let pRaf = 0;
    let pAlive = true;

    let particles = [];
    const PARTICLE_COUNT = 36;

    const resizeParticles = () => {
      const r = pCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      pCanvas.width = Math.max(1, Math.round(r.width * dpr));
      pCanvas.height = Math.max(1, Math.round(r.height * dpr));

      particles = Array.from(
        { length: PARTICLE_COUNT },
        () => new AmbientParticle(pCanvas.width, pCanvas.height)
      );
    };

    resizeParticles();
    window.addEventListener('resize', resizeParticles);

    const renderParticles = () => {
      if (!pAlive) return;
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(pCanvas.width, pCanvas.height);
        particles[i].draw(pCtx);
      }

      pRaf = requestAnimationFrame(renderParticles);
    };

    pRaf = requestAnimationFrame(renderParticles);

    return () => {
      pAlive = false;
      cancelAnimationFrame(pRaf);
      window.removeEventListener('resize', resizeParticles);
    };
  }, []);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none ${className}`}>
      {/* 1. Underlying Cinematic 300-Frame Movie Canvas */}
      <canvas
        ref={canvasRef}
        className="block absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />

      {/* 2. Ambient Floating Golden Bokeh / Dust Particles */}
      <canvas
        ref={particleCanvasRef}
        className="block absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* 3. Luxury Cinematic Vignettes & Editorial Directional Gradients */}
      {/* Deep Obsidian gradient on the left to ensure 100% WCAG typography contrast */}
      <div
        className="absolute inset-y-0 left-0 w-full lg:w-[68%] bg-gradient-to-r from-black via-black/85 via-45% to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Top soft shadow for fixed navbar integration */}
      <div
        className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Bottom deep gradient blending into the architectural Skyline and subsequent sections */}
      <div
        className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Ambient Crimson / Gold Radial Rim Light */}
      <div
        className="absolute -right-20 top-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(217,179,106,0.12)_0%,rgba(184,137,58,0.04)_45%,transparent_70%)] blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* 4. Interactive Film Control Pill (Discreet Play/Pause Toggle) */}
      <div className="absolute right-4 bottom-6 sm:right-8 sm:bottom-8 z-30 pointer-events-auto flex items-center">
        <button
          type="button"
          onClick={handleTogglePlay}
          title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-black/60 hover:bg-black/80 border border-gold-foil/30 hover:border-gold-foil/60 backdrop-blur-md transition-all duration-150 cursor-pointer shadow-lg active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-gold-text" />
          ) : (
            <Play className="w-3.5 h-3.5 text-gold-text ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}

