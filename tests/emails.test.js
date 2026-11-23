// node --test tests/emails.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { welcomeEmail, receivedEmail, adminAlertEmail, decisionEmail, esc } from '../src/data/emails.js';

const app = { ref: 'BMF.BC-SEO-00007', type: 'startup', name: 'Asha <script>', email: 'a@example.com', organisation: 'Asha & Co', status: 'pending' };

test('welcome email says the account means agreeing to the terms', () => {
  const m = welcomeEmail({ name: 'Asha' });
  assert.equal(m.subject, 'Welcome to Bharat Connect');
  assert.match(m.html, /agreed to all of Bharat Connect's .*Terms and Conditions/);
  assert.match(m.text, /agreed to all of Bharat Connect's Terms and Conditions/);
});

test('received email carries the reference and the pending-approval steps', () => {
  const m = receivedEmail(app);
  assert.match(m.subject, /BMF\.BC-SEO-00007.*pending approval/);
  assert.match(m.html, /Waiting for approval/);
  assert.match(m.html, /#startup/);
});

test('whatever an applicant types is escaped in the HTML', () => {
  for (const m of [receivedEmail(app), adminAlertEmail(app), decisionEmail({ ...app, status: 'declined', note: '<b>x</b>' })]) {
    assert.doesNotMatch(m.html, /<script>|<b>x<\/b>/);
  }
  assert.equal(esc(`<a href="x">'&`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
});

test('admin alert links to the approvals view', () => {
  assert.match(adminAlertEmail(app).html, /\/admin#approvals/);
});

test('decision email differs for approved and declined', () => {
  assert.match(decisionEmail({ ...app, status: 'approved' }).subject, /^Approved/);
  assert.match(decisionEmail({ ...app, status: 'declined', note: 'Incomplete documents' }).text, /Reason: Incomplete documents/);
});
