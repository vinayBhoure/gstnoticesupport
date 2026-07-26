import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import { ORG } from '@/lib/site';
import { LegalHero } from '../LegalHero';
import { LegalToc } from '../LegalToc';
import styles from '../legal.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Refund Policy | GST Notice Support',
  description: 'Refund Policy for GST Notice Support Pvt. Ltd. — our no-refund policy explained clearly, with the reason why and the conditions that apply.',
};

const EFFECTIVE_DATE = '1 June 2026';

const TOC_ITEMS = [
  { href: '#why', label: '1. Why We Have a No-Refund Policy' },
  { href: '#payment-timing', label: '2. When We Take Payment' },
  { href: '#no-refund', label: '3. No Refund Conditions' },
  { href: '#revisions', label: '4. If There Is a Problem' },
  { href: '#pre-deposit', label: '5. Government Pre-Deposit' },
  { href: '#payment-processing', label: '6. Payment Processing' },
  { href: '#dispute', label: '7. How to Raise a Dispute' },
  { href: '#summary', label: '8. Summary' },
];

export default function RefundPolicyPage() {
  return (
    <>
      <LegalHero
        title="Refund Policy"
        effectiveDate={EFFECTIVE_DATE}
        lead="Professional fees are payable upfront. This policy explains when a refund is available and how to claim it."
      />

      <section className="section bg-white">
        <div className={`container ${styles.legalWrap}`}>
          <div className={styles.lwGrid}>
            <LegalToc items={TOC_ITEMS} />
            <article className={styles.article}>
              <div className={`${styles.callout} ${styles.amber}`}>
                <AlertTriangle size={18} className={styles.ic} aria-hidden />
                <p>
                  <strong>No-Refund Policy in Plain Language:</strong> Once our team begins
                  preparing your draft — after you upload documents — our professional fee is
                  non-refundable. We tell you this clearly before you pay, not in fine print after.
                </p>
              </div>

              <section id="why">
                <h2>1. Why We Have a No-Refund Policy</h2>
                <p>
                  Our services are delivered by ICAI-registered CAs and Bar Council-enrolled
                  Advocates who invest professional time in reviewing your documents, analysing
                  applicable law, and drafting your reply or appeal. This work begins the moment
                  you complete document upload — before any payment is taken.
                </p>
                <p>
                  When you pay to unlock the draft, that work is already done. The fee compensates
                  for the professional time already spent. Refunding it after draft delivery would
                  mean professionals have worked without compensation, which is not a sustainable
                  model for maintaining the quality of service.
                </p>
              </section>

              <section id="payment-timing">
                <h2>2. When We Take Payment</h2>
                <p>To be fully transparent about our payment structure:</p>
                <ul>
                  <li>You upload your documents and book a service.</li>
                  <li>Our team begins reviewing your case and preparing a draft.</li>
                  <li>Once the draft is ready, you see a preview — confirming that work has commenced.</li>
                  <li><strong>Payment is taken at this point</strong>, to unlock the complete draft.</li>
                  <li>You never pay before you have seen evidence of work.</li>
                </ul>
                <p>
                  This structure is deliberately designed so you have confidence before committing.
                  You see the draft has been prepared. Only then does payment unlock the full
                  document.
                </p>
              </section>

              <section id="no-refund">
                <h2>3. No Refund Conditions</h2>
                <p>Our fee is <strong>non-refundable</strong> in the following circumstances:</p>
                <ul>
                  <li>After you have made payment and the draft has been unlocked.</li>
                  <li>After draft preparation has begun, even if you decide not to proceed.</li>
                  <li>If the GST authority does not decide in your favour. (Our fee covers professional service, not the outcome — see our <Link href="/terms">Terms &amp; Conditions</Link>.)</li>
                  <li>If you provide incomplete or inaccurate documents and subsequently disagree with the draft.</li>
                  <li>If you change the scope of your matter after the draft has been prepared.</li>
                </ul>
              </section>

              <section id="revisions">
                <h2>4. What We Will Do If There Is a Problem</h2>
                <p>
                  Each service includes <strong>one round of revision</strong>. If the draft does
                  not address the specific discrepancy or issue raised in your notice, raise it
                  during the revision round and our professional will correct it.
                </p>
                <p>
                  If there is a genuine quality issue — for example, if the draft clearly addresses
                  the wrong notice type — contact our Grievance Officer within 7 days of payment. We
                  will review the case and, at our sole discretion, may offer a credit toward a
                  future service.
                </p>
              </section>

              <section id="pre-deposit">
                <h2>5. Government Pre-Deposit</h2>
                <p>
                  For Commissioner Appeal and GSTAT Appeal services, a statutory government
                  pre-deposit is required by law before an appeal is admitted. This amount (10% or
                  20% of disputed tax) is paid by you directly to the GST portal — it is entirely
                  separate from our professional fee and is not collected, held, or refundable by
                  us.
                </p>
              </section>

              <section id="payment-processing">
                <h2>6. Payment Processing</h2>
                <p>
                  Payments are processed via Razorpay. For any charge dispute related to the
                  payment gateway, you may also contact Razorpay directly. However, payment gateway
                  disputes do not affect the no-refund policy described in this document.
                </p>
              </section>

              <section id="dispute">
                <h2>7. How to Raise a Dispute</h2>
                <p>If you believe there has been a billing error or a genuine service failure, contact us:</p>
                <div className={styles.callout}>
                  <Mail size={18} className={styles.ic} aria-hidden />
                  <p>
                    <strong>Grievance:</strong> {ORG.grievanceOfficer} —{' '}
                    <a href={`mailto:${ORG.email}`} className={styles.ref}>{ORG.email}</a>
                  </p>
                </div>
                <p>We acknowledge all grievances within 48 hours and aim to resolve them within 30 days.</p>
              </section>

              <section id="summary">
                <h2>8. Summary</h2>
                <ul>
                  <li><CheckCircle size={16} style={{ display: 'inline', color: 'var(--accent-green)', marginRight: 6, verticalAlign: -2 }} aria-hidden />You see evidence of work before you pay.</li>
                  <li><CheckCircle size={16} style={{ display: 'inline', color: 'var(--accent-green)', marginRight: 6, verticalAlign: -2 }} aria-hidden />One revision round is included in every service.</li>
                  <li><CheckCircle size={16} style={{ display: 'inline', color: 'var(--accent-green)', marginRight: 6, verticalAlign: -2 }} aria-hidden />Genuine quality complaints are reviewed by the Grievance Officer.</li>
                  <li><AlertTriangle size={16} style={{ display: 'inline', color: 'var(--warning-amber)', marginRight: 6, verticalAlign: -2 }} aria-hidden />Fees are non-refundable once draft preparation begins.</li>
                  <li><AlertTriangle size={16} style={{ display: 'inline', color: 'var(--warning-amber)', marginRight: 6, verticalAlign: -2 }} aria-hidden />Outcome of litigation does not entitle a refund.</li>
                </ul>
              </section>

              <div className={styles.articleCta}>
                <h3>Need to cancel an engagement?</h3>
                <p>Write to us with your case reference number — we&apos;ll confirm eligibility within 2 working days.</p>
                <div className={styles.ctaRow}>
                  <a className="btn btn-primary" href={`mailto:${ORG.email}`}>Email Refund Request</a>
                  <a className="btn btn-secondary" href="/contact">Speak to Support</a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
