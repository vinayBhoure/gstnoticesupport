import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileCheck2, FileSearch, FilePenLine, UploadCloud,
  CheckCircle2, ShieldCheck, Clock, Check, AlertTriangle,
} from 'lucide-react';
import styles from '../service.module.css';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'ASMT-10 Reply Service | GST Notice Support',
  description: 'ASMT-10 scrutiny notice reply prepared by ICAI-registered CAs. Fixed fee ₹2,999. Draft within 48 hours. Section 61 CGST Act responses, filed on the GST portal.',
};

export default function Asmt10Page() {
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
            <span aria-current="page">ASMT-10 Reply</span>
          </nav>

          <div className={styles.heroRef}>FORM GST ASMT-10 · SECTION 61 CGST ACT</div>
          <h1>ASMT-10 Reply — Expert GST Scrutiny Response</h1>
          <p className={styles.sub}>Section 61 CGST Act scrutiny notices handled by ICAI-registered CAs. Fixed fee: ₹2,999. Draft within 48 hours.</p>

          <div className={styles.heroCta}>
            <Link className="btn btn-primary" href="#book">
              <FileCheck2 size={18} />Book ASMT-10 Reply — ₹2,999
            </Link>
            <RequestCallbackButton className="btn btn-secondary">Request Callback</RequestCallbackButton>
          </div>

          <div className={styles.amberAlert} role="alert" aria-live="polite">
            <div className={styles.icWrap} aria-hidden="true">
              <AlertTriangle size={18} />
            </div>
            <div className={styles.alertBody}>
              <span className={styles.alertLbl}>Deadline notice</span>
              <p>ASMT-10 replies have a <strong>statutory response window</strong>. Do not delay — non-response can lead to best-judgement assessment under Section 62.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS AN ASMT-10 */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head left">
            <div className="eyebrow">The notice</div>
            <h2>What is an ASMT-10 Notice?</h2>
          </div>
          <div className={styles.whatisGrid}>
            <div className={styles.whatisText}>
              <p>An <strong>ASMT-10</strong> is issued by the GST officer under <strong>Section 61 of the CGST Act, 2017</strong> when scrutiny of your GST returns reveals discrepancies — typically a mismatch between <span className="mono">GSTR-1</span> and <span className="mono">GSTR-3B</span>, ineligible ITC claimed under <span className="mono">GSTR-2A/2B</span>, or differences between turnover declared in returns and other available data.</p>
              <p>The notice asks you to <strong>explain the discrepancy in writing</strong>, supported by ledgers, reconciliation, and source documents. Your reply is filed in <span className="mono">FORM GST ASMT-11</span> on the GST portal.</p>
              <p>Failing to respond — or filing a weak reply — exposes you to escalation: the officer can proceed to <strong>best-judgement assessment under Section 62</strong>, issue a <strong>Show Cause Notice under Section 73/74</strong>, or initiate audit proceedings under Section 65. None of these are situations you want to defend later.</p>
            </div>
            <aside className={`card card-elev ${styles.callout}`} aria-label="ASMT-10 quick reference">
              <span className={styles.calloutLbl}>Quick reference</span>
              <div className={styles.refRow}>Section 61, CGST Act, 2017</div>
              <p>Issued under Section 61 of the CGST Act, 2017. Requires the taxpayer to <strong>explain discrepancies</strong> found during return scrutiny.</p>
              <p>Non-response can lead to <strong>best-judgement assessment under Section 62</strong>.</p>
            </aside>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Scope of work</div>
            <h2>What Our Experts Prepare for You</h2>
            <p>Every ASMT-10 is reviewed by an ICAI-registered CA — no junior triage queue.</p>
          </div>
          <div className={styles.doGrid3}>
            <AnimateIn delay={0}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><FileSearch size={24} /></div>
                <h3>Legal Analysis of Discrepancy</h3>
                <p>We map each flagged item to its source — returns, ledgers, invoices — and prepare a defensible position grounded in the CGST Act and relevant CBIC circulars.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={100}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><FilePenLine size={24} /></div>
                <h3>Structured Written Reply</h3>
                <p>A clear, paragraph-numbered ASMT-11 reply with a reconciliation working annexed — the format scrutiny officers expect and act on quickly.</p>
              </div>
            </AnimateIn>
            <AnimateIn delay={200}>
              <div className={`card card-elev ${styles.doCard}`}>
                <div className={styles.icWrap}><UploadCloud size={24} /></div>
                <h3>Portal Filing Support</h3>
                <p>We file your reply in FORM GST ASMT-11 on the GST portal, attach supporting documents, and share the acknowledgement with you.</p>
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
            <h2>Documents You Need to Upload</h2>
            <p>Keep these ready as PDFs — your assigned CA will tell you if anything specific is missing.</p>
          </div>
          <ul className={styles.docChecklist}>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>ASMT-10 notice</span>
                <span className={styles.fmt}>The notice PDF as received from the GST portal (with reference number).</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Supporting ledgers / reconciliation</span>
                <span className={styles.fmt}>Sales register, purchase register, GSTR-1 vs 3B working — Excel or PDF.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Any earlier correspondence</span>
                <span className={styles.fmt}>Prior departmental letters, emails, or notices on the same period.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 className={styles.ic} aria-hidden="true" />
              <div className={styles.docItemBody}>
                <span className={styles.nm}>Other relevant documents / evidence</span>
                <span className={styles.fmt}>Invoices, debit/credit notes, payment proofs — anything that supports your position.</span>
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
            <h2>Your ASMT-10 Reply in 4 Steps</h2>
          </div>
          <div className={styles.steps}>
            <AnimateIn delay={0}>
              <div className={styles.step}>
                <div className={styles.num}>1</div>
                <div className={styles.stepBody}>
                  <h3>Upload Your ASMT-10</h3>
                  <p>Share your notice, returns, and reconciliation through our encrypted upload — you&#39;ll get a case reference number immediately.</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={120}>
              <div className={styles.step}>
                <div className={styles.num}>2</div>
                <div className={styles.stepBody}>
                  <h3>CA Reviews &amp; Drafts the Reply</h3>
                  <p>An ICAI-registered CA analyses the flagged discrepancy and prepares your ASMT-11 reply with a reconciliation working.</p>
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
                  <h3>You Review &amp; Confirm</h3>
                  <p>Read the draft, raise questions, and confirm. One round of revision is included before anything is filed.</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={360}>
              <div className={styles.step}>
                <div className={styles.num}>4</div>
                <div className={styles.stepBody}>
                  <h3>We File ASMT-11 on the Portal</h3>
                  <p>We submit your reply in FORM GST ASMT-11 on the GST portal and share the acknowledgement with you.</p>
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
            <p className={styles.lede}>One ASMT-10 reply, prepared by an ICAI-registered CA, filed on the GST portal.</p>

            <div className={styles.priceCard}>
              <div className={styles.amt}>₹2,999</div>
              <span className={styles.amtMeta}>One-time professional fee · inclusive of GST</span>

              <div className={styles.divider} aria-hidden="true" />

              <div className={styles.incLabel}>What&#39;s included</div>
              <ul>
                <li><Check className={styles.ic} aria-hidden="true" />Expert review of your ASMT-10</li>
                <li><Check className={styles.ic} aria-hidden="true" />Structured written reply draft</li>
                <li><Check className={styles.ic} aria-hidden="true" />One round of revision</li>
                <li><Check className={styles.ic} aria-hidden="true" />Portal filing support (ASMT-11)</li>
                <li><Check className={styles.ic} aria-hidden="true" />48-hour draft turnaround</li>
              </ul>
            </div>

            <div className={styles.ctaRow}>
              <Link className="btn btn-primary" href="/contact#callback">
                <FileCheck2 size={18} />Book ASMT-10 Reply Now
              </Link>
            </div>
            <p className={styles.payNote}>Full payment upfront. Non-refundable once draft preparation begins. No EMI.</p>
          </div>
        </div>
      </section>
    </>
  );
}
