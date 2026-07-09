'use client';

import { useRouter } from 'next/navigation';

type RowLinkProps = {
  href: string;
  ariaLabel: string;
  children: React.ReactNode;
};

// Clickable/keyboard-activatable table row (admin tables navigate per row —
// resources/ui/Admin Bookings.html). Cells are server-rendered children.
export function RowLink({ href, ariaLabel, children }: RowLinkProps) {
  const router = useRouter();
  const go = () => router.push(href);
  return (
    <tr
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      }}
    >
      {children}
    </tr>
  );
}
