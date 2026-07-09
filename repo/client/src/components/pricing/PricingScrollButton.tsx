'use client';

import { ChevronDown } from 'lucide-react';
import styles from '@/app/(public)/pricing/pricing.module.css';

export function PricingScrollButton() {
  function handleClick() {
    document.getElementById('pricing-table')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <button className={styles.scrollHint} onClick={handleClick} aria-label="Scroll to pricing">
      See all services
      <ChevronDown size={20} />
    </button>
  );
}
