// Single source of truth for site-wide SEO + organization identity.
// Legal-identity values are dummy placeholders sourced from env and are
// replaced with authentic data before production launch (EP4/EP5 content gate).

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gstnoticesupport.in';

export const SITE_NAME = 'GST Notice Support';

export const SITE_DESCRIPTION =
  'Professional GST litigation services for businesses, CAs, and Advocates. Expert help with GST notices, scrutiny, show-cause replies, and appeals — fixed fee, drafts within 48 hours, pan-India.';

export const ORG = {
  legalName: process.env.ORG_LEGAL_NAME ?? 'GST Notice Support Pvt. Ltd.',
  cin: process.env.ORG_CIN ?? 'U74999KA2024PTC000000',
  gstin: process.env.ORG_GSTIN ?? '29ABCDE1234F1Z5',
  phone: process.env.ORG_PHONE ?? '+919343297622',
  email: process.env.ORG_EMAIL ?? 'help@gstnoticesupport.in',
  grievanceOfficer: process.env.ORG_GRIEVANCE_OFFICER ?? 'Ananya Rao',
  grievanceEmail: process.env.ORG_GRIEVANCE_EMAIL ?? 'grievance@gstnoticesupport.in',
  address: {
    street: process.env.ORG_ADDRESS_STREET ?? '4th Floor, Prestige Centre, MG Road',
    locality: process.env.ORG_ADDRESS_LOCALITY ?? 'Bengaluru',
    region: process.env.ORG_ADDRESS_REGION ?? 'Karnataka',
    postalCode: process.env.ORG_ADDRESS_POSTAL ?? '560001',
    country: process.env.ORG_ADDRESS_COUNTRY ?? 'IN',
  },
} as const;
