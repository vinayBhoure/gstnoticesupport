import type { Metadata } from 'next';
import { redirectIfAuthenticated } from '@/lib/auth/session';
import { SignupForm } from './SignupForm';

export const metadata: Metadata = {
  title: 'Create your account — GST Notice Support',
  description: 'Create an account to upload your GST notice and get expert help.',
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  await redirectIfAuthenticated();
  return <SignupForm />;
}
