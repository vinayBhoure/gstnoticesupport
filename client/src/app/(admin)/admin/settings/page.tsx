import type { Metadata } from 'next';
import { Building2 } from 'lucide-react';
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ORG, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Admin · Settings — GST Notice Support',
  robots: { index: false, follow: false },
};

// Admin Settings per resources/ui/Admin Settings.html — change password +
// read-only business information (managed by configuration, lib/site.ts).
export default function AdminSettingsPage() {
  const address = `${ORG.address.street}, ${ORG.address.locality} — ${ORG.address.postalCode}, ${ORG.address.region}, India`;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Breadcrumb items={[{ label: 'Admin', href: '/admin' }]} current="Settings" />

      <div className="page-head" style={{ display: 'block', marginBottom: 32 }}>
        <h1>Settings</h1>
      </div>

      <ChangePasswordForm />

      <div
        className="a-card"
        role="region"
        aria-labelledby="bizHeading"
        style={{ padding: 28, marginTop: 24 }}
      >
        <div className="card-head" style={{ marginBottom: 8 }}>
          <Building2 className="ic" aria-hidden />
          <h2 id="bizHeading">Business Information</h2>
        </div>
        <p className="card-note" style={{ marginBottom: 24 }}>
          Read-only — managed by configuration.
        </p>

        <dl className="biz-grid">
          <div>
            <dt>Legal Name</dt>
            <dd>{ORG.legalName}</dd>
          </div>
          <div>
            <dt>Brand</dt>
            <dd>{SITE_NAME}</dd>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <dt>Registered Office</dt>
            <dd>{address}</dd>
          </div>
          <div>
            <dt>Support Email</dt>
            <dd>{ORG.email}</dd>
          </div>
          <div>
            <dt>Phone / WhatsApp</dt>
            <dd className="mono">{ORG.phone}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
