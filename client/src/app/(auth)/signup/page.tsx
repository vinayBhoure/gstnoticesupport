import type { Metadata } from 'next';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { SignupForm } from './SignupForm';

export const metadata: Metadata = {
  title: 'Create Account — GST Notice Support',
  description: 'Sign up for GST Notice Support to get expert help with your GST notices and appeals.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthCardShell
      title="Create your account"
      subtitle="Get expert GST litigation help in 24 hours"
    >
      <SignupForm />
    </AuthCardShell>
  );
}
