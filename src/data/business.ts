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
  body: string[];
  reports?: string[];
  title: string;
  description: string;
};

// Service names and meanings come from the owner's own words in business-facts.md.
export const services: Service[] = [
  {
    slug: 'blower-door-testing',
    name: 'New-Home Code Compliance Tests',
    short: 'Blower door tests that new homes need to pass the energy code.',
    body: [
      'Whole-building airtightness testing for new construction, performed with calibrated Retrotec blower door equipment.',
      'Testing follows ANSI/RESNET/ICC 380 and the test procedures of the Washington State Energy Code (WSEC) and IECC.',
    ],
    reports: ['CFM50', 'ACH50', 'Written report or code form'],
    title: "Blower Door Test Spokane & Coeur d'Alene | New Homes",
    description:
      'Blower door testing for new homes per ANSI/RESNET/ICC 380 and WSEC/IECC test procedures. CFM50 and ACH50 reported. Call 509-903-8595.',
  },
  {
    slug: 'duct-leakage-testing',
    name: 'Duct Leakage Tests',
    short: 'Measuring how much air leaks from your HVAC system.',
    body: [
      'Duct system leakage testing with calibrated Retrotec equipment, following ANSI/RESNET/ICC 380 and WSEC/IECC test procedures.',
      'Total duct leakage and/or duct leakage to outside are measured and reported, as the job requires.',
    ],
    reports: ['Total duct leakage', 'Duct leakage to outside', 'Written report or code form'],
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
    name: 'Washington C3 Calculations',
    short: 'Showing a home complies with the Washington State Energy Code using the Washington points system.',
    body: [
      'Energy code compliance through the Washington State Energy Code points system.',
      'The deliverable is a WSEC R406 energy credit worksheet.',
    ],
    reports: ['WSEC R406 energy credit worksheet'],
    title: 'Washington Energy Code Compliance | C3 Calculations',
    description:
      'Washington C3 calculations: WSEC compliance through the points system, delivered as a WSEC R406 energy credit worksheet. Call 509-903-8595.',
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
