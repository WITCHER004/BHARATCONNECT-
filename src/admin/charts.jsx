import { useEffect, useRef, useState } from 'react';
import { Clock, CheckCircle2, XCircle, Activity, Check, HelpCircle } from 'lucide-react';
import { TYPES, TYPE_ORDER, STATUS } from '../data/registry';

/* ── helpers ─────────────────────────────────────────── */

export const STATUS_ICON = {
  pending: Clock,
  approved: CheckCircle2,
  declined: XCircle,
  received: HelpCircle,
  'in-progress': Activity,
  answered: CheckCircle2,
  closed: Check,
};

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export function lastNDays(n) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

export const sameDay = (iso, d) => {
  const x = new Date(iso);
  return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() && x.getDate() === d.getDate();
};

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Counter: tweens from the last value to the new one ─ */

export function Counter({ value, suffix = '' }) {
  const [shown, setShown] = useState(reduced() ? value : 0);
  const from = useRef(reduced() ? value : 0);

  useEffect(() => {
    if (reduced()) {
      setShown(value);
      return undefined;
    }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / 900, 1);
      const v = Math.round(a + (value - a) * (1 - Math.pow(1 - p, 3)));
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className="tabular-nums">{shown.toLocaleString('en-IN')}{suffix}</span>;
}

/* ── Status badge: colour + icon + label, never colour alone ─ */

export const QUERY_STATUS = {
  received: { label: 'Received', color: '#8A9E97' },
  'in-progress': { label: 'In Progress', color: '#5B8DEF' },
  answered: { label: 'Answered', color: '#2FA58C' },
  closed: { label: 'Closed', color: '#9CA3AF' },
};

export function StatusBadge({ status }) {
  const meta = STATUS[status] || QUERY_STATUS[status] || { label: status || 'Received', color: '#8A9E97' };
  const Icon = STATUS_ICON[status] || STATUS_ICON.received;
  return (
    <span className={`ad-badge ad-badge-${status}`}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function TypeTag({ type }) {
  const t = TYPES[type];
  if (!t) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fg-2">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} aria-hidden="true" />
      {t.label}
    </span>
  );
}

export function Legend({ items }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <li key={it.label} className="inline-flex items-center gap-1.5 text-xs text-fg-2">
          <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: it.color }} aria-hidden="true" />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/* ── Stacked bars: registrations per day, by type ───── */

export function DailyBars({ records, days = 14 }) {
  const [hover, setHover] = useState(null);
  const dayList = lastNDays(days);
  const data = dayList.map((d) => {
    const byType = Object.fromEntries(TYPE_ORDER.map((t) => [t, 0]));
    records.forEach((r) => {
      if (byType[r.type] !== undefined && sameDay(r.submittedAt, d)) byType[r.type] += 1;
    });
    return { d, byType, total: Object.values(byType).reduce((a, b) => a + b, 0) };
  });
  const max = Math.max(4, ...data.map((x) => x.total));
  const niceMax = Math.ceil(max / 4) * 4;

  const W = 640;
  const H = 220;
  const padL = 28;
  const padB = 24;
  const plotW = W - padL;
  const plotH = H - padB - 8;
  const slot = plotW / days;
  const barW = Math.min(26, slot * 0.62);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label={`Registrations per day over the last ${days} days`}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = 8 + plotH * (1 - f);
          return (
            <g key={f}>
              <line x1={padL} x2={W} y1={y} y2={y} className="ad-grid" />
              <text x={padL - 8} y={y + 3} textAnchor="end" className="ad-axis">{Math.round(niceMax * f)}</text>
            </g>
          );
        })}
        {data.map((x, i) => {
          const cx = padL + slot * i + slot / 2;
          let y = 8 + plotH;
          const segs = TYPE_ORDER.filter((t) => x.byType[t] > 0);
          return (
            <g
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="ad-bar-group"
              style={{ '--i': i }}
            >
              {/* hit target bigger than the mark */}
              <rect x={cx - slot / 2} y={8} width={slot} height={plotH} fill="transparent" />
              {hover === i && <rect x={cx - slot / 2 + 2} y={8} width={slot - 4} height={plotH} className="ad-hover-col" rx="4" />}
              {segs.map((t, si) => {
                const h = (x.byType[t] / niceMax) * plotH;
                y -= h;
                const top = si === segs.length - 1;
                return (
                  <rect
                    key={t}
                    x={cx - barW / 2}
                    y={y + (si > 0 ? 0 : 0)}
                    width={barW}
                    height={Math.max(0, h - (top ? 0 : 2))}
                    rx={top ? 4 : 1}
                    fill={TYPES[t].color}
                    className="ad-bar"
                  />
                );
              })}
              {(i % 2 === (days - 1) % 2) && (
                <text x={cx} y={H - 6} textAnchor="middle" className="ad-axis">
                  {x.d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="ad-tooltip"
          style={{ left: `${((padL + slot * hover + slot / 2) / W) * 100}%` }}
        >
          <p className="text-xs text-fg-3">{data[hover].d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
          <p className="text-sm text-fg font-medium">{data[hover].total} registrations</p>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {TYPE_ORDER.map((t) => (
              <li key={t} className="flex items-center justify-between gap-4 text-xs text-fg-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: TYPES[t].color }} />
                  {TYPES[t].short}
                </span>
                <span className="tabular-nums text-fg">{data[hover].byType[t]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Donut: share of registrations by type ───────────── */

export function Donut({ records }) {
  const [hover, setHover] = useState(null);
  const counts = TYPE_ORDER.map((t) => ({ t, n: records.filter((r) => r.type === t).length }));
  const total = counts.reduce((a, b) => a + b.n, 0);
  const R = 70;
  const C = 2 * Math.PI * R;
  const gap = total > 0 && counts.filter((c) => c.n).length > 1 ? 3 : 0;
  let offset = 0;
  const focus = hover !== null ? counts[hover] : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 180 180" className="w-40 h-40 shrink-0" role="img" aria-label="Registrations by type">
        <circle cx="90" cy="90" r={R} className="ad-donut-track" />
        {total > 0 && counts.map((c, i) => {
          const len = (c.n / total) * C;
          const seg = (
            <circle
              key={c.t}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={TYPES[c.t].color}
              strokeWidth={hover === i ? 22 : 18}
              strokeDasharray={`${Math.max(0, len - gap)} ${C}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 90 90)"
              className="ad-donut-seg"
              style={{ '--i': i, '--len': Math.max(0, len - gap), '--c': C }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
          offset += len;
          return c.n ? seg : null;
        })}
        <text x="90" y="86" textAnchor="middle" className="ad-donut-big">{focus ? focus.n : total}</text>
        <text x="90" y="104" textAnchor="middle" className="ad-axis">{focus ? TYPES[focus.t].short : 'total'}</text>
      </svg>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-1.5 w-full">
        {counts.map((c, i) => (
          <li
            key={c.t}
            className={`flex items-center justify-between gap-3 text-sm rounded-lg px-2 py-1 -mx-2 transition-colors ${hover === i ? 'bg-surface-3' : ''}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="inline-flex items-center gap-2 text-fg-2">
              <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: TYPES[c.t].color }} />
              {TYPES[c.t].short}
            </span>
            <span className="tabular-nums text-fg">
              {c.n}
              <span className="text-fg-3 ml-2 text-xs">{total ? Math.round((c.n / total) * 100) : 0}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Status split per type: pending / approved / declined ─ */

export function StatusSplit({ records }) {
  const rows = TYPE_ORDER.map((t) => {
    const list = records.filter((r) => r.type === t);
    const n = list.length;
    const by = Object.fromEntries(Object.keys(STATUS).map((s) => [s, list.filter((r) => r.status === s).length]));
    return { t, n, by };
  });
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, ri) => (
        <div key={row.t}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-fg-2">{TYPES[row.t].short}</span>
            <span className="text-xs text-fg-3 tabular-nums">{row.n} total</span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-surface-3 overflow-hidden flex gap-[2px]">
            {row.n > 0 && Object.keys(STATUS).map((s) => (
              row.by[s] > 0 && (
                <span
                  key={s}
                  className="ad-split h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(row.by[s] / row.n) * 100}%`, background: STATUS[s].color, '--i': ri }}
                  title={`${STATUS[s].label}: ${row.by[s]}`}
                />
              )
            ))}
          </div>
          <div className="mt-1 flex gap-3 text-[11px] text-fg-3 tabular-nums">
            {Object.keys(STATUS).map((s) => (
              <span key={s}>{STATUS[s].label} {row.by[s]}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Ranked bars (single series) ─────────────────────── */

export function RankBars({ items, color = 'var(--color-gold-foil)' }) {
  const max = Math.max(1, ...items.map((i) => i.n));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-fg-2 truncate pr-3">{it.label}</span>
            <span className="text-fg tabular-nums">{it.n}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <span className="ad-rank block h-full rounded-full" style={{ width: `${(it.n / max) * 100}%`, background: color, '--i': i }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Sparkline for stat tiles ────────────────────────── */

export function Sparkline({ values, color = 'var(--color-gold-foil)' }) {
  const W = 100;
  const H = 28;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * W},${H - 2 - (v / max) * (H - 4)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-24 h-7" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="ad-spark" />
    </svg>
  );
}
