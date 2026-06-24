import type { Metadata } from 'next';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { VerifyOtpForm } from './VerifyOtpForm';

export const metadata: Metadata = {
  title: 'Verify Email — GST Notice Support',
  robots: { index: false, follow: false },
};

type VerifyOtpPageProps = {
  searchParams: Promise<{ userId?: string }>;
};

export default async function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const { userId } = await searchParams;

  if (!userId) {
    return (
      <AuthCardShell title="Invalid link">
        <p className="text-center text-[var(--neutral-600)]">
          This link is invalid or has expired.{' '}
          <a href="/signup" className="text-[var(--accent-green)] font-medium">
            Sign up again
          </a>
        </p>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell
      title="Check your email"
      subtitle="We sent a 6-digit code to your email. Enter it below."
    >
      <VerifyOtpForm userId={userId} />
    </AuthCardShell>
  );
}
