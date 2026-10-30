// Every value here must match business-facts.md (approved by the owner).
// Change facts there first, then here.

export const business = {
  name: 'Spokane Blower Doors',
  phone: '509-903-8595',
  phoneHref: 'tel:+15099038595',
  email: 'Gabriel@2ohairsolutions.com',
  url: 'https://spokaneblowerdoors.com',
  hours: 'By appointment',
  serviceArea: 'North Idaho and Eastern Washington',
  ownership: 'Owned and operated from Post Falls, Idaho.',
  customers: ['Home builders', 'Homeowners', 'HVAC contractors', 'Remodelers'],
  customersPhrase: 'home builders, homeowners, HVAC contractors and remodelers',
  pricing: 'Call for a quote',
  equipment: 'Retrotec',
  credential: 'Credentialed through Building Science Institute (BSI).',
  standards: [
    'ANSI/RESNET/ICC 301',
    'ANSI/RESNET/ICC 380',
    'ANSI/RESNET/ICC 310',
    'Washington State Energy Code (WSEC) and IECC test procedures',
  ],
  reporting: [
    'CFM50 and ACH50',
    'Total duct leakage',
    'Duct leakage to outside',
    'Written report or code form',
  ],
};

export type Service = {
  slug: string;
  name: string;
  short: string;
  cardName?: string;
  cardText?: string;
  body: string[];
  expect?: string[];
  reports?: string[];
  title: string;
  description: string;
};

// Service names and meanings come from the owner's own words in business-facts.md.
export const services: Service[] = [
  {
    slug: 'blower-door-testing',
    name: 'Blower Door Testing',
    cardName: 'Code Compliance',
    cardText:
      'Blower door testing verifies that new homes meet energy code airtightness requirements. We use calibrated Retrotec equipment to give builders accurate results they can submit with confidence.',
    short:
      'Blower door testing verifies that a new home meets the airtightness requirements of the energy code. We perform whole-building airtightness testing for new construction using calibrated Retrotec equipment, giving builders accurate, reliable results they can submit with confidence.',
    body: [
      'All testing follows ANSI/RESNET/ICC Standard 380 and the test procedures required by the Washington State Energy Code. During the test, the home is depressurized to a standard pressure while we measure how much air leaks through the building envelope. The result is reported in air changes per hour at 50 pascals (ACH50) and compared against the code’s maximum allowable leakage.',
    ],
    expect: [
      'Code-compliant documentation: a signed test report ready to submit to your building department.',
      'Calibrated equipment: Retrotec fans and gauges maintained to manufacturer calibration standards for accurate, repeatable results.',
      'Leak diagnosis: if a home doesn’t pass, we help identify where air is escaping so you can make targeted repairs before a retest.',
      'Scheduling that fits your build: testing coordinated with your timeline.',
    ],
    reports: ['CFM50', 'ACH50', 'Written report or code form'],
    title: "Blower Door Test Spokane & Coeur d'Alene | New Homes",
    description:
      'Blower door testing for new homes per ANSI/RESNET/ICC 380 and WSEC/IECC test procedures. CFM50 and ACH50 reported. Call 509-903-8595.',
  },
  {
    slug: 'duct-leakage-testing',
    name: 'Duct Leakage Testing',
    short:
      'Duct leakage testing measures how much air escapes from a home’s HVAC system before it reaches where it’s meant to go. Leaky ductwork wastes energy, reduces comfort, and can keep a home from passing the energy code.',
    body: [
      'We perform duct leakage testing using calibrated Retrotec equipment, following ANSI/RESNET/ICC Standard 380 and the test procedures required by the Washington State Energy Code (WSEC) and the International Energy Conservation Code (IECC).',
      'During the test, the duct system is pressurized to a standard test pressure while we measure the airflow needed to maintain it. Results are reported in cubic feet per minute at 25 pascals (CFM25) and compared against the code’s maximum allowable leakage. Depending on the job’s requirements, we measure total duct leakage, duct leakage to outside, or both.',
    ],
    expect: [
      'Accurate, repeatable results from properly calibrated equipment.',
      'Rough-in or final testing: testing at rough-in lets you find and seal leaks before ducts are covered, when repairs are easiest.',
      'Help when a system doesn’t pass: we help locate problem areas so your HVAC contractor can make targeted repairs before a retest.',
    ],
    reports: [
      'Total duct leakage: all air leaking from the duct system, whether into conditioned space or outside it.',
      'Duct leakage to outside: air lost to unconditioned areas such as attics, crawlspaces, and garages.',
      'Written report or code form: documentation ready to submit to your building department.',
    ],
    title: 'Duct Leakage Test Spokane | Spokane Blower Doors',
    description:
      'Duct leakage testing per ANSI/RESNET/ICC 380 and WSEC/IECC test procedures. North Idaho and Eastern Washington. Call 509-903-8595.',
  },
  {
    slug: 'eri-scores',
    name: 'ERI Scores',
    short: 'Energy Rating Index (ERI) scores, including HERS Index scores, calculated under ANSI/RESNET/ICC 301.',
    body: [
      'ERI scores are used for energy code compliance through the ERI path (Washington State Energy Code in Washington; IECC in Idaho), for HERS Index scores, for builder marketing, and for utility and tax incentive programs that require an ERI or HERS Index score.',
      'Credentialed through Building Science Institute (BSI).',
    ],
    reports: ['ERI / HERS Index score'],
    title: 'HERS Rating & ERI Scores Spokane | Spokane Blower Doors',
    description:
      "HERS rating and ERI scores under ANSI/RESNET/ICC 301 for WSEC/IECC compliance and incentives. 509-903-8595.",
  },
  {
    slug: 'washington-energy-code-compliance',
    name: 'WSEC Energy Credits',
    cardText:
      'Washington homes must earn a minimum number of energy credits, based on home size, through upgrades like higher R-Value insulation, high-efficiency HVAC, and Photovoltaic systems',
    short:
      'Washington homes must earn a minimum number of energy credits to comply with the Washington State Energy Code. The number required depends on the size of the home, and credits are earned through efficiency choices such as envelope improvements, high-efficiency HVAC and water heating, reduced air leakage, and renewable energy.',
    body: [
      'We review your plans and specifications, identify the credit options that fit your build, and document compliance on the WSEC R406 energy credit worksheet, ready to submit with your permit application.',
    ],
    reports: ['Completed WSEC R406 energy credit worksheet'],
    title: 'WSEC Energy Credits | Washington C3 Calculations',
    description:
      'WSEC energy credits and Washington C3 calculations, documented on a WSEC R406 energy credit worksheet for your permit application. 509-903-8595.',
  },
  {
    slug: 'home-energy-audits',
    name: 'Home Energy Audits',
    short: 'For homeowners: finding drafts and air leakage.',
    body: [
      'Diagnostic testing for existing homes to locate drafts and air leakage, using calibrated Retrotec equipment, thermal imaging and smoke guns.',
    ],
    reports: ['CFM50 and ACH50', 'Written report'],
    title: 'Home Energy Audit Spokane | Spokane Blower Doors',
    description:
      'Home energy audits in North Idaho and Eastern Washington. Diagnostic testing to locate air leakage. Call 509-903-8595.',
  },
  {
    slug: 'energy-efficiency-consultation',
    name: 'Energy Efficiency Consultation',
    short: 'Comprehensive energy consultation from framing to final.',
    body: ['Comprehensive energy consultation from framing to final.'],
    title: 'Energy Efficiency Consultation | Spokane Blower Doors',
    description:
      'Comprehensive energy consultation from framing to final. North Idaho and Eastern Washington. Call 509-903-8595.',
  },
];
