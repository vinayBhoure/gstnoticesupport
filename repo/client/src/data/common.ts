// Shared content used across multiple pages. Org identity (legal name,
// address, email, phone) stays in @/lib/site.ts — import ORG from there.
import { ORG } from '@/lib/site';
import type { FooterColumn, NavItem, NavServiceItem } from './types';

// Strip leading '+' for wa.me URL format (ORG.phone is stored as +91XXXXXXXXXX).
const WA_PHONE = ORG.phone.replace('+', '');

// Pre-filled WhatsApp deep links. The message text is part of the URL —
// keep it URL-encoded exactly as it should appear in the chat box.
export const WHATSAPP_LINKS = {
  generalQuery: `https://wa.me/${WA_PHONE}?text=Hello%2C%20I%20have%20a%20query%20about%20a%20GST%20notice.`,
  asmt10:
    `https://wa.me/${WA_PHONE}?text=Hi%2C%20I%20am%20interested%20in%20ASMT-10%20Scrutiny%20Reply%20service.%20Please%20assist%20me%20to%20proceed%20further.`,
  scnReply:
    `https://wa.me/${WA_PHONE}?text=Hi%2C%20I%20am%20interested%20in%20Show%20Cause%20Notice%20Reply%20service.%20Please%20assist%20me%20to%20proceed%20further.`,
  commissionerAppeal:
    `https://wa.me/${WA_PHONE}?text=Hi%2C%20I%20am%20interested%20in%20Commissioner%20Appeal%20service.%20Please%20assist%20me%20to%20proceed%20further.`,
  gstatAppeal:
    `https://wa.me/${WA_PHONE}?text=Hi%2C%20I%20am%20interested%20in%20GSTAT%20Appeal%20service.%20Please%20assist%20me%20to%20proceed%20further.`,
  representation:
    `https://wa.me/${WA_PHONE}?text=Hi%2C%20I%20am%20interested%20in%20Representation%20Before%20Authority%20service.%20Please%20assist%20me%20to%20proceed%20further.`,
};

export const NAV_SERVICE_ITEMS: NavServiceItem[] = [
  { href: '/services/asmt-10', title: 'ASMT-10 Scrutiny Notice', description: 'Section 61 — return discrepancies' },
  { href: '/services/scn-reply', title: 'Show Cause Notice (SCN)', description: 'DRC-01 / DRC-01A demands' },
  { href: '/services/commissioner-appeal', title: 'Commissioner Appeal', description: 'APL-01 first appeal' },
  { href: '/services/gstat-appeal', title: 'GSTAT Appeal', description: 'APL-05 tribunal filing' },
  { href: '/services/representation-before-authority', title: 'Representation Before Authority', description: 'Personal hearing & appearance' },
];

export const NAV_LINKS: NavItem[] = [
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/pricing', label: 'Pricing' },
];

export const NAV_LABELS = {
  servicesDropdown: 'Services',
  contact: { href: '/contact', label: 'Contact Us' },
  login: { href: '/login', label: 'Log In' },
  dashboard: { label: 'Dashboard' },
  logout: 'Log Out',
} as const;

export const FOOTER_COLUMNS: { services: FooterColumn; resources: FooterColumn } = {
  services: {
    heading: 'Services',
    links: [
      { href: '/services/asmt-10', label: 'ASMT-10 Scrutiny Notice' },
      { href: '/services/scn-reply', label: 'Show Cause Notice (SCN)' },
      { href: '/services/commissioner-appeal', label: 'Commissioner Appeal' },
      { href: '/services/gstat-appeal', label: 'GSTAT Appeal' },
      { href: '/services/representation-before-authority', label: 'Representation Before Authority' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  resources: {
    heading: 'Resources',
    links: [
      { href: '/faq', label: 'GST Notice Guides' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
};

export const FOOTER_LABELS = {
  contactHeading: 'Contact',
  grievanceLabel: 'Grievance:',
  whatsappCta: 'Chat on WhatsApp',
  whatsappHref: WHATSAPP_LINKS.generalQuery,
  sslLabel: 'SSL Secured',
  copyright: `© 2026 ${ORG.legalName}. All rights reserved.`,
} as const;

export const FOOTER_POLICIES: NavItem[] = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
  { href: '/refund', label: 'Refund Policy' },
];

export const NOT_FOUND = {
  metaTitle: '404 — Page Not Found | GST Notice Support',
  code: '404',
  heading: 'Page Not Found',
  body: 'The page you are looking for may have been moved or does not exist. Try one of the links below.',
  homeCta: { href: '/', label: 'Go to Homepage' },
  contactCta: { href: '/contact', label: 'Contact Us' },
  servicesPrompt: 'Looking for a specific service?',
  servicesCta: { href: '/pricing', label: 'View all services →' },
} as const;
