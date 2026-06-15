import type { ReactNode } from 'react';
import { CreditCard, Ban, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PageMeta, SectionHead } from './types';

export const pricingMeta: PageMeta = {
  title: 'Pricing | GST Notice Support',
  description: 'Transparent, fixed pricing for GST notice and appeal services. SCN Reply ₹5,999 · Commissioner Appeal ₹9,999 · GSTAT Appeal ₹14,999. No hourly billing, no hidden fees.',
};

export const pricingHero = {
  heading: 'Transparent, Fixed Pricing. No Hourly Billing. No Hidden Fees.',
  sub: 'Every service has a fixed professional fee. You see the price before you book. Final fee is confirmed before any payment is taken.',
} as const;

export type PricingTableCard = {
  noticeTag: string;
  title: string;
  priceDisplay: string;
  priceSub: string;
  features: string[];
  predepositNote?: {
    ariaLabel: string;
    body: ReactNode;
  };
  ctaLabel: string;
  href: string;
  popular?: boolean;
  popularBadge?: string;
  popularAriaLabel?: string;
};

export const pricingTable: SectionHead & { cards: PricingTableCard[] } = {
  eyebrow: 'Services & fees',
  heading: 'All Services, All Prices',
  sub: 'Professional fees are fixed. What you see is what you pay.',
  cards: [
    {
      noticeTag: 'Section 61 CGST Act scrutiny',
      title: 'ASMT-10 Reply',
      priceDisplay: '₹2,999',
      priceSub: 'One-time professional fee',
      features: [
        'Expert review of your documents',
        'Structured reply draft',
        'One revision round',
        'Portal filing support',
        'Draft within 48 hours',
      ],
      ctaLabel: 'Book ASMT-10 Reply',
      href: '/services/asmt-10',
    },
    {
      noticeTag: 'DRC-01 / DRC-01A demand notice',
      title: 'SCN Reply',
      priceDisplay: '₹5,999',
      priceSub: 'One-time professional fee',
      features: [
        'Expert review of your documents',
        'Structured reply draft',
        'One revision round',
        'Portal filing support',
        'Draft within 48 hours',
      ],
      ctaLabel: 'Book SCN Reply',
      href: '/services/scn-reply',
    },
    {
      noticeTag: 'APL-01 first appeal',
      title: 'Commissioner Appeal',
      priceDisplay: '₹9,999',
      priceSub: 'One-time professional fee',
      features: [
        'Expert review of your documents',
        'Complete appeal bundle draft',
        'One revision round',
        'Portal filing support',
        'Draft within 48 hours',
      ],
      predepositNote: {
        ariaLabel: 'Government pre-deposit note',
        body: (
          <p><strong>Govt. pre-deposit:</strong> 10% of disputed tax — paid by you to GST portal. Not our fee.</p>
        ),
      },
      ctaLabel: 'Book Commissioner Appeal',
      href: '/services/commissioner-appeal',
    },
    {
      noticeTag: 'APL-05 second appeal',
      title: 'GSTAT Appeal',
      priceDisplay: '₹14,999',
      priceSub: 'One-time professional fee',
      features: [
        'Expert review of your documents',
        'Complete APL-05 bundle draft',
        'One revision round',
        'Portal filing support',
        'Draft within 72 hours',
      ],
      predepositNote: {
        ariaLabel: 'Government pre-deposit note',
        body: (
          <p><strong>Govt. pre-deposit:</strong> 20% of disputed tax — paid by you to GST portal. Not our fee.</p>
        ),
      },
      ctaLabel: 'Book GSTAT Appeal',
      href: '/services/gstat-appeal',
    },
    {
      noticeTag: 'Personal hearing · appearance',
      title: 'Representation Before Authority',
      priceDisplay: 'Custom',
      priceSub: 'Consultation-based · offline',
      features: [
        'Personal hearing appearance',
        'Oral submissions before authority',
        'Written synopsis where required',
        'Post-hearing outcome guidance',
        'Fee confirmed to your case',
      ],
      ctaLabel: 'View Service Details',
      href: '/services/representation-before-authority',
    },
  ],
};

export const pricingRepresentation = {
  tag: 'Consultation-based · offline service',
  heading: 'Representation Before Authority',
  body: 'Handling where physical or virtual appearance before the GST Officer or Appellate Authority is required. Pricing depends on case complexity, jurisdiction, and hearing schedule. This service is discussed and confirmed offline before any engagement.',
  ctaLabel: 'Request a Callback for Representation',
  detailsLabel: 'View Service Details',
  detailsHref: '/services/representation-before-authority',
} as const;

export type PaymentPolicyItem = {
  Icon: LucideIcon;
  title: string;
  body: string;
  refund?: boolean;
};

export const pricingPaymentPolicy: SectionHead & { items: PaymentPolicyItem[] } = {
  eyebrow: 'How payment works',
  heading: 'Payment Policy',
  items: [
    {
      Icon: CreditCard,
      title: 'Full Payment Upfront',
      body: 'Payment is taken before draft delivery. You review a partial preview before full payment — so you know work has begun before committing.',
    },
    {
      Icon: Ban,
      title: 'No EMI, No Partial Payment',
      body: 'Services are priced as fixed units. We do not split payments or offer instalment plans. The fee you see is the fee you pay, once.',
    },
    {
      Icon: AlertTriangle,
      title: 'No Refund Policy',
      body: 'Once draft preparation begins, payment is non-refundable. We are transparent about this before you pay — not in fine print after. Our Refund Policy is linked in the footer.',
      refund: true,
    },
  ],
};

export const pricingFaqHead: SectionHead = {
  eyebrow: 'Common questions',
  heading: 'Questions About Pricing',
};

export const pricingCta = {
  heading: 'Ready to Get Started?',
  sub: 'Upload your notice now, or speak to an expert first.',
  uploadLabel: 'Upload Your Notice',
  uploadHref: '/contact',
  callbackLabel: 'Request a Callback',
} as const;
