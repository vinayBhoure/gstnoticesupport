import Link from 'next/link';
import {
  FileSearch, FileWarning, Gavel, Landmark, UserCheck, ClipboardList,
  MessageSquare, ShieldCheck, MapPin, Tag, Lock, Scale,
} from 'lucide-react';
import { WHATSAPP_LINKS } from './common';
import type {
  CaseOutcome, NoticeCard, PricingTier, ProcessStep, SectionHead,
  SecurityPillar, StatItem, TrustCard,
} from './types';

export const homeMeta = {
  titleAbsolute: 'GST Notice Support | Get Expert Legal Support in 24 Hours',
  description:
    'Received a GST notice? ICAI-registered CAs and Bar Council-enrolled Advocates prepare your reply, appeal, or representation — fixed fee, draft within 48 hours, pan-India.',
} as const;

export const homeHero = {
  badge: 'Trusted GST Litigation Experts · Pan-India',
  heading: 'GST Notice? Get Expert Legal Support in 24 Hours.',
  // headingLead + headingPhrases drive the animated hero <h1> (RotatingHeadline).
  // phrases[0] is the SSR/first-paint default, so the static h1 still reads
  // "GST Notice? Get Expert Legal Support in 24 Hours." — matching the SEO title.
  headingLead: 'GST Notice? Get Expert Legal Support',
  headingPhrases: [
    'in 24 Hours.',
    'for ASMT 10 Reply.',
    'for SCN Reply.',
    'for GSTAT Appeal.',
    'for Representation Before Authority.',
    'for Search Cases.',
  ],
  sub: 'Our team is backed with experienced Chartered Accountants (CAs), Company Secretaries (CSs), and Advocates specializes in preparing replies to GST notices, filing appeals, and representing clients before GST authorities across India.',
  bookLabel: 'Book Service',
  whatsappHref: WHATSAPP_LINKS.home,
  callbackLabel: 'Request a Callback',
  reassurance: [
    'Response within 24 hours',
    'Fixed fee, no hidden charges',
    'Pan-India service',
    'Documents encrypted',
  ],
} as const;

export const homeNotices: SectionHead & { getHelpLabel: string; cards: NoticeCard[] } = {
  eyebrow: 'Choose your service',
  heading: 'What Type of Notice Did You Receive?',
  sub: 'Select your notice type to begin. Fixed professional fee shown for each.',
  getHelpLabel: 'Get Help',
  cards: [
    {
      href: '/services/asmt-10',
      Icon: FileSearch,
      title: 'ASMT-10 Scrutiny Reply',
      description: 'Received an ASMT-10 scrutiny notice under GST? We provide expert support for drafting and filing replies, including reconciliation of GSTR-1, GSTR-3B, GSTR-2B, e-way bills, and related records. Our team prepares accurate, well-documented responses to address departmental queries and reduce the risk of further proceedings.',
      priceDisplay: '₹2,999',
      priceNote: 'fixed fee',
    },
    {
      href: '/services/scn-reply',
      Icon: FileWarning,
      title: 'Show Cause Notice Reply',
      description: 'Received a GST Show Cause Notice (SCN)? We assist in reviewing the notice, analyzing allegations, reconciling records, and preparing comprehensive replies backed by legal provisions and supporting documents. Our objective is to effectively address departmental concerns and safeguard your interests during GST proceedings.',
      priceDisplay: '₹5,999',
      priceNote: 'fixed fee',
    },
    {
      href: '/services/commissioner-appeal',
      Icon: Gavel,
      title: 'Commissioner Appeal',
      description: 'Dissatisfied with a GST order? We assist in preparing and filing appeals before the Commissioner (Appeals). Our services include case review, drafting grounds of appeal, preparing statements of facts, legal submissions, and supporting documents to strengthen your case and seek appropriate relief.',
      priceDisplay: '₹9,999',
      priceNote: 'fixed fee',
      badge: 'Pre-deposit required by law',
    },
    {
      href: '/services/gstat-appeal',
      Icon: Landmark,
      title: 'GSTAT Appeal',
      description: 'We provide specialized support for appeals before the Goods and Services Tax Appellate Tribunal (GSTAT). Our services include case evaluation, identification of legal issues, drafting appeal memoranda, preparing written submissions, and compiling evidence to build a strong case against adverse GST orders.',
      priceDisplay: '₹14,999',
      priceNote: 'fixed fee',
      badge: 'Pre-deposit required by law',
    },
    {
      href: '/services/representation-before-authority',
      Icon: UserCheck,
      title: 'Representation Before Authority',
      description: 'Our team of professionals provides dedicated support for personal hearings before GST Authorities and Appellate Authorities. We review your case, prepare submissions, address departmental queries, and present your position with clarity, professionalism, and strategic insight.',
      priceDisplay: 'Request Callback',
      priceNote: 'consultation-based',
    },
  ],
};

export const homeSteps: SectionHead & { items: ProcessStep[] } = {
  eyebrow: 'The process',
  heading: 'From Notice to Resolution in 4 Steps',
  items: [
    {
      title: 'Upload Documents',
      body: 'Share your notice and supporting documents securely through our encrypted portal.',
    },
    {
      title: 'Expert Review & Draft Preparation',
      body: 'Our team of professionals carefully assesses your case and prepares a well-researched response designed to address the notice effectively.',
      sla: 'Draft prepared within 48 hours of document receipt',
    },
    {
      title: 'You Review & Confirm',
      body: 'Review the draft, raise questions, and confirm before anything is filed.',
    },
    {
      title: 'We File on Portal',
      body: 'We submit your response on the GST portal and share the acknowledgement.',
    },
  ],
};

export const homeTrust: SectionHead & { cards: TrustCard[] } = {
  eyebrow: 'Trusted by CAs, Advocates & Businesses',
  heading: 'Why Businesses Trust GSTNoticeSupport',
  sub: 'Institutional expertise, structured process, and full transparency — from the first notice to the final filing.',
  cards: [
    { Icon: UserCheck, title: 'Qualified Professionals', desc: 'Cases handled by experienced professionals with specialized expertise in GST notices, appeals, and regulatory proceedings.' },
    { Icon: ClipboardList, title: 'Structured Review Process', desc: 'Every notice follows a documented review and response workflow — no ad-hoc handling.' },
    { Icon: MessageSquare, title: 'Transparent Communication', desc: 'Clear timelines, case status updates, and defined deliverables at every stage.' },
    { Icon: ShieldCheck, title: 'Secure Document Handling', desc: 'All uploaded documents are encrypted, access-controlled, and never shared with third parties.' },
    { Icon: MapPin, title: 'Pan-India Representation', desc: 'GST litigation and appeal assistance across all jurisdictions throughout India.' },
    { Icon: Tag, title: 'No Hidden Charges', desc: 'Fixed-fee pricing with clearly defined scope. What you see on the pricing page is what you pay.' },
  ],
};

export const homeOutcomes: SectionHead & { stats: StatItem[]; cases: CaseOutcome[] } = {
  eyebrow: 'Track record',
  heading: 'Results That Speak for Themselves',
  stats: [
    { value: 500, suffix: '+', label: 'Notices Handled' },
    { value: 98, suffix: '%', label: 'Success Ratio' },
    { value: 48, suffix: 'hrs', label: 'Average Draft Time' },
    { value: 100, suffix: '%', label: 'Cases Acknowledged Within 24 Hours' },
  ],
  cases: [
    { caseType: 'SCN Reply', issue: '₹8.4L ITC demand under DRC-01 for alleged ineligible credit.', outcome: 'Reply accepted, no penalty levied.' },
    { caseType: 'ASMT-10 Scrutiny', issue: 'GSTR-3B vs 2A mismatch flagged for FY 2021-22.', outcome: 'Discrepancy explained; proceedings dropped.' },
    { caseType: 'Commissioner Appeal', issue: '₹15.2L demand confirmed by adjudicating authority.', outcome: 'Demand reduced by 70% on appeal.' },
  ],
};

export const homeSecurity: SectionHead & { pillars: SecurityPillar[] } = {
  eyebrow: 'Security & transparency',
  heading: 'Your Documents Are Safe With Us',
  pillars: [
    { Icon: Lock, title: 'Encrypted Storage', desc: 'Every document is encrypted in transit and at rest. Your files are confidential and never shared with third parties.' },
    { Icon: Scale, title: 'Experienced Professionals', desc: 'Every matter is handled by seasoned professionals with extensive experience in GST proceedings, delivering informed guidance and meticulous case preparation.' },
    { Icon: ClipboardList, title: 'Full Transparency', desc: 'Fixed professional fee quoted upfront. No hidden charges, no surprise add-ons after you\'ve signed up.' },
  ],
};

export const homePricing: SectionHead & { ctaLabel: string; tiers: PricingTier[] } = {
  eyebrow: 'Pricing',
  heading: 'Transparent, Fixed Fees. No Surprises.',
  ctaLabel: 'Book This Service',
  tiers: [
    {
      title: 'ASMT-10 Reply',
      priceDisplay: '₹2,999',
      features: ['Section 61 discrepancy analysis', 'Drafted reply to ASMT-10', 'Filing on GST portal', 'Acknowledgement shared'],
      href: '/services/asmt-10',
    },
    {
      title: 'SCN Reply',
      priceDisplay: '₹5,999',
      features: ['DRC-01 / DRC-01A case review', 'Detailed reply with case law', 'Filing on GST portal', 'Acknowledgement shared'],
      href: '/services/scn-reply',
    },
    {
      title: 'Commissioner Appeal',
      priceDisplay: '₹9,999',
      features: ['APL-01 appeal drafting', 'Grounds of appeal & statement', 'Filing before Commissioner (Appeals)', 'Acknowledgement shared'],
      href: '/services/commissioner-appeal',
      predepositBadge: 'Pre-deposit required by law',
    },
    {
      title: 'GSTAT Appeal',
      priceDisplay: '₹14,999',
      features: ['APL-05 tribunal filing', 'Grounds of appeal & statement', 'Filing before Appellate Tribunal', 'Acknowledgement shared'],
      href: '/services/gstat-appeal',
      predepositBadge: 'Pre-deposit required by law',
    },
    {
      title: 'Representation Before Authority',
      priceDisplay: 'Review Based',
      features: ['Personal hearing appearance', 'Oral submissions before authority', 'Written synopsis where required', 'Consultation-based pricing'],
      href: '/services/representation-before-authority',
    },
  ],
};

export const homeTestimonialsHead: SectionHead = {
  eyebrow: 'Client voices',
  heading: 'What Our Clients Say',
};

export const homeFaqHead: SectionHead & { moreLabel: string; moreHref: string } = {
  eyebrow: 'Questions',
  heading: 'Frequently Asked Questions',
  moreLabel: 'View More FAQs',
  moreHref: '/faq',
};

export const homeDisclaimer = {
  label: 'Disclaimer',
  body: (
    <>
      The information provided on this website is for general guidance only and does not constitute legal advice.
      Outcomes in GST litigation depend on case-specific facts, the applicable law, and decisions made by the
      relevant tax authority — they cannot be predicted or guaranteed. Timelines mentioned are indicative and may
      vary based on case complexity and departmental processing times. The scope of services provided is defined
      by the selected service plan. For complete details, please refer to our{' '}
      <Link href="/terms">Disclaimer</Link>,{' '}
      <Link href="/terms">Terms &amp; Conditions</Link>, and{' '}
      <Link href="/privacy">Privacy Policy</Link>.
    </>
  ),
} as const;

export const homeFinalCta = {
  heading: 'Don\'t Let a GST Notice Become a Bigger Problem',
  sub: 'Get expert legal support within 24 hours.',
  bookLabel: 'Book Service',
  whatsappHref: WHATSAPP_LINKS.home,
  callbackLabel: 'Request a Callback',
} as const;
