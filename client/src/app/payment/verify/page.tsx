import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { verifyQuerySchema } from '@/lib/shared-schemas/payment.schema';
import { PaymentVerifier } from './PaymentVerifier';
import { InvalidLinkState } from './InvalidLinkState';

export const metadata: Metadata = {
  title: 'Verifying payment — GST Notice Support',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Payment Verification per resources/ui/Payment Verification.html — own
// chromeless shell (Zone 4). Dynamic Server Component: shape-validates the
// Razorpay redirect query before ever calling the API — malformed params never
// leave the server round trip and land straight on the invalid-link state.
export default async function PaymentVerifyPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const candidate = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = verifyQuerySchema.safeParse(candidate);

  return (
    <div className="pv-page">
      <div className="pv-wrap">
        <section className="pv-card" aria-labelledby="pvHeading">
          <div className="pv-wordmark" aria-hidden>
            <Image src="/logo.png" alt="" width={32} height={32} className="rounded-md border border-[var(--neutral-200)]" />
            <span className="bn">
              GST<span>Notice</span>Support
            </span>
          </div>

          <div className="pv-state-zone">
            {parsed.success ? <PaymentVerifier query={parsed.data} /> : <InvalidLinkState />}
          </div>
        </section>

        <aside className="pv-trust" aria-label="Legal identity">
          <div className="row">
            <span className="item">
              <ShieldCheck className="ic" style={{ width: 14, height: 14, color: 'var(--accent-green)' }} aria-hidden />
              SSL Secured · 256-bit encryption
            </span>
            <span className="item">GST Notice Support Pvt. Ltd.</span>
          </div>
          <div className="pols">
            <Link href="/privacy">Privacy Policy</Link>
            <span aria-hidden>·</span>
            <Link href="/terms">Terms</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
