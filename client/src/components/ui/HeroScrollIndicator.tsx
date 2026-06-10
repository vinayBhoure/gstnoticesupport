import { ChevronDown } from 'lucide-react';
import styles from './HeroScrollIndicator.module.css';

export function HeroScrollIndicator() {
  return (
    <div className={styles.indicator} aria-hidden="true">
      <ChevronDown size={22} />
    </div>
  );
}
