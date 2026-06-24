import type { Metadata } from 'next';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { authApi } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';

export const metadata: Metadata = {
  title: 'Session Invalidated — GST Notice Support',
  robots: { index: false, follow: false },
};

type InvalidatePageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function InvalidatePage({ searchParams }: InvalidatePageProps) {
  const { ref } = await searchParams;

  if (!ref) {
    return (
      <AuthCardShell title="Invalid link">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldAlert size={40} className="text-[var(--warning-amber)]" />
          <p className="text-sm text-[var(--neutral-600)]">
            This link is invalid or has already been used.
          </p>
          <a href="/" className="btn btn-secondary">
            Back to home
          </a>
        </div>
      </AuthCardShell>
    );
  }

  let success = false;
  let errorMessage = '';

  try {
    await authApi.invalidate(ref);
    success = true;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Something went wrong. Please try again.';
    }
  }

  if (success) {
    return (
      <AuthCardShell title="Session secured">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldCheck size={40} className="text-[var(--accent-green)]" />
          <p className="text-sm text-[var(--neutral-600)]">
            The suspicious session has been invalidated. Your account is secure.
          </p>
          <p className="text-sm text-[var(--neutral-600)]">
            We recommend changing your password if you think your account was compromised.
          </p>
          <a href="/forgot-password" className="btn btn-primary">
            Change password
          </a>
          <a href="/login" className="btn-tertiary">
            Sign in to your account
          </a>
        </div>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell title="Link expired">
      <div className="flex flex-col items-center gap-3 text-center">
        <ShieldAlert size={40} className="text-[var(--warning-amber)]" />
        <p className="text-sm text-[var(--neutral-600)]">{errorMessage}</p>
        <p className="text-xs text-[var(--neutral-600)]">
          If you&apos;re concerned about your account, please change your password.
        </p>
        <a href="/forgot-password" className="btn btn-primary">
          Reset password
        </a>
      </div>
    </AuthCardShell>
  );
}
