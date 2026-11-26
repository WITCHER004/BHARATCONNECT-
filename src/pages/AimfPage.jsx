import { useAuth } from '../auth/AuthContext';
import AimfHub from '../components/AimfHub';
import SignInGate from '../auth/SignInGate';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

/*
  AIMF (Atal Innovation Multilateral Forum) Overview Page.
  Provides high-level forum context and personal accreditation status via AimfHub.
  Registration is accessed via the dedicated registration portal (aimf-register).
*/

export default function AimfPage({ onNavigate, onOpenRegister }) {
  const { user } = useAuth();

  return (
    <div className="page-enter flex flex-col min-h-screen">
      {/* Top Hero Overview Banner */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 bg-royal border-b border-line text-fg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-foil/15 via-coral/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2 border border-gold-foil/30 shadow-sm mb-6">
              <span className="w-2 h-2 rotate-45 bg-gold-foil animate-pulse" />
              <span className="text-xs sm:text-[13px] font-mono uppercase tracking-[0.15em] text-gold-text">
                Atal Innovation Multilateral Forum · Cultural Pavilion
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-fg tracking-[-0.02em] leading-[1.1]">
              AIMF — Atal Innovation Multilateral Forum
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-lg sm:text-xl text-fg-2 leading-relaxed max-w-3xl">
              Uniting civilizational heritage, creative media economies, performing arts, and sovereign cultural corridors between Bharat and the 22 Arab nations at Yashobhoomi, New Delhi.
            </p>

            {/* Event Highlights Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-y-3 gap-x-6 text-sm sm:text-base font-mono text-gold-text">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-foil" />
                <span>18–19 December 2026</span>
              </div>
              <span className="hidden sm:inline text-line">•</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-foil" />
                <span>Yashobhoomi (IICC), New Delhi</span>
              </div>
              <span className="hidden sm:inline text-line">•</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-foil" />
                <span>India + 22 Arab Corridors</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('aimf-register')}
                className="btn-primary !rounded-xl h-12 px-7 text-base font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-coral/20 active:scale-[0.98]"
              >
                <span>Register for AIMF Accreditation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('schedule')}
                className="btn-secondary !rounded-xl h-12 px-6 text-base font-medium flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Conclave Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Section: Accreditation Status Hub (No form rendered here) */}
      <section className="theme-ivory flex-1 py-12 sm:py-16 bg-surface-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="space-y-8 animate-fade-in">
            <SignInGate
              title="Sign in to view your AIMF accreditation"
              reason="AIMF registration needs an account (Google, Apple, or email), so your creative showcase, credentials, and unique Accreditation ID [BMF.BC-AMF-numbers] stay tied to you."
            >
              <AimfHub
                uid={user?.uid}
                formOpen={false}
                onRegister={() => onNavigate('aimf-register')}
              />
            </SignInGate>
          </div>
        </div>
      </section>
    </div>
  );
}
