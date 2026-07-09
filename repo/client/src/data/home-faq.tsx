import Link from 'next/link';
import type { HomeFaqItem } from './types';

export const HOME_FAQS: HomeFaqItem[] = [
  { q: 'Is my GST data safe with you?', a: 'Yes. Every document you upload is encrypted in transit and at rest, stored confidentially, and never shared with third parties. Only the professional assigned to your case can access your files.' },
  { q: 'How quickly will you respond to my notice?', a: (<>We acknowledge every case within 24 hours and prepare your draft response within 48 hours of receiving your documents. <Link href="/pricing">Upload your notice</Link> to start the clock.</>) },
  { q: 'What documents do I need to upload?', a: 'At minimum, the notice itself (PDF). Depending on the matter we may request relevant returns (GSTR-1, 3B), invoices, or reconciliation statements — your assigned professional will give you a precise checklist.' },
  { q: 'Do your experts appear before GST officers?', a: 'Yes. Our Bar Council-enrolled Advocates and CAs can represent you in personal hearings and before appellate authorities where required, in addition to drafting and filing your response.' },
  { q: 'What is your fee structure?', a: (<>Fixed professional fees, quoted upfront per service — ₹2,999 for ASMT-10, ₹5,999 for SCN reply, ₹9,999 for Commissioner Appeal, ₹14,999 for GSTAT Appeal. Government pre-deposits, where applicable, are paid separately to the GST portal. <Link href="/pricing">See full pricing</Link>.</>) },
  { q: 'Can I track my case progress?', a: 'Yes. You\'ll receive a case reference number after upload and can track each stage — review, draft, confirmation, filing — from your dashboard, with updates also sent on WhatsApp.' },
  { q: 'Do you handle pan-India GST matters?', a: 'Yes. GST is a national law and we handle notices and appeals across all states and union territories, regardless of where your business is registered.' },
  { q: 'What if my case is not resolved in our favour?', a: 'Outcomes depend on the facts and the authority\'s decision, so we never promise a guaranteed result. If an order goes against you, we\'ll advise on the next remedy — such as a Commissioner or GSTAT appeal — and what it involves.' },
];

export const HOME_FAQ_UI = {
  searchPlaceholder: 'Search your question…',
  searchAriaLabel: 'Search frequently asked questions',
  empty: {
    prefix: 'No questions match your search. Try a different term or',
    ctaLabel: 'request a callback',
  },
} as const;
