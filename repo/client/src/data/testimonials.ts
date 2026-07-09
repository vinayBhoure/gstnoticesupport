import type { TestimonialItem, TestimonialTab, TestimonialTabId } from './types';

export const TESTIMONIAL_TABS: TestimonialTab[] = [
  { id: 'adv', label: 'Advocates' },
  { id: 'biz', label: 'Business Owners' },
];

export const TESTIMONIALS: Record<TestimonialTabId, TestimonialItem[]> = {
  adv: [
    { quote: 'Their grounds of appeal for an APL-01 were thoroughly researched with relevant case law. Saved me hours of drafting on a tight deadline.', business: 'Sheikh Legal Associates', name: 'Adv. Imran Sheikh', meta: 'Tax Advocate · Hyderabad' },
    { quote: 'Professional coordination and prompt filing before the Commissioner (Appeals). The demand was reduced substantially for my client.', business: 'Rao & Partners', name: 'Adv. Lakshmi Rao', meta: 'Advocate, High Court · Bengaluru' },
  ],
  biz: [
    { quote: 'Got a scary DRC-01 for ₹8.4L. They explained it in plain language, replied within 48 hours, and it was accepted with no penalty.', business: 'Mehta Textiles', name: 'Rohit Mehta', meta: 'Proprietor · Surat' },
    { quote: 'First time I received a GST notice and panicked. Fixed fee, no surprises, and they kept me updated at every step on WhatsApp.', business: 'Crafted Home', name: 'Fatima Qureshi', meta: 'Founder · Jaipur' },
  ],
};
