import { Scale, FilePenLine, Folders, UploadCloud } from 'lucide-react';
import { WHATSAPP_LINKS } from '../common';
import type { ServicePageContent } from '../types';

export const scnContent: ServicePageContent = {
  meta: {
    title: 'DRC-01 / SCN Reply Service | GST Notice Support',
    description: 'Show Cause Notice reply for DRC-01 and DRC-01A prepared by CAs and Advocates. Fixed fee ₹5,999. Full structured reply under Section 73/74 CGST Act, filed on the GST portal.',
  },
  schema: {
    name: 'Show Cause Notice (SCN) Reply',
    description:
      'Show Cause Notice reply for DRC-01 and DRC-01A prepared by CAs and Advocates. Fixed fee ₹5,999. Full structured reply under Section 73/74 CGST Act, filed on the GST portal.',
    price: 5999,
    path: '/services/scn-reply',
  },
  breadcrumbLabel: 'SCN Reply',
  hero: {
    refLine: 'DRC-01 / DRC-01A · SECTION 73 & 74 CGST ACT',
    heading: 'Show Cause Notice Reply — DRC-01 & DRC-01A Expert Handling',
    sub: 'High-stakes GST demand notices require a precise, legally structured response. Our team of CAs and Advocates prepares your reply — fixed fee ₹5,999, draft within 48 hours.',
    bookLabel: 'Book SCN Reply — ₹5,999',
    whatsappHref: WHATSAPP_LINKS.scnReply,
    callbackLabel: 'Request Callback',
  },
  deadlineAlert: {
    label: 'Deadline notice',
    body: (
      <p>DRC-01 notices carry <strong>tight statutory deadlines</strong>. File a response before the adjudicating authority passes an ex-parte order against you.</p>
    ),
  },
  whatIs: {
    eyebrow: 'The notice',
    heading: 'What is a Show Cause Notice?',
    paragraphs: [
      <p key="p1">A <strong>Show Cause Notice (SCN)</strong> in the form of <span className="mono">DRC-01</span> is issued by the GST officer under <strong>Section 73 or Section 74 of the CGST Act, 2017</strong> when the officer has reason to believe that tax has been <strong>short-paid, unpaid, or wrongly refunded</strong>, or that input tax credit has been wrongly availed.</p>,
      <p key="p2"><span className="mono">DRC-01A</span> is a <strong>pre-SCN intimation</strong> — an opportunity to pay the ascertained amount with interest before the formal DRC-01 is issued. Addressing DRC-01A early can avoid full SCN proceedings.</p>,
      <p key="p3">The SCN demands a written explanation of why the alleged tax, interest, and penalty should not be confirmed. A weak or absent reply allows the adjudicating authority to <strong>pass an ex-parte order confirming the full demand</strong> — which then requires a Commissioner Appeal or GSTAT proceeding to challenge.</p>,
    ],
    callout: {
      ariaLabel: 'SCN quick reference',
      label: 'Quick reference',
      refRow: 'Section 73 / 74, CGST Act, 2017',
      paragraphs: [
        <p key="p1"><span className="mono">DRC-01</span> is a formal Show Cause Notice requiring explanation of alleged tax, interest, and penalty.</p>,
        <p key="p2">Non-response or an inadequate reply can result in an <strong>Order of Adjudicating Authority confirming the full demand</strong>.</p>,
      ],
    },
  },
  deliverables: {
    eyebrow: 'Scope of work',
    heading: 'What Our Team Prepares',
    sub: 'CAs and Advocates work together on every SCN — legal drafting plus factual reconciliation in one team.',
    cards: [
      {
        Icon: Scale,
        title: 'Legal Analysis of Demand',
        description: 'We review each ground of the demand under Section 73/74, assess limitation, and map the officer\'s allegations to the facts and applicable law.',
      },
      {
        Icon: FilePenLine,
        title: 'Structured Reply Draft',
        description: 'A point-by-point reply to every ground raised in the DRC-01, supported by case law citations and CBIC circulars where relevant.',
      },
      {
        Icon: Folders,
        title: 'Evidence Compilation Guidance',
        description: 'Your assigned expert tells you exactly which invoices, ledgers, or returns to annexe — no guesswork, no over-disclosure.',
      },
      {
        Icon: UploadCloud,
        title: 'Portal Filing',
        description: 'We upload and submit your reply on the GST portal, attach supporting documents, and share the filing acknowledgement.',
      },
    ],
  },
  documents: {
    eyebrow: 'Before you start',
    heading: 'Documents to Upload',
    sub: 'Keep these ready as PDFs — your assigned expert will confirm if anything else is needed.',
    items: [
      { name: 'ASMT-10 notice (if preceding)', format: 'The earlier scrutiny notice, if one was issued before the DRC-01.' },
      { name: 'ASMT-10 reply (if filed)', format: 'Your earlier response to the scrutiny notice, if one was submitted.' },
      { name: 'Show Cause Notice (DRC-01 & DRC-01A)', format: 'All notices received — pre-SCN intimation and the formal DRC-01 PDF.' },
      { name: 'Supporting invoices / returns / ledgers', format: 'GSTR-1, GSTR-3B, GSTR-2A, ITC ledger, sales register, purchase register.' },
      { name: 'Other relevant documents / evidence', format: 'Invoices, payment proofs, debit/credit notes — anything supporting your position.' },
    ],
    reassure: 'All uploaded documents are encrypted and never shared with third parties.',
  },
  steps: {
    eyebrow: 'The process',
    heading: 'Your SCN Reply in 4 Steps',
    items: [
      {
        title: 'Upload Your DRC-01',
        body: 'Share the notice and supporting documents through our encrypted portal — you\'ll receive a case reference number immediately.',
      },
      {
        title: 'Expert Legal Analysis & Draft',
        body: 'A CA and Advocate review the demand, research applicable law and circulars, and prepare a structured point-by-point reply.',
        sla: 'Draft prepared within 48 hours of document receipt',
      },
      {
        title: 'You Review & Confirm',
        body: 'Read the draft, ask questions, and confirm. One round of revision is included before anything is filed.',
      },
      {
        title: 'We File on the GST Portal',
        body: 'We submit your SCN reply on the GST portal, attach the supporting evidence, and share the filing acknowledgement.',
      },
    ],
  },
  pricing: {
    heading: 'Fixed Fee. No Surprises.',
    lede: 'One SCN reply, prepared by a CA and Advocate working together, filed on the GST portal.',
    amount: '₹5,999',
    amountMeta: 'One-time professional fee · inclusive of GST',
    includedLabel: 'What\'s included',
    included: [
      'Legal analysis of DRC-01 demand',
      'Full structured reply draft',
      'One revision round',
      'Portal filing support',
      '48-hour draft turnaround',
    ],
    ctaLabel: 'Book SCN Reply Now',
    whatsappHref: WHATSAPP_LINKS.scnReply,
    payNote: 'Full payment upfront. Non-refundable once draft preparation begins. No EMI.',
  },
  related: {
    eyebrow: 'If the demand is confirmed',
    heading: 'Escalation Path',
    sub: 'If an adjudicating order goes against you, the next remedy is a formal appeal. We handle both levels.',
    cards: [
      {
        href: '/services/commissioner-appeal',
        stageLabel: 'Next step',
        title: 'Commissioner Appeal (APL-01)',
        description: 'First appeal against an order of adjudicating authority. Filed before the Commissioner (Appeals) within 3 months of the order.',
        priceDisplay: '₹9,999',
      },
      {
        href: '/services/gstat-appeal',
        stageLabel: 'Second appeal',
        title: 'GSTAT Appeal (APL-05)',
        description: 'Appellate Tribunal filing if the Commissioner (Appeals) order is adverse. Requires statutory pre-deposit as per the CGST Act.',
        priceDisplay: '₹14,999',
      },
    ],
  },
};
