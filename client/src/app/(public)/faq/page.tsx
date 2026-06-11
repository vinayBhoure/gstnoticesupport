import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { FaqSection } from '@/components/faq/FaqSection';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import styles from './faq.module.css';
import { ORG } from '@/lib/site';
import { faqMeta, faqSchema, faqHero, faqStillQuestions, faqCta } from '@/data/faq';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: faqMeta.title,
  description: faqMeta.description,
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
          <h1>{faqHero.heading}</h1>
          <p className={styles.sub}>
            {faqHero.sub}
          </p>
        </div>
      </section>

      {/* SEARCH + ACCORDION — Client Component */}
      <FaqSection />

      {/* STILL HAVE QUESTIONS */}
      <section className={`${styles.sqxSection} bg-white`}>
        <div className="container">
          <div className="sec-head" style={{ marginBottom: '40px' }}>
            <div className="eyebrow">{faqStillQuestions.eyebrow}</div>
            <h2>{faqStillQuestions.heading}</h2>
            <p>{faqStillQuestions.sub}</p>
          </div>
          <div className={styles.sqxGrid}>

            <div className={styles.sqxCard}>
              <div className={styles.sqxIc} style={{ background: 'rgba(37,211,102,.1)', borderColor: 'rgba(37,211,102,.25)', color: '#128C7E' }} aria-hidden="true">
                <WaIcon />
              </div>
              <span className={styles.sqxLabel}>{faqStillQuestions.whatsapp.label}</span>
              <p style={{ fontSize: '15px', color: 'var(--neutral-600)', lineHeight: 1.5, margin: '0' }}>
                {faqStillQuestions.whatsapp.body}
              </p>
              <a
                className={styles.btnWaCard}
                href={faqStillQuestions.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={faqStillQuestions.whatsapp.ariaLabel}
              >
                <WaIcon />
                {faqStillQuestions.whatsapp.ctaLabel}
              </a>
            </div>

            <div className={styles.sqxCard}>
              <div className={styles.sqxIc} aria-hidden="true">
                <Mail size={22} />
              </div>
              <span className={styles.sqxLabel}>{faqStillQuestions.email.label}</span>
              <a className={styles.sqxValue} href={`mailto:${ORG.email}`} aria-label={faqStillQuestions.email.ariaLabel}>
                {ORG.email}
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <h2>{faqCta.heading}</h2>
          <p>{faqCta.sub}</p>
          <div className={styles.btnRow}>
            <Link className="btn btn-primary" href={faqCta.bookHref}>{faqCta.bookLabel}</Link>
            <RequestCallbackButton className="btn btn-secondary on-dark">
              {faqCta.callbackLabel}
            </RequestCallbackButton>
          </div>
        </div>
      </section>
    </>
  );
}
