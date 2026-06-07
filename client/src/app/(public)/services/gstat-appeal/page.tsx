import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileCheck2, FileText, BookOpen, Scale, Gavel, Landmark, Info,
  CheckCircle2, ShieldCheck, Clock, Check, AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import styles from '../service.module.css';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'GSTAT Appellate Tribunal Appeal (APL-05) | GST Notice Support',
  description: 'GSTAT Appeal (APL-05) filing before the GST Appellate Tribunal — second tier appeal under Section 112 CGST Act. Complete APL-05 bundle prepared by CAs and Advocates. Fixed fee ₹14,999.',
};

export default function GstatAppealPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-white`}>
        <div className="container">
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className={styles.sep} aria-hidden="true">›</span>
            <Link href="/#notices">Services</Link>
            <span className={styles.sep} aria-hidden="true">›</span>
            <span aria-current="page">GSTAT Appeal</span>
          </nav>

          <div className={styles.heroRef}>FORM GST APL-05 · SECTION 112 CGST ACT</div>
          <h1>GSTAT Appellate Tribunal Appeal (APL-05) — Expert Second Appeal Filing</h1>
          <p className={styles.sub}>The GST Appellate Tribunal is the second tier of appeal under GST law. Our experts prepare your complete APL-05 bundle — Statement of Facts, Grounds of Appeal, and Prayer. Fixed fee: ₹14,999. Statutory pre-deposit is payable by you to the government; it is not part of our fee.</p>

          <div className={styles.heroCta}>
            <Link className="btn btn-primary" href="#book">
              <FileCheck2 size={18} />Book GSTAT Appeal — ₹14,999
            </Link>
            <RequestCallbackButton className="btn btn-secondary">Request Callback</RequestCallbackButton>
          </div>

          <div className={styles.predepositInfo} role="note" aria-label="Pre-deposit requirement">
            <div className={styles.icWrap} aria-hidden="true">
              <Info size={18} />
            </div>
            <div className={styles.piBody}>
              <span className={styles.piLbl}>Pre-Deposit Requirement</span>
              <p>Under <strong>Section 112(8) of the CGST Act</strong>, you must pre-deposit <strong>20% of the disputed tax amount</strong> directly to the GST portal. This is a statutory government payment — not processed through this platform. We provide guidance on the pre-deposit process as part of our service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS A GSTAT APPEAL */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head left">
            <div className="eyebrow">The remedy</div>
            <h2>What is a GSTAT Appeal?</h2>
          </div>
          <div className={styles.whatisGrid}>
            <div className={styles.whatisText}>
              <p>The <strong>GST Appellate Tribunal (GSTAT)</strong> is the <strong>second tier of appeal</strong> available under the CGST Act, 2017. An appeal before the Tribunal in <span className="mono">FORM GST APL-05</span> is filed after a first appeal before the Commissioner (Appeals) in APL-01 has been decided against you.</p>
              <p>The GSTAT appeal is governed by <strong>Section 112 of the CGST Act</strong> and must be filed within <strong>3 months</strong> of the date of the Appellate Authority&#39;s order. As a second-tier legal remedy, it involves a significantly higher level of legal complexity than a first appeal — submissions are examined by a judicial member and a technical member of the Tribunal.</p>
              <p>A statutory pre-deposit of <strong>20% of the disputed tax</strong> under Section 112(8) is mandatory and must be deposited directly to the GST portal before the appeal is admitted. Our team guides you through this process without collecting or processing government payments.</p>
            </div>
            <aside className={`card card-elev ${styles.callout}`} aria-label="GSTAT Appeal quick reference">
              <span className={styles.calloutLbl}>Quick reference</span>
              <div className={styles.refRow}>Section 112, CGST Act, 2017</div>
              <p><span className="mono">APL-05</span> is filed before the GST Appellate Tribunal after a first appeal before the Commissioner (APL-01) has been decided against you. It is a second-tier legal remedy and involves a higher level of legal complexity.</p>
              <p>Our team prepares: <strong>Statement of Facts, Grounds of Appeal, Prayer, and complete APL-05 structured format.</strong></p>
            </aside>
          </div>
        </div>
      </section>

      {/* WHAT WE PREPARE */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Scope of work</div>
            <h2>Your Complete Appeal Bundle</h2>
            <p>Every deliverable prepared by a CA and Advocate working together — structured for the Tribunal&#39;s requirements.</p>
          </div>
          <div className={styles.doGrid5}>
            <AnimateIn delay={0}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><FileText size={24} /></div>
                <h3>APL-05 Application</h3>
                <p>The formal appeal application in the prescribed GST Appellate Tribunal format, completed with all required particulars and case history.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={70}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><BookOpen size={24} /></div>
                <h3>Statement of Facts</h3>
                <p>A precise chronological account of the transaction history and all proceedings — from SCN through OIO and OIA — leading to the Tribunal appeal.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={140}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><Scale size={24} /></div>
                <h3>Grounds of Appeal</h3>
                <p>Legally reasoned grounds citing the CGST Act, CBIC circulars, and binding Tribunal and High Court precedents applicable to your case.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={210}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><Gavel size={24} /></div>
                <h3>Prayer / Relief Sought</h3>
                <p>Precisely framed prayer clause — quashing, reduction, or remand — tailored to your legal position and the Tribunal&#39;s jurisdiction.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={280}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><Landmark size={24} /></div>
                <h3>Pre-deposit Process Guidance</h3>
                <p>Detailed walkthrough of the Section 112(8) pre-deposit calculation and GST portal payment steps. We do not collect or process government payments.</p>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* DOCUMENTS REQUIRED */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Before you start</div>
            <h2>Documents to Upload</h2>
            <p>Gather all prior orders and replies before booking — this service requires the complete paper trail from the original notice through the first appeal.</p>
          </div>
          <ul className={styles.docChecklist}>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Show Cause Notice (SCN)</span>
                <span className={styles.fmt}>The original notice that initiated the demand proceedings.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>SCN Reply (as filed)</span>
                <span className={styles.fmt}>Your response to the SCN filed before the adjudicating authority.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Demand Order (OIO)</span>
                <span className={styles.fmt}>The Order-in-Original passed by the adjudicating authority confirming the demand.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>First Appeal (APL-01) and Commissioner&#39;s Order (OIA)</span>
                <span className={styles.fmt}>The APL-01 filed before the Appellate Authority and the Order-in-Appeal (OIA) issued against you — both required to establish GSTAT jurisdiction.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Other relevant documents / evidence</span>
                <span className={styles.fmt}>Invoices, ledgers, returns, correspondence, or any evidence you wish to place before the Tribunal.</span>
              </div>
            </li>
          </ul>

          <div className={styles.docNote} role="note">
            <AlertTriangle className={styles.ic} aria-hidden="true" />
            <p><strong>Most document-intensive service:</strong> This is the highest-complexity filing in our suite. Ensure all prior orders and replies — OIO, APL-01, and OIA — are available before booking. Incomplete records delay preparation.</p>
          </div>

          <p className={styles.docReassure}>
            <ShieldCheck className={styles.ic} aria-hidden="true" />
            All uploaded documents are encrypted and never shared with third parties.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">The process</div>
            <h2>Your GSTAT Appeal in 4 Steps</h2>
          </div>
          <div className={styles.steps}>
            <AnimateIn delay={0}>
              <div className={styles.step}>
                <div className={styles.num}>1</div>
                <div className={styles.stepBody}>
                  <h3>Upload All Orders &amp; Documents</h3>
                  <p>Share the complete record — SCN, SCN reply, OIO, APL-01, and the Commissioner&#39;s Order (OIA) — through our encrypted portal. You&#39;ll receive a case reference immediately.</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={120}>
              <div className={styles.step}>
                <div className={styles.num}>2</div>
                <div className={styles.stepBody}>
                  <h3>APL-05 Bundle Drafted</h3>
                  <p>A CA and Advocate jointly draft the complete APL-05 application, Statement of Facts, Grounds of Appeal, and Prayer — with Tribunal-level case-law research included.</p>
                  <span className={`badge badge-amber ${styles.sla}`}>
                    <Clock size={13} />Draft prepared within 72 hours of document receipt
                  </span>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={240}>
              <div className={styles.step}>
                <div className={styles.num}>3</div>
                <div className={styles.stepBody}>
                  <h3>You Review, Pre-deposit &amp; Share Credentials</h3>
                  <p>Confirm the appeal bundle. Make the 20% statutory pre-deposit directly on the GST portal, then share your portal credentials so we can file on your behalf.</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={360}>
              <div className={styles.step}>
                <div className={styles.num}>4</div>
                <div className={styles.stepBody}>
                  <h3>We File APL-05 on the Portal</h3>
                  <p>We submit the complete appeal in FORM GST APL-05 on the GST portal and share the filing acknowledgement with you.</p>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* PRICING & CTA */}
      <section className="section bg-deep on-dark" id="book">
        <div className="container">
          <div className={styles.pricingBlock}>
            <h2>Fixed Fee. No Surprises.</h2>
            <p className={styles.lede}>Complete APL-05 Tribunal appeal bundle, prepared by a CA and Advocate — professional services only.</p>

            <div className={styles.priceCard}>
              <div className={styles.amt}>₹14,999</div>
              <span className={styles.amtMeta}>One-time professional fee · inclusive of GST</span>

              <div className={styles.divider} aria-hidden="true" />

              <div className={styles.incLabel}>What&#39;s included</div>
              <ul>
                <li><Check className={styles.ic} aria-hidden="true" />APL-05 preparation</li>
                <li><Check className={styles.ic} aria-hidden="true" />Statement of Facts</li>
                <li><Check className={styles.ic} aria-hidden="true" />Grounds of Appeal</li>
                <li><Check className={styles.ic} aria-hidden="true" />Prayer drafting</li>
                <li><Check className={styles.ic} aria-hidden="true" />Pre-deposit process guidance</li>
                <li><Check className={styles.ic} aria-hidden="true" />Portal filing support</li>
              </ul>

              <div className={styles.predepositBox} role="note">
                <AlertTriangle className={styles.ic} aria-hidden="true" />
                <div>
                  <span className={styles.pdLabel}>Government Pre-Deposit</span>
                  <p>20% of disputed tax — payable by you directly to GST portal. Not included in our fee.</p>
                </div>
              </div>
            </div>

            <div className={styles.ctaRow}>
              <Link className="btn btn-primary" href="/contact#callback">
                <FileCheck2 size={18} />Book GSTAT Appeal Now
              </Link>
            </div>
            <p className={styles.payNote}>Full payment upfront. Non-refundable once draft preparation begins. No EMI.</p>
          </div>
        </div>
      </section>

      {/* RELATED SERVICES */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Related services</div>
            <h2>The Stage Before This Appeal</h2>
            <p>GSTAT is the second-tier remedy. A Commissioner Appeal (APL-01) must be decided against you before GSTAT jurisdiction arises.</p>
          </div>
          <div className={styles.relatedSingle}>
            <Link
              className={`card card-elev ${styles.relatedCard}`}
              href="/services/commissioner-appeal"
              aria-label="Commissioner Appeal (APL-01) — ₹9,999"
            >
              <div className={styles.rcArrow} aria-hidden="true"><ArrowLeft size={20} /></div>
              <div className={styles.rcLeft}>
                <span className={styles.rcLabel}>Prior stage</span>
                <h3>Commissioner Appeal (APL-01)</h3>
                <p className={styles.rcDesc}>First appeal against a demand order before the Appellate Authority. Pre-deposit: 10% of disputed tax.</p>
                <span className={styles.rcPrice}>₹9,999</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
