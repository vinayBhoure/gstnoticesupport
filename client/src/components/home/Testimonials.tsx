'use client';

import { useState, useCallback } from 'react';
import styles from '@/app/(public)/page.module.css';

type Tab = 'ca' | 'adv' | 'biz';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ca', label: 'Chartered Accountants' },
  { id: 'adv', label: 'Advocates' },
  { id: 'biz', label: 'Business Owners' },
];

const TESTIMONIALS: Record<Tab, { quote: string; name: string; meta: string }[]> = {
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

export function Testimonials() {
  const [active, setActive] = useState<Tab>('ca');

  const selectTab = useCallback((id: Tab) => setActive(id), []);

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = TABS[(idx + dir + TABS.length) % TABS.length];
      setActive(next.id);
    }
  };

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="Testimonials by client type">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            aria-selected={active === t.id}
            tabIndex={active === t.id ? 0 : -1}
            className={`${styles.tab}${active === t.id ? ` ${styles.tabActive}` : ''}`}
            onClick={() => selectTab(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          className={active === t.id ? styles.tpanelActive : styles.tpanel}
          hidden={active !== t.id}
        >
          <div className={styles.tscroll} role="group" aria-label={`${t.label} testimonials`} tabIndex={0}>
            {TESTIMONIALS[t.id].map((tm) => (
              <div key={tm.name} className={`card card-elev ${styles.tcard}`}>
                <div className={styles.qm}>&ldquo;</div>
                <p className={styles.quote}>{tm.quote}</p>
                <div className={styles.div} />
                <div className={styles.who}>
                  <div className={styles.nm}>{tm.name}</div>
                  <div className={styles.meta}>{tm.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
