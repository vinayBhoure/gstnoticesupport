import type { Metadata } from 'next';
import Link from 'next/link';
import { NOT_FOUND } from '@/data/common';

export const metadata: Metadata = {
  title: NOT_FOUND.metaTitle,
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
          {NOT_FOUND.code}
        </div>
        <h1 style={{ fontSize: '28px', color: 'var(--primary-navy)', marginBottom: '16px' }}>
          {NOT_FOUND.heading}
        </h1>
        <p style={{
          fontSize: '17px',
          color: 'var(--neutral-600)',
          lineHeight: 1.65,
          marginBottom: '36px',
        }}>
          {NOT_FOUND.body}
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" href={NOT_FOUND.homeCta.href}>{NOT_FOUND.homeCta.label}</Link>
          <Link className="btn btn-secondary" href={NOT_FOUND.contactCta.href}>{NOT_FOUND.contactCta.label}</Link>
        </div>
        <div style={{ marginTop: '40px', fontSize: '14px', color: 'var(--neutral-600)' }}>
          {NOT_FOUND.servicesPrompt}{' '}
          <Link href={NOT_FOUND.servicesCta.href} style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
            {NOT_FOUND.servicesCta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
