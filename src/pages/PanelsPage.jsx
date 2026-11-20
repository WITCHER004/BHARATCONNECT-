import { useState, useEffect, useRef } from 'react';
import {
  Landmark, TrendingUp, Lightbulb, Check, ArrowRight, RotateCcw,
  Compass, Globe, BadgeCheck, Handshake, Award, Users, Radar, Mic, Briefcase, FileText, GraduationCap,
} from 'lucide-react';
import { PANELS, getPanel, getNextPanelId } from '../data/panels';
import PanelArt from '../components/PanelArt';
import PanelMembers from '../components/PanelMembers';
import { recordRegistration } from '../data/registry';

const DUTY_ICONS = { Compass, Globe, BadgeCheck, Handshake, Award, Users, Radar, Mic, Briefcase, FileText, GraduationCap };

const ICONS = { advisory: Landmark, investor: TrendingUp, expert: Lightbulb };

const inputClass =
  'w-full h-11 px-3 rounded-[10px] bg-surface-3 border border-line text-sm text-fg placeholder:text-fg-3 transition-colors duration-150 focus:border-line-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-coral/60';

const EMPTY_FORM = { name: '', email: '', organisation: '', country: '', role: '', note: '' };

function Field({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs text-fg-3 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ApplyForm({ panel, prefill }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [refId, setRefId] = useState(null);
  const nameRef = useRef(null);

  // "Nominate for this seat" from a member profile fills in the note
  useEffect(() => {
    if (!prefill) return;
    setRefId(null);
    setForm((prev) => ({ ...prev, note: prefill.note }));
    const t = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 450);
    return () => clearTimeout(t);
  }, [prefill]);

  // Start fresh when switching between panels
  useEffect(() => {
    setForm(EMPTY_FORM);
    setRefId(null);
  }, [panel.id]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = getNextPanelId(panel.code);
    setRefId(id);
    recordRegistration({
      id,
      type: 'panel',
      name: form.name,
      email: form.email,
      organisation: form.organisation,
      country: form.country,
      detail: panel.label,
      sector: form.role,
      message: form.note,
    });
  };

  if (refId) {
    return (
      <div className="surface-card rounded-2xl p-6 sm:p-8 animate-fade-in" aria-live="polite">
        <span className="w-11 h-11 rounded-full bg-surface-3 border border-gold-foil/50 flex items-center justify-center">
          <Check className="w-5 h-5 text-gold-text" strokeWidth={2} />
        </span>
        <h3 className="mt-5 font-serif text-2xl text-fg">Received, thank you</h3>
        <p className="mt-2 text-sm text-fg-2 leading-relaxed">
          Your {panel.label.toLowerCase()} submission for <span className="text-fg">{form.name}</span> has been logged.
          The Secretariat will be in touch at <span className="text-fg break-all">{form.email}</span>.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-surface-3 border border-line">
          <span className="text-xs text-fg-3 block">Reference</span>
          <span className="mt-1 block font-mono text-lg text-gold-text font-semibold">{refId}</span>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setRefId(null); }}
          className="mt-6 btn-secondary h-10 px-4 text-sm"
        >
          <RotateCcw className="w-4 h-4 text-fg-3" strokeWidth={1.5} />
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form id="panel-apply" onSubmit={handleSubmit} className="scroll-mt-40 relative surface-card rounded-2xl p-6 sm:p-8 overflow-hidden">
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-foil/80 to-transparent" aria-hidden="true" />
      <h3 className="font-serif text-2xl text-fg">{panel.applyTitle}</h3>
      <p className="mt-2 text-sm text-fg-3 leading-relaxed">{panel.applyNote}</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" htmlFor="pn-name">
          <input ref={nameRef} id="pn-name" required value={form.name} onChange={update('name')} className={inputClass} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="pn-email">
          <input id="pn-email" type="email" required value={form.email} onChange={update('email')} className={inputClass} autoComplete="email" />
        </Field>
        <Field label="Organisation" htmlFor="pn-org">
          <input id="pn-org" required value={form.organisation} onChange={update('organisation')} className={inputClass} autoComplete="organization" />
        </Field>
        <Field label="Country" htmlFor="pn-country">
          <input id="pn-country" required value={form.country} onChange={update('country')} className={inputClass} autoComplete="country-name" />
        </Field>
        <Field label={panel.id === 'expert' ? 'Sector' : 'Category'} htmlFor="pn-role" className="sm:col-span-2">
          <select id="pn-role" required value={form.role} onChange={update('role')} className={`${inputClass} cursor-pointer`}>
            <option value="" disabled>Select one</option>
            {panel.roleOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Short profile (optional)" htmlFor="pn-note" className="sm:col-span-2">
          <textarea
            id="pn-note"
            rows={3}
            value={form.note}
            onChange={update('note')}
            className={`${inputClass} h-auto py-2.5 resize-none`}
          />
        </Field>
      </div>

      <button type="submit" className="mt-6 btn-primary h-11 px-5 text-sm w-full sm:w-auto">
        Submit
        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
      </button>

      {/* Reference ticket preview */}
      <div className="relative mt-7 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-4 border-t border-dashed border-line-strong bg-surface-2/60 flex items-center justify-between gap-4">
        <span className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-surface-1 border border-line" aria-hidden="true" />
        <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-surface-1 border border-line" aria-hidden="true" />
        <span className="text-xs text-fg-3">You'll receive a reference</span>
        <span className="font-mono text-sm text-gold-text tracking-wide">BMF.BC-{panel.code}-•••••</span>
      </div>
    </form>
  );
}

export default function PanelsPage({ panelId, onNavigate }) {
  const panel = getPanel(panelId);
  const Icon = ICONS[panel.id];
  const [prefill, setPrefill] = useState(null);

  useEffect(() => setPrefill(null), [panel.id]);

  const handleNominate = (seat) => {
    setPrefill({ note: `Nomination for the ${seat.title} seat on the ${panel.label}.` });
    document.getElementById('panel-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page-enter flex flex-col">

      {/* Page header */}
      <section className="pt-32 pb-12 bg-royal border-b border-line overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="ref-line mb-4">Bharat Connect 2026 · Panels</p>
            <h1 className="font-serif font-medium text-4xl sm:text-5xl text-fg tracking-[-0.02em] mb-4">
              {panel.label}
            </h1>
            <p className="text-[15px] sm:text-lg text-fg-2 max-w-xl leading-relaxed">{panel.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <span className="block font-serif text-3xl text-gold-text">{String(panel.seats.length).padStart(2, '0')}</span>
                <span className="text-xs text-fg-3">Seats</span>
              </div>
              <div>
                <span className="block font-serif text-3xl text-gold-text">23</span>
                <span className="text-xs text-fg-3">Nations: India + 22 Arab states</span>
              </div>
              <div>
                <span className="block font-serif text-3xl text-gold-text">2026</span>
                <span className="text-xs text-fg-3">Inaugural term</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 max-w-xl w-full mx-auto lg:mx-0">
            <PanelArt panelId={panel.id} />
          </div>
        </div>
      </section>

      {/* Panel switcher */}
      <section className="sticky top-16 z-30 bg-surface-0/95 backdrop-blur-sm border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 w-max" role="tablist" aria-label="Panels">
            {PANELS.map((p) => {
              const TabIcon = ICONS[p.id];
              const active = p.id === panel.id;
              return (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => onNavigate(p.id)}
                  className={`h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-surface-3 text-fg border border-gold-foil/50'
                      : 'text-fg-2 hover:text-fg hover:bg-surface-2 border border-transparent'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${active ? 'text-gold-text' : 'text-fg-3'}`} strokeWidth={1.5} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="theme-cream py-14 sm:py-20">
        <div key={panel.id} className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 animate-fade-in">

          {/* About + seats */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gold-text" strokeWidth={1.5} />
              </span>
              <span className="text-xs font-mono text-gold-text">BMF.BC-{panel.code}</span>
            </div>
            <p className="mt-6 text-[15px] sm:text-base text-fg-2 leading-relaxed">{panel.intro}</p>

            <h2 className="mt-10 text-sm font-medium text-fg">What the panel does</h2>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {panel.mandate.map((m, i) => {
                const DutyIcon = DUTY_ICONS[panel.mandateIcons[i]];
                return (
                  <li key={m} className="p-4 rounded-xl bg-surface-2/60 border border-line flex items-start gap-3 transition-colors duration-150 hover:border-gold-foil/40">
                    <span className="w-9 h-9 rounded-lg bg-surface-3 border border-gold-foil/30 flex items-center justify-center shrink-0">
                      <DutyIcon className="w-4 h-4 text-gold-text" strokeWidth={1.5} />
                    </span>
                    <span className="text-sm text-fg-2 leading-relaxed pt-1.5">{m}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Apply / nominate */}
          <div className="lg:col-span-5 lg:sticky lg:top-36 self-start">
            <ApplyForm panel={panel} prefill={prefill} />
          </div>
        </div>
      </section>

      {/* Panel members */}
      <section className="theme-cream pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="pt-12 sm:pt-16 border-t border-line flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-gold-text">The {panel.short.toLowerCase()} panel</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-fg tracking-[-0.01em]">Panel members</h2>
              <p className="mt-2 text-sm text-fg-3 max-w-xl">
                Select a member to see their profile and role. Seat numbers match the diagram at the top of the page.
              </p>
            </div>
            <span className="text-sm text-fg-3">
              <span className="font-serif text-2xl text-fg">{panel.seats.filter((s) => s.name).length}</span>
              <span className="mx-1">/</span>
              {panel.seats.length} seats confirmed
            </span>
          </div>
          <PanelMembers panel={panel} onNominate={handleNominate} />
        </div>
      </section>
    </div>
  );
}
