import type { Metadata } from 'next';
import { redirectIfAuthenticated } from '@/lib/auth/session';
import { sanitizeReturnTo } from '@/lib/auth/return-to';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Log in — GST Notice Support',
  description: 'Log in to track and manage your GST notice responses.',
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { returnTo } = await searchParams;
  const safeReturnTo = sanitizeReturnTo(returnTo);
  await redirectIfAuthenticated(safeReturnTo);
  return <LoginForm returnTo={safeReturnTo} />;
}
