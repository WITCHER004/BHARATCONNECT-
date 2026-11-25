import { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe2, 
  Music, 
  Sparkles, 
  XCircle,
  FileText,
  Calendar,
  MapPin
} from 'lucide-react';
import { watchMyRegistrations } from '../data/registry';

const STATUS_VIEW = {
  pending: { label: 'Under Curatorial Review', Icon: Clock, cls: 'text-[#9A6B00] bg-[#FAB219]/15 border-[#FAB219]/40' },
  approved: { label: 'Accreditation Approved', Icon: CheckCircle2, cls: 'text-[#0A7A0A] bg-[#0CA30C]/10 border-[#0CA30C]/35' },
  declined: { label: 'Application Declined', Icon: XCircle, cls: 'text-[#B02E2E] bg-[#D03B3B]/10 border-[#D03B3B]/35' },
};

export default function AimfHub({ uid, formOpen, onRegister }) {
  const [regs, setRegs] = useState([]);
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    if (!uid) return;
    return watchMyRegistrations(uid, (list) => {
      const aimfRegs = list.filter((r) => r.type === 'aimf');
      setRegs(aimfRegs);
    });
  }, [uid]);

  const copyRef = async (idText) => {
    try {
      await navigator.clipboard.writeText(idText);
      setCopiedId(idText);
      setTimeout(() => setCopiedId(''), 1800);
    } catch { /* clipboard blocked */ }
  };

  if (!regs.length) {
    return (
      <div className="surface-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 border border-gold-foil/30 shadow-lg mb-8">
        <span className="w-14 h-14 rounded-2xl bg-surface-3 border border-gold-foil/40 flex items-center justify-center shrink-0">
          <Music className="w-7 h-7 text-gold-text" strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-gold-text">Complimentary Accreditation</span>
            <span className="w-1.5 h-1.5 rotate-45 bg-gold-foil" />
            <span className="text-xs font-mono text-fg-3">No Fee Required</span>
          </div>
          <h2 className="font-serif text-2xl text-fg">Register for AIMF Cultural & Creative Accreditation</h2>
          <p className="mt-1 text-sm text-fg-2 leading-relaxed">
            Apply to showcase your artistic troupe, media enterprise, creative studio, or sovereign cultural delegation at Yashobhoomi, New Delhi.
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={onRegister}
            className="btn-primary !rounded-xl h-11 px-6 text-sm font-semibold shrink-0 flex items-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
          >
            <span>Open AIMF Application</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {regs.map((reg) => {
        const st = STATUS_VIEW[reg.status] || STATUS_VIEW.pending;
        const StIcon = st.Icon;
        return (
          <div key={reg.id} className="surface-card rounded-2xl p-6 sm:p-8 border border-gold-foil/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${st.cls}`}>
                    <StIcon className="w-3.5 h-3.5" />
                    <span>{st.label}</span>
                  </span>
                  <span className="text-xs font-mono text-fg-3">
                    Submitted: {new Date(reg.submittedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-medium text-fg">{reg.organisation || reg.name}</h3>
                  <p className="text-xs sm:text-sm text-gold-text font-mono mt-0.5">{reg.detail || 'AIMF Cultural Accreditation'}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-fg-3 font-mono">
                  <span>Representative: <strong className="text-fg">{reg.name}</strong></span>
                  <span>•</span>
                  <span>Email: <strong className="text-fg">{reg.email}</strong></span>
                  {reg.country && (
                    <>
                      <span>•</span>
                      <span>Origin: <strong className="text-fg">{reg.country}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* ID Box */}
              <div className="flex flex-col items-start lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-line">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-fg-3 block">Accreditation ID</span>
                  <span className="font-mono text-lg font-bold text-gold-text">{reg.id}</span>
                </div>

                <button
                  type="button"
                  onClick={() => copyRef(reg.id)}
                  className="btn-secondary !rounded-xl h-9 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === reg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === reg.id ? 'Copied ID' : 'Copy ID'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
