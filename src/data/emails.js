/*
  The emails Bharat Connect sends through EmailJS (see mailer.js), as { subject, html, text }.
  Everything a visitor typed is HTML-escaped before it goes into an email.
*/

export const FROM = 'Bharat Connect <info@bharatconnect.live>';
export const SITE = 'https://bharatconnect-aa30d.web.app';
export const ADMIN_URL = `${SITE}/admin`;
export const TERMS_URL = `${SITE}/terms/Bharat-Mahotsav-Festivals-LLP-Registration-Terms-and-Conditions-v1-04Nov2026.pdf`;

const WHAT = { delegate: 'event registration', startup: 'startup registration', collaboration: 'collaboration request' };
const PORTAL = { delegate: 'register', startup: 'startup', collaboration: 'collaborate' };

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// The letterhead (logo, skyline, footer) lives in the EmailJS template: email-templates/emailjs-letterhead.html.
// Each email here is only the message that goes inside it.
const NAVY = '#12306b';
const ORANGE = '#ef7d1a';

function layout(title, bodyHtml) {
  return `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;color:${NAVY};margin:0 0 16px">${title}</h1>
${bodyHtml}`;
}

const p = (html) => `<p style="font-size:15px;line-height:1.6;margin:0 0 14px">${html}</p>`;
const button = (href, label) => `<p style="margin:22px 0"><a href="${href}" style="display:inline-block;background:${ORANGE};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;font-size:15px">${label}</a></p>`;
const refBox = (ref) => `<div style="margin:18px 0;padding:14px 16px;background:#f3f6fb;border-left:4px solid ${ORANGE};border-radius:8px"><div style="font-size:12px;color:#6b7184">Your reference</div><div style="font-family:Consolas,monospace;font-size:18px;font-weight:bold;color:${NAVY}">${esc(ref)}</div></div>`;

/* 1. A new account: welcome, and the terms they agreed to by creating it. */
export function welcomeEmail({ name }) {
  const hello = name ? `Dear ${esc(name)},` : 'Hello,';
  return {
    subject: 'Welcome to Bharat Connect',
    html: layout('Welcome to Bharat Connect', [
      p(hello),
      p('Thank you for creating your Bharat Connect account. You can now register for Bharat Connect 2026, showcase your startup, propose a collaboration and follow your applications in one place.'),
      p(`By creating your account, you agreed to all of Bharat Connect's <a href="${TERMS_URL}" style="color:${ORANGE}">Terms and Conditions</a>.`),
      button(SITE, 'Go to Bharat Connect'),
      p('If you did not create this account, reply to this email and we will remove it.'),
    ].join('')),
    text: `${name ? `Dear ${name},` : 'Hello,'}\n\nWelcome to Bharat Connect. Thank you for creating your account.\n\nBy creating your account, you agreed to all of Bharat Connect's Terms and Conditions: ${TERMS_URL}\n\n${SITE}\n\nIf you did not create this account, reply to this email.`,
  };
}

/* 2. An application was received: what happens next, while it waits for approval. */
export function receivedEmail(r) {
  const what = WHAT[r.type] || 'application';
  return {
    subject: `We received your ${what} (${r.ref}): pending approval`,
    html: layout(`Your ${what} is pending approval`, [
      p(`Dear ${esc(r.name) || 'applicant'},`),
      p(`Thank you. We have received your ${what}${r.organisation ? ` for <b>${esc(r.organisation)}</b>` : ''}.`),
      refBox(r.ref),
      p('<b>What happens next</b>'),
      `<ol style="font-size:15px;line-height:1.6;margin:0 0 14px;padding-left:20px">
<li>The Bharat Connect Secretariat reviews your application.</li>
<li>Until it is approved, your page on the website shows <i>Waiting for approval</i>.</li>
<li>We email you as soon as a decision is made.</li></ol>`,
      button(`${SITE}/#${PORTAL[r.type] || ''}`, 'Check your status'),
      p(`You agreed to the Bharat Connect <a href="${TERMS_URL}" style="color:${ORANGE}">Terms and Conditions</a> when you submitted this application.`),
    ].join('')),
    text: `Dear ${r.name || 'applicant'},\n\nWe have received your ${what}. Reference: ${r.ref}\n\nThe Secretariat will review it. Until it is approved, your page shows "Waiting for approval", and we will email you with the decision.\n\nCheck your status: ${SITE}/#${PORTAL[r.type] || ''}`,
  };
}

/* 3. To the admins: a new application is waiting in the admin portal. */
export function adminAlertEmail(r) {
  const what = WHAT[r.type] || 'application';
  const rows = [['Reference', r.ref], ['Name', r.name], ['Email', r.email], ['Organisation', r.organisation], ['Country', r.country], ['Category', r.detail], ['Sector', r.sector]]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#7a7364;font-size:13px">${k}</td><td style="padding:6px 0;font-size:14px">${esc(v)}</td></tr>`).join('');
  return {
    subject: `New ${what} awaiting approval: ${r.name || r.ref} (${r.ref})`,
    html: layout(`New ${what} awaiting approval`, [
      p('A new application is waiting for a decision in the admin portal.'),
      `<table cellpadding="0" cellspacing="0" style="margin:0 0 8px">${rows}</table>`,
      button(`${ADMIN_URL}#approvals`, 'Review in the admin portal'),
      p('The applicant sees <i>Waiting for approval</i> until you approve or decline it.'),
    ].join('')),
    text: `New ${what} awaiting approval\n\n${[['Reference', r.ref], ['Name', r.name], ['Email', r.email], ['Organisation', r.organisation]].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nReview: ${ADMIN_URL}#approvals`,
  };
}

/* 4. The decision. */
export function decisionEmail(r) {
  const what = WHAT[r.type] || 'application';
  const ok = r.status === 'approved';
  return {
    subject: ok ? `Approved: your ${what} (${r.ref})` : `Update on your ${what} (${r.ref})`,
    html: layout(ok ? `Your ${what} is approved` : `Your ${what} was not approved`, [
      p(`Dear ${esc(r.name) || 'applicant'},`),
      ok
        ? p(`Good news: the Bharat Connect Secretariat has approved your ${what}. We look forward to welcoming you at Bharat Connect 2026 on 18–19 December at Yashobhoomi, New Delhi.`)
        : p(`Thank you for your interest. After review, the Secretariat could not approve your ${what}.${r.note ? ` Reason: ${esc(r.note)}` : ''} You are welcome to reply to this email with any questions.`),
      refBox(r.ref),
      button(`${SITE}/#${PORTAL[r.type] || ''}`, ok ? 'View your registration' : 'Visit Bharat Connect'),
    ].join('')),
    text: ok
      ? `Dear ${r.name || 'applicant'},\n\nYour ${what} (${r.ref}) has been approved. See you at Bharat Connect 2026, 18–19 December, Yashobhoomi, New Delhi.\n\n${SITE}`
      : `Dear ${r.name || 'applicant'},\n\nAfter review, your ${what} (${r.ref}) could not be approved.${r.note ? ` Reason: ${r.note}` : ''}\n\nReply to this email with any questions.`,
  };
}
