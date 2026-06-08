import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileCheck2, FileText, BookOpen, Scale, Gavel, Info,
  CheckCircle2, ShieldCheck, Clock, Check, AlertTriangle,
  ArrowLeft, ArrowRight,
} from 'lucide-react';
import styles from '../service.module.css';
import { JsonLd } from '@/components/seo/JsonLd';
import { serviceSchema } from '@/lib/structured-data';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Commissioner Appeal (APL-01) Service | GST Notice Support',
  description: 'Commissioner Appeal (APL-01) filing under Section 107 CGST Act, prepared by CAs and Advocates. Fixed professional fee ₹9,999. Statement of Facts, Grounds of Appeal, portal filing.',
};

export default function CommissionerAppealPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Commissioner Appeal (APL-01)',
          description:
            'Commissioner Appeal (APL-01) filing under Section 107 CGST Act, prepared by CAs and Advocates. Fixed professional fee ₹9,999. Statement of Facts, Grounds of Appeal, portal filing.',
          price: 9999,
          path: '/services/commissioner-appeal',
        })}
      />
      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-white`}>
        <div className="container">
          <nav className={styles.crumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className={styles.sep} aria-hidden="true">›</span>
            <Link href="/#notices">Services</Link>
            <span className={styles.sep} aria-hidden="true">›</span>
            <span aria-current="page">Commissioner Appeal</span>
          </nav>

          <div className={styles.heroRef}>FORM GST APL-01 · SECTION 107 CGST ACT</div>
          <h1>Commissioner Appeal (APL-01) — Expert GST First Appeal Filing</h1>
          <p className={styles.sub}>Challenging an Order of Adjudicating Authority requires a precise APL-01 filing with Statement of Facts and Grounds of Appeal. Fixed fee ₹9,999. Note: Statutory pre-deposit payable by you directly to the GST portal — our fee covers professional services only.</p>

          <div className={styles.heroCta}>
            <Link className="btn btn-primary" href="#book">
              <FileCheck2 size={18} />Book Commissioner Appeal — ₹9,999
            </Link>
            <RequestCallbackButton className="btn btn-secondary">Request Callback</RequestCallbackButton>
          </div>

          <div className={styles.predepositInfo} role="note">
            <div className={styles.icWrap} aria-hidden="true">
              <Info size={18} />
            </div>
            <div className={styles.piBody}>
              <span className={styles.piLbl}>Pre-Deposit Requirement</span>
              <p>Under <strong>Section 107(6) of the CGST Act</strong>, you must pre-deposit <strong>10% of the disputed tax amount</strong> directly to the GST portal before filing an appeal. This amount is paid by you to the government — it is not part of our professional fee and is not processed through this platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS A COMMISSIONER APPEAL */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head left">
            <div className="eyebrow">The remedy</div>
            <h2>What is a Commissioner Appeal?</h2>
          </div>
          <div className={styles.whatisGrid}>
            <div className={styles.whatisText}>
              <p>A <strong>Commissioner Appeal</strong> filed in <span className="mono">FORM GST APL-01</span> is the <strong>first legal recourse</strong> available to a taxpayer after an adjudicating authority passes an adverse order — confirming a demand for tax, interest, or penalty under the CGST Act, 2017.</p>
              <p>The appeal must be filed before the <strong>Appellate Authority (Commissioner of CGST/SGST)</strong> under <strong>Section 107 of the CGST Act</strong>, within <strong>3 months</strong> of the date of the impugned order. A pre-deposit of <strong>10% of the disputed tax</strong> (as per Section 107(6)) is mandatory and must be paid directly to the GST portal before filing.</p>
              <p>The appeal bundle comprises a <strong>Statement of Facts</strong>, <strong>Grounds of Appeal</strong>, and a <strong>Prayer for relief</strong> — all of which must be drafted with precision to give the Appellate Authority a clear basis to grant relief.</p>
            </div>
            <aside className={`card card-elev ${styles.callout}`} aria-label="Commissioner Appeal quick reference">
              <span className={styles.calloutLbl}>Quick reference</span>
              <div className={styles.refRow}>Section 107, CGST Act, 2017</div>
              <p>An <span className="mono">APL-01</span> filed before the Appellate Authority is the first appeal against a demand order. It must be filed within <strong>3 months</strong> of the order.</p>
              <p>Our team prepares the complete appeal bundle: <strong>Statement of Facts, Grounds of Appeal, and Prayer.</strong></p>
            </aside>
          </div>
        </div>
      </section>

      {/* WHAT WE PREPARE */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Scope of work</div>
            <h2>What We Prepare for Your Appeal</h2>
            <p>A complete, court-ready APL-01 bundle — every element drafted by a CA and Advocate working together.</p>
          </div>
          <div className={styles.doGrid5}>
            <AnimateIn delay={0}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><FileText size={24} /></div>
                <h3>APL-01 Application</h3>
                <p>The formal appeal application in the prescribed format, accurately completed with all required particulars.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={70}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><BookOpen size={24} /></div>
                <h3>Statement of Facts</h3>
                <p>A clear, chronological account of the transaction history and proceedings that led to the impugned order.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={140}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><Scale size={24} /></div>
                <h3>Grounds of Appeal</h3>
                <p>Legally reasoned grounds citing the CGST Act, CBIC circulars, and relevant tribunal / High Court decisions.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={210}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><Gavel size={24} /></div>
                <h3>Prayer / Relief Sought</h3>
                <p>Precise prayer clause specifying the relief — full quashing, partial reduction, or remand — appropriate to your case.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={280}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><Info size={24} /></div>
                <h3>Pre-deposit Guidance</h3>
                <p>We explain the Section 107(6) pre-deposit calculation and portal payment process — we do not collect or process government payments.</p>
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
            <p>Keep these ready as PDFs — your assigned CA and Advocate will confirm if anything else is needed.</p>
          </div>
          <ul className={styles.docChecklist}>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Show Cause Notice (SCN / DRC-01)</span>
                <span className={styles.fmt}>The original notice that initiated the demand proceedings.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>SCN Reply (as filed)</span>
                <span className={styles.fmt}>Your response to the SCN, if filed before the adjudicating authority.</span>
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
                <span className={styles.nm}>Other supporting documents / evidence</span>
                <span className={styles.fmt}>Invoices, ledgers, returns, correspondence — anything relevant to your grounds of appeal.</span>
              </div>
            </li>
          </ul>
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
            <h2>Your Commissioner Appeal in 4 Steps</h2>
          </div>
          <div className={styles.steps}>
            <AnimateIn delay={0}>
              <div className={styles.step}>
                <div className={styles.num}>1</div>
                <div className={styles.stepBody}>
                  <h3>Upload the Order &amp; Documents</h3>
                  <p>Share the demand order (OIO), SCN, SCN reply, and supporting documents through our encrypted portal. You&#39;ll receive a case reference number immediately.</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={120}>
              <div className={styles.step}>
                <div className={styles.num}>2</div>
                <div className={styles.stepBody}>
                  <h3>Appeal Bundle Drafted</h3>
                  <p>A CA and Advocate jointly draft the APL-01 application, Statement of Facts, Grounds of Appeal, and Prayer — with case-law research included.</p>
                  <span className={`badge badge-amber ${styles.sla}`}>
                    <Clock size={13} />Draft prepared within 48 hours of document receipt
                  </span>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={240}>
              <div className={styles.step}>
                <div className={styles.num}>3</div>
                <div className={styles.stepBody}>
                  <h3>You Review &amp; Pre-deposit</h3>
                  <p>Confirm the appeal bundle. You make the statutory pre-deposit (10% of disputed tax) directly on the GST portal before we file.</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={360}>
              <div className={styles.step}>
                <div className={styles.num}>4</div>
                <div className={styles.stepBody}>
                  <h3>We File APL-01 on the Portal</h3>
                  <p>We submit the complete appeal in FORM GST APL-01 on the portal and share the filing acknowledgement with you.</p>
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
            <p className={styles.lede}>Complete APL-01 appeal bundle, prepared by a CA and Advocate — professional services only.</p>

            <div className={styles.priceCard}>
              <div className={styles.amt}>₹9,999</div>
              <span className={styles.amtMeta}>One-time professional fee · inclusive of GST</span>

              <div className={styles.divider} aria-hidden="true" />

              <div className={styles.incLabel}>What&#39;s included</div>
              <ul>
                <li><Check className={styles.ic} aria-hidden="true" />APL-01 preparation</li>
                <li><Check className={styles.ic} aria-hidden="true" />Statement of Facts</li>
                <li><Check className={styles.ic} aria-hidden="true" />Grounds of Appeal</li>
                <li><Check className={styles.ic} aria-hidden="true" />Prayer drafting</li>
                <li><Check className={styles.ic} aria-hidden="true" />Portal filing support</li>
                <li><Check className={styles.ic} aria-hidden="true" />48-hour draft turnaround</li>
              </ul>

              <div className={styles.predepositBox} role="note">
                <AlertTriangle className={styles.ic} aria-hidden="true" />
                <div>
                  <span className={styles.pdLabel}>Government Pre-Deposit</span>
                  <p>10% of disputed tax — payable by you directly to GST portal. Not included in our fee.</p>
                </div>
              </div>
            </div>

            <div className={styles.ctaRow}>
              <Link className="btn btn-primary" href="/contact#callback">
                <FileCheck2 size={18} />Book Commissioner Appeal Now
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
            <h2>Before and After the Appeal</h2>
            <p>Our SCN reply service is the stage before this appeal; GSTAT is the tribunal-level escalation if needed.</p>
          </div>
          <div className={styles.relatedGrid}>
            <Link className={`card card-elev ${styles.relatedCard}`} href="/services/scn-reply">
              <div className={styles.rcArrow} aria-hidden="true"><ArrowLeft size={20} /></div>
              <div className={styles.rcLeft}>
                <span className={styles.rcLabel}>Prior stage</span>
                <h3>Show Cause Notice Reply (SCN)</h3>
                <p className={styles.rcDesc}>DRC-01 / DRC-01A response before adjudicating authority passes an order.</p>
                <span className={styles.rcPrice}>₹5,999</span>
              </div>
            </Link>
            <Link className={`card card-elev ${styles.relatedCard}`} href="/services/gstat-appeal">
              <div className={styles.rcLeft}>
                <span className={styles.rcLabel}>Next escalation</span>
                <h3>GSTAT Appeal (APL-05)</h3>
                <p className={styles.rcDesc}>Appellate Tribunal filing if the Commissioner (Appeals) order is adverse. Statutory pre-deposit required.</p>
                <span className={styles.rcPrice}>₹14,999</span>
              </div>
              <div className={styles.rcArrow} aria-hidden="true"><ArrowRight size={20} /></div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
