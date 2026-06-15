import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Check, AlertTriangle, Upload, Phone,
} from 'lucide-react';
import { PricingScrollButton } from '@/components/pricing/PricingScrollButton';
import { PricingFaqAccordion } from '@/components/pricing/PricingFaqAccordion';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import styles from './pricing.module.css';
import { AnimateIn } from '@/components/ui/AnimateIn';
import {
  pricingMeta, pricingHero, pricingTable, pricingRepresentation,
  pricingPaymentPolicy, pricingFaqHead, pricingCta,
} from '@/data/pricing';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: pricingMeta.title,
  description: pricingMeta.description,
};

const [card1, card2, card3, card4, card5] = pricingTable.cards;

export default function PricingPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-white`}>
        <div className="container">
          <div className={styles.heroInner}>
            <h1>{pricingHero.heading}</h1>
            <p className={styles.sub}>
              {pricingHero.sub}
            </p>
            <PricingScrollButton />
          </div>
        </div>
      </section>

      {/* PRICING TABLE */}
      <section className="section bg-50" id="pricing-table" style={{ paddingTop: '64px' }}>
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{pricingTable.eyebrow}</div>
            <h2>{pricingTable.heading}</h2>
            <p>{pricingTable.sub}</p>
          </div>

          <div className={styles.pricingGrid}>

            {/* ASMT-10 */}
            <AnimateIn delay={0}>
              <div className={styles.pCard}>
                <span className={styles.noticeTag}>{card1.noticeTag}</span>
                <h3>{card1.title}</h3>
                <div className={styles.price}>{card1.priceDisplay}</div>
                <p className={styles.priceSub}>{card1.priceSub}</p>
                <ul className={styles.incList}>
                  {card1.features.map(feature => (
                    <li key={feature}><Check className={styles.ic} aria-hidden="true" />{feature}</li>
                  ))}
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdSpacer} aria-hidden="true" />
                  <Link className="btn btn-primary" href={card1.href}>{card1.ctaLabel}</Link>
                </div>
              </div>
            </AnimateIn>

            {/* SCN Reply */}
            <AnimateIn delay={80}>
              <div className={styles.pCard}>
                <span className={styles.noticeTag}>{card2.noticeTag}</span>
                <h3>{card2.title}</h3>
                <div className={styles.price}>{card2.priceDisplay}</div>
                <p className={styles.priceSub}>{card2.priceSub}</p>
                <ul className={styles.incList}>
                  {card2.features.map(feature => (
                    <li key={feature}><Check className={styles.ic} aria-hidden="true" />{feature}</li>
                  ))}
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdSpacer} aria-hidden="true" />
                  <Link className="btn btn-primary" href={card2.href}>{card2.ctaLabel}</Link>
                </div>
              </div>
            </AnimateIn>

            {/* Commissioner Appeal */}
            <AnimateIn delay={160}>
              <div className={styles.pCard}>
                <span className={styles.noticeTag}>{card3.noticeTag}</span>
                <h3>{card3.title}</h3>
                <div className={styles.price}>{card3.priceDisplay}</div>
                <p className={styles.priceSub}>{card3.priceSub}</p>
                <ul className={styles.incList}>
                  {card3.features.map(feature => (
                    <li key={feature}><Check className={styles.ic} aria-hidden="true" />{feature}</li>
                  ))}
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdNote} role="note" aria-label={card3.predepositNote?.ariaLabel}>
                    <AlertTriangle className={styles.ic} aria-hidden="true" />
                    {card3.predepositNote?.body}
                  </div>
                  <Link className="btn btn-primary" href={card3.href}>{card3.ctaLabel}</Link>
                </div>
              </div>
            </AnimateIn>

            {/* GSTAT Appeal */}
            <AnimateIn delay={240}>
              <div className={styles.pCard}>
                <span className={styles.noticeTag}>{card4.noticeTag}</span>
                <h3>{card4.title}</h3>
                <div className={styles.price}>{card4.priceDisplay}</div>
                <p className={styles.priceSub}>{card4.priceSub}</p>
                <ul className={styles.incList}>
                  {card4.features.map(feature => (
                    <li key={feature}><Check className={styles.ic} aria-hidden="true" />{feature}</li>
                  ))}
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdNote} role="note" aria-label={card4.predepositNote?.ariaLabel}>
                    <AlertTriangle className={styles.ic} aria-hidden="true" />
                    {card4.predepositNote?.body}
                  </div>
                  <Link className="btn btn-primary" href={card4.href}>{card4.ctaLabel}</Link>
                </div>
              </div>
            </AnimateIn>

            {/* Representation Before Authority — consultation-based */}
            <AnimateIn delay={320}>
              <div className={styles.pCard}>
                <span className={styles.noticeTag}>{card5.noticeTag}</span>
                <h3>{card5.title}</h3>
                <div className={styles.price}>{card5.priceDisplay}</div>
                <p className={styles.priceSub}>{card5.priceSub}</p>
                <ul className={styles.incList}>
                  {card5.features.map(feature => (
                    <li key={feature}><Check className={styles.ic} aria-hidden="true" />{feature}</li>
                  ))}
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdSpacer} aria-hidden="true" />
                  <Link className="btn btn-primary" href={card5.href}>{card5.ctaLabel}</Link>
                </div>
              </div>
            </AnimateIn>

          </div>
        </div>
      </section>

      {/* REPRESENTATION SERVICE */}
      <section className="section bg-white">
        <div className="container">
          <div className={styles.repCard}>
            <div className={styles.repText}>
              <span className={styles.repTag}>{pricingRepresentation.tag}</span>
              <h2>{pricingRepresentation.heading}</h2>
              <p>
                {pricingRepresentation.body}
              </p>
            </div>
            <div className={styles.repAction}>
              <Link className="btn btn-primary" href={pricingRepresentation.detailsHref}>
                {pricingRepresentation.detailsLabel}
              </Link>
              <RequestCallbackButton className="btn btn-secondary on-dark">
                {pricingRepresentation.ctaLabel}
              </RequestCallbackButton>
            </div>
          </div>
        </div>
      </section>

      {/* PAYMENT & REFUND POLICY */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{pricingPaymentPolicy.eyebrow}</div>
            <h2>{pricingPaymentPolicy.heading}</h2>
          </div>
          <div className={styles.policyGrid}>
            {pricingPaymentPolicy.items.map(({ Icon, title, body, refund }) => (
              <div key={title} className={refund ? `${styles.policyItem} ${styles.refund}` : styles.policyItem}>
                <div className={styles.icWrap}><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ON PRICING */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{pricingFaqHead.eyebrow}</div>
            <h2>{pricingFaqHead.heading}</h2>
          </div>
          <PricingFaqAccordion />
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className={styles.ctaBanner} id="callback">
        <div className="container">
          <h2>{pricingCta.heading}</h2>
          <p>{pricingCta.sub}</p>
          <div className={styles.btnRow}>
            <Link className="btn btn-primary" href={pricingCta.uploadHref}>
              <Upload size={18} />{pricingCta.uploadLabel}
            </Link>
            <RequestCallbackButton className="btn btn-secondary on-dark">
              <Phone size={18} />{pricingCta.callbackLabel}
            </RequestCallbackButton>
          </div>
        </div>
      </section>
    </>
  );
}
