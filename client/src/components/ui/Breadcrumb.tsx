import { Fragment } from 'react';
import Link from 'next/link';

export type BreadcrumbItem = { label: string; href: string };

type BreadcrumbProps = {
  // Preceding, clickable items in order (e.g. Dashboard → Booking).
  items: BreadcrumbItem[];
  // The current page — rendered last, not a link (issue #7: current page must
  // be clearly indicated, not clickable).
  current: string;
};

// One breadcrumb style used across the whole app (issue #7) — replaces the
// per-page inline `<nav className="breadcrumb">` copies.
export function Breadcrumb({ items, current }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item) => (
        <Fragment key={item.href}>
          <Link href={item.href}>{item.label}</Link>
          <span className="sep" aria-hidden>
            ›
          </span>
        </Fragment>
      ))}
      <span className="current" aria-current="page">
        {current}
      </span>
    </nav>
  );
}
