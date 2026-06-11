import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2, ShieldCheck, Clock, Check, AlertTriangle,
} from 'lucide-react';
import styles from '../service.module.css';
import { JsonLd } from '@/components/seo/JsonLd';
import { serviceSchema } from '@/lib/structured-data';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import { asmt10Content as content } from '@/data/services/asmt10';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
};

export default function Asmt10Page() {
  return (
    <>
      <JsonLd data={serviceSchema(content.schema)} />
      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-white`}>
        <div className="container">
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className={styles.sep} aria-hidden="true">›</span>
            <Link href="/#notices">Services</Link>
            <span className={styles.sep} aria-hidden="true">›</span>
            <span aria-current="page">{content.breadcrumbLabel}</span>
          </nav>

          <div className={styles.heroRef}>{content.hero.refLine}</div>
          <h1>{content.hero.heading}</h1>
          <p className={styles.sub}>{content.hero.sub}</p>

          <div className={styles.heroCta}>
            <a
              className="btn btn-primary"
              href={content.hero.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content.hero.bookLabel}
            </a>
            <RequestCallbackButton className="btn btn-secondary">{content.hero.callbackLabel}</RequestCallbackButton>
          </div>

          <div className={styles.amberAlert} role="alert" aria-live="polite">
            <div className={styles.icWrap} aria-hidden="true">
              <AlertTriangle size={18} />
            </div>
            <div className={styles.alertBody}>
              <span className={styles.alertLbl}>{content.deadlineAlert?.label}</span>
              {content.deadlineAlert?.body}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS AN ASMT-10 */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head left">
            <div className="eyebrow">{content.whatIs.eyebrow}</div>
            <h2>{content.whatIs.heading}</h2>
          </div>
          <div className={styles.whatisGrid}>
            <div className={styles.whatisText}>
              {content.whatIs.paragraphs}
            </div>
            <aside className={`card card-elev ${styles.callout}`} aria-label={content.whatIs.callout.ariaLabel}>
              <span className={styles.calloutLbl}>{content.whatIs.callout.label}</span>
              <div className={styles.refRow}>{content.whatIs.callout.refRow}</div>
              {content.whatIs.callout.paragraphs}
            </aside>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{content.deliverables.eyebrow}</div>
            <h2>{content.deliverables.heading}</h2>
            <p>{content.deliverables.sub}</p>
          </div>
          <div className={styles.doGrid3}>
            {content.deliverables.cards.map(({ Icon, title, description }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className={`card card-elev ${styles.doCard}`}>
                  <div className={styles.icWrap}><Icon size={24} /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* DOCUMENTS REQUIRED */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{content.documents.eyebrow}</div>
            <h2>{content.documents.heading}</h2>
            <p>{content.documents.sub}</p>
          </div>
          <ul className={styles.docChecklist}>
            {content.documents.items.map(item => (
              <li key={item.name}>
                <CheckCircle2 className={styles.ic} aria-hidden="true" />
                <div className={styles.docItemBody}>
                  <span className={styles.nm}>{item.name}</span>
                  <span className={styles.fmt}>{item.format}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.docReassure}>
            <ShieldCheck className={styles.ic} aria-hidden="true" />
            {content.documents.reassure}
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{content.steps.eyebrow}</div>
            <h2>{content.steps.heading}</h2>
          </div>
          <div className={styles.steps}>
            {content.steps.items.map((step, i) => (
              <AnimateIn key={step.title} delay={i * 120}>
                <div className={styles.step}>
                  <div className={styles.num}>{i + 1}</div>
                  <div className={styles.stepBody}>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                    {step.sla && (
                      <span className={`badge badge-amber ${styles.sla}`}>
                        <Clock size={13} />{step.sla}
                      </span>
                    )}
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING & CTA */}
      <section className="section bg-deep on-dark" id="book">
        <div className="container">
          <div className={styles.pricingBlock}>
            <h2>{content.pricing.heading}</h2>
            <p className={styles.lede}>{content.pricing.lede}</p>

            <div className={styles.priceCard}>
              <div className={styles.amt}>{content.pricing.amount}</div>
              <span className={styles.amtMeta}>{content.pricing.amountMeta}</span>

              <div className={styles.divider} aria-hidden="true" />

              <div className={styles.incLabel}>{content.pricing.includedLabel}</div>
              <ul>
                {content.pricing.included.map(item => (
                  <li key={item}><Check className={styles.ic} aria-hidden="true" />{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.ctaRow}>
              <a
                className="btn btn-primary"
                href={content.pricing.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content.pricing.ctaLabel}
              </a>
            </div>
            <p className={styles.payNote}>{content.pricing.payNote}</p>
          </div>
        </div>
      </section>
    </>
  );
}
