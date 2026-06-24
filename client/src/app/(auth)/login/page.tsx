import type { Metadata } from 'next';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — GST Notice Support',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCardShell
      title="Welcome back"
      subtitle="Sign in to your account to manage your GST notices"
    >
      <LoginForm />
    </AuthCardShell>
  );
}
