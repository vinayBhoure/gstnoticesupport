import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { ORG } from '@/lib/site';
import { FOOTER_LABELS, FOOTER_POLICIES } from '@/data/common';

type AuthCardShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  // Footer slot below the card body (e.g. "New here? Create an account").
  footer?: React.ReactNode;
};

// Auth Card Shell (components.md). Full-viewport neutral background, centered
// 440px card with wordmark + heading, slim legal trust strip below. No Navbar,
// no Footer, no entrance animation.
export function AuthCardShell({ title, subtitle, children, footer }: AuthCardShellProps) {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--neutral-50)] pt-5 pb-8 sm:pt-8 sm:pb-12">
      <div className="container">
        <header className="flex items-center justify-between gap-4 mb-6 sm:mb-10">
          <Link href="/" className="flex items-center gap-2.5" aria-label="GST Notice Support home">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="rounded-md border border-[var(--neutral-200)]"
            />
            <span className="font-bold text-[var(--primary-navy)]">
              GST<span className="text-[var(--accent-green)]">Notice</span>Support
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-1 py-2 rounded-[var(--r-btn)] text-sm font-medium text-[var(--neutral-600)] hover:text-[var(--primary-navy)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,139,78,0.3)]"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </header>
      </div>

      <div className="container flex-1 flex flex-col items-center">
        <section className="auth-card" aria-labelledby="auth-heading">
          <div className="flex items-center gap-2.5 mb-6">
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="rounded-md border border-[var(--neutral-200)]"
            />
            <span className="font-bold text-[15px] text-[var(--primary-navy)]">
              GST<span className="text-[var(--accent-green)]">Notice</span>Support
            </span>
          </div>

          <h1 id="auth-heading" className="text-2xl sm:text-[28px] font-bold text-[var(--primary-navy)] leading-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2.5 mb-7 text-[var(--neutral-600)] leading-relaxed">{subtitle}</p>
          ) : (
            <div className="mb-7" />
          )}

          {children}

          {footer && (
            <p className="mt-6 text-center text-sm text-[var(--neutral-600)]">{footer}</p>
          )}
        </section>

        <aside className="auth-trust-strip" aria-label="Legal identity">
          <div className="row">
            <span className="item">
              <ShieldCheck size={14} className="text-[var(--accent-green)]" />
              SSL Secured · 256-bit encryption
            </span>
            <span className="item">{ORG.legalName}</span>
          </div>
          {ORG.gstin && (
            <div className="row">
              <span className="mono">GSTIN: {ORG.gstin}</span>
            </div>
          )}
          <div className="pols">
            {FOOTER_POLICIES.map((policy, index) => (
              <Fragment key={policy.href}>
                {index > 0 && <span aria-hidden>·</span>}
                <Link href={policy.href}>{policy.label}</Link>
              </Fragment>
            ))}
          </div>
          <div className="copy">{FOOTER_LABELS.copyright}</div>
        </aside>
      </div>
    </main>
  );
}
