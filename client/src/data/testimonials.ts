import type { TestimonialItem, TestimonialTab, TestimonialTabId } from './types';

export const TESTIMONIAL_TABS: TestimonialTab[] = [
  { id: 'ca', label: 'Chartered Accountants' },
  { id: 'adv', label: 'Advocates' },
  { id: 'biz', label: 'Business Owners' },
];

export const TESTIMONIALS: Record<TestimonialTabId, TestimonialItem[]> = {
  ca: [
    { quote: 'They drafted a watertight SCN reply for my client\'s ₹8L ITC demand in two days. I now refer my own clients\' litigation work to them.', name: 'CA Anand Krishnan', meta: 'Practising CA · Kochi' },
    { quote: 'Clear scope, fixed fee, filed on time. The reconciliation working they prepared for the ASMT-10 was exactly what the officer asked for.', name: 'CA Meera Joshi', meta: 'Partner, Joshi & Associates · Pune' },
  ],
  adv: [
    { quote: 'Their grounds of appeal for an APL-01 were thoroughly researched with relevant case law. Saved me hours of drafting on a tight deadline.', name: 'Adv. Imran Sheikh', meta: 'Tax Advocate · Hyderabad' },
    { quote: 'Professional coordination and prompt filing before the Commissioner (Appeals). The demand was reduced substantially for my client.', name: 'Adv. Lakshmi Rao', meta: 'Advocate, High Court · Bengaluru' },
  ],
  biz: [
    { quote: 'Got a scary DRC-01 for ₹8.4L. They explained it in plain language, replied within 48 hours, and it was accepted with no penalty.', name: 'Rohit Mehta', meta: 'Proprietor, Mehta Textiles · Surat' },
    { quote: 'First time I received a GST notice and panicked. Fixed fee, no surprises, and they kept me updated at every step on WhatsApp.', name: 'Fatima Qureshi', meta: 'Founder, Crafted Home · Jaipur' },
  ],
};
