import type { Metadata } from 'next';
import { redirectIfAuthenticated } from '@/lib/auth/session';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Log in — GST Notice Support',
  description: 'Log in to track and manage your GST notice responses.',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm />;
}
