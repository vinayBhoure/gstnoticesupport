'use client';

import { useEffect, useState } from 'react';
import styles from './RotatingHeadline.module.css';

interface RotatingHeadlineProps {
  lead: string;
  phrases: readonly string[];
  intervalMs?: number;
}

export function RotatingHeadline({ lead, phrases, intervalMs = 3000 }: RotatingHeadlineProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [phrases.length, intervalMs]);

  const exitIndex = (index - 1 + phrases.length) % phrases.length;

  return (
    <h1>
      {lead}{' '}
      <span className={styles.rotator}>
        {phrases.map((phrase, i) => {
          const state = i === index ? 'active' : i === exitIndex ? 'exit' : 'idle';
          return (
            <span
              key={phrase}
              className={styles.phrase}
              data-state={state}
              aria-hidden={state === 'active' ? undefined : true}
            >
              {phrase}
            </span>
          );
        })}
      </span>
    </h1>
  );
}
