import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Terms & Conditions | GST Notice Support',
  description: 'Terms and Conditions for GST Notice Support Pvt. Ltd. — service scope, payment terms, no-guarantee clause, and governing law.',
};

const EFFECTIVE_DATE = '1 June 2026';

export default function TermsPage() {
  return (
    <>
      <section style={{ padding: '80px 0 40px', background: 'var(--neutral-50)' }}>
        <div className="container">
          <div style={{ maxWidth: '48ch' }}>
            <div className="eyebrow">Legal</div>
            <h1>Terms &amp; Conditions</h1>
            <p style={{ color: 'var(--neutral-600)', marginTop: 8 }}>
              Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; GST Notice Support Pvt. Ltd.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div style={{ maxWidth: '720px' }}>

            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing <strong>gstnoticesupport.in</strong> or using any service offered by
              {ORG.legalName}, you agree to be bound
              by these Terms &amp; Conditions (<strong>"Terms"</strong>) and our{' '}
              <Link href="/privacy">Privacy Policy</Link>. If you do not agree to these Terms, you
              must not use our website or services.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and GST Notice Support
              Pvt. Ltd. We reserve the right to update these Terms at any time. Continued use of
              our services after any update constitutes acceptance of the revised Terms.
            </p>

            <h2>2. Services</h2>
            <p>We offer the following fixed-fee professional services:</p>
            <ul>
              <li><strong>ASMT-10 Scrutiny Notice Reply</strong> — ₹2,999</li>
              <li><strong>Show Cause Notice (SCN) Reply</strong> — ₹5,999</li>
              <li><strong>Commissioner Appeal (APL-01)</strong> — ₹9,999</li>
              <li><strong>GSTAT Appeal (APL-05)</strong> — ₹14,999</li>
            </ul>
            <p>
              Services are delivered by ICAI-registered Chartered Accountants and Bar Council-enrolled
              Advocates. Scope, deliverables, and timelines for each service are described on the
              respective service pages and the{' '}
              <Link href="/pricing">Pricing page</Link>.
            </p>

            <h2>3. Eligibility</h2>
            <p>
              You must be at least 18 years of age and legally authorised to enter into binding contracts
              under Indian law to use our services. By using our services, you represent that you are
              acting on behalf of yourself or a legal entity you are authorised to represent.
            </p>

            <h2>4. Booking &amp; Payment</h2>
            <h3>4.1 Payment Timing</h3>
            <p>
              Payment is taken after documents are uploaded and our team has prepared a draft preview for
              your review. You will see that work has commenced before you commit to payment. Full payment
              is required before the complete draft is released.
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
              For Commissioner Appeal and GSTAT Appeal services, a statutory government pre-deposit is
              required by law — 10% of disputed tax for Commissioner Appeal and 20% for GSTAT Appeal.
              This pre-deposit is payable by you directly to the GST portal. It is <strong>not</strong>{' '}
              part of our professional fee and is not collected or held by us.
            </p>

            <h2>5. Refund Policy</h2>
            <p>
              Our fees are non-refundable once draft preparation has commenced. Please review our{' '}
              <Link href="/refund">Refund Policy</Link> for complete details.
            </p>

            <h2>6. No Guarantee of Outcome</h2>
            <p>
              GST litigation outcomes depend on case-specific facts, the applicable law, and decisions
              made by independent tax authorities and tribunals. We do not guarantee any particular
              outcome. Nothing on this website or in any communication from us constitutes a guarantee
              of success, a favourable order, or a reduction in tax demand.
            </p>
            <p>
              Our fee is for professional service — preparation, drafting, and filing — not for the
              outcome of the litigation.
            </p>

            <h2>7. Scope of Service</h2>
            <p>
              Each service covers the specific deliverables described on the service page. The following
              are explicitly outside scope:
            </p>
            <ul>
              <li>Representation at in-person hearings (available as a separate consultation-based service).</li>
              <li>Additional revisions beyond the one included revision round.</li>
              <li>Handling of additional notices, orders, or proceedings arising from the same or related matters after the original service is completed.</li>
              <li>Legal advice on matters outside GST law.</li>
              <li>Filing fees, court fees, or government charges (if any).</li>
            </ul>

            <h2>8. Document Responsibility</h2>
            <p>
              You are responsible for providing complete, accurate, and authentic documents. We rely on
              the documents you provide to prepare your reply or appeal. We are not responsible for any
              adverse outcome resulting from incomplete, inaccurate, or misleading documents.
            </p>
            <p>
              You warrant that you are authorised to upload and share any documents submitted through
              our platform and that doing so does not violate any law, regulation, or third-party right.
            </p>

            <h2>9. Confidentiality</h2>
            <p>
              We treat all documents and information you share as strictly confidential. Our professionals
              are bound by confidentiality obligations. We will not disclose your information to third
              parties except as required by applicable law or as described in our{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable Indian law, GST Notice Support Pvt. Ltd.,
              its directors, employees, and assigned professionals shall not be liable for:
            </p>
            <ul>
              <li>Any indirect, consequential, or incidental loss arising from the use of our services.</li>
              <li>The outcome of any GST proceeding, including additional demands, penalties, or interest.</li>
              <li>Decisions made by tax authorities, appellate bodies, or tribunals.</li>
              <li>Losses arising from documents or information provided by you that were incomplete or inaccurate.</li>
            </ul>
            <p>
              Our total liability to you under or in connection with these Terms shall not exceed the
              professional fee paid by you for the specific service in question.
            </p>

            <h2>11. Intellectual Property</h2>
            <p>
              All content on this website — including text, design, logos, and code — is owned by or
              licensed to GST Notice Support Pvt. Ltd. You may not reproduce, distribute, or create
              derivative works without our prior written consent.
            </p>
            <p>
              The draft replies and appeal documents prepared for your case are created for your use.
              You own the content of your own documents. We retain the right to use anonymised,
              aggregated insights from cases (without any identifying information) for improving our
              services.
            </p>

            <h2>12. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of India. Any dispute arising under or in connection
              with these Terms shall be subject to the exclusive jurisdiction of the courts of
              {ORG.address.locality}, {ORG.address.region}.
            </p>

            <h2>13. Contact</h2>
            <p>
              For any questions about these Terms, contact us at:{' '}
              <a href={`mailto:${ORG.email}`}>{ORG.email}</a>.
            </p>

            <hr style={{ margin: '40px 0', borderColor: 'var(--neutral-200)' }} />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link className="btn btn-secondary" href="/privacy">Privacy Policy</Link>
              <Link className="btn btn-secondary" href="/refund">Refund Policy</Link>
              <Link className="btn btn-secondary" href="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
