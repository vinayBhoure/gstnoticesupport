import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type PageMeta = {
  title: string;
  description: string;
};

export type ServiceSchemaInput = {
  name: string;
  description: string;
  // Optional: consultation-based services (e.g. Representation Before Authority)
  // have no fixed price, so no Schema.org Offer is emitted for them.
  price?: number;
  path: string;
};

export type SectionHead = {
  eyebrow: string;
  heading: string;
  sub?: string;
};

export type NavItem = {
  href: string;
  label: string;
};

export type NavServiceItem = {
  href: string;
  title: string;
  description: string;
};

export type FooterColumn = {
  heading: string;
  links: NavItem[];
};

export type NoticeCard = {
  href: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  priceDisplay: string;
  priceNote: string;
  badge?: string;
};

export type ProcessStep = {
  title: string;
  body: string;
  sla?: string;
};

export type TrustCard = {
  Icon: LucideIcon;
  title: string;
  desc: string;
};

export type StatItem = {
  prefix?: string;
  value: number;
  suffix: string;
  label: string;
};

export type CaseOutcome = {
  caseType: string;
  issue: string;
  outcome: string;
};

export type SecurityPillar = {
  Icon: LucideIcon;
  title: string;
  desc: string;
};

export type PricingTier = {
  title: string;
  priceDisplay: string;
  features: string[];
  href: string;
  popular?: boolean;
  popularBadge?: string;
  predepositBadge?: string;
};

export type HomeFaqItem = {
  q: string;
  a: ReactNode;
};

export type FaqItem = {
  id: string;
  question: string;
  searchText: string;
  answerJsx: ReactNode;
};

export type FaqGroup = {
  id: string;
  heading: string;
  items: FaqItem[];
};

export type PricingFaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

export type TestimonialTabId = 'ca' | 'adv' | 'biz';

export type TestimonialTab = {
  id: TestimonialTabId;
  label: string;
};

export type TestimonialItem = {
  quote: string;
  name: string;
  meta: string;
};

export type DeliverableCard = {
  Icon: LucideIcon;
  title: string;
  description: string;
};

export type DocChecklistItem = {
  name: string;
  format: string;
};

export type RelatedServiceCard = {
  href: string;
  stageLabel: string;
  title: string;
  description: string;
  priceDisplay: string;
  ariaLabel?: string;
};

export type ServicePageContent = {
  meta: PageMeta;
  schema: ServiceSchemaInput;
  breadcrumbLabel: string;
  hero: {
    refLine: string;
    heading: string;
    sub: string;
    bookLabel: string;
    whatsappHref: string;
    callbackLabel: string;
  };
  deadlineAlert?: {
    label: string;
    body: ReactNode;
  };
  predepositInfo?: {
    label: string;
    body: ReactNode;
  };
  whatIs: SectionHead & {
    paragraphs: ReactNode[];
    callout: {
      ariaLabel: string;
      label: string;
      refRow: string;
      paragraphs: ReactNode[];
    };
  };
  deliverables: SectionHead & {
    cards: DeliverableCard[];
  };
  documents: SectionHead & {
    items: DocChecklistItem[];
    note?: ReactNode;
    reassure: string;
  };
  steps: SectionHead & {
    items: ProcessStep[];
  };
  pricing: {
    heading: string;
    lede: string;
    amount: string;
    amountMeta: string;
    includedLabel: string;
    included: string[];
    predeposit?: {
      label: string;
      body: string;
    };
    ctaLabel: string;
    whatsappHref: string;
    payNote: string;
  };
  related?: SectionHead & {
    cards: RelatedServiceCard[];
  };
};
