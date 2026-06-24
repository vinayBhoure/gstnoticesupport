import type { Metadata } from 'next';
import { AuthCardShell } from '@/components/layout/AuthCardShell';
import { CompleteProfileForm } from './CompleteProfileForm';

export const metadata: Metadata = {
  title: 'Complete Your Profile — GST Notice Support',
  robots: { index: false, follow: false },
};

export default function CompleteProfilePage() {
  return (
    <AuthCardShell
      title="Complete your profile"
      subtitle="One last step — this helps us reach you about your cases."
    >
      <CompleteProfileForm />
    </AuthCardShell>
  );
}
