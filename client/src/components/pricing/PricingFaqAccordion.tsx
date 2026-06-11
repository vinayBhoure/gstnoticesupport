'use client';

import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '@/app/(public)/pricing/pricing.module.css';
import { PRICING_FAQS as faqs } from '@/data/pricing-faq';

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
