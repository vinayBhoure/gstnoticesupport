import type { Metadata } from 'next';
import Link from 'next/link';
import { Receipt, BadgeCheck, MapPin, Clock } from 'lucide-react';
import styles from './about.module.css';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import { ORG } from '@/lib/site';
import { HeroScrollIndicator } from '@/components/ui/HeroScrollIndicator';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About Us | GST Notice Support',
  description: 'GST Notice Support Pvt. Ltd. — ICAI-registered Chartered Accountants and Bar Council-enrolled Advocates handling GST notices, replies, and appeals across India. Fixed fees, 48-hour drafts, full transparency.',
};

export default function AboutPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-white`} style={{ position: 'relative' }}>
        <div className="container">
          <h1>India&#39;s GST Litigation Experts — Backed by Real Credentials</h1>
          <p className={styles.sub}>
            We are a team of ICAI-registered Chartered Accountants and Bar Council-enrolled Advocates
            specialising in GST litigation, notice handling, and appellate representation across India.
          </p>
          <div className={styles.ctaRow}>
            <a
              className="btn btn-primary"
              href="https://wa.me/919343297622?text=Hello%2C%20I%20want%20to%20know%20more%20about%20GST%20Notice%20Support%20services.%20Please%20assist%20me."
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Service
            </a>
            <RequestCallbackButton className="btn btn-secondary">Request Callback</RequestCallbackButton>
          </div>
        </div>
        <HeroScrollIndicator />
      </section>

      {/* MISSION & VISION */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head" style={{ marginBottom: '36px' }}>
            <div className="eyebrow">Who we are</div>
            <h2>Mission &amp; Vision</h2>
          </div>
          <div className={styles.mvGrid}>
            <div className={styles.mvPanel}>
              <span className={styles.mvLabel}>Our Mission</span>
              <h3>Reliable GST Litigation Support</h3>
              <p>To provide businesses with reliable, professional, and strategic GST litigation support while minimising tax risks and ensuring full compliance.</p>
            </div>
            <div className={styles.mvPanel}>
              <span className={styles.mvLabel}>Our Vision</span>
              <h3>India&#39;s Most Trusted GST Platform</h3>
              <p>To become India&#39;s most trusted GST litigation and tax advisory platform by delivering excellence, integrity, and value-driven professional services.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY IDENTITY */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head left" style={{ marginBottom: '36px' }}>
            <div className="eyebrow">Legal identity</div>
            <h2>Company Details</h2>
          </div>
          <div className={styles.companyGrid}>
            <div className={styles.companyText}>
              <p>GST Notice Support Pvt. Ltd. is a professionally managed company established with the singular focus of helping Indian businesses navigate the increasingly complex GST litigation landscape. We operate nationally, serving CAs, Advocates, and SME owners who need expert help responding to tax notices and filing appeals.</p>
              <p>Our registered office is in {ORG.address.locality}, {ORG.address.region}. All professional services are delivered by ICAI-registered Chartered Accountants and Bar Council-enrolled Advocates. We do not engage generalist legal or tax advisors for client work.</p>
            </div>
            <aside className={styles.companyRef} aria-label="Company legal reference">
              <h3>{ORG.legalName}</h3>
              <div className={styles.refRow}>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>Registered Address</span>
                  <span className={styles.refValue}>
                    {ORG.address.street},<br />
                    {ORG.address.locality}, {ORG.address.region} {ORG.address.postalCode}
                  </span>
                </div>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>Grievance Contact</span>
                  <span className={styles.refValue}>{ORG.grievanceOfficer}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head" style={{ marginBottom: '48px' }}>
            <div className="eyebrow">Our difference</div>
            <h2>Why Clients Trust Us</h2>
          </div>
          <div className={styles.whyGrid}>
            <div className={styles.whyItem}>
              <div className={styles.icWrap} aria-hidden="true"><Receipt size={22} /></div>
              <div className={styles.whyBody}>
                <h3>Fixed, Transparent Fees</h3>
                <p>Every service carries a published fixed fee. No hourly billing, no retainer, no hidden charges. You see the price before you book.</p>
              </div>
            </div>
            <div className={styles.whyItem}>
              <div className={styles.icWrap} aria-hidden="true"><BadgeCheck size={22} /></div>
              <div className={styles.whyBody}>
                <h3>ICAI &amp; Bar Council Registered</h3>
                <p>Work is handled exclusively by ICAI-registered CAs and Bar Council-enrolled Advocates — not paralegals or document generalists.</p>
              </div>
            </div>
            <div className={styles.whyItem}>
              <div className={styles.icWrap} aria-hidden="true"><MapPin size={22} /></div>
              <div className={styles.whyBody}>
                <h3>Pan-India Service</h3>
                <p>We serve clients across all Indian states and union territories. GST portal filings are done remotely — no in-person visit required.</p>
              </div>
            </div>
            <div className={styles.whyItem}>
              <div className={styles.icWrap} aria-hidden="true"><Clock size={22} /></div>
              <div className={styles.whyBody}>
                <h3>48-Hour Draft Turnaround</h3>
                <p>Most service drafts are prepared within 48 hours of complete document receipt. GSTAT appeals allow 72 hours given higher complexity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.ctaBanner} id="book">
        <div className="container">
          <h2>Have a GST Notice? Let&#39;s Handle It.</h2>
          <p>Expert filing and appeal support — fixed fee, no surprises.</p>
          <div className={styles.btnRow}>
            <a
              className="btn btn-primary"
              href="https://wa.me/919343297622?text=Hello%2C%20I%20want%20to%20know%20more%20about%20GST%20Notice%20Support%20services.%20Please%20assist%20me."
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Service
            </a>
            <RequestCallbackButton className="btn btn-secondary on-dark">
              Request a Callback
            </RequestCallbackButton>
          </div>
        </div>
      </section>
    </>
  );
}
