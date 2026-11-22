import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

/*
  Firebase for Bharat Connect (project bharatconnect-aa30d).
  This web config is public by design: what protects the data is firestore.rules.
*/
const firebaseConfig = {
  apiKey: 'AIzaSyBsP4LFJazWRJfgZo9SJNVGmqwi5PLk2xw',
  authDomain: 'bharatconnect-aa30d.firebaseapp.com',
  projectId: 'bharatconnect-aa30d',
  storageBucket: 'bharatconnect-aa30d.firebasestorage.app',
  messagingSenderId: '381721803830',
  appId: '1:381721803830:web:286eccf38b2659fcabac97',
  measurementId: 'G-L3LSCPPT90',
};

export const app = initializeApp(firebaseConfig);
// The project's database is named "default" (not the usual "(default)"), so it is named here.
// Optional form fields left undefined are skipped instead of failing the write.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true }, 'default');
export const auth = getAuth(app);

// Visitors may send an inquiry or collaboration request without an account:
// they get an anonymous Firebase session so the database rules can tie the record to them.
export async function ensureSignedIn() {
  await auth.authStateReady();
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser;
}

// Analytics is unavailable in some browsers (privacy modes, blocked cookies); skip it quietly there
isSupported().then((ok) => ok && getAnalytics(app)).catch(() => {});
