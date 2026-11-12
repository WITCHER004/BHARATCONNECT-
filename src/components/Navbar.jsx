import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

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
        <div role="menu" className="absolute right-0 mt-2 w-64 surface-card rounded-xl p-2 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.5)] animate-fade-in">
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

export function BrandMark({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 3 L29 16 L16 29 L3 16 Z" fill="none" style={{ stroke: 'var(--color-gold-foil)' }} strokeWidth="1.5" />
      <path d="M16 9 L23 16 L16 23 L9 16 Z" fill="none" style={{ stroke: 'var(--color-gold-foil)' }} strokeWidth="1" opacity="0.6" />
      <circle cx="16" cy="16" r="3" fill="#FF6F5E" />
    </svg>
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Overview' },
  { id: 'schedule', label: 'Programme' },
  { id: 'exhibition', label: 'Exhibition' },
  { id: 'experience', label: 'Venue & Delhi' },
  { id: 'startup', label: 'Startups' },
  { id: 'collaborate', label: 'Collaboration' },
  { id: 'register', label: 'Event registration' },
  { id: 'query', label: 'Inquiries' },
];

export default function Navbar({ activePage, onNavigate, onOpenRegister }) {
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
          ? 'bg-surface-0/95 backdrop-blur-sm border-line'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="h-16 flex items-center justify-between gap-6">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left cursor-pointer text-fg"
          >
            <BrandMark />
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold leading-5">Bharat Connect 2026</span>
              <span className="text-xs text-fg-3 leading-4">Bharat-Arab Business Conclave</span>
            </span>
          </button>

          <nav className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`h-9 px-3 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavClick('startup')}
              className="hidden sm:inline-flex btn-primary h-9 px-4 text-sm"
            >
              Register a startup
            </button>

            <AccountMenu onSignIn={() => setMobileMenuOpen(false)} />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-9 h-9 flex items-center justify-center rounded-lg text-fg-2 hover:text-fg hover:bg-surface-3 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden pb-4 pt-2 border-t border-line animate-slide-up">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`h-11 px-3 rounded-lg text-[15px] text-left font-medium transition-colors cursor-pointer ${
                      isActive ? 'bg-surface-3 text-fg' : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handleNavClick('startup')}
              className="mt-4 w-full btn-primary h-11 text-sm"
            >
              Register a startup
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
