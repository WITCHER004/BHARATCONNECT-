import { useEffect, useRef } from 'react';

/*
  The Bharat Connect invitation film (same timeline as teaser/babc-teaser.html, 8 s).
  Two routes, India and the Arab world, meet at one point. The point becomes the brand mark,
  the mark opens into the invitation card, and the point returns as the coral seal.

  - FilmStage: the 1080 × 1080 drawing. `titles` adds the headline and the closing line (intro only).
  - makeSeek(root, { full }): returns seek(t) that sets every style from time alone.
  - HeroCard (default): the settled card in the hero, cropped from the same stage.
*/

export const FILM_END = 7.2; // the card has settled and the closing line has been read

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const span = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const out = (k) => 1 - Math.pow(1 - k, 3);
const inn = (k) => k * k * k;
const io = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

const C = { x: 540, y: 470 };
const R = 56;
const diamond = (r) => [[C.x, C.y - r], [C.x + r, C.y], [C.x, C.y + r], [C.x - r, C.y]];
const CARD = [[220, 140], [860, 140], [860, 940], [220, 940]];
const poly = (pts) => 'M ' + pts.map((p) => p.join(' ')).join(' L ') + ' Z';
const SEAL = { x: 780, y: 244 };
const VIEW = { x: 140, y: 40, w: 800, h: 1000 }; // the crop the hero shows

function rise(el, t, a, b) {
  if (!el) return;
  const k = out(span(t, a, b));
  el.style.transform = `translateY(${(1 - k) * 100}%)`;
  el.style.opacity = k;
}

export function makeSeek(root, { full = false } = {}) {
  const q = (k) => root.querySelector(`[data-k="${k}"]`);
  const el = {
    india: q('routeIndia'), arab: q('routeArab'), shape: q('shape'), inner: q('inner'),
    labelIndia: q('labelIndia'), labelArab: q('labelArab'), dot: q('dot'),
    headline: q('headline'), h1: q('h1'), h2: q('h2'), cta: q('cta'),
    group: q('group'), card: q('card'), frame: q('frame'), jTop: q('jaaliTop'), jBot: q('jaaliBot'),
    small: q('small'), title: q('title'), big: q('big'), month: q('month'),
    cells: [...root.querySelectorAll('[data-k="cell"]')], rule: q('rule'), foot: q('foot'),
    seal: q('seal'), sealBody: q('sealBody'), ring: q('sealRing'), sd: q('sealDiamond'), core: q('sealCore'),
  };
  const lenI = el.india.getTotalLength();
  const lenA = el.arab.getTotalLength();
  const lenD = 4 * R * Math.SQRT2;
  const lenSD = 4 * 11 * Math.SQRT2;
  const lenSR = 2 * Math.PI * 17;
  el.india.style.strokeDasharray = lenI;
  el.arab.style.strokeDasharray = lenA;
  el.sd.style.strokeDasharray = lenSD;
  el.ring.style.strokeDasharray = lenSR;
  el.inner.setAttribute('d', poly(diamond(32)));

  return function seek(t) {
    // the routes travel in and meet
    const pr = io(span(t, 0.1, 1.0));
    el.india.style.strokeDashoffset = lenI * (1 - pr);
    el.arab.style.strokeDashoffset = lenA * (1 - pr);
    const routesOut = 1 - span(t, 1.4, 1.8);
    el.india.style.opacity = 0.85 * routesOut;
    el.arab.style.opacity = 0.85 * routesOut;
    el.labelIndia.style.opacity = out(span(t, 0.15, 0.45)) * (1 - span(t, 1.3, 1.6));
    el.labelArab.style.opacity = out(span(t, 0.25, 0.55)) * (1 - span(t, 1.3, 1.6));

    // the coral point, which later waits where the seal will land
    const dotIn = out(span(t, 0.95, 1.15));
    const dm = io(span(t, 2.85, 3.6));
    el.dot.style.left = lerp(C.x, SEAL.x, dm) + 'px';
    el.dot.style.top = lerp(C.y, SEAL.y, dm) + 'px';
    el.dot.style.transform = `scale(${dotIn})`;
    el.dot.style.opacity = t < 5.45 && dotIn > 0 ? 1 : 0;

    // the mark draws, then opens into the card: one shape, never cut
    const md = io(span(t, 1.0, 1.45));
    const morph = io(span(t, 2.85, 3.6));
    const pts = diamond(R).map((p, i) => [lerp(p[0], CARD[i][0], morph), lerp(p[1], CARD[i][1], morph)]);
    el.shape.setAttribute('d', poly(pts));
    if (morph === 0) {
      el.shape.style.strokeDasharray = lenD;
      el.shape.style.strokeDashoffset = lenD * (1 - md);
    } else {
      el.shape.style.strokeDasharray = 'none';
    }
    el.shape.style.opacity = md > 0 ? 1 - span(t, 3.35, 3.6) : 0;
    el.inner.style.opacity = 0.5 * out(span(t, 1.2, 1.45)) * (1 - span(t, 2.7, 2.9));

    // the line the film is about (intro only)
    if (el.headline) {
      rise(el.h1, t, 1.45, 1.85);
      rise(el.h2, t, 1.65, 2.05);
      const hOut = inn(span(t, 2.75, 3.0));
      el.headline.style.opacity = 1 - hOut;
      el.headline.style.transform = `translateY(${-12 * hOut}px)`;
    }

    // card stock fills the outline
    const fill = out(span(t, 3.3, 3.65));
    el.card.style.opacity = fill;
    el.group.style.visibility = fill > 0 ? 'visible' : 'hidden';
    el.frame.style.opacity = out(span(t, 3.5, 3.8));
    el.jTop.style.opacity = out(span(t, 3.55, 3.85));
    el.jBot.style.opacity = out(span(t, 3.6, 3.9));

    // the invitation prints, top to bottom
    rise(el.small, t, 3.7, 4.0);
    rise(el.title, t, 3.85, 4.2);
    rise(el.big, t, 4.15, 4.55);
    rise(el.month, t, 4.35, 4.7);
    el.cells.forEach((c, i) => {
      const k = out(span(t, 4.6 + i * 0.06, 4.9 + i * 0.06));
      c.style.opacity = k;
      c.style.transform = `translateY(${(1 - k) * 10}px)`;
    });
    el.rule.style.transform = `scaleX(${io(span(t, 4.85, 5.15))})`;
    const fk = out(span(t, 4.95, 5.25));
    el.foot.style.opacity = fk;
    el.foot.style.transform = `translateY(${(1 - fk) * 8}px)`;

    // the seal is pressed on where the point has waited
    const fall = inn(span(t, 5.3, 5.45));
    const press = span(t, 5.45, 5.65);
    const pressScale = press === 0 ? 1 : 1 - 0.03 * Math.sin(Math.PI * press);
    el.sealBody.style.transform = `scale(${lerp(1.25, 1, fall) * pressScale})`;
    el.seal.style.opacity = fall;
    el.ring.style.strokeDashoffset = lenSR * (1 - io(span(t, 5.55, 5.9)));
    el.sd.style.strokeDashoffset = lenSD * (1 - io(span(t, 5.6, 5.9)));
    el.core.style.opacity = out(span(t, 5.75, 5.95));
    const impact = Math.sin(Math.PI * span(t, 5.45, 5.62));

    // the card settles at its resting angle
    const settle = io(span(t, 6.0, 6.8));
    const lift = full ? -34 : 0;
    const shrink = full ? 0.1 : 0.04;
    el.group.style.transform =
      `translateY(${3 * impact + lift * settle}px) rotate(${-1.5 * settle}deg) scale(${1 - shrink * settle})`;

    // the closing line (intro only)
    if (el.cta) {
      const ck = out(span(t, 6.3, 6.8));
      el.cta.style.opacity = ck;
      el.cta.style.transform = `translateY(${(1 - ck) * 8}px)`;
    }
  };
}

function daysToOpen() {
  const diff = new Date('2026-12-18T09:00:00+05:30').getTime() - Date.now();
  const d = Math.ceil(diff / 86400000);
  return d > 1 ? `Opens in ${d} days` : d === 1 ? 'Opens tomorrow' : 'Bharat Connect';
}

export function FilmStage({ stageRef, titles = false, className = '' }) {
  const patternId = titles ? 'film-jaali-row-intro' : 'film-jaali-row';
  return (
    <div ref={stageRef} className={`film-stage ${className}`} aria-hidden="true">
      <svg className="film-routes" viewBox="0 0 1080 1080">
        <path data-k="routeIndia" d="M -20 780 C 210 780 380 470 540 470" fill="none" stroke="#D9B36A" strokeWidth="1.5" strokeLinecap="round" />
        <path data-k="routeArab" d="M 1100 300 C 870 300 700 470 540 470" fill="none" stroke="#D9B36A" strokeWidth="1.5" strokeLinecap="round" />
        <path data-k="shape" fill="none" stroke="#D9B36A" strokeWidth="1.5" strokeLinejoin="round" />
        <path data-k="inner" fill="none" stroke="#D9B36A" strokeWidth="1" strokeLinejoin="round" />
      </svg>

      <div className="film-label" data-k="labelIndia" style={titles ? { left: 40, top: 732 } : { left: 164, top: 724 }}>India</div>
      <div className="film-label" data-k="labelArab" style={titles ? { right: 40, top: 318 } : { right: 164, top: 318 }}>22 Arab nations</div>

      {titles && (
        <div className="film-headline" data-k="headline">
          <span className="film-mask"><span data-k="h1">India and 22 Arab nations</span></span>
          <span className="film-mask"><span data-k="h2" className="film-gold">at one table</span></span>
        </div>
      )}

      <div className="film-group" data-k="group">
        <div className="film-card" data-k="card" />
        <div className="film-frame" data-k="frame" />
        <svg className="film-jaali" data-k="jaaliTop" style={{ top: 12 }} preserveAspectRatio="none">
          <defs>
            <pattern id={patternId} width="14" height="14" patternUnits="userSpaceOnUse">
              <path d="M7 1.5 L12.5 7 L7 12.5 L1.5 7 Z" fill="none" stroke="#B8893A" strokeWidth="0.9" />
            </pattern>
          </defs>
          <rect width="100%" height="14" fill={`url(#${patternId})`} opacity="0.7" />
        </svg>
        <svg className="film-jaali" data-k="jaaliBot" style={{ bottom: 12 }} preserveAspectRatio="none">
          <rect width="100%" height="14" fill={`url(#${patternId})`} opacity="0.7" />
        </svg>

        <div className="film-content">
          <span className="film-mask film-small"><span data-k="small">IACCIA requests the pleasure of your company at</span></span>
          <span className="film-mask film-title"><span data-k="title">Bharat-Arab Business Conclave</span></span>
          <div className="film-date">
            <span className="film-mask"><span className="film-big" data-k="big">18-19</span></span>
            <span className="film-mask"><span className="film-month" data-k="month">December<br />2026</span></span>
          </div>
          <dl className="film-grid">
            <div data-k="cell"><dt>Hall</dt><dd>Palash Hall, 6th floor</dd></div>
            <div data-k="cell"><dt>Venue</dt><dd>Yashobhoomi, New Delhi</dd></div>
            <div data-k="cell"><dt>Delegations</dt><dd>India and 22 Arab nations</dd></div>
            <div data-k="cell"><dt>Doors open</dt><dd>Friday, 09:00 IST</dd></div>
          </dl>
          <div className="film-rule" data-k="rule" />
          <div className="film-foot" data-k="foot">
            <span className="film-theme">People. Partnerships. Prosperity</span>
            <span className="film-time">{daysToOpen()}</span>
          </div>
        </div>

        <svg className="film-seal" data-k="seal" viewBox="0 0 48 48">
          <g data-k="sealBody" style={{ transformOrigin: '24px 24px' }}>
            <circle cx="24" cy="24" r="22" fill="#FF6F5E" />
            <circle data-k="sealRing" cx="24" cy="24" r="17" fill="none" stroke="#2a0d08" strokeOpacity="0.35" strokeWidth="0.75" />
            <path data-k="sealDiamond" d="M24 13 L35 24 L24 35 L13 24 Z" fill="none" stroke="#2a0d08" strokeOpacity="0.55" strokeWidth="1" />
            <circle data-k="sealCore" cx="24" cy="24" r="3" fill="#2a0d08" fillOpacity="0.55" />
          </g>
        </svg>
      </div>

      <div className="film-dot" data-k="dot" />

      {titles && <div className="film-cta" data-k="cta">Registration open · Organised by IACCIA</div>}
    </div>
  );
}

/* The settled invitation card in the hero. `hidden` keeps it invisible while the intro card flies in. */
export default function HeroCard({ viewRef, hidden = false }) {
  const ownRef = useRef(null);
  const ref = viewRef || ownRef;
  const stageRef = useRef(null);

  useEffect(() => {
    const view = ref.current;
    const stage = stageRef.current;
    if (!view || !stage) return;
    makeSeek(stage)(FILM_END);

    const fit = () => {
      const s = view.clientWidth / VIEW.w;
      stage.style.transform = `translate(${-VIEW.x * s}px, ${-VIEW.y * s}px) scale(${s})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(view);
    return () => ro.disconnect();
  }, [ref]);

  return (
    <div
      ref={ref}
      className="babc-film relative w-full max-w-[min(520px,calc((100svh-112px)*0.8))] mx-auto aspect-[4/5] overflow-hidden"
      style={{ visibility: hidden ? 'hidden' : 'visible' }}
      role="img"
      aria-label="Invitation to the Bharat-Arab Business Conclave, 18–19 December 2026, Palash Hall, Yashobhoomi, New Delhi"
    >
      <FilmStage stageRef={stageRef} />
    </div>
  );
}
