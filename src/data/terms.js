/*
  Bharat Connect 2026 · Terms, Conditions & Policy Registry
  Centralized terms definition, storage, and acceptance checking across all portals.
*/

import { VERSION, TERMS_PDF } from './registrationTerms';

// the official Registration Terms and Conditions (Version 1, 04 Nov 2026), served by the site
export const TERMS_LINK = TERMS_PDF;
export const TERMS_URL = TERMS_LINK;

export const PORTAL_TERMS = {
  global: {
    portalId: 'global',
    title: 'Bharat Connect Conclave Terms & Code of Conduct',
    subtitle: 'General platform use, diplomatic protocol, and security accreditation at Yashobhoomi (IICC).',
    bullets: [
      'Official credentials and accreditation badges are strictly non-transferable and must be displayed at all times within Palash Hall (6F).',
      'Delegates, exhibitors, and participants agree to maintain high diplomatic and business decorum during ministerial plenaries and deal rooms.',
      'Information exchanged under the Comprehensive Economic Partnership Agreement (CEPA) corridor is subject to bilateral confidentiality protocols.',
      'Audio and video recording in closed-door sovereign roundtables and government bilateral suites is strictly prohibited without prior Secretariat clearance.',
    ],
    legalNotice: 'By clicking "I Agree", you confirm compliance with the rules and protocols established by the Bharat Connect Secretariat and IACCIA.',
  },

  register: {
    portalId: 'register',
    title: 'Delegate & Event Pass Terms & Conditions',
    subtitle: 'Accreditation guidelines for Corporate Delegates, Sovereign Investors, and Official Observers.',
    bullets: [
      'Each registration generates a unique sovereign Accreditation ID (BMF.BC-DGO-00001 onwards) tied to the registrant’s government-issued ID.',
      'Access permits entry to ministerial plenaries, sector sessions, bilateral networking lunches, and the 7,000 sq ft Yashobhoomi Executive Deal Lounge.',
      'International delegates requiring an official Visa Support Letter or Ministry of External Affairs (MEA) conference clearance will receive verified documentation within 48 hours of approval.',
      'Passes are subject to review by the Secretariat. The Secretariat reserves the right to decline or reallocate passes to ensure regional quota balance.',
    ],
    legalNotice: 'Admission is subject to security screening by the Diplomatic Protection Unit at Yashobhoomi Entrance Gate 3.',
  },

  startup: {
    portalId: 'startup',
    title: 'Startup Showcase Pavilion & Innovation Terms',
    subtitle: 'Rules for startup registration, ₹5,000 + GST accreditation, and bilateral investor matchmaking.',
    bullets: [
      'The registration fee of ₹5,000 plus applicable GST grants a unique Accreditation ID (BMF.BC-SEO-00001 onwards) valid for 2 years across 5 flagship events of Bharat Mahotsav Festivals LLP.',
      'Registration fees are strictly non-refundable once the accreditation process commences, except as explicitly stated in the master terms.',
      'Participation in the physical Startup Pavilion and private investor deal rooms is subject to sectoral vetting by the Innovation Directorate.',
      'Founders retain full proprietary rights and intellectual property over pitches, patents, and disclosures. The Secretariat does not claim equity or IP rights.',
    ],
    legalNotice: 'You consent to Bharat Mahotsav Festivals LLP verifying company credentials and sharing pitch summaries with accredited Arab sovereign funds.',
  },

  aimf: {
    portalId: 'aimf',
    title: 'AIMF Cultural & Creative Accreditation Terms',
    subtitle: 'Guidelines for artists, cultural troupes, creative studios, and sovereign delegations.',
    bullets: [
      'AIMF accreditation is complimentary (₹0 fee / No payment required) and grants a unique Accreditation ID (BMF.BC-AMF-00001 onwards).',
      'Accreditation grants access to the AIMF Cultural Pavilion, Grand Auditorium symphonic galas, and bilateral creative deal rooms.',
      'Stage allocations and exhibition spaces are subject to curatorial scheduling by the Secretariat and IACCIA Cultural Directorate.',
      'Artists, performers, and creative enterprises retain 100% intellectual property and copyright over all works, performances, and recordings.',
    ],
    legalNotice: 'By clicking "I Agree", you confirm adherence to the AIMF Participation Guidelines and Yashobhoomi venue security protocols.',
  },

  'aimf-register': {
    portalId: 'aimf-register',
    title: 'AIMF Cultural & Creative Accreditation Terms',
    subtitle: 'Guidelines for artists, cultural troupes, creative studios, and sovereign delegations.',
    bullets: [
      'AIMF accreditation is complimentary (₹0 fee / No payment required) and grants a unique Accreditation ID (BMF.BC-AMF-00001 onwards).',
      'Accreditation grants access to the AIMF Cultural Pavilion, Grand Auditorium symphonic galas, and bilateral creative deal rooms.',
      'Stage allocations and exhibition spaces are subject to curatorial scheduling by the Secretariat and IACCIA Cultural Directorate.',
      'Artists, performers, and creative enterprises retain 100% intellectual property and copyright over all works, performances, and recordings.',
    ],
    legalNotice: 'By clicking "I Agree", you confirm adherence to the AIMF Participation Guidelines and Yashobhoomi venue security protocols.',
  },

  collaborate: {
    portalId: 'collaborate',
    title: 'Summit Collaboration & Sovereign Directorate Agreement',
    subtitle: 'Institutional framework for Country Pavilions, Industry Sector Anchors, and Deal-Room Co-Hosts.',
    bullets: [
      'Partnership inquiries are treated as official institutional letters of intent (LOI) under the bilateral trade promotion framework.',
      'Allotted pavilion spaces, ministerial speaking slots, and branded negotiation suites are allocated following bilateral quota clearance.',
      'Co-authoring of policy whitepapers and official compendiums requires editorial concurrence from the Summit Knowledge Directorate.',
      'MOU signing ceremonies during plenary sessions must be pre-vetted with the IACCIA Protocol Office 14 days prior to the conclave.',
    ],
    legalNotice: 'Formal engagement is executed via an official Bilateral Partnership Memorandum signed with the Organizing Secretariat.',
  },

  exhibition: {
    portalId: 'exhibition',
    title: 'Exhibition Spaceworks & Pavilion Operations Policy',
    subtitle: 'Safety, booth construction, and commercial display rules for Palash Hall (6F) at Yashobhoomi.',
    bullets: [
      'Standard (9 m²), Premium Corner (18 m²), and Sovereign Pavilion (36 m²) booths must adhere to Yashobhoomi IICC height restrictions (max 3.5m).',
      'All stall fabrication materials, electrical fittings, and display systems must comply with Delhi Fire Services (DFS) class-A fire-retardant standards.',
      'Stall allocation is confirmed upon fee realization and verified documentation. Subletting or sharing booth space without approval is prohibited.',
      'Setup occurs during the official setup window on 17 Dec 2026. Teardown must be completed by midnight of 19 Dec 2026.',
    ],
    legalNotice: 'Exhibitors are required to maintain comprehensive third-party public liability insurance for their booth operations.',
  },

  query: {
    portalId: 'query',
    title: 'Secretariat Query Desk & Helpdesk Terms',
    subtitle: 'Terms of service for official inquiries, concierge assistance, and ticket tracking.',
    bullets: [
      'Queries submitted through the Query Desk are assigned an official tracking reference (BMF.BC-QRY-00001 onwards).',
      'The Secretariat endeavors to respond to general inquiries within 24 hours, and expedited protocol/visa inquiries within 4 hours.',
      'You consent to the Secretariat contacting you via email, telephone, or official WhatsApp concerning your inquiry.',
      'Submissions containing commercial proposals or confidential documents are handled under strict Secretariat non-disclosure obligations.',
    ],
    legalNotice: 'For urgent diplomatic motorcade or protocol requests, please also notify the 24/7 Diplomatic Liaison Office.',
  },

  auth: {
    portalId: 'auth',
    title: 'Bharat Connect Platform Account Terms',
    subtitle: 'Single Sign-On, credentials security, and privacy protection under Indian and CEPA data standards.',
    bullets: [
      'Authentication provides seamless tracking across delegate passes, startup accreditations, and exhibition applications.',
      'You are responsible for maintaining the confidentiality of your sign-in credentials and any actions performed thereunder.',
      'Your email and contact data are strictly utilized for conclave communication, badge issuing, and bilateral scheduling.',
      'We never store plain-text passwords or share your contact info with unauthorized commercial advertisers.',
    ],
    legalNotice: 'Account services are operated under the Digital Personal Data Protection (DPDP) Act of India and international bilateral data standards.',
  },
};

import { recordTermsConsent } from './registry';

const STORAGE_PREFIX = `babc_terms_agreed_${VERSION}_`;

export function hasUserDecidedTerms(uidOrEmail) {
  if (!uidOrEmail) return false;
  try {
    return !!localStorage.getItem(`babc_user_terms_${VERSION}_${uidOrEmail}`);
  } catch {
    return false;
  }
}

export function getUserTermsDecision(uidOrEmail) {
  if (!uidOrEmail) return null;
  try {
    return localStorage.getItem(`babc_user_terms_${VERSION}_${uidOrEmail}`) || null;
  } catch {
    return null;
  }
}

export function setUserTermsDecision(uidOrEmail, decision) {
  if (!uidOrEmail) return;
  try {
    localStorage.setItem(`babc_user_terms_${VERSION}_${uidOrEmail}`, decision);
    window.dispatchEvent(new CustomEvent('babc-user-terms-change', { detail: { uidOrEmail, decision } }));
  } catch { /* storage unavailable */ }
}

export function hasAccepted(portalId = 'global') {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${portalId}`) === 'true';
  } catch {
    return false;
  }
}

export function hasAcceptedTerms(portalId = 'global') {
  return hasAccepted(portalId);
}

export function accept(portalId = 'global', userDetails = null) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${portalId}`, 'true');
    // Also trigger custom storage event so active modals update immediately
    window.dispatchEvent(new CustomEvent('babc-terms-change', { detail: { portalId, status: 'agreed' } }));

    // Log to admin consent registry
    const portalObj = PORTAL_TERMS[portalId] || PORTAL_TERMS.global;
    recordTermsConsent({
      uid: userDetails?.uid,
      userName: userDetails?.name,
      userEmail: userDetails?.email,
      decision: 'agreed',
      portal: portalId,
      portalTitle: portalObj?.title || `Portal Terms (${portalId})`,
    });
    return true;
  } catch {
    return false;
  }
}

export function acceptTerms(portalId = 'global', userDetails = null) {
  return accept(portalId, userDetails);
}

export function decline(portalId = 'global', userDetails = null) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${portalId}`, 'declined');
    window.dispatchEvent(new CustomEvent('babc-terms-change', { detail: { portalId, status: 'declined' } }));

    // Log to admin consent registry
    const portalObj = PORTAL_TERMS[portalId] || PORTAL_TERMS.global;
    recordTermsConsent({
      uid: userDetails?.uid,
      userName: userDetails?.name,
      userEmail: userDetails?.email,
      decision: 'disagreed',
      portal: portalId,
      portalTitle: portalObj?.title || `Portal Terms (${portalId})`,
    });
    return true;
  } catch {
    return false;
  }
}

export function declineTerms(portalId = 'global') {
  return decline(portalId);
}

export function resetTerms(portalId = 'global') {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${portalId}`);
    window.dispatchEvent(new CustomEvent('babc-terms-change', { detail: { portalId, status: 'reset' } }));
  } catch {
    /* storage unavailable */
  }
}
