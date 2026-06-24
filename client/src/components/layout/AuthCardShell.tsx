import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, Star } from 'lucide-react';

type AuthCardShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export function AuthCardShell({ children, title, subtitle }: AuthCardShellProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--neutral-50)] px-4 py-12">
      <div className="auth-card">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" aria-label="Back to home">
            <Image
              src="/logo.png"
              alt="GST Notice Support"
              width={160}
              height={40}
              priority
            />
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-[var(--primary-navy)] text-center">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[var(--neutral-600)] text-center">{subtitle}</p>
          )}
        </div>
        {children}
      </div>

      <div className="auth-trust-strip">
        <span>
          <ShieldCheck size={14} className="text-[var(--accent-green)]" />
          Secured by 256-bit SSL
        </span>
        <span>
          <Lock size={14} className="text-[var(--accent-green)]" />
          Data encrypted at rest
        </span>
        <span>
          <Star size={14} className="text-[var(--accent-green)]" />
          Trusted by 500+ clients
        </span>
      </div>
    </main>
  );
}
