// Single source of truth for site-wide SEO + organization identity.
// Legal-identity values are dummy placeholders sourced from env and are
// replaced with authentic data before production launch (EP4/EP5 content gate).

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gstnoticesupport.in';

export const SITE_NAME = 'GST Notice Support';

export const SITE_DESCRIPTION =
  'Professional GST litigation services for businesses, CAs, and Advocates. Expert help with GST notices, scrutiny, show-cause replies, and appeals — fixed fee, drafts within 48 hours, pan-India.';

export const ORG = {
  legalName: process.env.ORG_LEGAL_NAME ?? 'GST Notice Support Pvt. Ltd.',
  phone: process.env.ORG_PHONE ?? '+919343297622',
  email: process.env.ORG_EMAIL ?? 'support@gstnoticesupport.in',
  grievanceOfficer: process.env.ORG_GRIEVANCE_OFFICER ?? 'Customer Support',
  // GSTIN has no dummy fallback — absent (not a placeholder) until the
  // company's real GSTIN is set (decisions.md D39/D10x). The auth trust strip
  // renders this row only when the value is present.
  gstin: process.env.ORG_GSTIN || undefined,
  address: {
    street: process.env.ORG_ADDRESS_STREET ?? 'Dashmesh Dear, The brain train academy, opp. Gurudwara, Premnagar, Madan Mahal',
    locality: process.env.ORG_ADDRESS_LOCALITY ?? 'Jabalpur',
    region: process.env.ORG_ADDRESS_REGION ?? 'Madhya Pradesh',
    postalCode: process.env.ORG_ADDRESS_POSTAL ?? '482001',
    country: process.env.ORG_ADDRESS_COUNTRY ?? 'IN',
  },
} as const;
