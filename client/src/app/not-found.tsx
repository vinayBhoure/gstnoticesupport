import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Page Not Found | GST Notice Support',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 76px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '48px 20px',
      background: 'var(--neutral-50)',
    }}>
      <div style={{ maxWidth: '480px' }}>
        <div style={{
          fontSize: '72px',
          fontWeight: 700,
          color: 'var(--primary-navy)',
          lineHeight: 1,
          marginBottom: '16px',
          fontFamily: 'var(--font-inter, Inter, sans-serif)',
        }}>
          404
        </div>
        <h1 style={{ fontSize: '28px', color: 'var(--primary-navy)', marginBottom: '16px' }}>
          Page Not Found
        </h1>
        <p style={{
          fontSize: '17px',
          color: 'var(--neutral-600)',
          lineHeight: 1.65,
          marginBottom: '36px',
        }}>
          The page you are looking for may have been moved or does not exist.
          Try one of the links below.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" href="/">Go to Homepage</Link>
          <Link className="btn btn-secondary" href="/contact">Contact Us</Link>
        </div>
        <div style={{ marginTop: '40px', fontSize: '14px', color: 'var(--neutral-600)' }}>
          Looking for a specific service?{' '}
          <Link href="/pricing" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
            View all services →
          </Link>
        </div>
      </div>
    </div>
  );
}
