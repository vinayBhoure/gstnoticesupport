import { Receipt, BadgeCheck, MapPin, Clock } from 'lucide-react';
import { ORG } from '@/lib/site';
import { WHATSAPP_LINKS } from './common';
import type { PageMeta, SectionHead, TrustCard } from './types';

export const aboutMeta: PageMeta = {
  title: 'About Us | GST Notice Support',
  description: 'GST Notice Support Pvt. Ltd. — ICAI-registered Chartered Accountants and Bar Council-enrolled Advocates handling GST notices, replies, and appeals across India. Fixed fees, 48-hour drafts, full transparency.',
};

export const aboutHero = {
  heading: 'India\'s GST Litigation Experts — Backed by Real Credentials',
  sub: 'We are a team of ICAI-registered Chartered Accountants and Bar Council-enrolled Advocates specialising in GST litigation, notice handling, and appellate representation across India.',
  bookLabel: 'Book Service',
  whatsappHref: WHATSAPP_LINKS.about,
  callbackLabel: 'Request Callback',
} as const;

export const aboutMission: SectionHead & {
  mission: { label: string; heading: string; body: string };
  vision: { label: string; heading: string; body: string };
} = {
  eyebrow: 'Who we are',
  heading: 'Mission & Vision',
  mission: {
    label: 'Our Mission',
    heading: 'Reliable GST Litigation Support',
    body: 'To provide businesses with reliable, professional, and strategic GST litigation support while minimising tax risks and ensuring full compliance.',
  },
  vision: {
    label: 'Our Vision',
    heading: 'India\'s Most Trusted GST Platform',
    body: 'To become India\'s most trusted GST litigation and tax advisory platform by delivering excellence, integrity, and value-driven professional services.',
  },
};

export const aboutCompany: SectionHead & {
  paragraphs: string[];
  asideAriaLabel: string;
  refLabels: { address: string; grievance: string };
} = {
  eyebrow: 'Legal identity',
  heading: 'Company Details',
  paragraphs: [
    'GST Notice Support Pvt. Ltd. is a professionally managed company established with the singular focus of helping Indian businesses navigate the increasingly complex GST litigation landscape. We operate nationally, serving CAs, Advocates, and SME owners who need expert help responding to tax notices and filing appeals.',
    `Our registered office is in ${ORG.address.locality}, ${ORG.address.region}. All professional services are delivered by ICAI-registered Chartered Accountants and Bar Council-enrolled Advocates. We do not engage generalist legal or tax advisors for client work.`,
  ],
  asideAriaLabel: 'Company legal reference',
  refLabels: {
    address: 'Registered Address',
    grievance: 'Grievance Contact',
  },
};

export const aboutWhy: SectionHead & { items: TrustCard[] } = {
  eyebrow: 'Our difference',
  heading: 'Why Clients Trust Us',
  items: [
    {
      Icon: Receipt,
      title: 'Fixed, Transparent Fees',
      desc: 'Every service carries a published fixed fee. No hourly billing, no retainer, no hidden charges. You see the price before you book.',
    },
    {
      Icon: BadgeCheck,
      title: 'ICAI & Bar Council Registered',
      desc: 'Work is handled exclusively by ICAI-registered CAs and Bar Council-enrolled Advocates — not paralegals or document generalists.',
    },
    {
      Icon: MapPin,
      title: 'Pan-India Service',
      desc: 'We serve clients across all Indian states and union territories. GST portal filings are done remotely — no in-person visit required.',
    },
    {
      Icon: Clock,
      title: '48-Hour Draft Turnaround',
      desc: 'Most service drafts are prepared within 48 hours of complete document receipt. GSTAT appeals allow 72 hours given higher complexity.',
    },
  ],
};

export const aboutCta = {
  heading: 'Have a GST Notice? Let\'s Handle It.',
  sub: 'Expert filing and appeal support — fixed fee, no surprises.',
  bookLabel: 'Book Service',
  whatsappHref: WHATSAPP_LINKS.about,
  callbackLabel: 'Request a Callback',
} as const;
