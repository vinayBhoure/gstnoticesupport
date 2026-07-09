import { FileText, BookOpen, Scale, Gavel, Info } from 'lucide-react';
import { WHATSAPP_LINKS } from '../common';
import type { ServicePageContent } from '../types';

export const commissionerAppealContent: ServicePageContent = {
  meta: {
    title: 'Commissioner Appeal (APL-01) Service | GST Notice Support',
    description: 'Commissioner Appeal (APL-01) filing under Section 107 CGST Act, prepared by CAs and Advocates. Fixed professional fee ₹9,999. Statement of Facts, Grounds of Appeal, portal filing.',
  },
  schema: {
    name: 'Commissioner Appeal (APL-01)',
    description:
      'Commissioner Appeal (APL-01) filing under Section 107 CGST Act, prepared by CAs and Advocates. Fixed professional fee ₹9,999. Statement of Facts, Grounds of Appeal, portal filing.',
    price: 9999,
    path: '/services/commissioner-appeal',
  },
  breadcrumbLabel: 'Commissioner Appeal',
  hero: {
    refLine: 'FORM GST APL-01 · SECTION 107 CGST ACT',
    heading: 'Commissioner Appeal (APL-01) — Expert GST First Appeal Filing',
    sub: 'Challenging an Order of Adjudicating Authority requires a precise APL-01 filing with Statement of Facts and Grounds of Appeal. Fixed fee ₹9,999. Note: Statutory pre-deposit payable by you directly to the GST portal — our fee covers professional services only.',
    bookLabel: 'Book Commissioner Appeal — ₹9,999',
    whatsappHref: WHATSAPP_LINKS.commissionerAppeal,
    callbackLabel: 'Request Callback',
  },
  predepositInfo: {
    label: 'Pre-Deposit Requirement',
    body: (
      <p>Under <strong>Section 107(6) of the CGST Act</strong>, you must pre-deposit <strong>10% of the disputed tax amount</strong> directly to the GST portal before filing an appeal. This amount is paid by you to the government — it is not part of our professional fee and is not processed through this platform.</p>
    ),
  },
  whatIs: {
    eyebrow: 'The remedy',
    heading: 'What is a Commissioner Appeal?',
    paragraphs: [
      <p key="p1">A <strong>Commissioner Appeal</strong> filed in <span className="mono">FORM GST APL-01</span> is the <strong>first legal recourse</strong> available to a taxpayer after an adjudicating authority passes an adverse order — confirming a demand for tax, interest, or penalty under the CGST Act, 2017.</p>,
      <p key="p2">The appeal must be filed before the <strong>Appellate Authority (Commissioner of CGST/SGST)</strong> under <strong>Section 107 of the CGST Act</strong>, within <strong>3 months</strong> of the date of the impugned order. A pre-deposit of <strong>10% of the disputed tax</strong> (as per Section 107(6)) is mandatory and must be paid directly to the GST portal before filing.</p>,
      <p key="p3">The appeal bundle comprises a <strong>Statement of Facts</strong>, <strong>Grounds of Appeal</strong>, and a <strong>Prayer for relief</strong> — all of which must be drafted with precision to give the Appellate Authority a clear basis to grant relief.</p>,
    ],
    callout: {
      ariaLabel: 'Commissioner Appeal quick reference',
      label: 'Quick reference',
      refRow: 'Section 107, CGST Act, 2017',
      paragraphs: [
        <p key="p1">An <span className="mono">APL-01</span> filed before the Appellate Authority is the first appeal against a demand order. It must be filed within <strong>3 months</strong> of the order.</p>,
        <p key="p2">Our team prepares the complete appeal bundle: <strong>Statement of Facts, Grounds of Appeal, and Prayer.</strong></p>,
      ],
    },
  },
  deliverables: {
    eyebrow: 'Scope of work',
    heading: 'What We Prepare for Your Appeal',
    sub: 'A complete, court-ready APL-01 bundle — every element drafted by a CA and Advocate working together.',
    cards: [
      {
        Icon: FileText,
        title: 'APL-01 Application',
        description: 'The formal appeal application in the prescribed format, accurately completed with all required particulars.',
      },
      {
        Icon: BookOpen,
        title: 'Statement of Facts',
        description: 'A clear, chronological account of the transaction history and proceedings that led to the impugned order.',
      },
      {
        Icon: Scale,
        title: 'Grounds of Appeal',
        description: 'Legally reasoned grounds citing the CGST Act, CBIC circulars, and relevant tribunal / High Court decisions.',
      },
      {
        Icon: Gavel,
        title: 'Prayer / Relief Sought',
        description: 'Precise prayer clause specifying the relief — full quashing, partial reduction, or remand — appropriate to your case.',
      },
      {
        Icon: Info,
        title: 'Pre-deposit Guidance',
        description: 'We explain the Section 107(6) pre-deposit calculation and portal payment process — we do not collect or process government payments.',
      },
    ],
  },
  documents: {
    eyebrow: 'Before you start',
    heading: 'Documents to Upload',
    sub: 'Keep these ready as PDFs — your assigned CA and Advocate will confirm if anything else is needed.',
    items: [
      { name: 'Show Cause Notice (SCN / DRC-01)', format: 'The original notice that initiated the demand proceedings.' },
      { name: 'SCN Reply (as filed)', format: 'Your response to the SCN, if filed before the adjudicating authority.' },
      { name: 'Demand Order (OIO)', format: 'The Order-in-Original passed by the adjudicating authority confirming the demand.' },
      { name: 'Other supporting documents / evidence', format: 'Invoices, ledgers, returns, correspondence — anything relevant to your grounds of appeal.' },
    ],
    reassure: 'All uploaded documents are encrypted and never shared with third parties.',
  },
  steps: {
    eyebrow: 'The process',
    heading: 'Your Commissioner Appeal in 4 Steps',
    items: [
      {
        title: 'Upload the Order & Documents',
        body: 'Share the demand order (OIO), SCN, SCN reply, and supporting documents through our encrypted portal. You\'ll receive a case reference number immediately.',
      },
      {
        title: 'Appeal Bundle Drafted',
        body: 'A CA and Advocate jointly draft the APL-01 application, Statement of Facts, Grounds of Appeal, and Prayer — with case-law research included.',
        sla: 'Draft prepared within 48 hours of document receipt',
      },
      {
        title: 'You Review & Pre-deposit',
        body: 'Confirm the appeal bundle. You make the statutory pre-deposit (10% of disputed tax) directly on the GST portal before we file.',
      },
      {
        title: 'We File APL-01 on the Portal',
        body: 'We submit the complete appeal in FORM GST APL-01 on the portal and share the filing acknowledgement with you.',
      },
    ],
  },
  pricing: {
    heading: 'Fixed Fee. No Surprises.',
    lede: 'Complete APL-01 appeal bundle, prepared by a CA and Advocate — professional services only.',
    amount: '₹9,999',
    amountMeta: 'One-time professional fee · inclusive of GST',
    includedLabel: 'What\'s included',
    included: [
      'APL-01 preparation',
      'Statement of Facts',
      'Grounds of Appeal',
      'Prayer drafting',
      'Portal filing support',
      '48-hour draft turnaround',
    ],
    predeposit: {
      label: 'Government Pre-Deposit',
      body: '10% of disputed tax — payable by you directly to GST portal. Not included in our fee.',
    },
    ctaLabel: 'Book Commissioner Appeal Now',
    whatsappHref: WHATSAPP_LINKS.commissionerAppeal,
    payNote: 'Full payment upfront. Non-refundable once draft preparation begins. No EMI.',
  },
  related: {
    eyebrow: 'Related services',
    heading: 'Before and After the Appeal',
    sub: 'Our SCN reply service is the stage before this appeal; GSTAT is the tribunal-level escalation if needed.',
    cards: [
      {
        href: '/services/scn-reply',
        stageLabel: 'Prior stage',
        title: 'Show Cause Notice Reply (SCN)',
        description: 'DRC-01 / DRC-01A response before adjudicating authority passes an order.',
        priceDisplay: '₹5,999',
      },
      {
        href: '/services/gstat-appeal',
        stageLabel: 'Next escalation',
        title: 'GSTAT Appeal (APL-05)',
        description: 'Appellate Tribunal filing if the Commissioner (Appeals) order is adverse. Statutory pre-deposit required.',
        priceDisplay: '₹14,999',
      },
    ],
  },
};
