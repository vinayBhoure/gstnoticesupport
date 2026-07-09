import { WHATSAPP_LINKS } from './common';
import type { PageMeta } from './types';

export const contactMeta: PageMeta = {
  title: 'Contact Us | GST Notice Support',
  description: 'Reach the GST Notice Support team by phone, WhatsApp, or email. We respond to every enquiry within 24 hours. Mon–Sat, 9 AM–7 PM IST.',
};

export const contactHero = {
  heading: 'Get in Touch',
  sub: 'Have a GST notice or a question about our services? Reach us by email or WhatsApp. We respond within 24 hours on working days.',
} as const;

export const contactContent = {
  formCardHeading: 'Send Us a Message',
  detailsHeading: 'Other Ways to Reach Us',
  whatsapp: {
    label: 'WhatsApp',
    ctaLabel: 'Chat on WhatsApp',
    href: WHATSAPP_LINKS.generalQuery,
    ariaLabel: 'Chat on WhatsApp — opens WhatsApp',
  },
  email: {
    label: 'Email',
    hours: 'We respond within 24 hours on working days',
  },
  address: {
    label: 'Office Address',
    country: 'India',
    note: 'Services delivered remotely — no in-person visit required',
  },
  hours: {
    label: 'Office Hours',
    days: 'Monday – Saturday',
    detail: '9 AM – 7 PM IST · Closed on Sundays & national holidays',
  },
  grievance: {
    label: 'Grievance:',
    text: 'For escalations and unresolved complaints, email us at',
  },
  callback: {
    title: 'Prefer a callback?',
    sub: 'Leave your number and a convenient time — we will call you.',
    ctaLabel: 'Request a Callback',
  },
} as const;
