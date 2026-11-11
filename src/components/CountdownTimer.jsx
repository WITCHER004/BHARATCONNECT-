import { useState, useEffect } from 'react';

const TARGET_DATE = new Date('2026-12-18T09:00:00+05:30').getTime();

function calcTimeLeft() {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
  };
}

const pad = (n) => String(n).padStart(2, '0');

export default function CountdownTimer({ className = '' }) {
  const [t, setT] = useState(calcTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setT(calcTimeLeft()), 30000);
    return () => clearInterval(id);
  }, []);

  const cells = [
    { value: t.days, label: 'days' },
    { value: pad(t.hours), label: 'hours' },
    { value: pad(t.minutes), label: 'min' },
  ];

  return (
    <div className={`flex items-baseline gap-4 ${className}`} aria-label="Time until the conclave opens">
      {cells.map((c) => (
        <span key={c.label} className="flex items-baseline gap-1">
          <span className="font-mono text-lg font-medium figure">{c.value}</span>
          <span className="text-xs opacity-75">{c.label}</span>
        </span>
      ))}
    </div>
  );
}
