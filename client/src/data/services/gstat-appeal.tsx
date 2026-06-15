import { FileText, BookOpen, Scale, Gavel, Landmark } from 'lucide-react';
import { WHATSAPP_LINKS } from '../common';
import type { ServicePageContent } from '../types';

export const gstatAppealContent: ServicePageContent = {
  meta: {
    title: 'GSTAT Appellate Tribunal Appeal (APL-05) | GST Notice Support',
    description: 'GSTAT Appeal (APL-05) filing before the GST Appellate Tribunal — second tier appeal under Section 112 CGST Act. Complete APL-05 bundle prepared by CAs and Advocates. Fixed fee ₹14,999.',
  },
  schema: {
    name: 'GSTAT Appeal (APL-05)',
    description:
      'GSTAT Appeal (APL-05) filing before the GST Appellate Tribunal — second tier appeal under Section 112 CGST Act. Complete APL-05 bundle prepared by CAs and Advocates. Fixed fee ₹14,999.',
    price: 14999,
    path: '/services/gstat-appeal',
  },
  breadcrumbLabel: 'GSTAT Appeal',
  hero: {
    refLine: 'FORM GST APL-05 · SECTION 112 CGST ACT',
    heading: 'GSTAT Appellate Tribunal Appeal (APL-05) — Expert Second Appeal Filing',
    sub: 'The GST Appellate Tribunal is the second tier of appeal under GST law. Our experts prepare your complete APL-05 bundle — Statement of Facts, Grounds of Appeal, and Prayer. Fixed fee: ₹14,999. Statutory pre-deposit is payable by you to the government; it is not part of our fee.',
    bookLabel: 'Book GSTAT Appeal — ₹14,999',
    whatsappHref: WHATSAPP_LINKS.gstatAppeal,
    callbackLabel: 'Request Callback',
  },
  predepositInfo: {
    label: 'Pre-Deposit Requirement',
    body: (
      <p>Under <strong>Section 112(8) of the CGST Act</strong>, you must pre-deposit <strong>20% of the disputed tax amount</strong> directly to the GST portal. This is a statutory government payment — not processed through this platform. We provide guidance on the pre-deposit process as part of our service.</p>
    ),
  },
  whatIs: {
    eyebrow: 'The remedy',
    heading: 'What is a GSTAT Appeal?',
    paragraphs: [
      <p key="p1">The <strong>GST Appellate Tribunal (GSTAT)</strong> is the <strong>second tier of appeal</strong> available under the CGST Act, 2017. An appeal before the Tribunal in <span className="mono">FORM GST APL-05</span> is filed after a first appeal before the Commissioner (Appeals) in APL-01 has been decided against you.</p>,
      <p key="p2">The GSTAT appeal is governed by <strong>Section 112 of the CGST Act</strong> and must be filed within <strong>3 months</strong> of the date of the Appellate Authority&#39;s order. As a second-tier legal remedy, it involves a significantly higher level of legal complexity than a first appeal — submissions are examined by a judicial member and a technical member of the Tribunal.</p>,
      <p key="p3">A statutory pre-deposit of <strong>20% of the disputed tax</strong> under Section 112(8) is mandatory and must be deposited directly to the GST portal before the appeal is admitted. Our team guides you through this process without collecting or processing government payments.</p>,
    ],
    callout: {
      ariaLabel: 'GSTAT Appeal quick reference',
      label: 'Quick reference',
      refRow: 'Section 112, CGST Act, 2017',
      paragraphs: [
        <p key="p1"><span className="mono">APL-05</span> is filed before the GST Appellate Tribunal after a first appeal before the Commissioner (APL-01) has been decided against you. It is a second-tier legal remedy and involves a higher level of legal complexity.</p>,
        <p key="p2">Our team prepares: <strong>Statement of Facts, Grounds of Appeal, Prayer, and complete APL-05 structured format.</strong></p>,
      ],
    },
  },
  deliverables: {
    eyebrow: 'Scope of work',
    heading: 'Your Complete Appeal Bundle',
    sub: 'Every deliverable prepared by a CA and Advocate working together — structured for the Tribunal\'s requirements.',
    cards: [
      {
        Icon: FileText,
        title: 'APL-05 Application',
        description: 'The formal appeal application in the prescribed GST Appellate Tribunal format, completed with all required particulars and case history.',
      },
      {
        Icon: BookOpen,
        title: 'Statement of Facts',
        description: 'A precise chronological account of the transaction history and all proceedings — from SCN through OIO and OIA — leading to the Tribunal appeal.',
      },
      {
        Icon: Scale,
        title: 'Grounds of Appeal',
        description: 'Legally reasoned grounds citing the CGST Act, CBIC circulars, and binding Tribunal and High Court precedents applicable to your case.',
      },
      {
        Icon: Gavel,
        title: 'Prayer / Relief Sought',
        description: 'Precisely framed prayer clause — quashing, reduction, or remand — tailored to your legal position and the Tribunal\'s jurisdiction.',
      },
      {
        Icon: Landmark,
        title: 'Pre-deposit Process Guidance',
        description: 'Detailed walkthrough of the Section 112(8) pre-deposit calculation and GST portal payment steps. We do not collect or process government payments.',
      },
    ],
  },
  documents: {
    eyebrow: 'Before you start',
    heading: 'Documents to Upload',
    sub: 'Gather all prior orders and replies before booking — this service requires the complete paper trail from the original notice through the first appeal.',
    items: [
      { name: 'Show Cause Notice (SCN)', format: 'The original notice that initiated the demand proceedings.' },
      { name: 'SCN Reply (as filed)', format: 'Your response to the SCN filed before the adjudicating authority.' },
      { name: 'Demand Order (OIO)', format: 'The Order-in-Original passed by the adjudicating authority confirming the demand.' },
      { name: 'First Appeal (APL-01) and Commissioner\'s Order (OIA)', format: 'The APL-01 filed before the Appellate Authority and the Order-in-Appeal (OIA) issued against you — both required to establish GSTAT jurisdiction.' },
      { name: 'Other relevant documents / evidence', format: 'Invoices, ledgers, returns, correspondence, or any evidence you wish to place before the Tribunal.' },
    ],
    note: (
      <p><strong>Most document-intensive service:</strong> This is the highest-complexity filing in our suite. Ensure all prior orders and replies — OIO, APL-01, and OIA — are available before booking. Incomplete records delay preparation.</p>
    ),
    reassure: 'All uploaded documents are encrypted and never shared with third parties.',
  },
  steps: {
    eyebrow: 'The process',
    heading: 'Your GSTAT Appeal in 4 Steps',
    items: [
      {
        title: 'Upload All Orders & Documents',
        body: 'Share the complete record — SCN, SCN reply, OIO, APL-01, and the Commissioner\'s Order (OIA) — through our encrypted portal. You\'ll receive a case reference immediately.',
      },
      {
        title: 'APL-05 Bundle Drafted',
        body: 'A CA and Advocate jointly draft the complete APL-05 application, Statement of Facts, Grounds of Appeal, and Prayer — with Tribunal-level case-law research included.',
        sla: 'Draft prepared within 72 hours of document receipt',
      },
      {
        title: 'You Review, Pre-deposit & Share Credentials',
        body: 'Confirm the appeal bundle. Make the 20% statutory pre-deposit directly on the GST portal, then share your portal credentials so we can file on your behalf.',
      },
      {
        title: 'We File APL-05 on the Portal',
        body: 'We submit the complete appeal in FORM GST APL-05 on the GST portal and share the filing acknowledgement with you.',
      },
    ],
  },
  pricing: {
    heading: 'Fixed Fee. No Surprises.',
    lede: 'Complete APL-05 Tribunal appeal bundle, prepared by a CA and Advocate — professional services only.',
    amount: '₹14,999',
    amountMeta: 'One-time professional fee · inclusive of GST',
    includedLabel: 'What\'s included',
    included: [
      'APL-05 preparation',
      'Statement of Facts',
      'Grounds of Appeal',
      'Prayer drafting',
      'Pre-deposit process guidance',
      'Portal filing support',
    ],
    predeposit: {
      label: 'Government Pre-Deposit',
      body: '20% of disputed tax — payable by you directly to GST portal. Not included in our fee.',
    },
    ctaLabel: 'Book GSTAT Appeal Now',
    whatsappHref: WHATSAPP_LINKS.gstatAppeal,
    payNote: 'Full payment upfront. Non-refundable once draft preparation begins. No EMI.',
  },
  related: {
    eyebrow: 'Related services',
    heading: 'Around the Tribunal Appeal',
    sub: 'A Commissioner Appeal (APL-01) must be decided against you before GSTAT jurisdiction arises. If your appeal needs a personal hearing, we appear on your behalf.',
    cards: [
      {
        href: '/services/commissioner-appeal',
        stageLabel: 'Prior stage',
        title: 'Commissioner Appeal (APL-01)',
        description: 'First appeal against a demand order before the Appellate Authority. Pre-deposit: 10% of disputed tax.',
        priceDisplay: '₹9,999',
        ariaLabel: 'Commissioner Appeal (APL-01) — ₹9,999',
      },
      {
        href: '/services/representation-before-authority',
        stageLabel: 'At the hearing',
        title: 'Representation Before Authority',
        description: 'Personal or virtual appearance before the Tribunal when your appeal is heard. Our CAs and Advocates argue your case.',
        priceDisplay: 'Custom quote',
        ariaLabel: 'Representation Before Authority — consultation-based',
      },
    ],
  },
};
