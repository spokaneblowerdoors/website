// Every value here must match business-facts.md (approved by the owner).
// Change facts there first, then here.

export const business = {
  name: 'Spokane Blower Doors',
  owner: 'Gabe Bell',
  phone: '509-903-8595',
  phoneHref: 'tel:+15099038595',
  email: 'Gabriel@2ohairsolutions.com',
  url: 'https://spokaneblowerdoors.com',
  hours: 'By appointment',
  serviceArea: 'Eastern Washington and North Idaho',
  towns: ['Spokane', 'Spokane Valley', "Coeur d'Alene", 'Post Falls'],
  customers: ['Home builders', 'Homeowners', 'HVAC contractors', 'Remodelers'],
  customersPhrase: 'home builders, homeowners, HVAC contractors and remodelers',
  pricing: 'Call for a quote',
};

export type Service = {
  slug: string;
  name: string;
  short: string;
  title: string;
  description: string;
};

// Service names and meanings come from the owner's own words in business-facts.md.
export const services: Service[] = [
  {
    slug: 'blower-door-testing',
    name: 'New-Home Code Tests',
    short: 'Blower door tests that new homes need to pass the energy code.',
    title: 'Blower Door Test Spokane | New-Home Code Testing',
    description:
      'Blower door testing for new homes in Spokane, Spokane Valley, Coeur d\'Alene and Post Falls. Call Spokane Blower Doors for a quote: 509-903-8595.',
  },
  {
    slug: 'duct-leakage-testing',
    name: 'Duct Leakage Tests',
    short: 'Measuring how much air leaks from heating and cooling ducts.',
    title: 'Duct Leakage Test Spokane | Spokane Blower Doors',
    description:
      'Duct leakage testing for builders, HVAC contractors and homeowners in Eastern Washington and North Idaho. Call 509-903-8595 for a quote.',
  },
  {
    slug: 'washington-energy-code-compliance',
    name: 'Washington C3 Calculations',
    short: 'Showing a home complies with the Washington State Energy Code using the Washington points system.',
    title: 'Washington Energy Code Compliance | C3 Calculations',
    description:
      'Washington C3 calculations: showing a home complies with the Washington State Energy Code using the points system. Call 509-903-8595.',
  },
  {
    slug: 'energy-star-testing',
    name: 'Energy Star Tests',
    short: 'Testing for homes going through Energy Star.',
    title: 'Energy Star Home Testing | Spokane Blower Doors',
    description:
      'Energy Star home testing in Spokane, Spokane Valley, Coeur d\'Alene and Post Falls. Call Spokane Blower Doors at 509-903-8595 for a quote.',
  },
  {
    slug: 'home-energy-audits',
    name: 'Home Energy Audits',
    short: 'For homeowners: finding drafts and air leaks.',
    title: 'Home Energy Audit Spokane | Spokane Blower Doors',
    description:
      'Home energy audits in Spokane, Spokane Valley, Coeur d\'Alene and Post Falls. Call Spokane Blower Doors at 509-903-8595 for a quote.',
  },
];
