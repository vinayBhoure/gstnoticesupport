'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '@/app/(public)/pricing/pricing.module.css';
import { PRICING_FAQS as faqs } from '@/data/pricing-faq';

export function PricingFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);

  function toggle(index: number) {
    setOpenIndex(prev => (prev === index ? null : index));
  }

  // Reading ref.current during render is unsafe under concurrent rendering
  // (react-hooks/refs) — the measured scrollHeight is applied imperatively
  // here instead, after commit but before paint, so the max-height
  // transition still animates with no visible flash.
  useLayoutEffect(() => {
    faqs.forEach((faq, i) => {
      const el = bodyRefs.current[i];
      if (!el) return;
      el.style.maxHeight = openIndex === i ? `${el.scrollHeight}px` : '0';
    });
  }, [openIndex]);

  return (
    <div className={styles.faqList} role="list">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;

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
