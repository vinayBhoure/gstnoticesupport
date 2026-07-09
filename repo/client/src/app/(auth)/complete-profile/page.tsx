import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { CompleteProfileForm } from './CompleteProfileForm';

export const metadata: Metadata = {
  title: 'Complete your profile — GST Notice Support',
  description: 'Add your name and phone number to finish setting up your account.',
  robots: { index: false, follow: false },
};

export default async function CompleteProfilePage() {
  const user = await requireUser();
  // Profile is a one-time step (D67): a non-null phone means it is already done.
  if (user.phone) redirect('/dashboard');
  return <CompleteProfileForm defaultName={user.name} />;
}
