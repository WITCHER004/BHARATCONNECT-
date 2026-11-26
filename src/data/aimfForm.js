/*
  AIMF (Atal Innovation Multilateral Forum & Cultural Pavilion) Accreditation Form.
  Organised by Bharat Mahotsav Festivals LLP in strategic alliance with IACCIA.
  Complimentary accreditation for artists, cultural organizations, creative studios,
  media producers, and sovereign delegates. No registration fee / payment required.
*/

export { TERMS_PDF as TERMS_URL } from './registrationTerms';

export const ORGANISER = {
  name: 'Bharat Mahotsav Festivals LLP',
  alliance: 'India-Arab Chamber of Commerce and Industry (IACCIA)',
  email: 'aimf@bharatconnect.live',
  phone: '+91 92174 00624',
  phoneHref: 'tel:+919217400624',
  website: 'bharatmahotsavfestivals.com',
  websiteHref: 'https://bharatmahotsavfestivals.com',
};

export const EVENT = {
  title: 'Atal Innovation Multilateral Forum (AIMF): Cultural Diplomacy, Music & Creative Economy Conclave',
  byline: 'Bharat Connect x IACCIA, an initiative of Bharat Mahotsav Festivals LLP',
  venue: 'Yashobhoomi (IICC), Dwarka, New Delhi',
  dates: '18 and 19 December 2026',
  pavilion: 'AIMF Cultural & Media Pavilion (Hall 4 & Grand Auditorium)',
  admission: 'Complimentary upon official accreditation',
};

export const DOCUMENTS = [
  { title: 'Entity / Troupe details', text: 'Name and profile of your cultural organization, troupe, studio, or enterprise' },
  { title: 'Official identification', text: 'PAN, CIN, Tax ID or Passport number of the lead representative or entity' },
  { title: 'Showcase & artistic profile', text: 'Summary of your performance, cultural showcase, or co-production project' },
  { title: 'Portfolio / Showreel links', text: 'Google Drive, YouTube, or web link to lookbooks, performance videos, or deck' },
];

export const DESIGNATIONS = [
  'Artistic Director / Troupe Lead',
  'Founder / CEO / Studio Head',
  'Cultural Delegate / Diplomatic Officer',
  'Master Artist / Musician / Performer',
  'Authorised Representative',
];

export const ENTITY_TYPES = [
  'Cultural Organisation / Society / Trust',
  'Performing Arts Troupe / Musical Ensemble',
  'Media Production Studio / OTT Network',
  'Creative Agency / Architecture & Design Studio',
  'Private Limited Enterprise',
  'Independent Artist / Cultural Practitioner',
  'Government / Sovereign Cultural Mission',
  'Other',
];

export const COUNTRIES = [
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Oman',
  'Egypt',
  'Kuwait',
  'Bahrain',
  'Jordan',
  'Morocco',
  'Algeria',
  'Tunisia',
  'Iraq',
  'Lebanon',
  'International / Other',
];

export const SECTORS = [
  { value: 'Music & Performing Arts: Classical, Sufi, Maqam, Folk, Fusion, Symphonic', label: 'Music & Performing Arts', hint: 'Classical, Sufi, Maqam, folk, orchestral, fusion' },
  { value: 'Film, Cinema & OTT Streaming: Co-productions, Distribution, Rights licensing', label: 'Film & OTT Streaming', hint: 'Co-productions, distribution, streaming rights' },
  { value: 'Media, Broadcasting & Digital Content: Virtual production, Podcasts, Creators', label: 'Media & Digital Content', hint: 'Virtual production, podcasts, creator economies' },
  { value: 'Creative Tech, Animation & Gaming: VFX, Immersive Media, Virtual Heritage', label: 'Creative Tech & Gaming', hint: 'VFX, gaming studios, immersive digital heritage' },
  { value: 'Art, Calligraphy & Design: Arabic calligraphy, Indian fine arts, Sculpture', label: 'Art, Calligraphy & Design', hint: 'Calligraphy, contemporary arts, sculptural crafts' },
  { value: 'Textiles, Handlooms & High Fashion: Silk corridors, Traditional couture, Weaves', label: 'Textiles & Fashion Corridors', hint: 'Silk corridors, couture, artisanal luxury weaves' },
  { value: 'Cultural Heritage & Museum Conservation: Archaeology, Archives, Artefacts', label: 'Heritage & Museum Exchange', hint: 'Archaeology, archives, museum artefact loans' },
  { value: 'Gastronomy & Culinary Diplomacy: Spice routes, Heritage cuisine, Coffee diplomacy', label: 'Gastronomy & Culinary Arts', hint: 'Spice routes, heritage gastronomy, coffee diplomacy' },
  { value: 'Publishing, Literature & Translation: Bilateral translation, Poetry, Academic exchange', label: 'Literature & Translation', hint: 'Bilateral translation, poetry, academic pacts' },
  { value: 'Cultural Tourism & Bilateral Festivals: Heritage routes, Festival partnerships', label: 'Cultural Tourism & Festivals', hint: 'Bilateral festival circuits and heritage tours' },
];

export const PARTICIPATION_TRACKS = [
  'Main Stage Symphony / Auditorium Gala',
  'Cultural Pavilion Exhibition Booth',
  'Ministerial & Diplomatic Roundtable',
  'Bilateral Deal Room & Co-Production Pitch',
  'Masterclass / Workshop Session',
  'Accredited Cultural Delegate',
];

export const REPRESENTATION_STATUS = [
  'Official Sovereign / Embassy Delegation',
  'Recognised Cultural / Industry Body',
  'Independent Artist / Creative Enterprise',
];

export const HEARD_FROM = [
  'Diplomatic Mission / Embassy',
  'Bharat Mahotsav Festivals Announcement',
  'Social Media & Digital Channels',
  'Cultural Council / ICCR',
  'Referral / Colleague',
  'Event / Exhibition',
  'Other',
];

export const TERMS_TEXT =
  'I have read and agree to the Participation Guidelines of the Atal Innovation Multilateral Forum (AIMF) under Bharat Mahotsav Festivals LLP and IACCIA Secretariat. I understand that AIMF accreditation is complimentary, subject to scheduling, protocol approvals, stage curation, and Yashobhoomi venue security guidelines.';

export const DECLARATION_AUTHORITY =
  'I confirm that I am authorised to submit this accreditation application on behalf of the artist, cultural troupe, or organization, and that all portfolio materials, credentials, and information provided are authentic, true and complete.';

export const DECLARATION_DATA =
  'I consent to Bharat Mahotsav Festivals LLP and IACCIA Secretariat using the details provided for accreditation, stage curation, protocol clearance, and delegate communications. I agree to receive official communications via email, telephone, and WhatsApp.';

export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^[+]?[0-9 -]{10,16}$/,
  pan: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/,
  url: /^https:\/\/\S+\.\S+/,
  descriptionMaxChars: 800,
};
