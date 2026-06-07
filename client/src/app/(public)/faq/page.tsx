import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { FaqSection } from '@/components/faq/FaqSection';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import styles from './faq.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'FAQ | GST Notice Support',
  description: 'Answers to the most common questions about GST notice handling, our expert team, document security, fees, and payment. Find out how GST Notice Support works.',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'I have received a GST notice. What should I do first?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Do not respond without professional review. Upload a copy of your notice through our booking system. Our team reviews it within 4 business hours and guides you on the right service.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to prepare my reply or appeal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ASMT-10 Reply and SCN Reply: 48 hours. Commissioner Appeal (APL-01): 48 hours. GSTAT Appeal (APL-05): 72 hours. Clock starts from complete document receipt.',
      },
    },
    {
      '@type': 'Question',
      name: 'What documents do I need to submit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'At minimum: the notice itself and your GSTN. For notice replies, also GSTR returns, purchase and sales registers, and GSTR-2B reconciliation. For appeals, the original order plus supporting records.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track the progress of my case after booking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Your dashboard shows real-time booking status from document upload through review, draft ready, and filing. Email notifications are sent at each stage.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do your experts appear before GST authorities in person?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, for cases requiring personal or virtual appearance before the Appellate Authority or GSTAT. This is the Representation Before Tax Authority service, priced separately.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between your team and a local CA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our team works exclusively on GST litigation — notice replies, appeals, and tribunal filings. Specialisation means our professionals have handled hundreds of GST demands, ITC disallowances, and appellate proceedings.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are your professionals registered with ICAI or Bar Council?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. CA work is handled by ICAI-registered CAs. Appellate and tribunal representation is handled by Bar Council-enrolled Advocates. Registration details are on our About page.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my GST data and financial information safe with you?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Documents are stored on AWS S3 in private, encrypted buckets. Access is via time-limited pre-signed URLs. Our professionals are bound by confidentiality obligations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens to my documents after the service is complete?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Documents remain in your dashboard while your account is active. If you delete your account, documents are permanently removed from our servers within 7 days.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your exact fee for each service?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fixed fees: ASMT-10 Reply ₹2,999 · SCN Reply ₹5,999 · Commissioner Appeal ₹9,999 · GSTAT Appeal ₹14,999. One-time professional fees — no retainer, no hourly billing.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the government pre-deposit and who pays it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The pre-deposit is a mandatory statutory payment you make directly to the GST portal before your appeal is admitted. It is not our fee. Commissioner Appeal requires 10% of disputed tax; GSTAT Appeal requires 20%.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a refund if my case is not decided in my favour?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Our fee is for professional service — preparation, drafting, and filing — not for the outcome. We do not guarantee results. Our No-Refund Policy is linked in the footer.',
      },
    },
    {
      '@type': 'Question',
      name: 'When exactly do I pay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After you upload your documents and our team prepares a partial draft preview. You review the preview first. Payment unlocks the complete draft and portal filing support.',
      },
    },
  ],
};

const WaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-50`}>
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p className={styles.sub}>
            Answers to the most common questions about GST notice handling, our process,
            our team, and our fees.
          </p>
        </div>
      </section>

      {/* SEARCH + ACCORDION — Client Component */}
      <FaqSection />

      {/* STILL HAVE QUESTIONS */}
      <section className={`${styles.sqxSection} bg-white`}>
        <div className="container">
          <div className="sec-head" style={{ marginBottom: '40px' }}>
            <div className="eyebrow">Get in touch</div>
            <h2>Still Have Questions?</h2>
            <p>Our team is available Monday to Saturday, 9 AM – 7 PM IST.</p>
          </div>
          <div className={styles.sqxGrid}>

            <div className={styles.sqxCard}>
              <div className={styles.sqxIc} aria-hidden="true">
                <Phone size={22} />
              </div>
              <span className={styles.sqxLabel}>Call Us</span>
              <a className={styles.sqxValue} href="tel:+919343297622" aria-label="Call GST Notice Support">
                +91 93432 97622
              </a>
            </div>

            <div className={styles.sqxCard}>
              <div className={styles.sqxIc} style={{ background: 'rgba(37,211,102,.1)', borderColor: 'rgba(37,211,102,.25)', color: '#128C7E' }} aria-hidden="true">
                <WaIcon />
              </div>
              <span className={styles.sqxLabel}>WhatsApp Us</span>
              <p style={{ fontSize: '15px', color: 'var(--neutral-600)', lineHeight: 1.5, margin: '0' }}>
                Send your query directly — we reply within 2 hours.
              </p>
              <a
                className={styles.btnWaCard}
                href="https://wa.me/919343297622?text=Hello%2C%20I%20have%20a%20query%20about%20a%20GST%20notice."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open WhatsApp chat with GST Notice Support"
              >
                <WaIcon />
                Chat on WhatsApp
              </a>
            </div>

            <div className={styles.sqxCard}>
              <div className={styles.sqxIc} aria-hidden="true">
                <Mail size={22} />
              </div>
              <span className={styles.sqxLabel}>Email Us</span>
              <a className={styles.sqxValue} href="mailto:support@gstnoticesupport.in" aria-label="Email GST Notice Support">
                support@gstnoticesupport.in
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <h2>Ready to Get Expert Help?</h2>
          <p>Upload your notice today and get a professional response within 48 hours.</p>
          <div className={styles.btnRow}>
            <Link className="btn btn-primary" href="/pricing">Book a Service</Link>
            <RequestCallbackButton className="btn btn-secondary on-dark">
              Request a Callback
            </RequestCallbackButton>
          </div>
        </div>
      </section>
    </>
  );
}
