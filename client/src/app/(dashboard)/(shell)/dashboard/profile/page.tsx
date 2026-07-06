import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { SERVICE_META } from '@/lib/constants/services';
import type { ServiceType } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'My Profile — GST Notice Support',
  robots: { index: false, follow: false },
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isServiceType(value: string): value is ServiceType {
  return value in SERVICE_META;
}

// My Profile per resources/ui/My Profile.html — read-only (D80/plan C1):
// complete-profile is a one-time step and there is no PATCH /user/profile
// endpoint yet (EP15), so KYC/edit affordances from the prototype are
// omitted rather than faked. Data comes entirely from the already-fetched
// GET /auth/me user object — no extra request.
export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="sep" aria-hidden>
          ›
        </span>
        <span className="current">My Profile</span>
      </nav>

      <div className="page-head" style={{ display: 'block', marginBottom: 24 }}>
        <h1>My Profile</h1>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Identity</h2>
            <div className="ph-sub">Your account details as registered with GST Notice Support.</div>
          </div>
        </div>
        <div className="panel-body">
          <div className="avatar-block">
            <span className="av-lg" aria-hidden>
              {initials(user.name)}
            </span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--primary-navy)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--neutral-600)', marginTop: 3 }}>
                Member since {formatMemberSince(user.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Contact details</h2>
            <div className="ph-sub">Used for account access and service updates.</div>
          </div>
        </div>
        <div className="panel-body">
          <div className="form-row">
            <div className="lbl">
              <div className="ttl">Email</div>
              <div className="desc">Your sign-in email.</div>
            </div>
            <div className="fld">
              <div className="ro-field">
                <span className="v">{user.email}</span>
                {user.emailVerified && (
                  <span className="verify-badge">
                    <Check size={11} aria-hidden />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="lbl">
              <div className="ttl">Mobile</div>
              <div className="desc">Collected during profile completion.</div>
            </div>
            <div className="fld">
              <div className="ro-field">
                <span className={`v${user.phone ? '' : ' muted'}`}>
                  {user.phone ? `+91 ${user.phone}` : 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="lbl">
              <div className="ttl">Interested services</div>
              <div className="desc">Noted from your signup preferences.</div>
            </div>
            <div className="fld">
              {user.interestedServices.length > 0 ? (
                <div className="chips-row">
                  {user.interestedServices.filter(isServiceType).map((service) => (
                    <span key={service} className="chip-ro">
                      {SERVICE_META[service].label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="ro-field">
                  <span className="v muted">None recorded</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="lbl">
              <div className="ttl">Promotional updates</div>
              <div className="desc">Offers and service announcements by email.</div>
            </div>
            <div className="fld">
              <div className="ro-field">
                <span className="v">{user.allowPromotions ? 'Subscribed' : 'Not subscribed'}</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="lbl">
              <div className="ttl">Terms &amp; conditions</div>
              <div className="desc">Accepted at signup.</div>
            </div>
            <div className="fld">
              <div className="ro-field">
                {user.termsAccepted ? (
                  <span className="verify-badge">
                    <Check size={11} aria-hidden />
                    Accepted
                  </span>
                ) : (
                  <span className="v muted">Not recorded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="text-sm text-[var(--neutral-600)]" style={{ textAlign: 'center' }}>
        To update your name, mobile number, or preferences, contact our support team via{' '}
        <Link href="/contact" style={{ color: 'var(--accent-green)', fontWeight: 500 }}>
          our contact page
        </Link>
        .
      </p>
    </>
  );
}
