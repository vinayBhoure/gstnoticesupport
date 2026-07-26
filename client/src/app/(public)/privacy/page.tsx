import type { Metadata } from 'next';
import { ORG } from '@/lib/site';
import { LegalHero } from '../LegalHero';
import { LegalToc } from '../LegalToc';
import styles from '../legal.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Privacy Policy | GST Notice Support',
  description: 'Privacy Policy for GST Notice Support Pvt. Ltd. — how we collect, use, and protect your data.',
};

const EFFECTIVE_DATE = '1 June 2026';

const TOC_ITEMS = [
  { href: '#who-we-are', label: '1. Who We Are' },
  { href: '#information-collected', label: '2. Information We Collect' },
  { href: '#how-we-use', label: '3. How We Use Your Information' },
  { href: '#document-security', label: '4. Document Handling & Security' },
  { href: '#sharing', label: '5. Sharing of Information' },
  { href: '#retention', label: '6. Data Retention' },
  { href: '#rights', label: '7. Your Rights' },
  { href: '#cookies', label: '8. Cookies' },
  { href: '#children', label: '9. Children' },
  { href: '#changes', label: '10. Changes to This Policy' },
  { href: '#grievance', label: '11. Contact & Grievance Officer' },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalHero
        title="Privacy Policy"
        effectiveDate={EFFECTIVE_DATE}
        lead="This Privacy Policy describes how GST Notice Support Pvt. Ltd. collects, processes, stores, and discloses personal information when you use our website and services."
        metaExtra={<span>Compliance: DPDP Act 2023, IT Rules 2011</span>}
      />

      <section className="section bg-white">
        <div className={`container ${styles.legalWrap}`}>
          <div className={styles.lwGrid}>
            <LegalToc items={TOC_ITEMS} />
            <article className={styles.article}>
              <section id="who-we-are">
                <h2>1. Who We Are</h2>
                <p>
                  {ORG.legalName} (<strong>&quot;we&quot;, &quot;us&quot;, &quot;our&quot;</strong>) is a
                  company incorporated under the Companies Act, 2013, with its registered office at{' '}
                  {ORG.address.street}, {ORG.address.locality}, {ORG.address.region}{' '}
                  {ORG.address.postalCode}. We provide GST litigation services to individuals and
                  businesses across India through this website and our online booking platform at{' '}
                  <strong>gstnoticesupport.in</strong>.
                </p>
                <p>
                  This Privacy Policy explains how we collect, use, store, and protect information
                  about you when you use our website or services. By using our website or creating
                  an account, you consent to the practices described in this policy.
                </p>
              </section>

              <section id="information-collected">
                <h2>2. Information We Collect</h2>
                <h3>2.1 Information You Provide</h3>
                <ul>
                  <li><strong>Account information:</strong> Name, email address, mobile number, and GSTIN when you create an account or book a service.</li>
                  <li><strong>Documents:</strong> GST notices, returns, demand orders, invoices, reconciliation workings, and any other documents you upload for service delivery.</li>
                  <li><strong>Communications:</strong> Messages, questions, or information you submit via contact forms or email.</li>
                  <li><strong>Payment information:</strong> Payment details processed via Razorpay (we do not store card numbers — Razorpay is PCI-DSS compliant).</li>
                </ul>
                <h3>2.2 Information Collected Automatically</h3>
                <ul>
                  <li><strong>Usage data:</strong> Pages visited, links clicked, time spent, and navigation patterns.</li>
                  <li><strong>Device data:</strong> Browser type, operating system, IP address, and device identifiers.</li>
                  <li><strong>Cookies:</strong> Session identifiers and authentication tokens stored in HTTP-only cookies. We do not use third-party advertising cookies.</li>
                </ul>
              </section>

              <section id="how-we-use">
                <h2>3. How We Use Your Information</h2>
                <ul>
                  <li>To deliver the GST litigation service you have booked and communicate case progress.</li>
                  <li>To authenticate your account and maintain session security.</li>
                  <li>To process payments through our payment gateway (Razorpay).</li>
                  <li>To send transactional emails (booking confirmation, draft ready, filing acknowledgement).</li>
                  <li>To respond to your queries and support requests.</li>
                  <li>To comply with applicable Indian tax laws and regulatory requirements.</li>
                  <li>To detect fraud and prevent unauthorised access.</li>
                </ul>
                <p>We do not use your information for advertising or sell it to any third party.</p>
              </section>

              <section id="document-security">
                <h2>4. Document Handling &amp; Security</h2>
                <p>
                  All documents you upload are stored on AWS S3 in private, encrypted buckets in the
                  Mumbai region. Documents are never publicly accessible — access is granted only
                  via time-limited pre-signed URLs generated on demand. Our professionals are bound
                  by confidentiality obligations and access only documents relevant to their
                  assigned cases.
                </p>
                <p>
                  We use HTTPS/TLS for all data in transit. Passwords are hashed using
                  industry-standard algorithms (bcrypt). JWT session tokens are stored in HTTP-only
                  cookies and are never exposed to client-side JavaScript.
                </p>
              </section>

              <section id="sharing">
                <h2>5. Sharing of Information</h2>
                <p>We share your information only in the following limited circumstances:</p>
                <ul>
                  <li><strong>Service delivery:</strong> ICAI-registered CAs and Bar Council-enrolled Advocates assigned to your case access only the documents relevant to your matter.</li>
                  <li><strong>Service providers:</strong> AWS (document storage), Razorpay (payment processing), Resend (transactional email). Each is bound by data processing agreements.</li>
                  <li><strong>Legal obligation:</strong> We may disclose information when required by law, court order, or a competent regulatory authority.</li>
                </ul>
                <div className={styles.callout}>
                  <p>
                    We do not share your business documents with marketing platforms, ad networks,
                    or third-party analytics that profile individuals.
                  </p>
                </div>
                <p>We do not share your documents, GSTIN, or financial information with any other third party.</p>
              </section>

              <section id="retention">
                <h2>6. Data Retention</h2>
                <ul>
                  <li>Account information is retained while your account is active.</li>
                  <li>Booking records and payment records are retained for a minimum of 8 years to comply with Indian tax law requirements.</li>
                  <li>Uploaded documents are retained while your account is active. If you delete your account, documents are permanently deleted from our servers within 7 days.</li>
                  <li>Server access logs are retained for 90 days.</li>
                </ul>
              </section>

              <section id="rights">
                <h2>7. Your Rights</h2>
                <p>Under the Digital Personal Data Protection Act, 2023 you may at any time:</p>
                <ul>
                  <li>Access the personal information we hold about you.</li>
                  <li>Request correction of inaccurate information.</li>
                  <li>Request deletion of your account and associated documents (subject to legal retention obligations on financial records).</li>
                  <li>Withdraw consent for communications where consent was the legal basis.</li>
                </ul>
                <p>
                  To exercise these rights, email us at{' '}
                  <a href={`mailto:${ORG.email}`} className={styles.ref}>{ORG.email}</a>.
                </p>
              </section>

              <section id="cookies">
                <h2>8. Cookies</h2>
                <p>
                  We use essential cookies only: an HTTP-only session cookie for authentication and
                  a preference cookie for language/region settings. We do not use tracking cookies,
                  advertising cookies, or third-party analytics cookies. You may disable cookies in
                  your browser settings, but this will prevent you from logging in to your account.
                </p>
              </section>

              <section id="children">
                <h2>9. Children</h2>
                <p>
                  Our services are intended for businesses and professionals. We do not knowingly
                  collect information from individuals under 18 years of age. If we become aware of
                  such collection, we will delete the information promptly.
                </p>
              </section>

              <section id="changes">
                <h2>10. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify registered
                  users of material changes by email. The effective date at the top of this page
                  will reflect the latest revision. Continued use of our services after any change
                  constitutes acceptance of the updated policy.
                </p>
              </section>

              <section id="grievance">
                <h2>11. Contact &amp; Grievance Officer</h2>
                <p>For any privacy-related queries or to file a grievance, contact:</p>
                <p>
                  <strong>Grievance Contact:</strong> {ORG.grievanceOfficer}
                  <br />
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${ORG.email}`} className={styles.ref}>{ORG.email}</a>
                  <br />
                  <strong>Address:</strong> {ORG.legalName}, {ORG.address.street}, {ORG.address.locality},{' '}
                  {ORG.address.region} {ORG.address.postalCode}
                  <br />
                  <strong>Response time:</strong> We acknowledge grievances within 48 hours and aim
                  to resolve them within 30 days.
                </p>
              </section>

              <div className={styles.articleCta}>
                <h3>Have a privacy concern?</h3>
                <p>Write to our Grievance Officer or speak to our team — we respond within 1 working day.</p>
                <div className={styles.ctaRow}>
                  <a className="btn btn-primary" href={`mailto:${ORG.email}`}>Email Grievance Officer</a>
                  <a className="btn btn-secondary" href="/contact">Request a Callback</a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
