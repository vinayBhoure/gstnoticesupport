import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { VerifyOtpForm } from './VerifyOtpForm';

export const metadata: Metadata = {
  title: 'Verify your email — GST Notice Support',
  description: 'Enter the 6-digit code we sent to your email.',
  robots: { index: false, follow: false },
};

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  if (!userId) redirect('/signup');

  // Nothing to verify for an already-verified session — send them on rather than showing
  // a code field that can only ever answer "already verified" (spec §4).
  const user = await getCurrentUser();
  if (user?.emailVerified) {
    redirect(user.role !== 'admin' && !user.phone ? '/complete-profile' : '/dashboard');
  }

  return <VerifyOtpForm userId={userId} />;
}
