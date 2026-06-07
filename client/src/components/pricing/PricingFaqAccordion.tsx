'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import styles from '@/app/(public)/pricing/pricing.module.css';

type FaqItem = {
  id: string;
  question: string;
  answer: React.ReactNode;
};

const faqs: FaqItem[] = [
  {
    id: 'faq1',
    question: 'Is the fee per notice or per case?',
    answer: (
      <p>
        Per service booking. Each notice type is a separate service — an SCN reply is one booking, a
        Commissioner Appeal arising from the same matter is a separate booking. We do not bundle services.
      </p>
    ),
  },
  {
    id: 'faq2',
    question: 'What does the pre-deposit mean?',
    answer: (
      <>
        <p>
          A statutory pre-deposit is a mandatory government payment you must make directly to the GST portal
          before an appeal is admitted. It is <strong>not our fee</strong> — it is paid to the government,
          not to us, and is not processed through this platform.
        </p>
        <p style={{ marginTop: '12px' }}>
          For a <strong>Commissioner Appeal (APL-01)</strong>,{' '}
          <span className="mono">Section 107(6) CGST Act</span> requires 10% of the disputed tax. For a{' '}
          <strong>GSTAT Appeal (APL-05)</strong>,{' '}
          <span className="mono">Section 112(8) CGST Act</span> requires 20%. We guide you through both
          processes as part of our service.
        </p>
      </>
    ),
  },
  {
    id: 'faq3',
    question: 'When exactly do I pay?',
    answer: (
      <p>
        After you upload your documents and our team prepares a <strong>partial draft preview</strong>. You
        review the preview first. Payment unlocks the complete draft and portal filing support. You are never
        asked to pay before seeing that work has begun.
      </p>
    ),
  },
  {
    id: 'faq4',
    question: 'What payment methods are accepted?',
    answer: (
      <p>
        UPI, Net Banking, Credit Card, and Debit Card — processed securely via <strong>Razorpay</strong>. No
        additional charges on UPI or Net Banking. Card payments may carry standard gateway fees.
      </p>
    ),
  },
  {
    id: 'faq5',
    question: 'Is there a consultation before paying?',
    answer: (
      <p>
        Yes. You can request a callback before booking any service. One of our CAs or Advocates will call to
        understand your notice and confirm the right service for your situation.{' '}
        <RequestCallbackButton style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'var(--accent-green)', fontWeight: 600 }}>
          Request a callback →
        </RequestCallbackButton>
      </p>
    ),
  },
];

export function PricingFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);

  function toggle(index: number) {
    setOpenIndex(prev => (prev === index ? null : index));
  }

  return (
    <div className={styles.faqList} role="list">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        const bodyEl = bodyRefs.current[i];
        const maxHeight = isOpen && bodyEl ? `${bodyEl.scrollHeight}px` : '0';

        return (
          <div key={faq.id} className={styles.faqItem} role="listitem">
            <button
              className={styles.faqTrigger}
              aria-expanded={isOpen}
              aria-controls={faq.id}
              onClick={() => toggle(i)}
            >
              <span className={styles.q}>{faq.question}</span>
              <ChevronDown className={styles.chev} aria-hidden="true" />
            </button>
            <div
              className={styles.faqBody}
              id={faq.id}
              role="region"
              style={{ maxHeight }}
              ref={el => { bodyRefs.current[i] = el; }}
            >
              <div className={styles.faqBodyInner}>{faq.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
