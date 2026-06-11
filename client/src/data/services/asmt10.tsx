import { FileSearch, FilePenLine, UploadCloud } from 'lucide-react';
import { WHATSAPP_LINKS } from '../common';
import type { ServicePageContent } from '../types';

export const asmt10Content: ServicePageContent = {
  meta: {
    title: 'ASMT-10 Reply Service | GST Notice Support',
    description: 'ASMT-10 scrutiny notice reply prepared by ICAI-registered CAs. Fixed fee ₹2,999. Draft within 48 hours. Section 61 CGST Act responses, filed on the GST portal.',
  },
  schema: {
    name: 'ASMT-10 Scrutiny Notice Reply',
    description:
      'ASMT-10 scrutiny notice reply prepared by ICAI-registered CAs. Fixed fee ₹2,999. Draft within 48 hours. Section 61 CGST Act responses, filed on the GST portal.',
    price: 2999,
    path: '/services/asmt-10',
  },
  breadcrumbLabel: 'ASMT-10 Reply',
  hero: {
    refLine: 'FORM GST ASMT-10 · SECTION 61 CGST ACT',
    heading: 'ASMT-10 Reply — Expert GST Scrutiny Response',
    sub: 'Section 61 CGST Act scrutiny notices handled by ICAI-registered CAs. Fixed fee: ₹2,999. Draft within 48 hours.',
    bookLabel: 'Book ASMT-10 Reply — ₹2,999',
    whatsappHref: WHATSAPP_LINKS.asmt10,
    callbackLabel: 'Request Callback',
  },
  deadlineAlert: {
    label: 'Deadline notice',
    body: (
      <p>ASMT-10 replies have a <strong>statutory response window</strong>. Do not delay — non-response can lead to best-judgement assessment under Section 62.</p>
    ),
  },
  whatIs: {
    eyebrow: 'The notice',
    heading: 'What is an ASMT-10 Notice?',
    paragraphs: [
      <p key="p1">An <strong>ASMT-10</strong> is issued by the GST officer under <strong>Section 61 of the CGST Act, 2017</strong> when scrutiny of your GST returns reveals discrepancies — typically a mismatch between <span className="mono">GSTR-1</span> and <span className="mono">GSTR-3B</span>, ineligible ITC claimed under <span className="mono">GSTR-2A/2B</span>, or differences between turnover declared in returns and other available data.</p>,
      <p key="p2">The notice asks you to <strong>explain the discrepancy in writing</strong>, supported by ledgers, reconciliation, and source documents. Your reply is filed in <span className="mono">FORM GST ASMT-11</span> on the GST portal.</p>,
      <p key="p3">Failing to respond — or filing a weak reply — exposes you to escalation: the officer can proceed to <strong>best-judgement assessment under Section 62</strong>, issue a <strong>Show Cause Notice under Section 73/74</strong>, or initiate audit proceedings under Section 65. None of these are situations you want to defend later.</p>,
    ],
    callout: {
      ariaLabel: 'ASMT-10 quick reference',
      label: 'Quick reference',
      refRow: 'Section 61, CGST Act, 2017',
      paragraphs: [
        <p key="p1">Issued under Section 61 of the CGST Act, 2017. Requires the taxpayer to <strong>explain discrepancies</strong> found during return scrutiny.</p>,
        <p key="p2">Non-response can lead to <strong>best-judgement assessment under Section 62</strong>.</p>,
      ],
    },
  },
  deliverables: {
    eyebrow: 'Scope of work',
    heading: 'What Our Experts Prepare for You',
    sub: 'Every ASMT-10 is reviewed by an ICAI-registered CA — no junior triage queue.',
    cards: [
      {
        Icon: FileSearch,
        title: 'Legal Analysis of Discrepancy',
        description: 'We map each flagged item to its source — returns, ledgers, invoices — and prepare a defensible position grounded in the CGST Act and relevant CBIC circulars.',
      },
      {
        Icon: FilePenLine,
        title: 'Structured Written Reply',
        description: 'A clear, paragraph-numbered ASMT-11 reply with a reconciliation working annexed — the format scrutiny officers expect and act on quickly.',
      },
      {
        Icon: UploadCloud,
        title: 'Portal Filing Support',
        description: 'We file your reply in FORM GST ASMT-11 on the GST portal, attach supporting documents, and share the acknowledgement with you.',
      },
    ],
  },
  documents: {
    eyebrow: 'Before you start',
    heading: 'Documents You Need to Upload',
    sub: 'Keep these ready as PDFs — your assigned CA will tell you if anything specific is missing.',
    items: [
      { name: 'ASMT-10 notice', format: 'The notice PDF as received from the GST portal (with reference number).' },
      { name: 'Supporting ledgers / reconciliation', format: 'Sales register, purchase register, GSTR-1 vs 3B working — Excel or PDF.' },
      { name: 'Any earlier correspondence', format: 'Prior departmental letters, emails, or notices on the same period.' },
      { name: 'Other relevant documents / evidence', format: 'Invoices, debit/credit notes, payment proofs — anything that supports your position.' },
    ],
    reassure: 'All uploaded documents are encrypted and never shared with third parties.',
  },
  steps: {
    eyebrow: 'The process',
    heading: 'Your ASMT-10 Reply in 4 Steps',
    items: [
      {
        title: 'Upload Your ASMT-10',
        body: 'Share your notice, returns, and reconciliation through our encrypted upload — you\'ll get a case reference number immediately.',
      },
      {
        title: 'CA Reviews & Drafts the Reply',
        body: 'An ICAI-registered CA analyses the flagged discrepancy and prepares your ASMT-11 reply with a reconciliation working.',
        sla: 'Draft prepared within 48 hours of document receipt',
      },
      {
        title: 'You Review & Confirm',
        body: 'Read the draft, raise questions, and confirm. One round of revision is included before anything is filed.',
      },
      {
        title: 'We File ASMT-11 on the Portal',
        body: 'We submit your reply in FORM GST ASMT-11 on the GST portal and share the acknowledgement with you.',
      },
    ],
  },
  pricing: {
    heading: 'Fixed Fee. No Surprises.',
    lede: 'One ASMT-10 reply, prepared by an ICAI-registered CA, filed on the GST portal.',
    amount: '₹2,999',
    amountMeta: 'One-time professional fee · inclusive of GST',
    includedLabel: 'What\'s included',
    included: [
      'Expert review of your ASMT-10',
      'Structured written reply draft',
      'One round of revision',
      'Portal filing support (ASMT-11)',
      '48-hour draft turnaround',
    ],
    ctaLabel: 'Book ASMT-10 Reply Now',
    whatsappHref: WHATSAPP_LINKS.asmt10,
    payNote: 'Full payment upfront. Non-refundable once draft preparation begins. No EMI.',
  },
};
