import { useState, useEffect, useRef } from 'react';

// Tweens a figure like "$500B", "10,000+" or "22" once when it scrolls into view
export default function AnimatedCounter({ value }) {
  const raw = String(value);
  const target = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0;
  const prefix = raw.match(/^[^0-9]*/)[0];
  const suffix = raw.match(/[^0-9,]*$/)[0];

  const [display, setDisplay] = useState(target);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setDisplay(0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="figure">
      {prefix}{display.toLocaleString('en-US')}{suffix}
    </span>
  );
}
