/*
  Bharat Connect Start-up Showcase registration.
  Mirrors the Google Form "Bharat Connect Start-up Showcase: Registration Form"
  (Bharat Mahotsav Festivals LLP). Entry IDs map each field to that form, so a submission
  from this portal lands in the same response sheet.
*/

export const GOOGLE_FORM = {
  id: '1FAIpQLSdc74jPm8CHef2DHrqSUnvT1J5AR5NUX6n5eb6k5gya5nfkWw',
  viewUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdc74jPm8CHef2DHrqSUnvT1J5AR5NUX6n5eb6k5gya5nfkWw/viewform',
  responseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdc74jPm8CHef2DHrqSUnvT1J5AR5NUX6n5eb6k5gya5nfkWw/formResponse',
  pageCount: 9,
};

export const TERMS_URL = 'https://drive.google.com/file/d/1-S5W_tZKOOiem1Q2N8q4hY1hAqc_pkab/view?usp=sharing';

export const ORGANISER = {
  name: 'Bharat Mahotsav Festivals LLP',
  email: 'info@bharatconnect.live',
  phone: '+91 92174 00624',
  phoneHref: 'tel:+919217400624',
  website: 'bharatmahotsavfestivals.com',
  websiteHref: 'https://bharatmahotsavfestivals.com',
};

export const EVENT = {
  title: 'Bharat Connect Startup Showcase: Scale your innovation globally at the Bharat Arab Business Conclave',
  byline: 'Bharat Connect x IACCIA, an initiative of Bharat Mahotsav Festivals LLP',
  venue: 'Yashobhoomi, Dwarka, New Delhi',
  dates: '18 and 19 December 2026',
  pavilion: 'Startup Pavilion',
};

export const DOCUMENTS = [
  { title: 'Entity details', text: 'Name and type of registered business entity' },
  { title: 'PAN details', text: 'PAN of the entity or proprietor, as applicable' },
  { title: 'Startup profile', text: 'A brief description of your startup, its offerings and key differentiators' },
  { title: 'Registration fee proof', text: 'Payment receipt or transaction confirmation' },
];

export const FEE = {
  base: 5000,
  total: 5900,
  words: 'Five thousand nine hundred only',
  upiId: '9266368100@ptaxis',
  payee: 'Bharat Mahotsav Festivals LLP',
  // Drop the official QR image from the Google Form at public/startup/payment-qr.png to show it here
  qrSrc: '/startup/payment-qr.png',
  posterSrc: '/startup/showcase-poster.jpg',
};

export const DESIGNATIONS = ['Founder', 'Co-founder', 'CEO', 'Authorised Representative'];

export const ENTITY_TYPES = [
  'Private Limited Company',
  'Limited Liability Partnership (LLP)',
  'One Person Company',
  'Partnership Firm',
  'Sole Proprietorship',
  'Other',
];

// value is sent to the form exactly; label/hint are how the portal shows it
export const SECTORS = [
  { value: 'AgriTech : Agriculture, Animal Husbandry, Food processing', label: 'AgriTech', hint: 'Agriculture, animal husbandry, food processing' },
  { value: 'FinTech: includes InsurTech, financial literacy, digital lending', label: 'FinTech', hint: 'InsurTech, financial literacy, digital lending' },
  { value: 'HealthTech: Health and Wellness, MedTech, diagnostics', label: 'HealthTech', hint: 'Health and wellness, MedTech, diagnostics' },
  { value: 'EdTech: education and skill development', label: 'EdTech', hint: 'Education and skill development' },
  { value: 'Enterprise Tech and SaaS: B2B software, enterprise applications', label: 'Enterprise tech and SaaS', hint: 'B2B software, enterprise applications' },
  { value: 'Deep Tech: AI/ML, IoT, Robotics, Blockchain', label: 'Deep tech', hint: 'AI/ML, IoT, robotics, blockchain' },
  { value: 'Industry 4.0 and Manufacturing: advanced and smart manufacturing', label: 'Industry 4.0 and manufacturing', hint: 'Advanced and smart manufacturing' },
  { value: 'CleanTech and Renewable Energy: energy, environment, sustainability', label: 'CleanTech and renewable energy', hint: 'Energy, environment, sustainability' },
  { value: 'Consumer, Retail and E-commerce', label: 'Consumer, retail and e-commerce' },
  { value: 'Textiles, Fashion and Craft-Tech', label: 'Textiles, fashion and craft-tech' },
  { value: 'Travel, Transport and Logistics', label: 'Travel, transport and logistics' },
  { value: 'Media and Entertainment', label: 'Media and entertainment' },
  { value: 'Space and Defence Tech: Drone Technology, UAVs, aerial logistics, precision agriculture, surveillance and mapping applications', label: 'Space and defence tech', hint: 'Drones, UAVs, aerial logistics, precision agriculture, surveillance and mapping' },
  { value: 'Security, Risk Management and Enterprise Solutions', label: 'Security, risk management and enterprise solutions' },
];

export const STAGES = ['Idea', 'Prototype', 'MVP', 'Early revenue', 'Growth', 'Scale-up'];
export const DPIIT_STATUS = ['Recognised', 'Applied', 'Not applied'];
export const PAYMENT_MODES = ['UPI', 'NEFT', 'RTGS', 'IMPS'];
export const HEARD_FROM = ['Email', 'Social media', 'WhatsApp', 'Referral', 'Event or exhibition', 'Other'];

// Exact checkbox texts the form expects
export const TERMS_TEXT =
  'I have read and agree to the Registration Terms and Conditions of Bharat Mahotsav Festivals LLP. I understand that the Registration Fee of ₹5,000 plus GST is non-refundable except as stated in the Terms, that the Registration is valid for two years or five Events, whichever is earlier, and that participation in each Event is subject to separate Event Terms and an admission fee.';
export const DECLARATION_AUTHORITY =
  'I confirm that I am authorised to submit this registration on behalf of the startup, and that all information and documents provided are true, accurate and complete. I understand that false or misleading information may lead to rejection or cancellation of the registration without refund.';
export const DECLARATION_DATA =
  'I consent to Bharat Mahotsav Festivals LLP using the information in this form for registration, verification, communication and management of events, and sharing it with event partners and investors where necessary for those purposes, in accordance with the Terms and Conditions and applicable Indian law. I agree to receive communications about events by email, telephone and WhatsApp.';

// Google Form entry IDs
export const ENTRY = {
  fullName: 285529429,
  designation: 2029049340,
  commEmail: 72831814,
  phone: 1394580754,
  address: 1198607249,
  entityName: 1423640731,
  brandNames: 585211471,
  entityType: 650318756,
  incorporationDate: 1977139002,
  sectors: 1052998864,
  stage: 684986747,
  website: 1132316284,
  pitch: 2092000582,
  description: 429193702,
  pan: 80066096,
  regNumber: 984101353,
  gstin: 1214002877,
  dpiitStatus: 949075016,
  dpiitNumber: 1186733629,
  dpiitCertificate: 1114010364,
  pitchDeck: 353872193,
  demoVideo: 254113655,
  productImages: 211712819,
  ipHeld: 423374519,
  ipDetails: 2010028686,
  terms: 861828957,
  paymentMode: 1559032650,
  transactionId: 66300184,
  paymentDate: 1550699414,
  amountPaid: 659097638,
  payerName: 69083142,
  invoiceAddress: 121677169,
  declAuthority: 2017414668,
  declData: 242759281,
  heardFrom: 1906013816,
};

export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^[+]?[0-9 -]{10,16}$/,
  pan: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/,
  gstin: /^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z][Zz][0-9A-Za-z]$/,
  url: /^https:\/\/\S+\.\S+/,
  descriptionMaxChars: 800,
  descriptionWords: [50, 100],
};
