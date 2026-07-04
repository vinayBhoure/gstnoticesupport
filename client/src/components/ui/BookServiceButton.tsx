'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const BOOK_HREF = '/dashboard/bookings/new';

type BookServiceButtonProps = {
  className?: string;
  children: React.ReactNode;
};

// Logged-in users go straight to the booking wizard; guests are sent to login
// with a returnTo so they land back on the wizard after authenticating.
// Uses the same cosmetic-only auth check as the nav CTA (useCurrentUser) —
// requireUser() in the (dashboard) layout is still the real access gate.
export function BookServiceButton({ className, children }: BookServiceButtonProps) {
  const { data: user, isLoading } = useCurrentUser();
  const href = user
    ? BOOK_HREF
    : `/login?returnTo=${encodeURIComponent(BOOK_HREF)}`;

  return (
    <Link className={className} href={href} aria-busy={isLoading}>
      {children}
    </Link>
  );
}
