import type { Metadata } from 'next';
import { NewBookingWizard } from './NewBookingWizard';

export const metadata: Metadata = {
  title: 'Start a service — GST Notice Support',
  robots: { index: false, follow: false },
};

// Auth is enforced by the (dashboard) layout's requireUser() gate.
export default function NewBookingPage() {
  return <NewBookingWizard />;
}
