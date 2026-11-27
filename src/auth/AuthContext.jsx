import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, GoogleAuthProvider, OAuthProvider, getAdditionalUserInfo,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '../firebase';
import { recordLogin } from '../data/registry';
import { sendWelcomeEmail } from '../data/mailer';

/*
  Sign-in with Firebase Authentication: Google, Apple, or email and password.
  Visitors who only send an inquiry may hold an anonymous session (see ensureSignedIn);
  that never counts as signed in here.
*/

const AuthContext = createContext(null);

const toUser = (u) => (u && !u.isAnonymous ? { uid: u.uid, name: u.displayName || u.email, email: u.email, picture: u.photoURL || '' } : null);

const MESSAGES = {
  'auth/invalid-credential': 'That email and password do not match an account.',
  'auth/wrong-password': 'That email and password do not match an account.',
  'auth/user-not-found': 'That email and password do not match an account.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/weak-password': 'Use at least 8 characters for your password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth/unauthorized-domain': 'Sign-in is not enabled on this web address yet. Please use bharatconnect-aa30d.web.app or contact the Secretariat.',
  'auth/too-many-requests': 'Too many attempts. Please wait a minute and try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not switched on yet. Please use another option or contact the Secretariat.',
  'auth/account-exists-with-different-credential': 'This email is already registered with another sign-in method. Use that one instead.',
};
const LAST_METHOD_KEY = 'bc-last-sign-in';
const rememberMethod = (m) => { try { localStorage.setItem(LAST_METHOD_KEY, m); } catch { /* storage unavailable */ } };
export const lastMethod = () => { try { return localStorage.getItem(LAST_METHOD_KEY) || ''; } catch { return ''; } };

function providerFor(name) {
  if (name === 'Apple') {
    const p = new OAuthProvider('apple.com');
    p.addScope('email');
    p.addScope('name');
    return p;
  }
  return new GoogleAuthProvider();
}
const methodOf = (u) => (u.providerData.some((p) => p.providerId === 'google.com') ? 'Google'
  : u.providerData.some((p) => p.providerId === 'apple.com') ? 'Apple' : 'Email');

const friendly = (e) => {
  if (!MESSAGES[e?.code]) console.warn('Sign-in failed:', e?.code || e);
  return MESSAGES[e?.code] || 'Sign-in failed. Please try again.';
};
const QUIET = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => toUser(auth.currentUser));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  // the sign in / sign up window: null when closed, otherwise { mode, reason }
  const [authRequest, setAuthRequest] = useState(null);
  const pendingAction = useRef(null);

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(toUser(u)); setReady(true); }), []);

  // close the window and carry on with whatever the visitor clicked
  const done = useCallback(() => {
    setError('');
    setAuthRequest(null);
    const next = pendingAction.current;
    pendingAction.current = null;
    if (next) setTimeout(next, 0);
  }, []);

  /* 'Google' | 'Apple'. Returns an error message, or '' on success (or if the visitor closed the window). */
  const signInWith = useCallback(async (name) => {
    setError('');
    try {
      const cred = await signInWithPopup(auth, providerFor(name));
      const isNew = getAdditionalUserInfo(cred)?.isNewUser;
      recordLogin({ action: isNew ? 'sign-up' : 'sign-in', name: cred.user.displayName, method: name });
      sendWelcomeEmail(cred.user.displayName, cred.user.email);
      rememberMethod(name);
      done();
      return '';
    } catch (e) {
      return QUIET.includes(e.code) ? '' : friendly(e);
    }
  }, [done]);

  /* mode: 'signin' | 'signup'. Returns an error message, or '' on success. */
  const emailAuth = useCallback(async ({ mode, name, email, password }) => {
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        setUser(toUser({ ...cred.user, displayName: name.trim() }));
        recordLogin({ action: 'sign-up', name: name.trim(), method: 'Email' });
        sendWelcomeEmail(name.trim(), cred.user.email);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        recordLogin({ action: 'sign-in', name: cred.user.displayName, method: 'Email' });
        sendWelcomeEmail(cred.user.displayName, cred.user.email);
      }
      rememberMethod('Email');
      done();
      return '';
    } catch (e) {
      return friendly(e);
    }
  }, [done]);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return '';
    } catch (e) {
      return friendly(e);
    }
  }, []);

  const signOut = useCallback(async () => {
    const u = auth.currentUser;
    if (u && !u.isAnonymous) {
      recordLogin({ action: 'sign-out', name: u.displayName, method: methodOf(u) });
    }
    await fbSignOut(auth);
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

  const value = useMemo(
    () => ({
      user, ready, error, signOut, signInWith, emailAuth, resetPassword,
      authRequest, openAuth, closeAuth, setAuthMode,
    }),
    [user, ready, error, signOut, signInWith, emailAuth, resetPassword, authRequest, openAuth, closeAuth, setAuthMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
