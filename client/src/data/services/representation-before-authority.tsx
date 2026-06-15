import { Scale, MessageSquare, FileText, CalendarClock, ShieldCheck } from 'lucide-react';
import { WHATSAPP_LINKS } from '../common';
import type { ServicePageContent } from '../types';

// NOTE: Placeholder copy for review. Representation Before Authority is a
// consultation-based, offline-priced service — no fixed fee. Fee is confirmed
// with the client before any engagement begins.
export const representationContent: ServicePageContent = {
  meta: {
    title: 'Representation Before Authority — GST Personal Hearing & Appearance | GST Notice Support',
    description:
      'Expert representation and personal appearance before the GST Officer or Appellate Authority. Consultation-based service — fee confirmed to your case. Handled by ICAI-registered CAs and Bar Council-enrolled Advocates, pan-India.',
  },
  schema: {
    name: 'Representation Before Authority',
    description:
      'Professional representation and personal/virtual appearance before the GST Officer or Appellate Authority during hearings. Consultation-based service tailored to case complexity, jurisdiction, and hearing schedule.',
    path: '/services/representation-before-authority',
  },
  breadcrumbLabel: 'Representation Before Authority',
  hero: {
    refLine: 'PERSONAL HEARING · GST OFFICER & APPELLATE AUTHORITY',
    heading: 'Representation Before Authority — Expert Appearance at GST Hearings',
    sub: 'When your case requires physical or virtual appearance before the GST Officer or Appellate Authority, our CAs and Advocates appear and argue on your behalf. Consultation-based — fee depends on case complexity, jurisdiction, and hearing schedule, and is confirmed before any engagement.',
    bookLabel: 'Discuss My Case on WhatsApp',
    whatsappHref: WHATSAPP_LINKS.representation,
    callbackLabel: 'Request a Callback',
  },
  deadlineAlert: {
    label: 'Hearing date notice',
    body: (
      <p>Personal hearings are scheduled by the authority and carry <strong>fixed appearance dates</strong>. Engage early so your case is prepared and represented before the hearing — missed hearings can lead to an ex-parte order.</p>
    ),
  },
  whatIs: {
    eyebrow: 'The service',
    heading: 'What is Representation Before Authority?',
    paragraphs: [
      <p key="p1"><strong>Representation Before Authority</strong> is professional appearance on your behalf at a <strong>personal hearing</strong> before a GST Officer (during adjudication) or an Appellate Authority (during an appeal). The GST Acts give every taxpayer the right to be heard before an adverse order is passed.</p>,
      <p key="p2">A personal hearing is where your written reply or appeal is argued orally — questions are answered, additional submissions are made, and the case is presented in its strongest form. Effective representation requires both <strong>command of the facts</strong> and <strong>fluency in GST law and procedure</strong>.</p>,
      <p key="p3">Because the scope of representation varies widely — number of hearings, jurisdiction, forum, and complexity — this service is <strong>consultation-based</strong>. We discuss your case, agree the scope, and confirm the fee in writing before any engagement begins.</p>,
    ],
    callout: {
      ariaLabel: 'Representation quick reference',
      label: 'Quick reference',
      refRow: 'Right to be heard · CGST Act, 2017',
      paragraphs: [
        <p key="p1">Appearance before the <span className="mono">GST Officer</span> or <span className="mono">Appellate Authority</span> at a scheduled personal hearing — physical or virtual.</p>,
        <p key="p2">Pricing is <strong>case-specific and confirmed offline</strong> before engagement. No fixed online fee.</p>,
      ],
    },
  },
  deliverables: {
    eyebrow: 'Scope of work',
    heading: 'What Representation Covers',
    sub: 'A complete hearing engagement — from strategy through appearance and follow-up, handled by a CA and Advocate.',
    cards: [
      {
        Icon: Scale,
        title: 'Case & Hearing Strategy',
        description: 'We review your notice, reply, or appeal record and build the line of argument to be advanced at the hearing.',
      },
      {
        Icon: MessageSquare,
        title: 'Oral Submissions',
        description: 'Your assigned expert presents the case, responds to the authority’s questions, and argues each ground on your behalf.',
      },
      {
        Icon: FileText,
        title: 'Written Synopsis & Paperbook',
        description: 'Where required, we prepare a written synopsis, case-law compilation, and additional submissions to hand up at the hearing.',
      },
      {
        Icon: CalendarClock,
        title: 'Appearance on Hearing Dates',
        description: 'Physical or virtual appearance on the scheduled date(s), including adjournment requests where genuinely warranted.',
      },
      {
        Icon: ShieldCheck,
        title: 'Post-Hearing Follow-Up',
        description: 'We track the outcome, advise on next steps, and flag any further reply or appeal the order may call for.',
      },
    ],
  },
  documents: {
    eyebrow: 'Before you start',
    heading: 'Documents to Share',
    sub: 'Keep these ready as PDFs — your assigned expert will confirm if anything else is needed for your hearing.',
    items: [
      { name: 'Hearing notice / intimation', format: 'The notice fixing the date and venue of the personal hearing.' },
      { name: 'Underlying notice or order', format: 'The SCN, scrutiny notice, or order to which the hearing relates.' },
      { name: 'Reply or appeal already filed', format: 'Your written reply or appeal memo, if one has been submitted.' },
      { name: 'Supporting documents / evidence', format: 'Invoices, ledgers, returns, and any records relevant to the case.' },
      { name: 'Prior correspondence', format: 'Earlier replies, adjournment letters, or communication with the department.' },
    ],
    reassure: 'All shared documents are encrypted and never disclosed to third parties.',
  },
  steps: {
    eyebrow: 'The process',
    heading: 'How Representation Works',
    items: [
      {
        title: 'Share Your Hearing Notice',
        body: 'Send the hearing notice and case record through our encrypted portal. We assess the forum, complexity, and scope of appearance required.',
      },
      {
        title: 'Consultation & Scope Confirmation',
        body: 'We discuss your case, agree the scope of representation, and confirm the fee in writing before any engagement begins.',
        sla: 'Fee and scope confirmed before engagement',
      },
      {
        title: 'Preparation & Appearance',
        body: 'Your CA and Advocate prepare the arguments and synopsis, then appear before the authority on the scheduled hearing date — physically or virtually.',
      },
      {
        title: 'Outcome & Next Steps',
        body: 'After the hearing we share what transpired, the likely outcome, and advise on any further reply or appeal that may be needed.',
      },
    ],
  },
  pricing: {
    heading: 'Consultation-Based. Quoted to Your Case.',
    lede: 'Representation is priced to the engagement — number of hearings, forum, jurisdiction, and complexity. We confirm the fee with you before any work begins.',
    amount: 'Custom Quote',
    amountMeta: 'Fee depends on case complexity, jurisdiction & hearing schedule · confirmed offline before engagement',
    includedLabel: 'What’s typically included',
    included: [
      'Case review and hearing strategy',
      'Oral submissions before the authority',
      'Written synopsis where required',
      'Appearance on scheduled hearing dates',
      'Post-hearing outcome guidance',
    ],
    ctaLabel: 'Discuss My Case on WhatsApp',
    whatsappHref: WHATSAPP_LINKS.representation,
    payNote: 'Scope and fee are agreed in writing before any engagement begins. No fixed online fee for this service.',
  },
  related: {
    eyebrow: 'Related services',
    heading: 'Where Representation Fits',
    sub: 'Representation often accompanies an appeal. If you also need the appeal drafted and filed, we handle both levels.',
    cards: [
      {
        href: '/services/commissioner-appeal',
        stageLabel: 'First appeal',
        title: 'Commissioner Appeal (APL-01)',
        description: 'First appeal against an adjudicating authority order, filed before the Commissioner (Appeals) within 3 months.',
        priceDisplay: '₹9,999',
      },
      {
        href: '/services/gstat-appeal',
        stageLabel: 'Second appeal',
        title: 'GSTAT Appeal (APL-05)',
        description: 'Appellate Tribunal filing if the Commissioner (Appeals) order is adverse. Statutory pre-deposit applies.',
        priceDisplay: '₹14,999',
      },
    ],
  },
};
