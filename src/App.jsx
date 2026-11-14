import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import IntroSplash from './components/IntroSplash';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import ExhibitionPage from './pages/ExhibitionPage';
import ExperiencePage from './pages/ExperiencePage';
import RegistrationPage from './pages/RegistrationPage';
import StartupPage from './pages/StartupPage';
import CollaborationPage from './pages/CollaborationPage';
import QueryPage from './pages/QueryPage';
import QueryConciergeModal from './components/QueryConciergeModal';
import AuthModal from './auth/AuthModal';
import { useAuth } from './auth/AuthContext';

export default function App() {
  // Sync with URL hash if present (#home, #schedule, #exhibition, #experience, #register, #startup, #collaborate, #query)
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validPages = ['home', 'schedule', 'exhibition', 'experience', 'register', 'startup', 'collaborate', 'query'];
    return validPages.includes(hash) ? hash : 'home';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [selectedStallTier, setSelectedStallTier] = useState(null);
  const [introActive, setIntroActive] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).has('no-intro')) return false;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      return true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validPages = ['home', 'schedule', 'exhibition', 'experience', 'register', 'startup', 'collaborate', 'query'];
      if (validPages.includes(hash)) {
        setActivePage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { user, openAuth } = useAuth();

  // Registering needs an account: signed-out visitors get the sign in / sign up window first,
  // then carry on to where they were going
  const AUTH_REASONS = {
    startup: 'Sign in or sign up to register your startup',
    register: 'Sign in or sign up to register for the event',
  };

  const navigate = (pageId) => {
    if (!user && AUTH_REASONS[pageId]) {
      openAuth({ reason: AUTH_REASONS[pageId], then: () => handleNavigate(pageId) });
    } else {
      handleNavigate(pageId);
    }
  };

  // "Register" buttons across the site lead to event registration
  const handleOpenRegister = () => navigate('register');

  const handleSelectTierFromExhibition = (tierId) => {
    setSelectedStallTier(tierId);
    navigate('register');
  };

  return (
    <div className="min-h-screen bg-surface-1 text-fg flex flex-col font-sans">
      {/* Opening Teaser / Launch Film Splash on Site Load */}
      {introActive && <IntroSplash onDone={() => setIntroActive(false)} />}
      
      {/* Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={navigate}
        onOpenRegister={handleOpenRegister}
      />

      {/* Main Multi-Page Route View */}
      <main className="flex-1 w-full">
        {activePage === 'home' && (
          <HomePage
            onNavigate={navigate}
            onOpenRegister={handleOpenRegister}
          />
        )}

        {activePage === 'schedule' && (
          <SchedulePage
            onNavigate={navigate}
            onOpenRegister={handleOpenRegister}
          />
        )}

        {activePage === 'exhibition' && (
          <ExhibitionPage
            onNavigate={navigate}
            onOpenRegister={handleOpenRegister}
            onSelectTier={handleSelectTierFromExhibition}
          />
        )}

        {activePage === 'experience' && (
          <ExperiencePage
            onNavigate={navigate}
            onOpenRegister={handleOpenRegister}
          />
        )}

        {activePage === 'startup' && <StartupPage onNavigate={navigate} />}

        {activePage === 'collaborate' && <CollaborationPage onNavigate={navigate} />}

        {activePage === 'register' && (
          <RegistrationPage
            defaultRole={selectedStallTier ? 'Exhibitor Representative' : 'Corporate Delegate'}
          />
        )}

        {activePage === 'query' && (
          <QueryPage
            onNavigate={navigate}
            onOpenRegister={handleOpenRegister}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigate}
        onOpenRegister={handleOpenRegister}
      />

      {/* Sign in / sign up */}
      <AuthModal />

      {/* Global Query Desk Floating Concierge */}
      <QueryConciergeModal onNavigate={navigate} />

    </div>
  );
}
