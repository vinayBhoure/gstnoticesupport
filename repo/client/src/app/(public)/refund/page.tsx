import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import { ORG } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Refund Policy | GST Notice Support',
  description: 'Refund Policy for GST Notice Support Pvt. Ltd. — our no-refund policy explained clearly, with the reason why and the conditions that apply.',
};

const EFFECTIVE_DATE = '1 June 2026';

export default function RefundPolicyPage() {
  return (
    <>
      <section style={{ padding: '80px 0 40px', background: 'var(--neutral-50)' }}>
        <div className="container">
          <div style={{ maxWidth: '48ch' }}>
            <div className="eyebrow">Legal</div>
            <h1>Refund Policy</h1>
            <p style={{ color: 'var(--neutral-600)', marginTop: 8 }}>
              Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; GST Notice Support Pvt. Ltd.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div style={{ maxWidth: '720px' }}>

            {/* Key point callout */}
            <div
              role="note"
              style={{
                background: 'rgba(245,158,11,.08)',
                border: '1px solid rgba(245,158,11,.3)',
                borderRadius: 'var(--r-card)',
                padding: '20px 24px',
                display: 'flex',
                gap: 16,
                marginBottom: 40,
              }}
            >
              <AlertTriangle style={{ width: 22, height: 22, color: 'var(--warning-amber)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <div>
                <strong style={{ color: 'var(--primary-navy)', display: 'block', marginBottom: 6 }}>
                  No-Refund Policy in Plain Language
                </strong>
                <p style={{ margin: 0, color: 'var(--neutral-600)' }}>
                  Once our team begins preparing your draft — after you upload documents — our professional
                  fee is non-refundable. We tell you this clearly before you pay, not in fine print after.
                </p>
              </div>
            </div>

            <h2>1. Why We Have a No-Refund Policy</h2>
            <p>
              Our services are delivered by ICAI-registered CAs and Bar Council-enrolled Advocates who
              invest professional time in reviewing your documents, analysing applicable law, and drafting
              your reply or appeal. This work begins the moment you complete document upload — before any
              payment is taken.
            </p>
            <p>
              When you pay to unlock the draft, that work is already done. The fee compensates for the
              professional time already spent. Refunding it after draft delivery would mean professionals
              have worked without compensation, which is not a sustainable model for maintaining the
              quality of service.
            </p>

            <h2>2. When We Take Payment</h2>
            <p>
              To be fully transparent about our payment structure:
            </p>
            <ul>
              <li>You upload your documents and book a service.</li>
              <li>Our team begins reviewing your case and preparing a draft.</li>
              <li>Once the draft is ready, you see a preview — confirming that work has commenced.</li>
              <li><strong>Payment is taken at this point</strong>, to unlock the complete draft.</li>
              <li>You never pay before you have seen evidence of work.</li>
            </ul>
            <p>
              This structure is deliberately designed so you have confidence before committing. You see
              the draft has been prepared. Only then does payment unlock the full document.
            </p>

            <h2>3. No Refund Conditions</h2>
            <p>Our fee is <strong>non-refundable</strong> in the following circumstances:</p>
            <ul>
              <li>After you have made payment and the draft has been unlocked.</li>
              <li>After draft preparation has begun, even if you decide not to proceed.</li>
              <li>If the GST authority does not decide in your favour. (Our fee covers professional service, not the outcome — see our <Link href="/terms">Terms &amp; Conditions</Link>.)</li>
              <li>If you provide incomplete or inaccurate documents and subsequently disagree with the draft.</li>
              <li>If you change the scope of your matter after the draft has been prepared.</li>
            </ul>

            <h2>4. What We Will Do If There Is a Problem</h2>
            <p>
              Each service includes <strong>one round of revision</strong>. If the draft does not address
              the specific discrepancy or issue raised in your notice, raise it during the revision round
              and our professional will correct it.
            </p>
            <p>
              If there is a genuine quality issue — for example, if the draft clearly addresses the wrong
              notice type — contact our Grievance Officer within 7 days of payment. We will review the
              case and, at our sole discretion, may offer a credit toward a future service.
            </p>

            <h2>5. Government Pre-Deposit</h2>
            <p>
              For Commissioner Appeal and GSTAT Appeal services, a statutory government pre-deposit is
              required by law before an appeal is admitted. This amount (10% or 20% of disputed tax) is
              paid by you directly to the GST portal — it is entirely separate from our professional fee
              and is not collected, held, or refundable by us.
            </p>

            <h2>6. Payment Processing</h2>
            <p>
              Payments are processed via Razorpay. For any charge dispute related to the payment gateway,
              you may also contact Razorpay directly. However, payment gateway disputes do not affect the
              no-refund policy described in this document.
            </p>

            <h2>7. How to Raise a Dispute</h2>
            <p>
              If you believe there has been a billing error or a genuine service failure, contact us:
            </p>
            <div
              style={{
                background: 'var(--neutral-50)',
                border: '1px solid var(--neutral-200)',
                borderRadius: 'var(--r-card)',
                padding: '20px 24px',
                marginTop: 16,
                marginBottom: 32,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail style={{ width: 18, height: 18, color: 'var(--accent-green)' }} aria-hidden="true" />
                  <span><strong>Grievance:</strong> {ORG.grievanceOfficer} — <a href={`mailto:${ORG.email}`}>{ORG.email}</a></span>
                </div>
              </div>
            </div>
            <p>
              We acknowledge all grievances within 48 hours and aim to resolve them within 30 days.
            </p>

            <h2>8. Summary</h2>
            <ul>
              <li>
                <CheckCircle style={{ width: 16, height: 16, display: 'inline', color: 'var(--accent-green)', marginRight: 6 }} aria-hidden="true" />
                You see evidence of work before you pay.
              </li>
              <li>
                <CheckCircle style={{ width: 16, height: 16, display: 'inline', color: 'var(--accent-green)', marginRight: 6 }} aria-hidden="true" />
                One revision round is included in every service.
              </li>
              <li>
                <CheckCircle style={{ width: 16, height: 16, display: 'inline', color: 'var(--accent-green)', marginRight: 6 }} aria-hidden="true" />
                Genuine quality complaints are reviewed by the Grievance Officer.
              </li>
              <li>
                <AlertTriangle style={{ width: 16, height: 16, display: 'inline', color: 'var(--warning-amber)', marginRight: 6 }} aria-hidden="true" />
                Fees are non-refundable once draft preparation begins.
              </li>
              <li>
                <AlertTriangle style={{ width: 16, height: 16, display: 'inline', color: 'var(--warning-amber)', marginRight: 6 }} aria-hidden="true" />
                Outcome of litigation does not entitle a refund.
              </li>
            </ul>

            <hr style={{ margin: '40px 0', borderColor: 'var(--neutral-200)' }} />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link className="btn btn-secondary" href="/privacy">Privacy Policy</Link>
              <Link className="btn btn-secondary" href="/terms">Terms &amp; Conditions</Link>
              <Link className="btn btn-secondary" href="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
