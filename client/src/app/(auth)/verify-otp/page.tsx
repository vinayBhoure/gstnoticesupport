import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
  return <VerifyOtpForm userId={userId} />;
}
