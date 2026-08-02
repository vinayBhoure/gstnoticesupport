import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { HelpSupportForm } from '@/components/support/HelpSupportForm';

export const metadata: Metadata = {
  title: 'Admin · Help & Support — GST Notice Support',
  robots: { index: false, follow: false },
};

// Admin mirror of /dashboard/help — same form, same /api/support route, same
// email flow. Kept identical across both surfaces rather than admin-specific.
export default function AdminHelpPage() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }]} current="Help & Support" />

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
    </div>
  );
}
