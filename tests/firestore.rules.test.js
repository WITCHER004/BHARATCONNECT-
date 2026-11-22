/*
  Tests for firestore.rules against the Firestore emulator.

  One-time setup (needs Java 11+ for the emulator):
    npm i -D firebase-tools @firebase/rules-unit-testing firebase
  Run:
    npx firebase emulators:exec --only firestore --project demo-bharatconnect "node --test tests/"
*/
import { readFileSync } from 'node:fs';
import { test, before, after, beforeEach } from 'node:test';
import {
  initializeTestEnvironment, assertSucceeds, assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where, serverTimestamp,
} from 'firebase/firestore';

let env;
const google = (uid, extra = {}) => ({ email: `${uid}@example.com`, firebase: { sign_in_provider: 'google.com' }, ...extra });
const anon = { firebase: { sign_in_provider: 'anonymous' } };

const asUser = (uid = 'alice') => env.authenticatedContext(uid, google(uid)).firestore();
const asAnon = (uid = 'anon1') => env.authenticatedContext(uid, anon).firestore();
const asAdmin = () => env.authenticatedContext('admin1', google('admin1', { admin: true })).firestore();
const asNobody = () => env.unauthenticatedContext().firestore();

const delegate = (uid = 'alice', extra = {}) => ({
  type: 'delegate', uid, status: 'pending', submittedAt: serverTimestamp(),
  name: 'Alice Rao', email: 'alice@example.com', organisation: 'Example Co', country: 'India',
  detail: 'Corporate Delegate', b2b: true, ...extra,
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-bharatconnect',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

const seed = (path, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));

test('a signed-in visitor can register as a delegate', async () => {
  await assertSucceeds(addDoc(collection(asUser(), 'registrations'), delegate()));
});

test('registrations are refused when faked or malformed', async () => {
  const reg = collection(asUser(), 'registrations');
  await assertFails(addDoc(collection(asNobody(), 'registrations'), delegate()));          // not signed in
  await assertFails(addDoc(collection(asAnon(), 'registrations'), delegate('anon1')));     // delegate needs an account
  await assertFails(addDoc(reg, delegate('bob')));                                         // posing as someone else
  await assertFails(addDoc(reg, delegate('alice', { status: 'approved' })));               // self-approval
  await assertFails(addDoc(reg, delegate('alice', { submittedAt: new Date(2020, 0, 1) }))); // backdated
  await assertFails(addDoc(reg, delegate('alice', { isAdmin: true })));                    // unknown field
  await assertFails(addDoc(reg, delegate('alice', { email: 'not-an-email' })));
  await assertFails(addDoc(reg, delegate('alice', { type: 'panel' })));
});

test('an anonymous visitor can send a collaboration request and an inquiry', async () => {
  const db = asAnon();
  await assertSucceeds(addDoc(collection(db, 'registrations'), {
    type: 'collaboration', uid: 'anon1', status: 'pending', submittedAt: serverTimestamp(),
    name: 'Omar', email: 'omar@example.com', track: 'country-pavilion', mouSigning: true,
  }));
  await assertSucceeds(addDoc(collection(db, 'queries'), {
    uid: 'anon1', status: 'received', submittedAt: serverTimestamp(),
    fullName: 'Omar', email: 'omar@example.com', message: 'Visa letter?', urgent: false,
  }));
});

test('visitors read only their own submissions; admins read all', async () => {
  await seed('registrations/r1', { ...delegate('alice'), submittedAt: new Date() });
  await seed('registrations/r2', { ...delegate('bob'), submittedAt: new Date() });
  await assertSucceeds(getDoc(doc(asUser('alice'), 'registrations/r1')));
  await assertFails(getDoc(doc(asUser('alice'), 'registrations/r2')));
  await assertSucceeds(getDocs(query(collection(asUser('alice'), 'registrations'), where('uid', '==', 'alice'))));
  await assertFails(getDocs(collection(asUser('alice'), 'registrations')));                // listing everyone
  await assertSucceeds(getDocs(collection(asAdmin(), 'registrations')));
});

test('only admins approve or decline, and only the status fields change', async () => {
  await seed('registrations/r1', { ...delegate('alice'), submittedAt: new Date() });
  const decision = { status: 'approved', decidedAt: serverTimestamp(), decidedBy: 'admin1' };
  await assertFails(updateDoc(doc(asUser('alice'), 'registrations/r1'), { ...decision, decidedBy: 'alice' }));
  await assertFails(updateDoc(doc(asAdmin(), 'registrations/r1'), { ...decision, email: 'x@example.com' }));
  await assertSucceeds(updateDoc(doc(asAdmin(), 'registrations/r1'), decision));
  await assertFails(deleteDoc(doc(asUser('alice'), 'registrations/r1')));
});

test('sign-in log: own entry only, admins read', async () => {
  const entry = { uid: 'alice', action: 'sign-in', name: 'Alice', email: 'alice@example.com', method: 'Google', at: serverTimestamp() };
  await assertSucceeds(addDoc(collection(asUser('alice'), 'logins'), entry));
  await assertFails(addDoc(collection(asUser('alice'), 'logins'), { ...entry, email: 'bob@example.com' }));
  await assertFails(getDocs(collection(asUser('alice'), 'logins')));
  await assertSucceeds(getDocs(collection(asAdmin(), 'logins')));
});

test('startup directory: public read, admin-only write, public fields only', async () => {
  const card = { name: 'Test Brand', sectors: ['Clean Energy'], stage: 'MVP', website: 'https://example.com', pitch: 'Short pitch' };
  await assertFails(setDoc(doc(asUser(), 'startupDirectory/s1'), card));
  await assertFails(setDoc(doc(asAdmin(), 'startupDirectory/s1'), { ...card, email: 'founder@example.com' }));
  await assertFails(setDoc(doc(asAdmin(), 'startupDirectory/s1'), { ...card, website: 'javascript:alert(1)' }));
  await assertSucceeds(setDoc(doc(asAdmin(), 'startupDirectory/s1'), card));
  await assertSucceeds(getDoc(doc(asNobody(), 'startupDirectory/s1')));
});

test('anything else is denied', async () => {
  await assertFails(setDoc(doc(asAdmin(), 'counters/delegate'), { n: 1 }));
  await assertFails(getDoc(doc(asNobody(), 'registrations/r1')));
});
