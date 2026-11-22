/*
  The Bharat Connect panels: Advisory & Expert, Investor, Startup and Strategic Partners.
  Each has its own page (#advisory, #investor, #startup-panel, #partners) and its own reference IDs
  (BMF.BC-ADV-, -INV-, -STP-, -SPT-00001), counted in this browser's storage like the other
  registration IDs.
*/

/*
  Panel members. Each seat has a title, a description of the role and its focus areas.
  When a member is confirmed, replace ...VACANT with their details, for example:
    name: 'Full Name',
    position: 'Their job title',
    organisation: 'Their organisation',
    country: 'India',
    bio: 'Two or three sentences about them.',
    photo: 'panels/advisory/chair.jpg',   // file placed in public/panels/advisory/
*/
const VACANT = { name: null, position: null, organisation: null, country: null, bio: null, photo: null, logo: null };

export const PANELS = [
  {
    id: 'advisory',
    label: 'Advisory & Expert Panel',
    short: 'Advisory & Expert',
    code: 'ADV',
    tagline: 'Strategic direction and sector knowledge for the India-Arab agenda',
    intro:
      'Policymakers, diplomats, industry leaders and sector specialists who shape the conclave agenda, moderate its roundtables and carry its outcomes into government and chamber dialogue.',
    mandateIcons: ['Compass', 'Mic', 'BadgeCheck', 'Handshake'],
    mandate: [
      'Set the strategic themes and ministerial plenary agenda',
      'Moderate sector roundtables and brief delegations',
      'Review partnership proposals and author the sector papers',
      'Carry conclave outcomes into CEPA, IMEC and chamber-level dialogue',
    ],
    seats: [
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Sameer Modi',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Amit Dubey',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Vijay Goel',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Vijay Mehta',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Ramesh Arora',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Vikram Shankr',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Hemawik Sharma',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Rima Sen',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Puran Jaeswani',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Richard Thompson',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Amey',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Astik Tripathi',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Manish Sharma',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Advisory & Expert Panel, shaping the conclave agenda and its sector roundtables.',
        focus: [],
        ...VACANT,
        name: 'Neeraj Agarwal',
      },
    ],
    applyTitle: 'Nominate an advisor or expert',
    applyNote: 'Nominations are reviewed by the Secretariat. Shortlisted nominees are contacted directly.',
    roleOptions: ['Government / Policy', 'Diplomatic', 'Chamber / Trade body', 'Industry leader', 'Sector expert', 'Other'],
  },
  {
    id: 'investor',
    label: 'Investor Panel',
    short: 'Investor',
    code: 'INV',
    tagline: 'Capital partners for startups and bilateral ventures',
    intro:
      'Sovereign funds, family offices, venture capital and private equity investors who meet Startup Showcase founders, sit on pitch juries and back cross-border ventures.',
    mandateIcons: ['Award', 'Handshake', 'Users', 'Radar'],
    mandate: [
      'Judge the Startup Showcase pitch sessions',
      'Take part in investor roundtables and B2B deal rooms',
      'Meet pre-screened founders through structured matchmaking',
      'Signal sectors and stages they are actively investing in',
    ],
    // confirmed investors: logo files live in public/panels/investor/
    seats: [
      {
        title: 'Investor',
        role: 'Investor on the Bharat Connect 2026 Investor Panel, meeting founders and backing cross-border ventures.',
        focus: [],
        ...VACANT,
        name: 'Sukook',
        logo: null,
      },
      {
        title: 'Investor',
        role: 'Investor on the Bharat Connect 2026 Investor Panel, meeting founders and backing cross-border ventures.',
        focus: [],
        ...VACANT,
        name: 'Ajman Holding',
        logo: 'panels/investor/ajman-holding.png',
      },
      {
        title: 'Investor',
        role: 'Investor on the Bharat Connect 2026 Investor Panel, meeting founders and backing cross-border ventures.',
        focus: [],
        ...VACANT,
        name: 'MEFCOM',
        logo: 'panels/investor/mefcom.jpg',
      },
      {
        title: 'Investor',
        role: 'Investor on the Bharat Connect 2026 Investor Panel, meeting founders and backing cross-border ventures.',
        focus: [],
        ...VACANT,
        name: 'IP Ventures',
        logo: null,
      },
      {
        title: 'Investor',
        role: 'Investor on the Bharat Connect 2026 Investor Panel, meeting founders and backing cross-border ventures.',
        focus: [],
        ...VACANT,
        name: 'Areion Group',
        logo: 'panels/investor/areion.png',
      },
      {
        title: 'Investor',
        role: 'Investor on the Bharat Connect 2026 Investor Panel, meeting founders and backing cross-border ventures.',
        focus: [],
        ...VACANT,
        name: 'United Investment Group LLC',
        logo: 'panels/investor/uig.jpg',
      },
    ],
    applyTitle: 'Join as an investor',
    applyNote: 'Investor seats are confirmed by the Secretariat after a short verification call.',
    roleOptions: ['Sovereign wealth fund', 'Family office', 'Venture capital', 'Private equity', 'Angel investor', 'Corporate venture'],
  },
  {
    id: 'startup-panel',
    label: 'Startup Panel',
    short: 'Startup',
    code: 'STP',
    tagline: 'The founders and ecosystem builders behind the Startup Showcase',
    intro:
      'Founders, incubators and ecosystem leaders from India and the Arab region who shape the Startup Showcase, mentor applicants and speak for the startup community at the conclave.',
    mandateIcons: ['Mic', 'Award', 'Users', 'GraduationCap'],
    mandate: [
      'Speak for the startup community in plenary sessions',
      'Help select and judge the Startup Showcase',
      'Pair founders with investors and corporate partners',
      'Mentor early-stage founders through the conclave',
    ],
    seats: [
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Startup Panel, guiding founders and judging the Startup Showcase.',
        focus: [],
        ...VACANT,
        name: 'Vishal Bahri',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Startup Panel, guiding founders and judging the Startup Showcase.',
        focus: [],
        ...VACANT,
        name: 'Vishal Chatrath',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Startup Panel, guiding founders and judging the Startup Showcase.',
        focus: [],
        ...VACANT,
        name: 'Srishti Mahajan',
      },
      {
        title: 'Panel member',
        role: 'Member of the Bharat Connect 2026 Startup Panel, guiding founders and judging the Startup Showcase.',
        focus: [],
        ...VACANT,
        name: 'Kushkanth Tiwari',
      },
    ],
    applyTitle: 'Join the Startup Panel',
    applyNote: 'Applications are reviewed with the Startup Showcase team.',
    roleOptions: ['Founder', 'Incubator / Accelerator', 'Ecosystem builder', 'Other'],
  },
  {
    id: 'partners',
    label: 'Strategic Partners',
    short: 'Partners',
    code: 'SPT',
    tagline: 'The institutions that make the conclave happen',
    intro:
      'Governments, financial institutions, industry groups and knowledge partners who co-host Bharat Connect 2026 and back its programme, pavilions and deal rooms.',
    mandateIcons: ['Handshake', 'Globe', 'BadgeCheck', 'Briefcase'],
    mandate: [
      'Co-host flagship sessions and country pavilions',
      'Back the B2B and G2B deal rooms',
      'Bring delegations and members to the conclave',
      'Carry partnerships forward after the event',
    ],
    seats: [
      {
        title: 'Strategic Partner',
        role: 'Strategic partner of Bharat Connect 2026, bringing chambers, delegations and industry from India and the Arab world to the conclave.',
        focus: [],
        ...VACANT,
        name: 'IACCIA',
        position: 'India & Arab Countries Chamber of Commerce, Industry & Agriculture',
        logo: 'panels/partners/iaccia.png',
      },
    ],
    applyTitle: 'Become a strategic partner',
    applyNote: 'Partnership enquiries are reviewed by the Directorate of Strategic Partnerships.',
    roleOptions: ['Government', 'Bank / Financial institution', 'Industry body / Corporate', 'Knowledge partner', 'Media', 'Other'],
  },
];

export const PANEL_IDS = PANELS.map((p) => p.id);

export function getPanel(id) {
  return PANELS.find((p) => p.id === id) || PANELS[0];
}
