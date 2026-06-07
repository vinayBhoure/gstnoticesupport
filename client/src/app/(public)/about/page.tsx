import type { Metadata } from 'next';
import Link from 'next/link';
import {
  User, ShieldCheck, Receipt, BadgeCheck, MapPin, Clock,
} from 'lucide-react';
import styles from './about.module.css';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About Us | GST Notice Support',
  description: 'Meet the ICAI-registered Chartered Accountants and Bar Council Advocates behind GST Notice Support — India\'s GST litigation experts.',
};

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function AboutPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-white`}>
        <div className="container">
          <h1>India&#39;s GST Litigation Experts — Backed by Real Credentials</h1>
          <p className={styles.sub}>
            We are a team of ICAI-registered Chartered Accountants and Bar Council-enrolled Advocates
            specialising in GST litigation, notice handling, and appellate representation across India.
          </p>
          <div className={styles.ctaRow}>
            <Link className="btn btn-primary" href="/pricing">Book a Service</Link>
            <RequestCallbackButton className="btn btn-secondary">Request Callback</RequestCallbackButton>
          </div>
        </div>
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

      {/* EXPERT TEAM */}
      {/*
        Photo placeholders — replace .teamPhoto with real <img> when professional portraits
        are provided (neutral backdrop, 3:4 ratio). Do NOT use stock photos or avatars.
      */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">The people</div>
            <h2>Meet the Team</h2>
            <p>Every case is handled by credentialled professionals — not generalists. Real registrations, real accountability.</p>
          </div>
          <div className={styles.teamGrid}>

            <article className={styles.teamCard}>
              <div className={styles.teamPhoto} aria-label="Photo placeholder — Rajesh Kumar Sharma, ICAI-Registered CA">
                <div className={styles.phIcon} aria-hidden="true"><User size={28} /></div>
                <span className={styles.phLabel}>Professional portrait<br />3 : 4 · neutral backdrop</span>
                <span className={styles.phFlag}>⚠ Photo required</span>
              </div>
              <div className={styles.teamBody}>
                <h3>Rajesh Kumar Sharma</h3>
                <span className={styles.teamCredBadge}>
                  <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />
                  ICAI-Registered CA
                </span>
                <span className={styles.teamReg} aria-label="ICAI Registration number">ICAI Reg: M[PLACEHOLDER]</span>
                <p className={styles.teamSpec}>Specialises in GST litigation, SCN replies, and appellate proceedings before Appellate Authorities.</p>
                <div className={styles.teamFooter}>
                  <a className={styles.teamLinkedin} href="https://linkedin.com/company/gstnoticesupport" aria-label="GST Notice Support on LinkedIn" rel="noopener noreferrer" target="_blank">
                    <LinkedInIcon />
                  </a>
                </div>
              </div>
            </article>

            <article className={styles.teamCard}>
              <div className={styles.teamPhoto} aria-label="Photo placeholder — Priya Venkataraman, Bar Council Advocate">
                <div className={styles.phIcon} aria-hidden="true"><User size={28} /></div>
                <span className={styles.phLabel}>Professional portrait<br />3 : 4 · neutral backdrop</span>
                <span className={styles.phFlag}>⚠ Photo required</span>
              </div>
              <div className={styles.teamBody}>
                <h3>Priya Venkataraman</h3>
                <span className={styles.teamCredBadge}>
                  <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />
                  Bar Council Advocate
                </span>
                <span className={styles.teamReg} aria-label="Bar Council enrolment number">Bar No: KAR/[PLACEHOLDER]/2016</span>
                <p className={styles.teamSpec}>Specialises in GST appellate representation, GSTAT filings, and departmental hearings across Karnataka and Tamil Nadu.</p>
                <div className={styles.teamFooter}>
                  <a className={styles.teamLinkedin} href="https://linkedin.com/company/gstnoticesupport" aria-label="GST Notice Support on LinkedIn" rel="noopener noreferrer" target="_blank">
                    <LinkedInIcon />
                  </a>
                </div>
              </div>
            </article>

            <article className={styles.teamCard}>
              <div className={styles.teamPhoto} aria-label="Photo placeholder — Anil Mehta, ICAI-Registered CA">
                <div className={styles.phIcon} aria-hidden="true"><User size={28} /></div>
                <span className={styles.phLabel}>Professional portrait<br />3 : 4 · neutral backdrop</span>
                <span className={styles.phFlag}>⚠ Photo required</span>
              </div>
              <div className={styles.teamBody}>
                <h3>Anil Mehta</h3>
                <span className={styles.teamCredBadge}>
                  <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />
                  ICAI-Registered CA
                </span>
                <span className={styles.teamReg} aria-label="ICAI Registration number">ICAI Reg: M[PLACEHOLDER]</span>
                <p className={styles.teamSpec}>Specialises in ASMT-10 scrutiny responses, ITC reconciliation disputes, and DRC-01A reply strategy.</p>
                <div className={styles.teamFooter}>
                  <a className={styles.teamLinkedin} href="https://linkedin.com/company/gstnoticesupport" aria-label="GST Notice Support on LinkedIn" rel="noopener noreferrer" target="_blank">
                    <LinkedInIcon />
                  </a>
                </div>
              </div>
            </article>

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
              <p>Our registered office is in Bengaluru, Karnataka. All professional services are delivered by ICAI-registered Chartered Accountants and Bar Council-enrolled Advocates. We do not engage generalist legal or tax advisors for client work.</p>
              <p>Our CIN and GSTIN are listed for reference and can be verified on the MCA portal and GST portal respectively. We believe legal identity transparency is a baseline requirement for any professional services firm.</p>
            </div>
            <aside className={styles.companyRef} aria-label="Company legal reference">
              <h3>GST Notice Support Pvt. Ltd.</h3>
              <div className={styles.refRow}>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>CIN</span>
                  <span className={`${styles.refValue} ${styles.refMono}`}>U74999KA2024PTC000000</span>
                </div>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>Company GSTIN</span>
                  <span className={`${styles.refValue} ${styles.refMono}`}>29ABCDE1234F1Z5</span>
                </div>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>Registered Address</span>
                  <span className={styles.refValue}>4th Floor, Prestige Centre, MG Road,<br />Bengaluru, Karnataka 560001</span>
                </div>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>Grievance Officer</span>
                  <span className={styles.refValue}>
                    Ananya Rao ·{' '}
                    <a href="mailto:grievance@gstnoticesupport.in" style={{ color: 'var(--accent-green)' }}>
                      grievance@gstnoticesupport.in
                    </a>
                  </span>
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
