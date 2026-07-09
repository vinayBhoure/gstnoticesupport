import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { requireUser } from '@/lib/auth/session';
import { bookingApi } from '@/lib/api/booking';
import { SettingsNav } from './SettingsNav';
import { AccountSettingsForm } from './AccountSettingsForm';
import { ChangePasswordPanel } from './ChangePasswordPanel';
import { CloseAccountSection } from './CloseAccountSection';
import type { BookingStatus } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Settings — GST Notice Support',
  robots: { index: false, follow: false },
};

const ACTIVE_STATUSES: BookingStatus[] = ['document_upload', 'in_review', 'draft_ready', 'filing'];

// Settings per resources/ui/Settings.html, trimmed to the Phase-2 scope (HLD §19):
// Account (name/mobile/marketing), Security (change password), Danger zone (close
// account). 2FA, sessions/devices, billing/GSTIN, data export and language/timezone
// are out of Phase-2 scope and omitted rather than faked (My Profile precedent).
export default async function SettingsPage() {
  const user = await requireUser();
  const cookieHeader = (await cookies()).toString();
  const bookings = await bookingApi.list(cookieHeader);
  const hasActiveBookings = bookings.some((b) => ACTIVE_STATUSES.includes(b.status));

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="sep" aria-hidden>
          ›
        </span>
        <span className="current">Settings</span>
      </nav>

      <div className="page-head" style={{ display: 'block', marginBottom: 6 }}>
        <h1>Settings</h1>
      </div>
      <p className="settings-sub">
        Manage your account, security, and how we communicate about your cases.
      </p>

      <div className="settings-grid">
        <SettingsNav />

        <div className="settings-main">
          <section className="panel" id="account">
            <div className="panel-head">
              <div>
                <h2>Account</h2>
                <div className="ph-sub">
                  Your contact details and marketing preferences.
                </div>
              </div>
            </div>
            <div className="panel-body">
              <AccountSettingsForm
                name={user.name}
                email={user.email}
                phone={user.phone}
                allowPromotions={user.allowPromotions}
              />
            </div>
          </section>

          <section className="panel" id="security">
            <div className="panel-head">
              <div>
                <h2>Security</h2>
                <div className="ph-sub">Change the password you use to sign in.</div>
              </div>
            </div>
            <div className="panel-body">
              <ChangePasswordPanel />
            </div>
          </section>

          <section className="panel" id="danger">
            <div className="panel-head">
              <div>
                <h2>Danger zone</h2>
                <div className="ph-sub">Irreversible operations. Read carefully.</div>
              </div>
            </div>
            <div className="panel-body">
              <CloseAccountSection email={user.email} hasActiveBookings={hasActiveBookings} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
