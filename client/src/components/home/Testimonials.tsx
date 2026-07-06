'use client';

import { useState, useCallback, useRef } from 'react';
import styles from '@/app/(public)/page.module.css';
import { TESTIMONIAL_TABS as TABS, TESTIMONIALS } from '@/data/testimonials';
import type { TestimonialTabId as Tab } from '@/data/types';

export function Testimonials() {
  const [active, setActive] = useState<Tab>('biz');
  const [activeDot, setActiveDot] = useState(0);
  const scrollRefs = useRef<Record<Tab, HTMLDivElement | null>>({ adv: null, biz: null });

  const selectTab = useCallback((id: Tab) => {
    setActive(id);
    setActiveDot(0);
  }, []);

  const onScroll = (id: Tab) => {
    const scroller = scrollRefs.current[id];
    if (!scroller) return;
    const cards = Array.from(scroller.children) as HTMLElement[];
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0, bd = Infinity;
    cards.forEach((card, i) => {
      const c = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < bd) { bd = d; best = i; }
    });
    setActiveDot(best);
  };

  const goToCard = (id: Tab, i: number) => {
    const scroller = scrollRefs.current[id];
    const card = scroller?.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

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
          <div
            className={styles.tscroll}
            role="group"
            aria-label={`${t.label} testimonials`}
            tabIndex={0}
            ref={el => { scrollRefs.current[t.id] = el; }}
            onScroll={() => onScroll(t.id)}
          >
            {TESTIMONIALS[t.id].map((tm) => (
              <div key={tm.name} className={`card card-elev ${styles.tcard}`}>
                <div className={styles.biz}>{tm.business}</div>
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
          <div className={`scroll-dots ${styles.tdots}`} aria-hidden="true">
            {TESTIMONIALS[t.id].map((tm, i) => (
              <button
                key={tm.name}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={active === t.id && activeDot === i ? 'true' : 'false'}
                onClick={() => goToCard(t.id, i)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
