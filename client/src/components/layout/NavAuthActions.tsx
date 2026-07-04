'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { NAV_LABELS } from '@/data/common';

type NavAuthActionsProps = {
  variant: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

// Marketing-header CTA slot: cosmetic only (see useCurrentUser for why this is
// safe as a client-side check). Defaults to the logged-out state while the
// query is pending so anonymous visitors — the vast majority of traffic —
// never see a layout flash toward a state they don't have.
export function NavAuthActions({ variant, onNavigate }: NavAuthActionsProps) {
  const { data: user } = useCurrentUser();

  const ctaClass = variant === 'desktop' ? 'nav-cta' : 'btn-block';
  const dashboardHref = user?.role === 'admin' ? '/admin' : '/dashboard';

  if (user) {
    return (
      <Link className={`btn btn-primary ${ctaClass}`} href={dashboardHref} onClick={onNavigate}>
        {NAV_LABELS.dashboard.label}
      </Link>
    );
  }

  return (
    <>
      <Link
        className={`btn btn-secondary ${ctaClass}`}
        href={NAV_LABELS.login.href}
        onClick={onNavigate}
      >
        {NAV_LABELS.login.label}
      </Link>
      <Link className={`btn btn-primary ${ctaClass}`} href={NAV_LABELS.signup.href} onClick={onNavigate}>
        {NAV_LABELS.signup.label}
      </Link>
    </>
  );
}
