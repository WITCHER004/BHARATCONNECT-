import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { recordLogin } from '../data/registry';

/*
  Google sign-in with Google Identity Services (no server).
  Set VITE_GOOGLE_CLIENT_ID in .env.local (see .env.example).

  The site has no back end, so the ID token is decoded in the browser to read the name, email
  and photo. That is enough to require sign-in before registering, but it is not server-side
  verification: anything that must be trusted (payments, approvals) still needs a server to
  verify the token with Google.
*/

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/*
  DEMO MODE, for showing the site before Google sign-in is set up.
  On whenever no client ID is configured (or VITE_AUTH_DEMO=true). It accepts any name, email and
  password, never checks or stores the password, and is not real security. Add VITE_GOOGLE_CLIENT_ID
  to .env.local before launch and the real Google sign-in replaces it automatically.
*/
export const DEMO_AUTH = !CLIENT_ID || import.meta.env.VITE_AUTH_DEMO === 'true';
const DEMO_ACCOUNTS_KEY = 'bc-demo-accounts'; // email → name, so sign-in can greet returning visitors
const DEMO_SESSION_DAYS = 7;
const GSI_SRC = 'https://accounts.google.com/gsi/client';
const STORAGE_KEY = 'bc-auth-user';

const AuthContext = createContext(null);

function decodeJwt(token) {
  const part = token.split('.')[1];
  const json = decodeURIComponent(
    atob(part.replace(/-/g, '+').replace(/_/g, '/'))
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
  return JSON.parse(json);
}

function readStoredUser() {
  try {
    const u = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return u && u.exp * 1000 > Date.now() ? u : null;
  } catch {
    return null;
  }
}

let gsiPromise = null;
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GSI_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => { gsiPromise = null; reject(new Error('Could not load Google sign-in')); };
      document.head.appendChild(s);
    });
  }
  return gsiPromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  // the sign in / sign up window: null when closed, otherwise { mode, reason }
  const [authRequest, setAuthRequest] = useState(null);
  const pendingAction = useRef(null);
  const initialised = useRef(false);
  // kept in refs so the sign-in log knows the mode and who is signing out
  const modeRef = useRef('signin');
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { if (authRequest) modeRef.current = authRequest.mode; }, [authRequest]);

  const handleCredential = useCallback((response) => {
    try {
      const p = decodeJwt(response.credential);
      if (p.aud !== CLIENT_ID || !['accounts.google.com', 'https://accounts.google.com'].includes(p.iss)) {
        throw new Error('Unexpected sign-in token');
      }
      const u = { name: p.name || p.email, email: p.email, picture: p.picture || '', exp: p.exp };
      setUser(u);
      setError('');
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch { /* storage unavailable */ }
      recordLogin({ action: 'sign-in', name: u.name, email: u.email, method: 'Google' });
      // close the window and carry on with whatever the visitor clicked
      setAuthRequest(null);
      const next = pendingAction.current;
      pendingAction.current = null;
      if (next) setTimeout(next, 0);
    } catch {
      setError('Sign-in failed. Please try again.');
    }
  }, []);

  /* Opens the sign in / sign up window. `then` runs after a successful sign-in. */
  const openAuth = useCallback(({ mode = 'signin', reason = '', then = null } = {}) => {
    pendingAction.current = then;
    setError('');
    setAuthRequest({ mode, reason });
  }, []);

  const closeAuth = useCallback(() => {
    pendingAction.current = null;
    setAuthRequest(null);
  }, []);

  const setAuthMode = useCallback((mode) => setAuthRequest((r) => (r ? { ...r, mode } : r)), []);

  /* Demo sign-in / sign-up: no password is checked or stored */
  const demoSignIn = useCallback(({ name, email }) => {
    const mail = email.trim().toLowerCase();
    let accounts = {};
    try { accounts = JSON.parse(localStorage.getItem(DEMO_ACCOUNTS_KEY) || '{}'); } catch { /* storage unavailable */ }
    const fromEmail = mail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const finalName = (name || '').trim() || accounts[mail] || fromEmail;
    accounts[mail] = finalName;
    try { localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts)); } catch { /* storage unavailable */ }

    const u = { name: finalName, email: mail, picture: '', exp: Math.floor(Date.now() / 1000) + DEMO_SESSION_DAYS * 86400, demo: true };
    recordLogin({ action: modeRef.current === 'signup' ? 'sign-up' : 'sign-in', name: u.name, email: u.email, method: 'Email' });
    setUser(u);
    setError('');
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch { /* storage unavailable */ }
    setAuthRequest(null);
    const next = pendingAction.current;
    pendingAction.current = null;
    if (next) setTimeout(next, 0);
  }, []);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || initialised.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
        });
        initialised.current = true;
        setReady(true);
      })
      .catch(() => !cancelled && setError('Google sign-in could not load. Check your connection.'));
    return () => { cancelled = true; };
  }, [handleCredential]);

  // sign out once the Google session token expires
  useEffect(() => {
    if (!user) return;
    const ms = user.exp * 1000 - Date.now();
    // setTimeout fires at once for delays over ~24.8 days, so cap it
    const id = setTimeout(() => setUser(null), Math.min(Math.max(0, ms), 2147483647));
    return () => clearTimeout(id);
  }, [user]);

  const signOut = useCallback(() => {
    const u = userRef.current;
    if (u) recordLogin({ action: 'sign-out', name: u.name, email: u.email, method: u.demo ? 'Email' : 'Google' });
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable */ }
    window.google?.accounts?.id?.disableAutoSelect();
  }, []);

  const renderButton = useCallback((el, options = {}) => {
    if (!el || !ready) return;
    el.innerHTML = '';
    window.google.accounts.id.renderButton(el, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      logo_alignment: 'left',
      width: Math.min(320, el.clientWidth || 320),
      ...options,
    });
  }, [ready]);

  const value = useMemo(
    () => ({
      user, ready: DEMO_AUTH || ready, error, configured: DEMO_AUTH || !!CLIENT_ID, demo: DEMO_AUTH,
      signOut, renderButton, demoSignIn,
      authRequest, openAuth, closeAuth, setAuthMode,
    }),
    [user, ready, error, signOut, renderButton, demoSignIn, authRequest, openAuth, closeAuth, setAuthMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
