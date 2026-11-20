/*
  The three Bharat Connect panels: Advisory, Investor and Expert.
  Each has its own page (#advisory, #investor, #expert) and its own reference IDs
  (BMF.BC-ADV-00001, BMF.BC-INV-00001, BMF.BC-EXP-00001), counted in this browser's
  storage like the other registration IDs.
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
const VACANT = { name: null, position: null, organisation: null, country: null, bio: null, photo: null };

export const PANELS = [
  {
    id: 'advisory',
    label: 'Advisory Panel',
    short: 'Advisory',
    code: 'ADV',
    tagline: 'Strategic direction for the India-Arab partnership agenda',
    intro:
      'Senior policymakers, diplomats and industry leaders who shape the conclave agenda, guide its bilateral priorities and carry its outcomes into government and chamber dialogue.',
    mandateIcons: ['Compass', 'Globe', 'BadgeCheck', 'Handshake'],
    mandate: [
      'Set the strategic themes and ministerial plenary agenda',
      'Advise on bilateral priorities across India and the 22 Arab League states',
      'Review partnership proposals and endorse flagship initiatives',
      'Carry conclave outcomes into CEPA, IMEC and chamber-level dialogue',
    ],
    seats: [
      {
        title: "Chair",
        role: "Presides over the Advisory Panel, sets its agenda and speaks for the panel at the opening plenary.",
        focus: ["Agenda", "Plenary", "Outcomes"],
        ...VACANT,
      },
      {
        title: "Co-Chair (Arab region)",
        role: "Co-leads the panel and brings the priorities of the 22 Arab League states into every recommendation.",
        focus: ["Arab League", "GCC", "Bilateral"],
        ...VACANT,
      },
      {
        title: "Government & Policy",
        role: "Aligns the conclave with Indian trade policy, CEPA frameworks and ministry-level initiatives.",
        focus: ["CEPA", "Trade policy", "Ministries"],
        ...VACANT,
      },
      {
        title: "Diplomatic Corps",
        role: "Connects the panel with embassies and missions, and guides protocol for visiting delegations.",
        focus: ["Embassies", "Protocol", "Delegations"],
        ...VACANT,
      },
      {
        title: "Chambers of Commerce",
        role: "Represents chambers and trade bodies, turning panel guidance into member programmes.",
        focus: ["Chambers", "Trade bodies", "SMEs"],
        ...VACANT,
      },
      {
        title: "Industry Leadership",
        role: "Brings the view of large Indian and Arab enterprises to the panel and its flagship initiatives.",
        focus: ["Enterprise", "Investment", "Industry"],
        ...VACANT,
      },
    ],
    applyTitle: 'Nominate an advisor',
    applyNote: 'Nominations are reviewed by the Secretariat. Shortlisted nominees are contacted directly.',
    roleOptions: ['Government / Policy', 'Diplomatic', 'Chamber / Trade body', 'Industry leader', 'Other'],
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
    seats: [
      {
        title: "Sovereign Wealth",
        role: "Represents sovereign and state investment funds backing long-horizon infrastructure and energy ventures.",
        focus: ["Infrastructure", "Energy", "Long horizon"],
        ...VACANT,
      },
      {
        title: "Family Office",
        role: "Brings family-office capital to growth-stage companies and cross-border joint ventures.",
        focus: ["Growth stage", "Joint ventures", "Patient capital"],
        ...VACANT,
      },
      {
        title: "Venture Capital",
        role: "Sits on the Startup Showcase jury and leads early-stage conversations with founders.",
        focus: ["Seed", "Series A", "Pitch jury"],
        ...VACANT,
      },
      {
        title: "Private Equity",
        role: "Looks at mature businesses expanding between India and the Arab region.",
        focus: ["Buyouts", "Expansion", "Mid-market"],
        ...VACANT,
      },
      {
        title: "Angel Network",
        role: "Connects founders with angel investors for first cheques and hands-on mentorship.",
        focus: ["Pre-seed", "Mentorship", "Angels"],
        ...VACANT,
      },
      {
        title: "Corporate Venture",
        role: "Links startups with large corporates for pilots, partnerships and strategic investment.",
        focus: ["Pilots", "Partnerships", "Strategic"],
        ...VACANT,
      },
    ],
    applyTitle: 'Join as an investor',
    applyNote: 'Investor seats are confirmed by the Secretariat after a short verification call.',
    roleOptions: ['Sovereign wealth fund', 'Family office', 'Venture capital', 'Private equity', 'Angel investor', 'Corporate venture'],
  },
  {
    id: 'expert',
    label: 'Expert Panel',
    short: 'Expert',
    code: 'EXP',
    tagline: 'Sector knowledge behind every roundtable',
    intro:
      'Specialists across energy, infrastructure, technology, food security, healthcare and tourism who moderate roundtables, brief delegations and author the conclave sector papers.',
    mandateIcons: ['Mic', 'Briefcase', 'FileText', 'GraduationCap'],
    mandate: [
      'Moderate and speak at sector roundtables',
      'Brief delegations ahead of deal-room meetings',
      'Author and review the conclave sector papers',
      'Mentor Startup Showcase founders in their field',
    ],
    seats: [
      {
        title: "Clean Energy",
        role: "Leads the energy roundtable on green hydrogen, solar grids and desalination.",
        focus: ["Green hydrogen", "Solar", "Desalination"],
        ...VACANT,
      },
      {
        title: "Infrastructure & Smart Cities",
        role: "Guides discussion on the IMEC corridor, ports, logistics and smart-city projects.",
        focus: ["IMEC", "Ports", "Logistics"],
        ...VACANT,
      },
      {
        title: "Technology & AI",
        role: "Moderates the technology track on fintech, digital payments and AI.",
        focus: ["Fintech", "UPI", "AI"],
        ...VACANT,
      },
      {
        title: "Food Security & Agri",
        role: "Covers food reserves, agri-tech and supply chains between India and the Gulf.",
        focus: ["Agri-tech", "Food reserves", "Supply chains"],
        ...VACANT,
      },
      {
        title: "Healthcare & Life Sciences",
        role: "Leads sessions on pharmaceuticals, medical technology and health partnerships.",
        focus: ["Pharma", "MedTech", "Health"],
        ...VACANT,
      },
      {
        title: "Tourism & Culture",
        role: "Shapes the tourism, hospitality and cultural exchange programme.",
        focus: ["MICE", "Heritage", "Hospitality"],
        ...VACANT,
      },
    ],
    applyTitle: 'Apply as an expert',
    applyNote: 'Applications are reviewed against the sector roundtable programme.',
    roleOptions: ['Clean Energy', 'Infrastructure & Smart Cities', 'Technology & AI', 'Food Security & Agri', 'Healthcare & Life Sciences', 'Tourism & Culture'],
  },
];

export const PANEL_IDS = PANELS.map((p) => p.id);

export function getPanel(id) {
  return PANELS.find((p) => p.id === id) || PANELS[0];
}

export function getNextPanelId(code) {
  const prefix = `BMF.BC-${code}-`;
  const key = `bc-panel-${code.toLowerCase()}-counter`;
  try {
    const parsed = parseInt(localStorage.getItem(key) || '0', 10);
    const nextNum = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed + 1;
    localStorage.setItem(key, String(nextNum));
    return `${prefix}${String(nextNum).padStart(5, '0')}`;
  } catch {
    return `${prefix}00001`;
  }
}
