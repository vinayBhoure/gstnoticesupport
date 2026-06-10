import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin, Check, FileSearch, FileWarning, Gavel, Landmark, ArrowRight,
  Clock, AlertTriangle, UserCheck, ClipboardList, MessageSquare,
  ShieldCheck, Tag, CheckCircle, Lock, Scale, List,
} from 'lucide-react';
import { Testimonials } from '@/components/home/Testimonials';
import { FaqAccordion } from '@/components/home/FaqAccordion';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HeroScrollIndicator } from '@/components/ui/HeroScrollIndicator';
import { CountUp } from '@/components/ui/CountUp';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import styles from './page.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: {
    absolute: 'GST Notice Support | Get Expert Legal Support in 24 Hours',
  },
  description:
    'Received a GST notice? ICAI-registered CAs and Bar Council-enrolled Advocates prepare your reply, appeal, or representation — fixed fee, draft within 48 hours, pan-India.',
  alternates: {
    canonical: '/',
  },
  // openGraph/twitter are intentionally inherited from the root layout so the
  // generated share image, site name, locale and type are not dropped — a
  // page-level openGraph object would shallow-replace the root one (Next 16).
};

export default function HomePage() {
  return (
    <>
      {/* 1. HERO */}
      <section className={`${styles.hero} bg-white`} style={{ position: 'relative' }}>
        <div className="container">
          <div className={styles.grid}>
              <AnimateIn delay={0} distance={32}>
                <span className="badge badge-outline">
                  <MapPin style={{ width: 14, height: 14, color: 'var(--accent-green)' }} />
                  Trusted GST Litigation Experts · Pan-India
                </span>
                <h1>GST Notice? Get Expert Legal Support in 24 Hours.</h1>
                <p className={styles.sub}>
                  Our team of ICAI-registered CAs and Bar Council-enrolled Advocates prepare your reply,
                  appeal, or representation — fully managed, fixed fee.
                </p>
                <div className={styles.cta}>
                  <a
                    className="btn btn-primary"
                    href="https://wa.me/919343297622?text=Hello%2C%20I%27m%20want%20to%20know%20more%20about%20GST%20Notice%20Support"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Service
                  </a>
                  <RequestCallbackButton className="btn btn-secondary">Request a Callback</RequestCallbackButton>
                </div>
                <div className={styles.reassure}>
                  <span><Check className="ic" />Response within 24 hours</span>
                  <span><Check className="ic" />Fixed fee, no hidden charges</span>
                  <span><Check className="ic" />Pan-India service</span>
                  <span><Check className="ic" />Documents encrypted</span>
                </div>
              </AnimateIn>

              <div className={styles.heroArt} aria-hidden="true">
                <video
                  className={styles.heroVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/hero-section.mp4" type="video/mp4" />
                </video>
              </div>
          </div>
        </div>
        <HeroScrollIndicator />
      </section>

      {/* 3. NOTICE TYPE SELECTOR */}
      <section className="section bg-50" id="notices">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Choose your service</div>
            <h2>What Type of Notice Did You Receive?</h2>
            <p>Select your notice type to begin. Fixed professional fee shown for each.</p>
          </div>
          <div className={styles.noticeGrid}>
            <AnimateIn delay={0}>
              <Link className={`card ${styles.noticeCard}`} href="/services/asmt-10">
                <div className={styles.icWrap}><FileSearch style={{ width: 23, height: 23 }} /></div>
                <h3>ASMT-10 Scrutiny Notice</h3>
                <p className={styles.desc}>Issued under Section 61 of the CGST Act when the authority detects return discrepancies. Our CAs prepare a structured, evidence-backed reply and ensure your input tax credit remains protected.</p>
                <div className={styles.price}>₹2,999 <small>fixed fee</small></div>
                <div className={styles.foot}><span className={styles.getlink}>Get Help <ArrowRight style={{ width: 15, height: 15 }} /></span></div>
              </Link>
            </AnimateIn>
            <AnimateIn delay={100}>
              <Link className={`card ${styles.noticeCard}`} href="/services/scn-reply">
                <div className={styles.icWrap}><FileWarning style={{ width: 23, height: 23 }} /></div>
                <h3>Show Cause Notice (SCN)</h3>
                <p className={styles.desc}>A formal demand alleging unpaid tax, interest, and penalties under DRC-01 or DRC-01A. Without a legally sound reply you risk ex-parte adjudication and recovery proceedings. Our Advocates draft a response backed by case law and your financials.</p>
                <div className={styles.price}>₹5,999 <small>fixed fee</small></div>
                <div className={styles.foot}><span className={styles.getlink}>Get Help <ArrowRight style={{ width: 15, height: 15 }} /></span></div>
              </Link>
            </AnimateIn>
            <AnimateIn delay={200}>
              <Link className={`card ${styles.noticeCard}`} href="/services/commissioner-appeal">
                <div className={styles.icWrap}><Gavel style={{ width: 23, height: 23 }} /></div>
                <h3>Commissioner Appeal</h3>
                <p className={styles.desc}>Filed as an APL-01 against an unfavourable adjudicating authority order. We draft the grounds of appeal, compile supporting documents, and represent you before the Commissioner (Appeals).</p>
                <div className={styles.price}>₹9,999 <small>fixed fee</small></div>
                <div className={styles.foot}><span className={styles.getlink}>Get Help <ArrowRight style={{ width: 15, height: 15 }} /></span></div>
              </Link>
            </AnimateIn>
            <AnimateIn delay={300}>
              <Link className={`card ${styles.noticeCard}`} href="/services/gstat-appeal">
                <div className={styles.icWrap}><Landmark style={{ width: 23, height: 23 }} /></div>
                <h3>GSTAT Appeal</h3>
                <p className={styles.desc}>The GST Appellate Tribunal is the last fact-finding forum before the High Court. We file APL-05 applications, research precedents, and provide full representation. Statutory pre-deposit is mandatory and not included in the fee.</p>
                <div className={styles.price}>₹14,999 <small>fixed fee</small></div>
                <span className={`badge badge-amber ${styles.badgeAmber}`}>
                  <AlertTriangle style={{ width: 13, height: 13 }} />Pre-deposit required by law
                </span>
                <div className={styles.foot}><span className={styles.getlink}>Get Help <ArrowRight style={{ width: 15, height: 15 }} /></span></div>
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">The process</div>
            <h2>From Notice to Resolution in 4 Steps</h2>
          </div>
          <div className={styles.steps}>
            <AnimateIn delay={0}>
              <div className={styles.step}>
                <div className={styles.num}>1</div>
                <div className={styles.stepBody}>
                  <h3>Upload Documents</h3>
                  <p>Share your notice and supporting documents securely through our encrypted portal.</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={120}>
              <div className={styles.step}>
                <div className={styles.num}>2</div>
                <div className={styles.stepBody}>
                  <h3>Expert Review &amp; Draft Preparation</h3>
                  <p>A qualified CA or Advocate assesses your case and prepares the response.</p>
                  <span className={`badge badge-amber ${styles.sla}`}>
                    <Clock style={{ width: 13, height: 13 }} />Draft prepared within 48 hours of document receipt
                  </span>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={240}>
              <div className={styles.step}>
                <div className={styles.num}>3</div>
                <div className={styles.stepBody}>
                  <h3>You Review &amp; Confirm</h3>
                  <p>Review the draft, raise questions, and confirm before anything is filed.</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={360}>
              <div className={styles.step}>
                <div className={styles.num}>4</div>
                <div className={styles.stepBody}>
                  <h3>We File on Portal</h3>
                  <p>We submit your response on the GST portal and share the acknowledgement.</p>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* 5. WHY BUSINESSES TRUST US */}
      <section className="section bg-50" id="trust">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Trusted by CAs, Advocates &amp; Businesses</div>
            <h2>Why Businesses Trust GSTNoticeSupport</h2>
            <p style={{ fontSize: 20, color: 'var(--neutral-600)' }}>
              Institutional expertise, structured process, and full transparency — from the first notice to the final filing.
            </p>
          </div>
          <div className={styles.trustGrid}>
            {[
              { Icon: UserCheck, title: 'Qualified Professionals', desc: 'Cases handled by experienced CAs, Advocates, and GST practitioners with domain-specific litigation expertise.' },
              { Icon: ClipboardList, title: 'Structured Review Process', desc: 'Every notice follows a documented review and response workflow — no ad-hoc handling.' },
              { Icon: MessageSquare, title: 'Transparent Communication', desc: 'Clear timelines, case status updates, and defined deliverables at every stage.' },
              { Icon: ShieldCheck, title: 'Secure Document Handling', desc: 'All uploaded documents are encrypted, access-controlled, and never shared with third parties.' },
              { Icon: MapPin, title: 'Pan-India Representation', desc: 'GST litigation and appeal assistance across all jurisdictions throughout India.' },
              { Icon: Tag, title: 'No Hidden Charges', desc: 'Fixed-fee pricing with clearly defined scope. What you see on the pricing page is what you pay.' },
            ].map(({ Icon, title, desc }, i) => (
              <AnimateIn key={title} delay={i * 80}>
                <div className={styles.trustCard}>
                  <Icon className={styles.tcIcon} />
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CASE OUTCOMES */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Track record</div>
            <h2>Results That Speak for Themselves</h2>
          </div>
          <AnimateIn>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.n}><CountUp value={500} suffix="+" /></div>
                <div className={styles.d}>Notices Handled</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.n}>₹<CountUp value={12} suffix="L" /></div>
                <div className={styles.d}>Avg. Dispute Value Resolved</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.n}><CountUp value={48} suffix="hrs" /></div>
                <div className={styles.d}>Average Draft Time</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.n}><CountUp value={100} suffix="%" /></div>
                <div className={styles.d}>Cases Acknowledged Within 24 Hours</div>
              </div>
            </div>
          </AnimateIn>
          <div className={styles.cases}>
            {[
              { ct: 'SCN Reply', issue: '₹8.4L ITC demand under DRC-01 for alleged ineligible credit.', out: 'Reply accepted, no penalty levied.' },
              { ct: 'ASMT-10 Scrutiny', issue: 'GSTR-3B vs 2A mismatch flagged for FY 2021-22.', out: 'Discrepancy explained; proceedings dropped.' },
              { ct: 'Commissioner Appeal', issue: '₹15.2L demand confirmed by adjudicating authority.', out: 'Demand reduced by 70% on appeal.' },
            ].map(({ ct, issue, out }, i) => (
              <AnimateIn key={ct} delay={i * 100}>
                <div className={`card ${styles.case}`}>
                  <div className={styles.ct}>{ct}</div>
                  <div className={styles.issue}>{issue}</div>
                  <div className={styles.out}><CheckCircle className={styles.ic} />{out}</div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRUST & SECURITY */}
      <section className="section bg-deep on-dark">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow" style={{ color: '#7FD3A6' }}>Security &amp; transparency</div>
            <h2 style={{ color: '#fff' }}>Your Documents Are Safe With Us</h2>
          </div>
          <div className={styles.pillars}>
            {[
              { Icon: Lock, title: 'Encrypted Storage', desc: 'Every document is encrypted in transit and at rest. Your files are confidential and never shared with third parties.' },
              { Icon: Scale, title: 'Regulated Professionals', desc: 'Your case is handled only by ICAI-registered CAs and Bar Council-enrolled Advocates — verifiable registration numbers.' },
              { Icon: ClipboardList, title: 'Full Transparency', desc: 'Fixed professional fee quoted upfront. No hidden charges, no surprise add-ons after you\'ve signed up.' },
            ].map(({ Icon, title, desc }, i) => (
              <AnimateIn key={title} delay={i * 120}>
                <div className={styles.pillar}>
                  <div className={styles.icWrap}><Icon style={{ width: 28, height: 28 }} /></div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PRICING */}
      <section className="section bg-50" id="pricing">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Pricing</div>
            <h2>Transparent, Fixed Fees. No Surprises.</h2>
          </div>
          <div className={styles.tiers}>
            <AnimateIn delay={0}>
              <div className={`card ${styles.tier}`}>
                <h3>ASMT-10 Reply</h3>
                <div className={styles.price}>₹2,999</div>
                <ul>
                  {['Section 61 discrepancy analysis', 'Drafted reply to ASMT-10', 'Filing on GST portal', 'Acknowledgement shared'].map(f => (
                    <li key={f}><Check className={styles.ic} />{f}</li>
                  ))}
                </ul>
                <div className={styles.tierFoot}>
                  <Link className="btn btn-secondary btn-block" href="/services/asmt-10">Book This Service</Link>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={100}>
              <div className={`card ${styles.tier} ${styles.popular}`}>
                <span className={`badge badge-green ${styles.popBadge}`}>Most Popular</span>
                <h3>SCN Reply</h3>
                <div className={styles.price}>₹5,999</div>
                <ul>
                  {['DRC-01 / DRC-01A case review', 'Detailed reply with case law', 'Filing on GST portal', 'Acknowledgement shared'].map(f => (
                    <li key={f}><Check className={styles.ic} />{f}</li>
                  ))}
                </ul>
                <div className={styles.tierFoot}>
                  <Link className="btn btn-primary btn-block" href="/services/scn-reply">Book This Service</Link>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={200}>
              <div className={`card ${styles.tier}`}>
                <h3>Commissioner Appeal</h3>
                <div className={styles.price}>₹9,999</div>
                <ul>
                  {['APL-01 appeal drafting', 'Grounds of appeal & statement', 'Filing before Commissioner (Appeals)', 'Acknowledgement shared'].map(f => (
                    <li key={f}><Check className={styles.ic} />{f}</li>
                  ))}
                </ul>
                <div className={styles.tierFoot}>
                  <Link className="btn btn-secondary btn-block" href="/services/commissioner-appeal">Book This Service</Link>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={300}>
              <div className={`card ${styles.tier}`}>
                <h3>GSTAT Appeal</h3>
                <div className={styles.price}>₹14,999</div>
                <ul>
                  {['APL-05 tribunal filing', 'Grounds of appeal & statement', 'Filing before Appellate Tribunal', 'Acknowledgement shared'].map(f => (
                    <li key={f}><Check className={styles.ic} />{f}</li>
                  ))}
                </ul>
                <div className={styles.tierFoot}>
                  <span className="badge badge-amber">
                    <AlertTriangle style={{ width: 13, height: 13 }} />Pre-deposit required by law
                  </span>
                  <Link className="btn btn-secondary btn-block" href="/services/gstat-appeal">Book This Service</Link>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Client voices</div>
            <h2>What Our Clients Say</h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="section bg-50" id="faq">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Questions</div>
            <h2>Frequently Asked Questions</h2>
          </div>
          <FaqAccordion />
          <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 8 }}>
            <Link className="btn btn-secondary" href="/faq" style={{ minWidth: 200 }}>
              <List style={{ width: 17, height: 17 }} aria-hidden="true" />
              View More FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* 11. DISCLAIMER */}
      <section className={styles.disclaimer}>
        <div className="container">
          <div className={styles.discInner}>
            <div className={styles.discRule} />
            <div className={styles.discLabel}>Disclaimer</div>
            <p className={styles.discBody}>
              The information provided on this website is for general guidance only and does not constitute legal advice.
              Outcomes in GST litigation depend on case-specific facts, the applicable law, and decisions made by the
              relevant tax authority — they cannot be predicted or guaranteed. Timelines mentioned are indicative and may
              vary based on case complexity and departmental processing times. The scope of services provided is defined
              by the selected service plan. For complete details, please refer to our{' '}
              <Link href="/terms">Disclaimer</Link>,{' '}
              <Link href="/terms">Terms &amp; Conditions</Link>, and{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* 12. FINAL CTA */}
      <section className={`${styles.final} bg-navy`} id="callback">
        <div className="container">
          <h2>Don&apos;t Let a GST Notice Become a Bigger Problem</h2>
          <p>Get expert legal support within 24 hours.</p>
          <div className={styles.cta}>
            <a
              className="btn btn-primary"
              href="https://wa.me/919343297622?text=Hello%2C%20I%27m%20want%20to%20know%20more%20about%20GST%20Notice%20Support"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Service
            </a>
            <RequestCallbackButton className="btn btn-secondary on-dark">Request a Callback</RequestCallbackButton>
          </div>
        </div>
      </section>
    </>
  );
}
