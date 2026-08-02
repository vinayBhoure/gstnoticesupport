import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { HelpSupportForm } from '@/components/support/HelpSupportForm';

export const metadata: Metadata = {
  title: 'Help & Support — GST Notice Support',
  robots: { index: false, follow: false },
};

// Help & Support — replaces the old sidebar redirect to the public Contact
// page (D-help-support). Sends via the same Resend flow as Contact, but with
// user identity resolved from the session instead of a public form.
export default function HelpPage() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }]} current="Help & Support" />

      <div className="page-head" style={{ display: 'block', marginBottom: 24 }}>
        <h1>Help & Support</h1>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Send a message</h2>
            <div className="ph-sub">We typically respond within 24 hours on working days.</div>
          </div>
        </div>
        <div className="panel-body">
          <HelpSupportForm />
        </div>
      </section>
    </>
  );
}
