'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import styles from '@/app/(public)/page.module.css';

const FAQS = [
  { q: 'Is my GST data safe with you?', a: 'Yes. Every document you upload is encrypted in transit and at rest, stored confidentially, and never shared with third parties. Only the professional assigned to your case can access your files.' },
  { q: 'How quickly will you respond to my notice?', a: (<>We acknowledge every case within 24 hours and prepare your draft response within 48 hours of receiving your documents. <Link href="/pricing">Upload your notice</Link> to start the clock.</>) },
  { q: 'What documents do I need to upload?', a: 'At minimum, the notice itself (PDF). Depending on the matter we may request relevant returns (GSTR-1, 3B), invoices, or reconciliation statements — your assigned professional will give you a precise checklist.' },
  { q: 'Do your experts appear before GST officers?', a: 'Yes. Our Bar Council-enrolled Advocates and CAs can represent you in personal hearings and before appellate authorities where required, in addition to drafting and filing your response.' },
  { q: 'What is your fee structure?', a: (<>Fixed professional fees, quoted upfront per service — ₹2,999 for ASMT-10, ₹5,999 for SCN reply, ₹9,999 for Commissioner Appeal, ₹14,999 for GSTAT Appeal. Government pre-deposits, where applicable, are paid separately to the GST portal. <Link href="/pricing">See full pricing</Link>.</>) },
  { q: 'Can I track my case progress?', a: 'Yes. You\'ll receive a case reference number after upload and can track each stage — review, draft, confirmation, filing — from your dashboard, with updates also sent on WhatsApp.' },
  { q: 'Do you handle pan-India GST matters?', a: 'Yes. GST is a national law and we handle notices and appeals across all states and union territories, regardless of where your business is registered.' },
  { q: 'What if my case is not resolved in our favour?', a: 'Outcomes depend on the facts and the authority\'s decision, so we never promise a guaranteed result. If an order goes against you, we\'ll advise on the next remedy — such as a Commissioner or GSTAT appeal — and what it involves.' },
];

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

  return (
    <>
      <div className={styles.faqSearch}>
        <Search className={styles.ic} />
        <input
          type="text"
          className="input"
          placeholder="Search your question…"
          aria-label="Search frequently asked questions"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className={styles.faqList}>
        {filtered.map((item, listIdx) => {
          const isOpen = openIdx === item.originalIdx;
          const bodyEl = bodyRefs.current[listIdx];
          const maxHeight = isOpen && bodyEl ? `${bodyEl.scrollHeight}px` : '0';

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
                  maxHeight,
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
          No questions match your search. Try a different term or{' '}
          <RequestCallbackButton style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>request a callback</RequestCallbackButton>.
        </div>
      )}
    </>
  );
}
