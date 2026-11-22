import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, ChevronDown, LogIn } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { BrandLogo, BrandMark } from './BrandLogo';
import { PANELS, PANEL_IDS } from '../data/panels';

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
        className="btn-primary !rounded-xl h-10 sm:h-11 px-4 sm:px-5 text-sm sm:text-[15px] font-semibold flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
      >
        <LogIn className="w-4 h-4" strokeWidth={2} />
        <span>Login</span>
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

function PanelsDropdown({ activePage, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = PANEL_IDS.includes(activePage);

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
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group relative h-11 px-2.5 text-[15px] font-medium tracking-[0.01em] flex items-center gap-1 transition-colors duration-200 cursor-pointer ${
          isActive ? 'text-gold-text' : 'text-fg-2 hover:text-fg'
        }`}
      >
        Panels
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        {isActive && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1.5 h-1.5 rotate-45 bg-gold-foil shadow-[0_0_8px_rgb(217_179_106/0.8)]" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 surface-card rounded-xl p-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(217,179,106,0.2)] animate-fade-in z-50"
        >
          {PANELS.map((p) => (
            <button
              key={p.id}
              role="menuitem"
              onClick={() => { setOpen(false); onNavigate(p.id); }}
              className={`w-full text-left p-2.5 rounded-lg hover:bg-surface-3 transition-colors cursor-pointer group flex items-start gap-2.5 ${
                activePage === p.id ? 'bg-surface-3' : ''
              }`}
            >
              <span className="w-1.5 h-1.5 rotate-45 bg-gold-foil mt-1.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-fg group-hover:text-gold-text transition-colors">{p.label}</div>
                <div className="text-[11px] text-fg-3">{p.tagline}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Overview' },
  { id: 'schedule', label: 'Programme' },
  { id: 'exhibition', label: 'Exhibition' },
  { id: 'startups', label: 'Startups' },
  { id: 'experience', label: 'Venue' },
  { id: 'collaborate', label: 'Collaboration' },
  { id: 'query', label: 'Inquiries' },
];

export default function Navbar({ activePage, onNavigate }) {
  const { user, signOut, openAuth } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key or route change
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  const solid = isScrolled || mobileMenuOpen;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2.5 sm:px-6 pt-2 sm:pt-3">
      <div
        className={`relative max-w-[1440px] mx-auto rounded-2xl border transition-all duration-300 ${
          solid
            ? 'bg-surface-0/80 backdrop-blur-xl backdrop-saturate-150 border-gold-foil/20 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.05)]'
            : 'bg-black/20 backdrop-blur-sm border-white/[0.06]'
        }`}
      >
        {/* gold hairline along the bottom edge */}
        <span
          className={`pointer-events-none absolute inset-x-10 -bottom-px h-px bg-gradient-to-r from-transparent via-gold-foil/70 to-transparent transition-opacity duration-300 ${
            solid ? 'opacity-100' : 'opacity-40'
          }`}
          aria-hidden="true"
        />

        <div className="h-[76px] pl-3 pr-3 sm:pl-4 flex items-center justify-between gap-4 lg:gap-6">
          {/* Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left cursor-pointer group shrink-0"
            aria-label="Bharat Connect homepage"
          >
            <div className="h-10 sm:h-12 px-2 sm:px-2.5 rounded-xl bg-[#FCFBF9] ring-1 ring-gold-foil/40 group-hover:ring-gold-foil shadow-[0_4px_14px_-6px_rgb(217_179_106/0.5)] flex items-center justify-center transition-all duration-200">
              <img
                src={`${import.meta.env.BASE_URL}brand/logo.png`}
                alt="Bharat Connect"
                className="h-7 sm:h-9 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:flex xl:hidden 2xl:flex flex-col">
              <span className="font-serif text-[17px] font-medium text-fg tracking-[0.16em] leading-5 uppercase">
                Bharat Connect
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-gold-text tracking-[0.14em] uppercase leading-3">
                <span className="w-1 h-1 rotate-45 bg-gold-foil" aria-hidden="true" />
                18–19 Dec · New Delhi
              </span>
            </div>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden xl:flex items-center" aria-label="Main">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative h-11 px-2.5 text-[15px] font-medium tracking-[0.01em] transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-gold-text' : 'text-fg-2 hover:text-fg'
                  }`}
                >
                  {item.label}
                  {/* hover underline */}
                  <span
                    className={`absolute left-2.5 right-2.5 bottom-1.5 h-px bg-gradient-to-r from-transparent via-gold-foil to-transparent origin-center transition-transform duration-300 ${
                      isActive ? 'scale-x-0' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                    aria-hidden="true"
                  />
                  {/* active marker */}
                  {isActive && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-1.5 h-1.5 rotate-45 bg-gold-foil shadow-[0_0_8px_rgb(217_179_106/0.8)]" aria-hidden="true" />
                  )}
                </button>
              );
            })}
            <PanelsDropdown activePage={activePage} onNavigate={handleNavClick} />
          </nav>

          {/* Right action area */}
          <div className="flex items-center gap-2 shrink-0">
            <AccountMenu onSignIn={() => setMobileMenuOpen(false)} />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-fg-2 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer select-none active:scale-95 [-webkit-tap-highlight-color:transparent]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-fg" strokeWidth={1.75} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden px-3 sm:px-4 pb-6 pt-3 border-t border-line animate-slide-up max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`min-h-[44px] px-3.5 rounded-xl text-[15px] text-left font-medium transition-colors cursor-pointer flex items-center ${
                      isActive ? 'bg-surface-3 text-gold-text font-semibold' : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-line/60 flex flex-col gap-1">
              <div className="text-[11px] font-mono text-gold-text uppercase tracking-wider px-1 mb-1">
                Panels
              </div>
              {PANELS.map((p) => {
                const isActive = activePage === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleNavClick(p.id)}
                    className={`min-h-[44px] px-3.5 rounded-xl text-[15px] text-left font-medium transition-colors cursor-pointer flex items-center gap-2.5 ${
                      isActive ? 'bg-surface-3 text-gold-text font-semibold' : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rotate-45 bg-gold-foil shrink-0" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-line/60 flex flex-col gap-2.5 pb-2">
              {!user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth({ mode: 'signin' });
                  }}
                  className="w-full btn-primary min-h-[44px] text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" strokeWidth={2} />
                  <span>Login to Bharat Connect</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-surface-2 border border-line flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar user={user} size={30} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg truncate">{user.name}</p>
                      <p className="text-xs text-fg-3 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="h-8 px-2.5 rounded-lg text-xs font-medium text-coral hover:bg-surface-3 transition-colors cursor-pointer shrink-0"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
