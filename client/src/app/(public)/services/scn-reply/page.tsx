import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileCheck2, Scale, FilePenLine, Folders, UploadCloud,
  CheckCircle2, ShieldCheck, Clock, Check, AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import styles from '../service.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'DRC-01 / SCN Reply Service | GST Notice Support',
  description: 'Show Cause Notice reply for DRC-01 and DRC-01A prepared by CAs and Advocates. Fixed fee ₹5,999. Full structured reply under Section 73/74 CGST Act, filed on the GST portal.',
};

export default function ScnReplyPage() {
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
            <span aria-current="page">SCN Reply</span>
          </nav>

          <div className={styles.heroRef}>DRC-01 / DRC-01A · SECTION 73 &amp; 74 CGST ACT</div>
          <h1>Show Cause Notice Reply — DRC-01 &amp; DRC-01A Expert Handling</h1>
          <p className={styles.sub}>High-stakes GST demand notices require a precise, legally structured response. Our team of CAs and Advocates prepares your reply — fixed fee ₹5,999, draft within 48 hours.</p>

          <div className={styles.heroCta}>
            <Link className="btn btn-primary" href="#book">
              <FileCheck2 size={18} />Book SCN Reply — ₹5,999
            </Link>
            <Link className="btn btn-secondary" href="/contact#callback">Request Callback</Link>
          </div>

          <div className={styles.amberAlert} role="alert" aria-live="polite">
            <div className={styles.icWrap} aria-hidden="true">
              <AlertTriangle size={18} />
            </div>
            <div className={styles.alertBody}>
              <span className={styles.alertLbl}>Deadline notice</span>
              <p>DRC-01 notices carry <strong>tight statutory deadlines</strong>. File a response before the adjudicating authority passes an ex-parte order against you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS AN SCN */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head left">
            <div className="eyebrow">The notice</div>
            <h2>What is a Show Cause Notice?</h2>
          </div>
          <div className={styles.whatisGrid}>
            <div className={styles.whatisText}>
              <p>A <strong>Show Cause Notice (SCN)</strong> in the form of <span className="mono">DRC-01</span> is issued by the GST officer under <strong>Section 73 or Section 74 of the CGST Act, 2017</strong> when the officer has reason to believe that tax has been <strong>short-paid, unpaid, or wrongly refunded</strong>, or that input tax credit has been wrongly availed.</p>
              <p><span className="mono">DRC-01A</span> is a <strong>pre-SCN intimation</strong> — an opportunity to pay the ascertained amount with interest before the formal DRC-01 is issued. Addressing DRC-01A early can avoid full SCN proceedings.</p>
              <p>The SCN demands a written explanation of why the alleged tax, interest, and penalty should not be confirmed. A weak or absent reply allows the adjudicating authority to <strong>pass an ex-parte order confirming the full demand</strong> — which then requires a Commissioner Appeal or GSTAT proceeding to challenge.</p>
            </div>
            <aside className={`card card-elev ${styles.callout}`} aria-label="SCN quick reference">
              <span className={styles.calloutLbl}>Quick reference</span>
              <div className={styles.refRow}>Section 73 / 74, CGST Act, 2017</div>
              <p><span className="mono">DRC-01</span> is a formal Show Cause Notice requiring explanation of alleged tax, interest, and penalty.</p>
              <p>Non-response or an inadequate reply can result in an <strong>Order of Adjudicating Authority confirming the full demand</strong>.</p>
            </aside>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Scope of work</div>
            <h2>What Our Team Prepares</h2>
            <p>CAs and Advocates work together on every SCN — legal drafting plus factual reconciliation in one team.</p>
          </div>
          <div className={styles.doGrid4}>
            <div className={`card card-elev ${styles.doCard}`}>
              <div className={styles.icWrap}><Scale size={24} /></div>
              <h3>Legal Analysis of Demand</h3>
              <p>We review each ground of the demand under Section 73/74, assess limitation, and map the officer&#39;s allegations to the facts and applicable law.</p>
            </div>
            <div className={`card card-elev ${styles.doCard}`}>
              <div className={styles.icWrap}><FilePenLine size={24} /></div>
              <h3>Structured Reply Draft</h3>
              <p>A point-by-point reply to every ground raised in the DRC-01, supported by case law citations and CBIC circulars where relevant.</p>
            </div>
            <div className={`card card-elev ${styles.doCard}`}>
              <div className={styles.icWrap}><Folders size={24} /></div>
              <h3>Evidence Compilation Guidance</h3>
              <p>Your assigned expert tells you exactly which invoices, ledgers, or returns to annexe — no guesswork, no over-disclosure.</p>
            </div>
            <div className={`card card-elev ${styles.doCard}`}>
              <div className={styles.icWrap}><UploadCloud size={24} /></div>
              <h3>Portal Filing</h3>
              <p>We upload and submit your reply on the GST portal, attach supporting documents, and share the filing acknowledgement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTS REQUIRED */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Before you start</div>
            <h2>Documents to Upload</h2>
            <p>Keep these ready as PDFs — your assigned expert will confirm if anything else is needed.</p>
          </div>
          <ul className={styles.docChecklist}>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>ASMT-10 notice (if preceding)</span>
                <span className={styles.fmt}>The earlier scrutiny notice, if one was issued before the DRC-01.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>ASMT-10 reply (if filed)</span>
                <span className={styles.fmt}>Your earlier response to the scrutiny notice, if one was submitted.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Show Cause Notice (DRC-01 &amp; DRC-01A)</span>
                <span className={styles.fmt}>All notices received — pre-SCN intimation and the formal DRC-01 PDF.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Supporting invoices / returns / ledgers</span>
                <span className={styles.fmt}>GSTR-1, GSTR-3B, GSTR-2A, ITC ledger, sales register, purchase register.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Other relevant documents / evidence</span>
                <span className={styles.fmt}>Invoices, payment proofs, debit/credit notes — anything supporting your position.</span>
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
            <h2>Your SCN Reply in 4 Steps</h2>
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.num}>1</div>
              <div className={styles.stepBody}>
                <h3>Upload Your DRC-01</h3>
                <p>Share the notice and supporting documents through our encrypted portal — you&#39;ll receive a case reference number immediately.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.num}>2</div>
              <div className={styles.stepBody}>
                <h3>Expert Legal Analysis &amp; Draft</h3>
                <p>A CA and Advocate review the demand, research applicable law and circulars, and prepare a structured point-by-point reply.</p>
                <span className={`badge badge-amber ${styles.sla}`}>
                  <Clock size={13} />Draft prepared within 48 hours of document receipt
                </span>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.num}>3</div>
              <div className={styles.stepBody}>
                <h3>You Review &amp; Confirm</h3>
                <p>Read the draft, ask questions, and confirm. One round of revision is included before anything is filed.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.num}>4</div>
              <div className={styles.stepBody}>
                <h3>We File on the GST Portal</h3>
                <p>We submit your SCN reply on the GST portal, attach the supporting evidence, and share the filing acknowledgement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING & CTA */}
      <section className="section bg-deep on-dark" id="book">
        <div className="container">
          <div className={styles.pricingBlock}>
            <h2>Fixed Fee. No Surprises.</h2>
            <p className={styles.lede}>One SCN reply, prepared by a CA and Advocate working together, filed on the GST portal.</p>

            <div className={styles.priceCard}>
              <div className={styles.amt}>₹5,999</div>
              <span className={styles.amtMeta}>One-time professional fee · inclusive of GST</span>

              <div className={styles.divider} aria-hidden="true" />

              <div className={styles.incLabel}>What&#39;s included</div>
              <ul>
                <li><Check className={styles.ic} aria-hidden="true" />Legal analysis of DRC-01 demand</li>
                <li><Check className={styles.ic} aria-hidden="true" />Full structured reply draft</li>
                <li><Check className={styles.ic} aria-hidden="true" />One revision round</li>
                <li><Check className={styles.ic} aria-hidden="true" />Portal filing support</li>
                <li><Check className={styles.ic} aria-hidden="true" />48-hour draft turnaround</li>
              </ul>
            </div>

            <div className={styles.ctaRow}>
              <Link className="btn btn-primary" href="#book">
                <FileCheck2 size={18} />Book SCN Reply Now
              </Link>
            </div>
            <p className={styles.payNote}>Full payment upfront. Non-refundable once draft preparation begins. No EMI.</p>
          </div>
        </div>
      </section>

      {/* RELATED SERVICES — Escalation Path */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">If the demand is confirmed</div>
            <h2>Escalation Path</h2>
            <p>If an adjudicating order goes against you, the next remedy is a formal appeal. We handle both levels.</p>
          </div>
          <div className={styles.relatedGrid}>
            <Link className={`card card-elev ${styles.relatedCard}`} href="/services/commissioner-appeal">
              <div className={styles.rcLeft}>
                <span className={styles.rcLabel}>Next step</span>
                <h3>Commissioner Appeal (APL-01)</h3>
                <p className={styles.rcDesc}>First appeal against an order of adjudicating authority. Filed before the Commissioner (Appeals) within 3 months of the order.</p>
                <span className={styles.rcPrice}>₹9,999</span>
              </div>
              <div className={styles.rcArrow} aria-hidden="true"><ArrowRight size={20} /></div>
            </Link>
            <Link className={`card card-elev ${styles.relatedCard}`} href="/services/gstat-appeal">
              <div className={styles.rcLeft}>
                <span className={styles.rcLabel}>Second appeal</span>
                <h3>GSTAT Appeal (APL-05)</h3>
                <p className={styles.rcDesc}>Appellate Tribunal filing if the Commissioner (Appeals) order is adverse. Requires statutory pre-deposit as per the CGST Act.</p>
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
