import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Set a new password — GST Notice Support',
  description: 'Enter your reset code and choose a new password.',
  robots: { index: false, follow: false },
};

// The reset email links to /reset-password?uid=<userId> (server notification.service).
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string }>;
}) {
  const { uid } = await searchParams;
  if (!uid) redirect('/forgot-password');
  return <ResetPasswordForm userId={uid} />;
}
