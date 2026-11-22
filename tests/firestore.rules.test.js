/*
  Tests for firestore.rules against the Firestore emulator.

  One-time setup (needs Java 11+ for the emulator):
    npm i -D firebase-tools @firebase/rules-unit-testing
  Run:
    npx firebase emulators:exec --only firestore --project demo-bharatconnect "node --test tests/"
*/
import { readFileSync } from 'node:fs';
import { test, before, after, beforeEach } from 'node:test';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where, serverTimestamp, writeBatch,
} from 'firebase/firestore';

let env;
const google = (uid, email = `${uid}@example.com`) => ({ email, email_verified: true, firebase: { sign_in_provider: 'google.com' } });
const asUser = (uid = 'alice') => env.authenticatedContext(uid, google(uid)).firestore();
const asAnon = (uid = 'anon1') => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const asAdmin = () => env.authenticatedContext('admin1', google('admin1', 'Boss@Example.com')).firestore();
const asNobody = () => env.unauthenticatedContext().firestore();

const seed = (path, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));

// what the site does: move the counter and write the record under the new number, together
function submit(db, coll, code, n, data) {
  const ref = `BMF.BC-${code}-${String(n).padStart(5, '0')}`;
  const b = writeBatch(db);
  b.set(doc(db, 'counters', code), { n });
  b.set(doc(db, coll, ref), { ...data, ref, submittedAt: serverTimestamp() });
  return b.commit();
}
const delegate = (uid = 'alice', extra = {}) => ({
  type: 'delegate', uid, status: 'pending', name: 'Alice Rao', email: 'alice@example.com',
  organisation: 'Example Co', country: 'India', detail: 'Corporate Delegate', b2b: true,
  details: { fullName: 'Alice Rao', role: 'Corporate Delegate' }, ...extra,
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-bharatconnect',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await seed('admins/boss@example.com', {});
});

test('a visitor registers under the next reference number', async () => {
  await assertSucceeds(submit(asUser(), 'registrations', 'DGO', 1, delegate()));
  await assertSucceeds(submit(asUser(), 'registrations', 'DGO', 2, delegate()));
});

test('references cannot be skipped, reused or mismatched', async () => {
  await assertFails(submit(asUser(), 'registrations', 'DGO', 5, delegate()));            // skips ahead
  await assertSucceeds(submit(asUser(), 'registrations', 'DGO', 1, delegate()));
  await assertFails(submit(asUser(), 'registrations', 'DGO', 1, delegate()));            // reuses 00001
  await assertFails(submit(asUser(), 'registrations', 'SEO', 1, delegate()));            // delegate under a startup code
  await assertFails(setDoc(doc(asUser(), 'registrations/BMF.BC-DGO-00002'), { ...delegate(), ref: 'BMF.BC-DGO-00002', submittedAt: serverTimestamp() })); // no counter move
});

test('registrations are refused when faked or malformed', async () => {
  const db = asUser();
  await assertFails(submit(asNobody(), 'registrations', 'DGO', 1, delegate()));         // not signed in
  await assertFails(submit(db, 'registrations', 'DGO', 1, delegate('bob')));            // posing as someone else
  await assertFails(submit(db, 'registrations', 'DGO', 1, delegate('alice', { status: 'approved' })));
  await assertFails(submit(db, 'registrations', 'DGO', 1, delegate('alice', { isAdmin: true })));
  await assertFails(submit(db, 'registrations', 'DGO', 1, delegate('alice', { email: 'nope' })));
  await assertFails(submit(asAnon(), 'registrations', 'SEO', 1, { ...delegate('anon1'), type: 'startup' })); // startup needs an account
});

test('anonymous visitors can send an inquiry but not register', async () => {
  await assertFails(submit(asAnon(), 'registrations', 'CBC', 1, {
    type: 'collaboration', uid: 'anon1', status: 'pending', name: 'Omar', email: 'omar@example.com',
    details: { orgName: 'Gulf Co', track: 'country-pavilion' },
  }));
  await assertSucceeds(submit(asAnon(), 'queries', 'QRY', 1, {
    uid: 'anon1', status: 'received', fullName: 'Omar', email: 'omar@example.com', message: 'Visa letter?', urgent: false,
  }));
});

test('visitors read only their own records; admins read everything', async () => {
  await seed('registrations/BMF.BC-DGO-00001', { ...delegate('alice'), submittedAt: new Date() });
  await seed('registrations/BMF.BC-DGO-00002', { ...delegate('bob'), submittedAt: new Date() });
  await assertSucceeds(getDoc(doc(asUser('alice'), 'registrations/BMF.BC-DGO-00001')));
  await assertFails(getDoc(doc(asUser('alice'), 'registrations/BMF.BC-DGO-00002')));
  await assertSucceeds(getDocs(query(collection(asUser('alice'), 'registrations'), where('uid', '==', 'alice'))));
  await assertFails(getDocs(collection(asUser('alice'), 'registrations')));
  await assertSucceeds(getDocs(collection(asAdmin(), 'registrations')));
  await assertFails(getDocs(collection(asUser('alice'), 'logins')));
  await assertSucceeds(getDocs(collection(asAdmin(), 'logins')));
});

test('only admins approve or decline, and only the decision fields change', async () => {
  await seed('registrations/BMF.BC-DGO-00001', { ...delegate('alice'), submittedAt: new Date() });
  const decision = { status: 'approved', note: '', decidedAt: serverTimestamp() };
  await assertFails(updateDoc(doc(asUser('alice'), 'registrations/BMF.BC-DGO-00001'), { ...decision, decidedBy: 'alice' }));
  await assertFails(updateDoc(doc(asAdmin(), 'registrations/BMF.BC-DGO-00001'), { ...decision, decidedBy: 'admin1', email: 'x@example.com' }));
  await assertSucceeds(updateDoc(doc(asAdmin(), 'registrations/BMF.BC-DGO-00001'), { ...decision, decidedBy: 'admin1' }));
  await assertFails(deleteDoc(doc(asUser('alice'), 'registrations/BMF.BC-DGO-00001')));
});

test('admin list: you can check yourself, nobody can edit it', async () => {
  await assertSucceeds(getDoc(doc(asAdmin(), 'admins/boss@example.com')));
  await assertFails(getDoc(doc(asUser('alice'), 'admins/boss@example.com')));
  await assertFails(setDoc(doc(asUser('alice'), 'admins/alice@example.com'), {}));
});

test('sign-in log: own entry only', async () => {
  const entry = { uid: 'alice', action: 'sign-in', name: 'Alice', email: 'alice@example.com', method: 'Google', at: serverTimestamp() };
  await assertSucceeds(addDoc(collection(asUser('alice'), 'logins'), entry));
  await assertFails(addDoc(collection(asUser('alice'), 'logins'), { ...entry, email: 'bob@example.com' }));
  await assertFails(addDoc(collection(asAnon(), 'logins'), { ...entry, uid: 'anon1' }));
});

test('startup directory: public read, admin-only write, public fields only', async () => {
  const card = { name: 'Test Brand', sectors: ['Clean Energy'], stage: 'MVP', website: 'https://example.com', pitch: 'Short pitch' };
  await assertFails(setDoc(doc(asUser(), 'startupDirectory/s1'), card));
  await assertFails(setDoc(doc(asAdmin(), 'startupDirectory/s1'), { ...card, email: 'founder@example.com' }));
  await assertFails(setDoc(doc(asAdmin(), 'startupDirectory/s1'), { ...card, website: 'javascript:alert(1)' }));
  await assertSucceeds(setDoc(doc(asAdmin(), 'startupDirectory/s1'), card));
  await assertSucceeds(getDoc(doc(asNobody(), 'startupDirectory/s1')));
});
