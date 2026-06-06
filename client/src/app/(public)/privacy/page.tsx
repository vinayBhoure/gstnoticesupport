import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Privacy Policy | GST Notice Support',
  description: 'Privacy Policy for GST Notice Support Pvt. Ltd. — how we collect, use, and protect your data.',
};

const EFFECTIVE_DATE = '1 June 2026';

export default function PrivacyPolicyPage() {
  return (
    <>
      <section style={{ padding: '80px 0 40px', background: 'var(--neutral-50)' }}>
        <div className="container">
          <div style={{ maxWidth: '48ch' }}>
            <div className="eyebrow">Legal</div>
            <h1>Privacy Policy</h1>
            <p style={{ color: 'var(--neutral-600)', marginTop: 8 }}>
              Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; GST Notice Support Pvt. Ltd.
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div style={{ maxWidth: '720px' }}>

            <h2>1. Who We Are</h2>
            <p>
              GST Notice Support Pvt. Ltd. (<strong>"we", "us", "our"</strong>) is a company incorporated
              under the Companies Act, 2013 (CIN: U74999KA2024PTC000000), with its registered office at
              4th Floor, Prestige Centre, MG Road, Bengaluru, Karnataka 560001. We provide GST litigation
              services to individuals and businesses across India through this website and our online
              booking platform at <strong>gstnoticesupport.in</strong>.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, and protect information about you
              when you use our website or services. By using our website or creating an account, you
              consent to the practices described in this policy.
            </p>

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

            <h2>4. Document Handling &amp; Security</h2>
            <p>
              All documents you upload are stored on AWS S3 in private, encrypted buckets in the Mumbai
              region. Documents are never publicly accessible — access is granted only via time-limited
              pre-signed URLs generated on demand. Our professionals are bound by confidentiality
              obligations and access only documents relevant to their assigned cases.
            </p>
            <p>
              We use HTTPS/TLS for all data in transit. Passwords are hashed using industry-standard
              algorithms (bcrypt). JWT session tokens are stored in HTTP-only cookies and are never
              exposed to client-side JavaScript.
            </p>

            <h2>5. Sharing of Information</h2>
            <p>We share your information only in the following limited circumstances:</p>
            <ul>
              <li><strong>Service delivery:</strong> ICAI-registered CAs and Bar Council-enrolled Advocates assigned to your case access only the documents relevant to your matter.</li>
              <li><strong>Service providers:</strong> AWS (document storage), Razorpay (payment processing), Resend (transactional email). Each is bound by data processing agreements.</li>
              <li><strong>Legal obligation:</strong> We may disclose information when required by law, court order, or a competent regulatory authority.</li>
            </ul>
            <p>We do not share your documents, GSTIN, or financial information with any other third party.</p>

            <h2>6. Data Retention</h2>
            <ul>
              <li>Account information is retained while your account is active.</li>
              <li>Booking records and payment records are retained for a minimum of 8 years to comply with Indian tax law requirements.</li>
              <li>Uploaded documents are retained while your account is active. If you delete your account, documents are permanently deleted from our servers within 7 days.</li>
              <li>Server access logs are retained for 90 days.</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your account and associated documents (subject to legal retention obligations on financial records).</li>
              <li>Withdraw consent for communications where consent was the legal basis.</li>
            </ul>
            <p>
              To exercise these rights, email our Grievance Officer at{' '}
              <a href="mailto:grievance@gstnoticesupport.in">grievance@gstnoticesupport.in</a>.
            </p>

            <h2>8. Cookies</h2>
            <p>
              We use essential cookies only: an HTTP-only session cookie for authentication and a
              preference cookie for language/region settings. We do not use tracking cookies, advertising
              cookies, or third-party analytics cookies. You may disable cookies in your browser settings,
              but this will prevent you from logging in to your account.
            </p>

            <h2>9. Children</h2>
            <p>
              Our services are intended for businesses and professionals. We do not knowingly collect
              information from individuals under 18 years of age. If we become aware of such collection,
              we will delete the information promptly.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of
              material changes by email. The effective date at the top of this page will reflect the
              latest revision. Continued use of our services after any change constitutes acceptance of
              the updated policy.
            </p>

            <h2>11. Contact &amp; Grievance Officer</h2>
            <p>
              For any privacy-related queries or to file a grievance, contact:
            </p>
            <p>
              <strong>Grievance Officer:</strong> Ananya Rao<br />
              <strong>Email:</strong> <a href="mailto:grievance@gstnoticesupport.in">grievance@gstnoticesupport.in</a><br />
              <strong>Address:</strong> GST Notice Support Pvt. Ltd., 4th Floor, Prestige Centre,
              MG Road, Bengaluru, Karnataka 560001<br />
              <strong>Response time:</strong> We acknowledge grievances within 48 hours and aim to
              resolve them within 30 days.
            </p>

            <hr style={{ margin: '40px 0', borderColor: 'var(--neutral-200)' }} />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link className="btn btn-secondary" href="/terms">Terms &amp; Conditions</Link>
              <Link className="btn btn-secondary" href="/refund">Refund Policy</Link>
              <Link className="btn btn-secondary" href="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
