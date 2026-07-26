import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG } from '@/lib/site';
import { LegalHero } from '../LegalHero';
import { LegalToc } from '../LegalToc';
import styles from '../legal.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Terms & Conditions | GST Notice Support',
  description: 'Terms and Conditions for GST Notice Support Pvt. Ltd. — service scope, payment terms, no-guarantee clause, and governing law.',
};

const EFFECTIVE_DATE = '1 June 2026';

const TOC_ITEMS = [
  { href: '#agreement', label: '1. Agreement to Terms' },
  { href: '#services', label: '2. Services' },
  { href: '#eligibility', label: '3. Eligibility' },
  { href: '#booking-payment', label: '4. Booking & Payment' },
  { href: '#refund-policy', label: '5. Refund Policy' },
  { href: '#no-guarantee', label: '6. No Guarantee of Outcome' },
  { href: '#scope', label: '7. Scope of Service' },
  { href: '#document-responsibility', label: '8. Document Responsibility' },
  { href: '#confidentiality', label: '9. Confidentiality' },
  { href: '#liability', label: '10. Limitation of Liability' },
  { href: '#ip', label: '11. Intellectual Property' },
  { href: '#governing-law', label: '12. Governing Law & Jurisdiction' },
  { href: '#contact', label: '13. Contact' },
];

export default function TermsPage() {
  return (
    <>
      <LegalHero
        title="Terms & Conditions"
        effectiveDate={EFFECTIVE_DATE}
        lead="These Terms govern your use of gstnoticesupport.in and any service booked through the platform. Please read carefully before booking."
        metaExtra={
          <span>
            Governing law: India · {ORG.address.locality}, {ORG.address.region} jurisdiction
          </span>
        }
      />

      <section className="section bg-white">
        <div className={`container ${styles.legalWrap}`}>
          <div className={styles.lwGrid}>
            <LegalToc items={TOC_ITEMS} />
            <article className={styles.article}>
              <section id="agreement">
                <h2>1. Agreement to Terms</h2>
                <p>
                  By accessing <strong>gstnoticesupport.in</strong> or using any service offered by{' '}
                  {ORG.legalName}, you agree to be bound by these Terms &amp; Conditions
                  (<strong>&quot;Terms&quot;</strong>) and our <Link href="/privacy">Privacy Policy</Link>.
                  If you do not agree to these Terms, you must not use our website or services.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and{' '}
                  {ORG.legalName}. We reserve the right to update these Terms at any time. Continued
                  use of our services after any update constitutes acceptance of the revised Terms.
                </p>
              </section>

              <section id="services">
                <h2>2. Services</h2>
                <p>We offer the following fixed-fee professional services:</p>
                <ul>
                  <li><strong>ASMT-10 Scrutiny Notice Reply</strong> — ₹2,999</li>
                  <li><strong>Show Cause Notice (SCN) Reply</strong> — ₹5,999</li>
                  <li><strong>Commissioner Appeal (APL-01)</strong> — ₹9,999</li>
                  <li><strong>GSTAT Appeal (APL-05)</strong> — ₹14,999</li>
                </ul>
                <p>
                  Services are delivered by ICAI-registered Chartered Accountants and Bar
                  Council-enrolled Advocates. Scope, deliverables, and timelines for each service are
                  described on the respective service pages and the{' '}
                  <Link href="/pricing">Pricing page</Link>.
                </p>
              </section>

              <section id="eligibility">
                <h2>3. Eligibility</h2>
                <p>
                  You must be at least 18 years of age and legally authorised to enter into binding
                  contracts under Indian law to use our services. By using our services, you
                  represent that you are acting on behalf of yourself or a legal entity you are
                  authorised to represent.
                </p>
              </section>

              <section id="booking-payment">
                <h2>4. Booking &amp; Payment</h2>
                <h3>4.1 Payment Timing</h3>
                <p>
                  Payment is taken after documents are uploaded and our team has prepared a draft
                  preview for your review. You will see that work has commenced before you commit to
                  payment. Full payment is required before the complete draft is released.
                </p>
                <h3>4.2 Payment Terms</h3>
                <ul>
                  <li>Services are priced as fixed units. No EMI, no partial payments, no instalment plans.</li>
                  <li>All fees are inclusive of applicable GST unless stated otherwise.</li>
                  <li>Payment is accepted via Razorpay (UPI, net banking, cards, wallets).</li>
                  <li>Payment confirmation is sent to your registered email address.</li>
                </ul>
                <h3>4.3 Government Pre-Deposit</h3>
                <p>
                  For Commissioner Appeal and GSTAT Appeal services, a statutory government
                  pre-deposit is required by law — 10% of disputed tax for Commissioner Appeal and
                  20% for GSTAT Appeal. This pre-deposit is payable by you directly to the GST
                  portal. It is <strong>not</strong> part of our professional fee and is not
                  collected or held by us.
                </p>
              </section>

              <section id="refund-policy">
                <h2>5. Refund Policy</h2>
                <p>
                  Our fees are non-refundable once draft preparation has commenced. Please review
                  our <Link href="/refund">Refund Policy</Link> for complete details.
                </p>
              </section>

              <section id="no-guarantee">
                <h2>6. No Guarantee of Outcome</h2>
                <div className={styles.callout}>
                  <p>
                    GST litigation outcomes depend on case-specific facts, the applicable law, and
                    decisions made by independent tax authorities and tribunals. We do not guarantee
                    any particular outcome. Nothing on this website or in any communication from us
                    constitutes a guarantee of success, a favourable order, or a reduction in tax
                    demand.
                  </p>
                </div>
                <p>
                  Our fee is for professional service — preparation, drafting, and filing — not for
                  the outcome of the litigation.
                </p>
              </section>

              <section id="scope">
                <h2>7. Scope of Service</h2>
                <p>
                  Each service covers the specific deliverables described on the service page. The
                  following are explicitly outside scope:
                </p>
                <ul>
                  <li>Representation at in-person hearings (available as a separate consultation-based service).</li>
                  <li>Additional revisions beyond the one included revision round.</li>
                  <li>Handling of additional notices, orders, or proceedings arising from the same or related matters after the original service is completed.</li>
                  <li>Legal advice on matters outside GST law.</li>
                  <li>Filing fees, court fees, or government charges (if any).</li>
                </ul>
              </section>

              <section id="document-responsibility">
                <h2>8. Document Responsibility</h2>
                <p>
                  You are responsible for providing complete, accurate, and authentic documents. We
                  rely on the documents you provide to prepare your reply or appeal. We are not
                  responsible for any adverse outcome resulting from incomplete, inaccurate, or
                  misleading documents.
                </p>
                <p>
                  You warrant that you are authorised to upload and share any documents submitted
                  through our platform and that doing so does not violate any law, regulation, or
                  third-party right.
                </p>
              </section>

              <section id="confidentiality">
                <h2>9. Confidentiality</h2>
                <p>
                  We treat all documents and information you share as strictly confidential. Our
                  professionals are bound by confidentiality obligations. We will not disclose your
                  information to third parties except as required by applicable law or as described
                  in our <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </section>

              <section id="liability">
                <h2>10. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by applicable Indian law, {ORG.legalName}, its
                  directors, employees, and assigned professionals shall not be liable for:
                </p>
                <ul>
                  <li>Any indirect, consequential, or incidental loss arising from the use of our services.</li>
                  <li>The outcome of any GST proceeding, including additional demands, penalties, or interest.</li>
                  <li>Decisions made by tax authorities, appellate bodies, or tribunals.</li>
                  <li>Losses arising from documents or information provided by you that were incomplete or inaccurate.</li>
                </ul>
                <p>
                  Our total liability to you under or in connection with these Terms shall not
                  exceed the professional fee paid by you for the specific service in question.
                </p>
              </section>

              <section id="ip">
                <h2>11. Intellectual Property</h2>
                <p>
                  All content on this website — including text, design, logos, and code — is owned
                  by or licensed to {ORG.legalName}. You may not reproduce, distribute, or create
                  derivative works without our prior written consent.
                </p>
                <p>
                  The draft replies and appeal documents prepared for your case are created for your
                  use. You own the content of your own documents. We retain the right to use
                  anonymised, aggregated insights from cases (without any identifying information)
                  for improving our services.
                </p>
              </section>

              <section id="governing-law">
                <h2>12. Governing Law &amp; Jurisdiction</h2>
                <p>
                  These Terms are governed by the laws of India. Any dispute arising under or in
                  connection with these Terms shall be subject to the exclusive jurisdiction of the
                  courts of {ORG.address.locality}, {ORG.address.region}.
                </p>
              </section>

              <section id="contact">
                <h2>13. Contact</h2>
                <p>
                  For any questions about these Terms, contact us at:{' '}
                  <a href={`mailto:${ORG.email}`} className={styles.ref}>{ORG.email}</a>.
                </p>
              </section>

              <div className={styles.articleCta}>
                <h3>Ready to get started?</h3>
                <p>Pick a service plan, upload your notice, and we&apos;ll begin within 24 hours.</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary" href="/pricing">See Pricing</Link>
                  <Link className="btn btn-secondary" href="/contact">Request a Callback</Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
