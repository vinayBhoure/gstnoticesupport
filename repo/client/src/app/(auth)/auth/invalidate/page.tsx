import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { authApi } from '@/lib/api/auth';

export const metadata: Metadata = {
  title: 'Session security — GST Notice Support',
  robots: { index: false, follow: false },
};

// "This wasn't me" link target. SSR — calls the backend invalidate endpoint and
// renders the outcome. Never echoes the raw JSON response (no token/PII leak).
export default async function InvalidateSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  let ok = false;
  if (ref) {
    try {
      await authApi.invalidate(ref);
      ok = true;
    } catch {
      ok = false;
    }
  }

  return (
    <AuthCardShell
      title={ok ? 'Session invalidated' : 'Link not valid'}
      subtitle={
        ok
          ? 'That session has been signed out. If this was you, no further action is needed.'
          : 'This security link is invalid, expired, or has already been used.'
      }
      footer={
        <Link href="/login" className="font-semibold text-[var(--accent-green)] underline underline-offset-2">
          Go to log in
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        {ok ? (
          <ShieldCheck size={40} className="text-[var(--accent-green)]" />
        ) : (
          <ShieldAlert size={40} className="text-[var(--warning-amber)]" />
        )}
        <p className="text-sm text-[var(--neutral-600)]">
          {ok
            ? 'For your security, we recommend changing your password if you did not sign in.'
            : 'If you are concerned about your account, log in and change your password.'}
        </p>
      </div>
    </AuthCardShell>
  );
}
