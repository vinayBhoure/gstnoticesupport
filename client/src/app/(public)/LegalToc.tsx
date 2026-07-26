'use client';

import { useEffect, useRef } from 'react';
import styles from './legal.module.css';

type LegalTocProps = {
  items: { href: string; label: string }[];
};

// Sticky "On this page" nav with scroll-spy active-section highlighting
// (resources/ui's legal pages — issues #11/#12). Client leaf only for the
// IntersectionObserver; the page itself stays a static Server Component.
export function LegalToc({ items }: LegalTocProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const links = navRef.current?.querySelectorAll('a');
    if (!links || links.length === 0) return;

    const sections = items
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => {
            a.classList.toggle(styles.active, a.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: '-20% 0% -70% 0%' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <aside className={styles.toc} ref={navRef}>
      <h6>On this page</h6>
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </aside>
  );
}
