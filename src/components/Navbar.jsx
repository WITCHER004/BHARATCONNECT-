import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { BrandLogo, BrandMark } from './BrandLogo';

export { BrandMark };

function Avatar({ user, size = 28 }) {
  const [broken, setBroken] = useState(false);
  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();
  if (user.picture && !broken) {
    return (
      <img
        src={user.picture}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="rounded-full border border-line-strong"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-full bg-surface-3 border border-line-strong text-fg text-xs font-medium flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {initial}
    </span>
  );
}

function AccountMenu({ onSignIn }) {
  const { user, signOut, openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (!user) {
    return (
      <button
        onClick={() => { onSignIn?.(); openAuth({ mode: 'signin' }); }}
        className="h-9 px-3 rounded-lg text-sm font-medium text-fg-2 hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
      >
        Sign in
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${user.name}`}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors cursor-pointer"
      >
        <Avatar user={user} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 surface-card rounded-xl p-2 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.5)] animate-fade-in z-50">
          <div className="px-3 py-2 flex items-center gap-3">
            <Avatar user={user} size={32} />
            <div className="min-w-0">
              <p className="text-sm text-fg truncate">{user.name}</p>
              <p className="text-xs text-fg-3 truncate">{user.email}</p>
            </div>
          </div>
          <div className="my-1 border-t border-line" />
          <button
            role="menuitem"
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full h-9 px-3 rounded-lg flex items-center gap-2 text-sm text-fg-2 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function RegisterDropdown({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn-primary h-9 px-3.5 text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span>Register</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-80 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 surface-card rounded-xl p-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(217,179,106,0.2)] animate-fade-in z-50"
        >
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gold-text">
            Registration Portals
          </div>

          <button
            role="menuitem"
            onClick={() => { setOpen(false); onNavigate('register'); }}
            className="w-full text-left p-2.5 rounded-lg hover:bg-surface-3 transition-colors cursor-pointer group flex items-start gap-2.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-fg group-hover:text-gold-text transition-colors">
                Event &amp; Delegate Pass
              </div>
              <div className="text-[11px] text-fg-3">
                Keynotes, deal rooms, networking lunches
              </div>
            </div>
          </button>

          <button
            role="menuitem"
            onClick={() => { setOpen(false); onNavigate('startup'); }}
            className="w-full text-left p-2.5 rounded-lg hover:bg-surface-3 transition-colors cursor-pointer group flex items-start gap-2.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-foil mt-1.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-fg group-hover:text-gold-text transition-colors">
                Startup Showcase
              </div>
              <div className="text-[11px] text-fg-3">
                Pitching, pavilion booth, investor matching
              </div>
            </div>
          </button>

          <div className="my-1 border-t border-line/60" />

          <button
            role="menuitem"
            onClick={() => { setOpen(false); onNavigate('collaborate'); }}
            className="w-full text-left p-2.5 rounded-lg hover:bg-surface-3 transition-colors cursor-pointer group flex items-start gap-2.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-text mt-1.5 shrink-0" />
            <div>
              <div className="text-sm font-medium text-fg group-hover:text-gold-text transition-colors">
                Summit Collaboration
              </div>
              <div className="text-[11px] text-fg-3">
                Sovereign, corporate &amp; institutional partnership
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Overview' },
  { id: 'schedule', label: 'Programme' },
  { id: 'exhibition', label: 'Exhibition' },
  { id: 'experience', label: 'Venue' },
  { id: 'collaborate', label: 'Collaboration' },
  { id: 'query', label: 'Inquiries' },
];

export default function Navbar({ activePage, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-200 ${
        isScrolled || mobileMenuOpen
          ? 'bg-surface-0/95 backdrop-blur-md border-line'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo & Conclave Edition */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group shrink-0"
            aria-label="Bharat Connect 2026 Homepage"
          >
            <div className="bg-white/95 group-hover:bg-white px-2 py-0.5 rounded-md border border-gold-foil/30 group-hover:border-gold-foil/60 shadow-sm flex items-center justify-center transition-all duration-150">
              <img
                src={`${import.meta.env.BASE_URL}brand/logo.png`}
                alt="Bharat Connect"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col border-l border-line/70 pl-2.5">
              <span className="text-[13px] font-semibold text-fg tracking-tight leading-4">Conclave 2026</span>
              <span className="text-[10px] font-mono text-gold-text tracking-wider uppercase leading-3 mt-0.5">18–19 Dec · New Delhi</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`h-9 px-3 rounded-lg text-[13.5px] font-medium transition-colors duration-150 cursor-pointer ${
                    isActive
                      ? 'text-fg bg-surface-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]'
                      : 'text-fg-2 hover:text-fg hover:bg-surface-2'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <RegisterDropdown onNavigate={handleNavClick} />

            <AccountMenu onSignIn={() => setMobileMenuOpen(false)} />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
              ) : (
                <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-5 pt-3 border-t border-line animate-slide-up">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`h-11 px-3.5 rounded-lg text-[15px] text-left font-medium transition-colors cursor-pointer ${
                      isActive ? 'bg-surface-3 text-fg' : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-line/60 flex flex-col gap-2">
              <div className="text-[11px] font-mono text-gold-text uppercase tracking-wider px-1">
                Registration &amp; Portals
              </div>
              <button
                onClick={() => handleNavClick('register')}
                className="w-full btn-primary h-11 text-sm font-medium flex items-center justify-center cursor-pointer"
              >
                Event &amp; Delegate Registration
              </button>
              <button
                onClick={() => handleNavClick('startup')}
                className="w-full h-11 rounded-[10px] border border-gold-foil/50 text-gold-text text-sm font-medium hover:bg-surface-3 flex items-center justify-center transition-colors cursor-pointer"
              >
                Register a Startup
              </button>
              <button
                onClick={() => handleNavClick('collaborate')}
                className="w-full h-11 rounded-[10px] border border-line text-fg-2 text-sm font-medium hover:bg-surface-3 flex items-center justify-center transition-colors cursor-pointer"
              >
                Summit Collaboration
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
