import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  LogOut, 
  QrCode, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import AuthForm from '../auth/AuthForm';
import { watchMyRegistrationsForUser } from '../data/registry';

export default function LoginPage({ onNavigate }) {
  const { user, signOut } = useAuth();
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [regs, setRegs] = useState([]);

  useEffect(() => {
    if (!user) { setRegs([]); return undefined; }
    return watchMyRegistrationsForUser(user, setRegs);
  }, [user]);

  const aimfReg = regs.find((r) => r.type === 'aimf');
  const startupReg = regs.find((r) => r.type === 'startup');

  return (
    <div className="pt-24 pb-20 min-h-screen bg-royal text-fg flex flex-col justify-center">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-foil/15 via-coral/5 to-transparent pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Back navigation button */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-sm font-medium text-fg-3 hover:text-fg transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Conclave Overview</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Diplomatic Context & Benefits */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-8">
            <div>
              {/* Official Seal Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-gold-foil/30 shadow-sm mb-4">
                <span className="w-2 h-2 rotate-45 bg-gold-foil" />
                <span className="text-xs font-mono uppercase tracking-[0.14em] text-gold-text">
                  Accredited Portal Access
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-fg tracking-[-0.02em] leading-tight">
                Sign in to your Bharat Connect Portal
              </h1>

              <p className="mt-4 text-base sm:text-lg text-fg-2 leading-relaxed max-w-2xl">
                Access your digital delegate pass, bilateral Arab trade meetings, startup deal rooms, and custom summit itinerary for 18–19 December at Yashobhoomi.
              </p>
            </div>

            {/* Portal Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-2/80 border border-line-strong">
                <div className="w-10 h-10 rounded-xl bg-surface-3 border border-line flex items-center justify-center text-gold-text mb-3">
                  <QrCode className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-base font-medium text-fg">Digital Badge & Fast-Track Pass</h3>
                <p className="mt-1 text-xs text-fg-3 leading-relaxed">
                  Fast-track barcode credentials for instant Yashobhoomi gate clearance and networking sessions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2/80 border border-line-strong">
                <div className="w-10 h-10 rounded-xl bg-surface-3 border border-line flex items-center justify-center text-gold-text mb-3">
                  <Building2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-base font-medium text-fg">Arab Corridor Deal Rooms</h3>
                <p className="mt-1 text-xs text-fg-3 leading-relaxed">
                  Book 45-minute confidential B2B meetings with sovereign Arab delegations and trade ministers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2/80 border border-line-strong">
                <div className="w-10 h-10 rounded-xl bg-surface-3 border border-line flex items-center justify-center text-gold-text mb-3">
                  <UserCheck className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-base font-medium text-fg">Startup & Founder Desk</h3>
                <p className="mt-1 text-xs text-fg-3 leading-relaxed">
                  Submit pitch decks, verify booth allocations, and engage with GCC sovereign venture funds.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2/80 border border-line-strong">
                <div className="w-10 h-10 rounded-xl bg-surface-3 border border-line flex items-center justify-center text-gold-text mb-3">
                  <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-base font-medium text-fg">AIMF Cultural Galas</h3>
                <p className="mt-1 text-xs text-fg-3 leading-relaxed">
                  Reserve VIP seating for the Atal Innovation Multilateral Forum symphonies and ministerial plenaries.
                </p>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="p-4 rounded-xl bg-surface-2/40 border border-line/60 flex items-start gap-3 text-xs text-fg-3 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Protected under official encryption standards. Powered by Bharat Mahotsav Festivals LLP in strategic partnership with IACCIA.
              </span>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="surface-card rounded-3xl p-6 sm:p-8 border border-gold-foil/30 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] relative">
              {/* Header inside Card */}
              {user ? (
                /* Authenticated State */
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Authenticated Session</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-2 border border-line flex items-center gap-4">
                    {user.picture ? (
                      <img 
                        src={user.picture} 
                        alt="" 
                        className="w-14 h-14 rounded-full border border-gold-foil/40"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-surface-3 border border-line-strong text-fg text-lg font-bold flex items-center justify-center">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-fg truncate">{user.name || 'Delegate User'}</h3>
                      <p className="text-xs text-fg-3 truncate">{user.email}</p>
                      <p className="text-[11px] font-mono text-gold-text mt-0.5">
                        {aimfReg ? `AIMF Accredited · ${aimfReg.id}` : startupReg ? `Startup Founder · ${startupReg.id}` : 'Accredited Delegate'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-sm text-fg-2">You are signed in to your Bharat Connect account.</p>

                    <div className="grid grid-cols-1 gap-2.5">
                      {aimfReg && (
                        <button
                          onClick={() => onNavigate('aimf')}
                          className="btn-primary !rounded-xl h-11 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Sparkles className="w-4 h-4 text-gold-text" />
                          <span>My AIMF Accreditations ({aimfReg.id})</span>
                          <ArrowRight className="w-4 h-4 ml-auto" />
                        </button>
                      )}

                      {startupReg && (
                        <button
                          onClick={() => onNavigate('startups')}
                          className="btn-primary !rounded-xl h-11 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Building2 className="w-4 h-4 text-gold-text" />
                          <span>My Startup Showcase & Deal Room ({startupReg.id})</span>
                          <ArrowRight className="w-4 h-4 ml-auto" />
                        </button>
                      )}

                      <button
                        onClick={() => onNavigate('register')}
                        className={`${!aimfReg && !startupReg ? 'btn-primary' : 'btn-secondary'} !rounded-xl h-11 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer`}
                      >
                        <span>Access Delegate Pass Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* For users with no registration yet, show options to register either */}
                      {!aimfReg && !startupReg && (
                        <>
                          <button
                            onClick={() => onNavigate('startup')}
                            className="btn-secondary !rounded-xl h-11 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Register Startup Showcase</span>
                          </button>
                          <button
                            onClick={() => onNavigate('aimf-register')}
                            className="btn-secondary !rounded-xl h-11 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Apply for AIMF Cultural Accreditation</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => onNavigate('home')}
                        className="btn-secondary !rounded-xl h-11 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Go to Conclave Overview</span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-line">
                      <button
                        onClick={() => signOut()}
                        className="w-full h-10 rounded-xl text-xs font-medium text-coral hover:bg-surface-3 transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out of account</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Unauthenticated State */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-serif text-2xl font-medium text-fg">
                        {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                      </h2>
                      <p className="text-xs text-fg-3 mt-1">
                        {authMode === 'signin' 
                          ? 'Use your accredited identity to log in' 
                          : 'Register a new profile for Bharat Connect 2026'}
                      </p>
                    </div>

                    {/* Mode Toggle Tabs */}
                    <div className="p-1 rounded-xl bg-surface-1 border border-line flex items-center">
                      <button
                        onClick={() => setAuthMode('signin')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          authMode === 'signin' ? 'bg-surface-3 text-gold-text font-semibold' : 'text-fg-3 hover:text-fg'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setAuthMode('signup')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          authMode === 'signup' ? 'bg-surface-3 text-gold-text font-semibold' : 'text-fg-3 hover:text-fg'
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>

                  {/* Embedded AuthForm */}
                  <AuthForm mode={authMode} />

                  {/* Auxiliary Options */}
                  <div className="mt-6 pt-5 border-t border-line/60 text-center space-y-2">
                    <p className="text-xs text-fg-3">
                      Need to register an organization or startup?
                    </p>
                    <div className="flex justify-center gap-3 text-xs font-mono">
                      <button 
                        onClick={() => onNavigate('register')} 
                        className="text-gold-text hover:text-gold-foil underline underline-offset-2 cursor-pointer"
                      >
                        Delegate Pass
                      </button>
                      <span className="text-line">•</span>
                      <button 
                        onClick={() => onNavigate('startup')} 
                        className="text-gold-text hover:text-gold-foil underline underline-offset-2 cursor-pointer"
                      >
                        Startup Showcase
                      </button>
                      <span className="text-line">•</span>
                      <button 
                        onClick={() => onNavigate('collaborate')} 
                        className="text-gold-text hover:text-gold-foil underline underline-offset-2 cursor-pointer"
                      >
                        Collaboration
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
