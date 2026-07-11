'use client';

import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import styles from '@/app/(public)/page.module.css';
import { HOME_FAQS as FAQS, HOME_FAQ_UI } from '@/data/home-faq';

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filtered = useMemo(() => {
    if (!query.trim()) return FAQS.map((f, i) => ({ ...f, originalIdx: i }));
    const q = query.toLowerCase();
    return FAQS
      .map((f, i) => ({ ...f, originalIdx: i }))
      .filter(f => f.q.toLowerCase().includes(q) || (typeof f.a === 'string' && f.a.toLowerCase().includes(q)));
  }, [query]);

  const toggle = (originalIdx: number) => {
    setOpenIdx(prev => (prev === originalIdx ? null : originalIdx));
  };

  // Reading ref.current during render is unsafe under concurrent rendering
  // (react-hooks/refs) — the measured scrollHeight is applied imperatively
  // here instead, after commit but before paint, so the max-height
  // transition still animates with no visible flash.
  useLayoutEffect(() => {
    filtered.forEach((item, listIdx) => {
      const el = bodyRefs.current[listIdx];
      if (!el) return;
      el.style.maxHeight = openIdx === item.originalIdx ? `${el.scrollHeight}px` : '0';
    });
  }, [openIdx, filtered]);

  return (
    <>
      <div className={styles.faqSearch}>
        <Search className={styles.ic} />
        <input
          type="text"
          className="input"
          placeholder={HOME_FAQ_UI.searchPlaceholder}
          aria-label={HOME_FAQ_UI.searchAriaLabel}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className={styles.faqList}>
        {filtered.map((item, listIdx) => {
          const isOpen = openIdx === item.originalIdx;

          return (
            <div key={item.originalIdx} className={styles.faqItem}>
              <button
                className={styles.faqQ}
                aria-expanded={isOpen}
                onClick={() => toggle(item.originalIdx)}
              >
                {item.q}
                <ChevronDown className={`${styles.chev}${isOpen ? ` ${styles.chevOpen}` : ''}`} />
              </button>
              <div
                className={styles.faqA}
                style={{
                  overflow: 'hidden',
                  transition: 'max-height 0.28s cubic-bezier(0.4,0,0.2,1)',
                }}
                ref={el => { bodyRefs.current[listIdx] = el; }}
              >
                <div style={{ padding: '0 4px 24px' }}>{item.a}</div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className={styles.faqEmpty}>
          {HOME_FAQ_UI.empty.prefix}{' '}
          <RequestCallbackButton style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>{HOME_FAQ_UI.empty.ctaLabel}</RequestCallbackButton>.
        </div>
      )}
    </>
  );
}
