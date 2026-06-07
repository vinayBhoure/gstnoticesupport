import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Check, AlertTriangle, CreditCard, Ban, Upload, Phone,
} from 'lucide-react';
import { PricingScrollButton } from '@/components/pricing/PricingScrollButton';
import { PricingFaqAccordion } from '@/components/pricing/PricingFaqAccordion';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import styles from './pricing.module.css';
import { AnimateIn } from '@/components/ui/AnimateIn';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Pricing | GST Notice Support',
  description: 'Transparent, fixed pricing for GST notice and appeal services. SCN Reply ₹5,999 · Commissioner Appeal ₹9,999 · GSTAT Appeal ₹14,999. No hourly billing, no hidden fees.',
};

export default function PricingPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-white`}>
        <div className="container">
          <div className={styles.heroInner}>
            <h1>Transparent, Fixed Pricing. No Hourly Billing. No Hidden Fees.</h1>
            <p className={styles.sub}>
              Every service has a fixed professional fee. You see the price before you book. Final fee is
              confirmed before any payment is taken.
            </p>
            <PricingScrollButton />
          </div>
        </div>
      </section>

      {/* PRICING TABLE */}
      <section className="section bg-50" id="pricing-table" style={{ paddingTop: '64px' }}>
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Services &amp; fees</div>
            <h2>All Services, All Prices</h2>
            <p>Professional fees are fixed. What you see is what you pay.</p>
          </div>

          <div className={styles.pricingGrid}>

            {/* ASMT-10 */}
            <AnimateIn delay={0}>
              <div className={styles.pCard}>
                <span className={styles.noticeTag}>Section 61 CGST Act scrutiny</span>
                <h3>ASMT-10 Reply</h3>
                <div className={styles.price}>₹2,999</div>
                <p className={styles.priceSub}>One-time professional fee</p>
                <ul className={styles.incList}>
                  <li><Check className={styles.ic} aria-hidden="true" />Expert review of your documents</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Structured reply draft</li>
                  <li><Check className={styles.ic} aria-hidden="true" />One revision round</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Portal filing support</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Draft within 48 hours</li>
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdSpacer} aria-hidden="true" />
                  <Link className="btn btn-primary" href="/services/asmt-10">Book ASMT-10 Reply</Link>
                </div>
              </div>
            </AnimateIn>

            {/* SCN Reply — Most Popular */}
            <AnimateIn delay={80}>
              <div className={`${styles.pCard} ${styles.popular}`}>
                <span className={styles.popularBadge} aria-label="Most popular service">Most Popular</span>
                <span className={styles.noticeTag}>DRC-01 / DRC-01A demand notice</span>
                <h3>SCN Reply</h3>
                <div className={styles.price}>₹5,999</div>
                <p className={styles.priceSub}>One-time professional fee</p>
                <ul className={styles.incList}>
                  <li><Check className={styles.ic} aria-hidden="true" />Expert review of your documents</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Structured reply draft</li>
                  <li><Check className={styles.ic} aria-hidden="true" />One revision round</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Portal filing support</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Draft within 48 hours</li>
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdSpacer} aria-hidden="true" />
                  <Link className="btn btn-primary" href="/services/scn-reply">Book SCN Reply</Link>
                </div>
              </div>
            </AnimateIn>

            {/* Commissioner Appeal */}
            <AnimateIn delay={160}>
              <div className={styles.pCard}>
                <span className={styles.noticeTag}>APL-01 first appeal</span>
                <h3>Commissioner Appeal</h3>
                <div className={styles.price}>₹9,999</div>
                <p className={styles.priceSub}>One-time professional fee</p>
                <ul className={styles.incList}>
                  <li><Check className={styles.ic} aria-hidden="true" />Expert review of your documents</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Complete appeal bundle draft</li>
                  <li><Check className={styles.ic} aria-hidden="true" />One revision round</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Portal filing support</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Draft within 48 hours</li>
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdNote} role="note" aria-label="Government pre-deposit note">
                    <AlertTriangle className={styles.ic} aria-hidden="true" />
                    <p><strong>Govt. pre-deposit:</strong> 10% of disputed tax — paid by you to GST portal. Not our fee.</p>
                  </div>
                  <Link className="btn btn-primary" href="/services/commissioner-appeal">Book Commissioner Appeal</Link>
                </div>
              </div>
            </AnimateIn>

            {/* GSTAT Appeal */}
            <AnimateIn delay={240}>
              <div className={styles.pCard}>
                <span className={styles.noticeTag}>APL-05 second appeal</span>
                <h3>GSTAT Appeal</h3>
                <div className={styles.price}>₹14,999</div>
                <p className={styles.priceSub}>One-time professional fee</p>
                <ul className={styles.incList}>
                  <li><Check className={styles.ic} aria-hidden="true" />Expert review of your documents</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Complete APL-05 bundle draft</li>
                  <li><Check className={styles.ic} aria-hidden="true" />One revision round</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Portal filing support</li>
                  <li><Check className={styles.ic} aria-hidden="true" />Draft within 72 hours</li>
                </ul>
                <div className={styles.cardBottom}>
                  <div className={styles.pdNote} role="note" aria-label="Government pre-deposit note">
                    <AlertTriangle className={styles.ic} aria-hidden="true" />
                    <p><strong>Govt. pre-deposit:</strong> 20% of disputed tax — paid by you to GST portal. Not our fee.</p>
                  </div>
                  <Link className="btn btn-primary" href="/services/gstat-appeal">Book GSTAT Appeal</Link>
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
              <span className={styles.repTag}>Consultation-based · offline service</span>
              <h2>Representation Before Tax Authority</h2>
              <p>
                Handling where physical or virtual appearance before the GST Officer or Appellate Authority is
                required. Pricing depends on case complexity, jurisdiction, and hearing schedule. This service
                is discussed and confirmed offline before any engagement.
              </p>
            </div>
            <div className={styles.repAction}>
              <RequestCallbackButton className="btn btn-secondary on-dark">
                Request a Callback for Representation
              </RequestCallbackButton>
            </div>
          </div>
        </div>
      </section>

      {/* PAYMENT & REFUND POLICY */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">How payment works</div>
            <h2>Payment Policy</h2>
          </div>
          <div className={styles.policyGrid}>
            <div className={styles.policyItem}>
              <div className={styles.icWrap}><CreditCard size={22} /></div>
              <h3>Full Payment Upfront</h3>
              <p>Payment is taken before draft delivery. You review a partial preview before full payment — so you know work has begun before committing.</p>
            </div>
            <div className={styles.policyItem}>
              <div className={styles.icWrap}><Ban size={22} /></div>
              <h3>No EMI, No Partial Payment</h3>
              <p>Services are priced as fixed units. We do not split payments or offer instalment plans. The fee you see is the fee you pay, once.</p>
            </div>
            <div className={`${styles.policyItem} ${styles.refund}`}>
              <div className={styles.icWrap}><AlertTriangle size={22} /></div>
              <h3>No Refund Policy</h3>
              <p>Once draft preparation begins, payment is non-refundable. We are transparent about this before you pay — not in fine print after. Our Refund Policy is linked in the footer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ON PRICING */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Common questions</div>
            <h2>Questions About Pricing</h2>
          </div>
          <PricingFaqAccordion />
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className={styles.ctaBanner} id="callback">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Upload your notice now, or speak to an expert first.</p>
          <div className={styles.btnRow}>
            <Link className="btn btn-primary" href="/contact">
              <Upload size={18} />Upload Your Notice
            </Link>
            <RequestCallbackButton className="btn btn-secondary on-dark">
              <Phone size={18} />Request a Callback
            </RequestCallbackButton>
          </div>
        </div>
      </section>
    </>
  );
}
