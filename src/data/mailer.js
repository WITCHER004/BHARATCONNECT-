import emailjs from '@emailjs/browser';

/*
  Sends the emails in emails.js through EmailJS (emailjs.com), straight from the browser.

  Set up once in the EmailJS dashboard:
    1. Email Services → Add service → connect the info@bharatconnect.live mailbox → copy the Service ID.
    2. Email Templates → Create template:
         To email:  {{to_email}}      From name: Bharat Connect      Reply to: info@bharatconnect.live
         Subject:   {{subject}}
         Content:   code view (< >) → paste email-templates/emailjs-letterhead.html (it contains {{{html}}})
       → copy the Template ID.
    3. Account → General → copy the Public Key.
    4. Account → Security → allow only your website's domains, so other sites can't use your quota.
  Then paste the three values below. They are public by design (EmailJS keys are meant for browsers).

  shortcut: browser-sent email can be triggered by anyone who copies these keys (limited by the
  allowed-domains list and the EmailJS quota); move to a server (Cloud Functions) if that is ever abused.
*/
const EMAILJS = {
  serviceId: 'service_nc4451t',
  templateId: '',
  publicKey: '',
};

export const emailReady = () => Boolean(EMAILJS.serviceId && EMAILJS.templateId && EMAILJS.publicKey);

/* Best effort: a failed email is logged and never blocks a sign-up, registration or decision. */
export async function sendEmail(to, { subject, html }) {
  if (!emailReady() || !to || (Array.isArray(to) && !to.length)) return;
  try {
    await emailjs.send(
      EMAILJS.serviceId,
      EMAILJS.templateId,
      { to_email: Array.isArray(to) ? to.join(',') : to, subject, html },
      { publicKey: EMAILJS.publicKey },
    );
  } catch (err) {
    console.warn('Email not sent:', subject, err?.text || err);
  }
}
