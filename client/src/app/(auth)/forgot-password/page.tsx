import type { Metadata } from 'next';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password — GST Notice Support',
  robots: { index: false, follow: false },
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{ userId?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { userId } = await searchParams;
  const isResetStep = Boolean(userId);

  return (
    <AuthCardShell
      title={isResetStep ? 'Set new password' : 'Forgot password?'}
      subtitle={
        isResetStep
          ? 'Enter the code from your email and choose a new password.'
          : 'Enter your email and we\'ll send you a reset code.'
      }
    >
      <ForgotPasswordForm prefillUserId={userId} />
    </AuthCardShell>
  );
}
