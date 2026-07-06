import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ArrowLeft, User } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiRequestError } from '@/lib/api/client';
import { DeleteUserCard } from '@/components/admin/DeleteUserCard';
import { SERVICE_META } from '@/lib/constants/services';
import type { AdminUserDetailDTO } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Admin · User Detail — GST Notice Support',
  robots: { index: false, follow: false },
};

function formatMobile(phone: string | null): string {
  if (!phone) return '—';
  const match = phone.match(/^(\d{5})(\d{5})$/);
  return match ? `+91 ${match[1]} ${match[2]}` : phone;
}

// Admin User Detail per resources/ui/Admin User Detail.html — read-only info +
// gated delete.
export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();

  let user: AdminUserDetailDTO;
  try {
    user = await adminApi.getUser(id, cookieHeader);
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }

  const services = user.interestedServices.map((s) => SERVICE_META[s]?.label ?? s).join(', ');

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Link href="/admin/users" className="back-link adm">
        <ArrowLeft className="ic" aria-hidden /> Back to users
      </Link>

      <div className="detail-head" style={{ display: 'block' }}>
        <h1>{user.name}</h1>
      </div>

      <section className="a-card" aria-labelledby="info-h" style={{ marginBottom: 24 }}>
        <h2 id="info-h">
          <User className="ic" aria-hidden /> User Information
        </h2>
        <p className="card-note">Read-only — admin cannot edit user profiles.</p>

        <dl className="info-grid">
          <div>
            <dt>Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Mobile</dt>
            <dd className="mono">{formatMobile(user.phone)}</dd>
          </div>
          <div className="full">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="full">
            <dt>Interested Services</dt>
            <dd className={services ? undefined : 'muted'}>{services || '—'}</dd>
          </div>
        </dl>
      </section>

      <DeleteUserCard
        userId={user.id}
        userEmail={user.email}
        activeBookingsCount={user.activeBookingsCount}
      />
    </div>
  );
}
