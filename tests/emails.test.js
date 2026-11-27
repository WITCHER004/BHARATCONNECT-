// node --test tests/emails.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import emailjs from '@emailjs/browser';
import { welcomeEmail, receivedEmail, adminAlertEmail, decisionEmail, esc } from '../src/data/emails.js';
import { sendWelcomeEmail, sendFormSubmissionEmail } from '../src/data/mailer.js';

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

test('sendWelcomeEmail passes expected credentials, variables, and falls back gracefully', async (t) => {
  const sendMock = t.mock.method(emailjs, 'send', async () => ({ status: 200, text: 'OK' }));

  await sendWelcomeEmail('Asha Sharma', 'asha@example.com');
  assert.equal(sendMock.mock.callCount(), 1);
  assert.deepEqual(sendMock.mock.calls[0].arguments, [
    'service_nc4451t',
    'template_6ot9999',
    {
      to_name: 'Asha Sharma',
      name: 'Asha Sharma',
      to_email: 'asha@example.com',
      email: 'asha@example.com',
    },
    'z_0w3S5cSA7W4kWvq',
  ]);

  await sendWelcomeEmail('', 'delegate@bharat.in');
  assert.deepEqual(sendMock.mock.calls[1].arguments[2], {
    to_name: 'delegate',
    name: 'delegate',
    to_email: 'delegate@bharat.in',
    email: 'delegate@bharat.in',
  });

  await sendWelcomeEmail(null, '@invalid');
  assert.deepEqual(sendMock.mock.calls[2].arguments[2], {
    to_name: 'Member',
    name: 'Member',
    to_email: '@invalid',
    email: '@invalid',
  });

  // Should not throw if EmailJS fails
  t.mock.method(console, 'error', () => {});
  const failMock = t.mock.method(emailjs, 'send', async () => { throw new Error('network down'); });
  await assert.doesNotReject(() => sendWelcomeEmail('Test', 'test@example.com'));
  assert.equal(failMock.mock.callCount(), 1);
});

test('sendFormSubmissionEmail uses template_7t66wzf, Applicant fallback, and handles errors safely', async (t) => {
  const sendMock = t.mock.method(emailjs, 'send', async () => ({ status: 200, text: 'OK' }));

  await sendFormSubmissionEmail('Priya Nair', 'priya@startup.in');
  assert.equal(sendMock.mock.callCount(), 1);
  assert.deepEqual(sendMock.mock.calls[0].arguments, [
    'service_nc4451t',
    'template_7t66wzf',
    {
      to_name: 'Priya Nair',
      name: 'Priya Nair',
      to_email: 'priya@startup.in',
      email: 'priya@startup.in',
    },
    'z_0w3S5cSA7W4kWvq',
  ]);

  await sendFormSubmissionEmail('', 'founder@example.com');
  assert.deepEqual(sendMock.mock.calls[1].arguments[2], {
    to_name: 'founder',
    name: 'founder',
    to_email: 'founder@example.com',
    email: 'founder@example.com',
  });

  await sendFormSubmissionEmail(null, '@invalid');
  assert.deepEqual(sendMock.mock.calls[2].arguments[2], {
    to_name: 'Applicant',
    name: 'Applicant',
    to_email: '@invalid',
    email: '@invalid',
  });

  t.mock.method(console, 'error', () => {});
  const failMock = t.mock.method(emailjs, 'send', async () => { throw new Error('timeout'); });
  await assert.doesNotReject(() => sendFormSubmissionEmail('Test', 'test@example.com'));
  assert.equal(failMock.mock.callCount(), 1);
});
