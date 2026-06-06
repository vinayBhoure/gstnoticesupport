'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ChevronDown, HelpCircle } from 'lucide-react';
import styles from '@/app/(public)/faq/faq.module.css';

type FaqItem = {
  id: string;
  question: string;
  searchText: string;
  answerJsx: React.ReactNode;
};

type FaqGroup = {
  id: string;
  heading: string;
  items: FaqItem[];
};

const groups: FaqGroup[] = [
  {
    id: 'process',
    heading: 'Process & Timeline',
    items: [
      {
        id: 'a1',
        question: 'I have received a GST notice. What should I do first?',
        searchText: 'Do not respond without professional review. Deadlines are tight but an incorrect reply often creates more problems. Upload a copy of your notice through the booking system. Our team reviews within 4 business hours and confirms the right service.',
        answerJsx: (
          <p>
            The first step is to <strong>not respond without professional review</strong> — deadlines are tight,
            but an incorrect reply often creates more problems than a missed one. Upload a copy of your notice
            through our booking system. Our team reviews it within 4 business hours and guides you on the right
            service and next steps.
          </p>
        ),
      },
      {
        id: 'a2',
        question: 'How long does it take to prepare my reply or appeal?',
        searchText: 'ASMT-10 Reply 48 hours. SCN Reply 48 hours. Commissioner Appeal APL-01 48 hours. GSTAT Appeal APL-05 72 hours. Clock starts from complete document receipt.',
        answerJsx: (
          <>
            <p>Turnaround after complete document receipt:</p>
            <p style={{ marginTop: '10px' }}>
              <strong>ASMT-10 Reply</strong> — 48 hours &nbsp;·&nbsp;{' '}
              <strong>SCN Reply</strong> — 48 hours &nbsp;·&nbsp;{' '}
              <strong>Commissioner Appeal (APL-01)</strong> — 48 hours &nbsp;·&nbsp;{' '}
              <strong>GSTAT Appeal (APL-05)</strong> — 72 hours, given increased complexity.
            </p>
            <p style={{ marginTop: '10px' }}>
              The clock starts when all required documents are in hand — not from booking.{' '}
              <Link className={styles.inlineCta} href="/pricing">See all services →</Link>
            </p>
          </>
        ),
      },
      {
        id: 'a3',
        question: 'What documents do I need to submit?',
        searchText: 'Varies by service. At minimum the notice and your GSTN. For notice replies GSTR returns purchase and sales registers GSTR-2B reconciliation. For appeals original order plus additional records.',
        answerJsx: (
          <>
            <p>
              This varies by service. At minimum: the notice itself and your GSTN. For notice replies,
              you will also need your GSTR returns, purchase and sales registers, and a GSTR-2B reconciliation.
              For appeals, you need the original order you are challenging plus supporting evidence.
            </p>
            <p style={{ marginTop: '10px' }}>
              Each service page lists the exact documents required.{' '}
              <Link className={styles.inlineCta} href="/services/asmt-10">ASMT-10 →</Link>
              {' '}<Link className={styles.inlineCta} href="/services/scn-reply">SCN Reply →</Link>
              {' '}<Link className={styles.inlineCta} href="/services/commissioner-appeal">Commissioner Appeal →</Link>
            </p>
          </>
        ),
      },
      {
        id: 'a4',
        question: 'Can I track the progress of my case after booking?',
        searchText: 'Yes. Dashboard shows real-time booking status from document upload through review draft ready and filing. Email updates at each stage. Admin notes visible in dashboard.',
        answerJsx: (
          <p>
            Yes. After you create an account and book, your dashboard shows the real-time status of every
            booking — from document upload through review, draft ready, and portal filing. You receive email
            notifications at each stage, and notes from your assigned CA are visible in the dashboard.
          </p>
        ),
      },
    ],
  },
  {
    id: 'team',
    heading: 'About Our Team',
    items: [
      {
        id: 'b1',
        question: 'Do your experts appear before GST authorities in person?',
        searchText: 'Yes for Commissioner Appeal and GSTAT where personal or virtual appearance is required. Representation Before Tax Authority service priced separately by case complexity jurisdiction and hearing schedule.',
        answerJsx: (
          <p>
            Yes, for cases that require personal or virtual appearance before the Appellate Authority or GSTAT.
            This is covered under our <strong>Representation Before Tax Authority</strong> service, which is
            priced separately based on case complexity, jurisdiction, and hearing schedule.{' '}
            <Link className={styles.inlineCta} href="/contact#callback">Request a callback to discuss →</Link>
          </p>
        ),
      },
      {
        id: 'b2',
        question: 'What is the difference between your team and a local CA?',
        searchText: 'Most CAs handle GST as one of many practice areas. Our team works exclusively on GST litigation notice replies appeals tribunal filings. Specialisation hundreds of GST demands ITC disallowances appellate proceedings.',
        answerJsx: (
          <p>
            Most Chartered Accountants handle GST as one of many practice areas. Our team works{' '}
            <strong>exclusively on GST litigation</strong> — notice replies, appeals, and tribunal filings.
            Specialisation means our professionals have handled hundreds of GST demands, ITC disallowances,
            and appellate proceedings. A generalist CA prepares your books; a GST litigation specialist
            builds your legal response strategy.{' '}
            <Link className={styles.inlineCta} href="/about">About our team →</Link>
          </p>
        ),
      },
      {
        id: 'b3',
        question: 'Are your professionals registered with ICAI or Bar Council?',
        searchText: 'Yes. CA work handled by ICAI-registered CAs. Appellate and tribunal representation by Bar Council-enrolled Advocates. Registration details on About page.',
        answerJsx: (
          <p>
            Yes. All Chartered Accountant work — ASMT-10 replies, SCN drafts, appeal preparation — is handled
            by <strong>ICAI-registered CAs</strong>. Representation before Appellate Authorities and GSTAT is
            handled by <strong>Bar Council-enrolled Advocates</strong>. Registration numbers are published on our{' '}
            <Link className={styles.inlineCta} href="/about">About page</Link>.
          </p>
        ),
      },
    ],
  },
  {
    id: 'security',
    heading: 'Data & Security',
    items: [
      {
        id: 'c1',
        question: 'Is my GST data and financial information safe with you?',
        searchText: 'Documents stored AWS S3 private encrypted buckets. Access via time-limited pre-signed URLs not public links. Professional confidentiality obligation. No sharing with third parties.',
        answerJsx: (
          <p>
            Your documents are stored on <strong>AWS S3 in private, encrypted buckets</strong>. Access is
            controlled via time-limited pre-signed URLs — there are no public download links. Our CAs and
            Advocates are bound by professional confidentiality obligations. We do not share client documents
            with any third party outside the engagement team assigned to your case.
          </p>
        ),
      },
      {
        id: 'c2',
        question: 'What happens to my documents after the service is complete?',
        searchText: 'Documents remain in dashboard while account is active. Delete account documents permanently removed from servers within 7 days. Payment records retained as required by Indian tax law.',
        answerJsx: (
          <p>
            Documents remain accessible in your dashboard for as long as your account is active. If you delete
            your account, uploaded documents are <strong>permanently removed from our servers within 7 days</strong>.
            We do not retain copies after account deletion. Payment records are retained as required by Indian
            tax law (typically 6–8 years).
          </p>
        ),
      },
    ],
  },
  {
    id: 'fees',
    heading: 'Fees & Payment',
    items: [
      {
        id: 'd1',
        question: 'What is your exact fee for each service?',
        searchText: 'Fixed fees. ASMT-10 Reply 2999 rupees. SCN Reply 5999 rupees. Commissioner Appeal APL-01 9999 rupees. GSTAT Appeal APL-05 14999 rupees. One-time professional fee no retainer no hourly billing.',
        answerJsx: (
          <p>
            All services have published fixed fees: <strong>ASMT-10 Reply — ₹2,999</strong> &nbsp;·&nbsp;{' '}
            <strong>SCN Reply — ₹5,999</strong> &nbsp;·&nbsp;{' '}
            <strong>Commissioner Appeal — ₹9,999</strong> &nbsp;·&nbsp;{' '}
            <strong>GSTAT Appeal — ₹14,999</strong>. These are one-time professional fees — no retainer, no
            hourly billing, no add-ons. What you see is what you pay.{' '}
            <Link className={styles.inlineCta} href="/pricing">Full pricing →</Link>
          </p>
        ),
      },
      {
        id: 'd2',
        question: 'What is the government pre-deposit and who pays it?',
        searchText: 'Mandatory statutory payment to GST portal not our fee. Commissioner Appeal APL-01 Section 107(6) CGST Act 10 percent disputed tax. GSTAT Appeal APL-05 Section 112(8) CGST Act 20 percent. We guide you.',
        answerJsx: (
          <>
            <p>
              The pre-deposit is a <strong>mandatory statutory payment you make directly to the GST portal</strong>{' '}
              before your appeal is admitted. It is not our fee — it goes to the government.
            </p>
            <p style={{ marginTop: '12px' }}>
              For a{' '}
              <Link className={styles.inlineCta} href="/services/commissioner-appeal">Commissioner Appeal (APL-01)</Link>,{' '}
              <span className="mono">Section 107(6) CGST Act</span> requires <strong>10%</strong> of the disputed
              tax. For a{' '}
              <Link className={styles.inlineCta} href="/services/gstat-appeal">GSTAT Appeal (APL-05)</Link>,{' '}
              <span className="mono">Section 112(8) CGST Act</span> requires <strong>20%</strong>. We guide you
              through the process as part of our service.
            </p>
          </>
        ),
      },
      {
        id: 'd3',
        question: 'Is there a refund if my case is not decided in my favour?',
        searchText: 'No refund. Our fee is for professional service preparation drafting filing not for outcome. GST litigation outcomes depend on facts applicable law adjudicating authority. No-Refund Policy linked in footer.',
        answerJsx: (
          <p>
            No. Our professional fee is for the preparation, drafting, and filing of your document — not for
            the outcome. GST litigation outcomes depend on the facts of your specific case, the applicable law,
            and the adjudicating authority. We prepare the strongest possible response based on your documents
            but do not guarantee results. Our No-Refund Policy is linked in the website footer.
          </p>
        ),
      },
      {
        id: 'd4',
        question: 'When exactly do I pay?',
        searchText: 'After uploading documents team prepares partial draft preview. You review preview first. Payment unlocks complete draft and portal filing support. Never asked to pay before seeing work has begun.',
        answerJsx: (
          <p>
            After you upload your documents and our team prepares a{' '}
            <strong>partial draft preview</strong>. You review the preview first — so you know work has genuinely
            begun before you commit to payment. Full payment unlocks the complete draft and portal filing support.
            You are never asked to pay before seeing evidence of work.
          </p>
        ),
      },
    ],
  },
];

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : part
  );
}

export function FaqSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const bodyRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const trimmedQuery = searchQuery.trim();

  const filteredGroups = groups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!trimmedQuery) return true;
      const q = trimmedQuery.toLowerCase();
      return (
        item.question.toLowerCase().includes(q) ||
        item.searchText.toLowerCase().includes(q)
      );
    }),
  })).filter(group => group.items.length > 0);

  const totalVisible = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);
  const showNoResults = trimmedQuery.length > 0 && totalVisible === 0;

  function handleSearch(value: string) {
    setSearchQuery(value);
    setOpenItemId(null);
  }

  function toggle(id: string) {
    setOpenItemId(prev => (prev === id ? null : id));
  }

  return (
    <>
      {/* SEARCH BAR */}
      <div className={`${styles.searchArea}`} style={{ background: 'var(--neutral-50)' }}>
        <div className="container">
          <div className={styles.searchWrap} role="search">
            <span className={styles.searchIc} aria-hidden="true">
              <Search size={18} />
            </span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search frequently asked questions…"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              aria-label="Search FAQ"
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery.length > 0 && (
              <button
                className={styles.searchClear}
                onClick={() => handleSearch('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div
            className={styles.searchAnnounce}
            aria-live="polite"
            aria-atomic="true"
          >
            {trimmedQuery.length > 0 && !showNoResults
              ? `${totalVisible} question${totalVisible !== 1 ? 's' : ''} found`
              : null}
          </div>
        </div>
      </div>

      {/* FAQ ACCORDION */}
      <section className={`${styles.faqSection} bg-50`}>
        <div className="container">
          <div className={styles.faqInner}>

            {showNoResults && (
              <div className={styles.noResults}>
                <div className={styles.nrIcon}>
                  <HelpCircle size={40} />
                </div>
                <p>
                  No results for <strong>&ldquo;{trimmedQuery}&rdquo;</strong>.
                  Try different keywords or{' '}
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-green)', fontWeight: 600, padding: 0, fontSize: 'inherit' }}
                    onClick={() => handleSearch('')}
                  >
                    clear the search
                  </button>.
                </p>
              </div>
            )}

            {filteredGroups.map(group => (
              <div key={group.id} className={styles.faqGroup}>
                <div className={styles.faqGroupHeader}>
                  <h2>{group.heading}</h2>
                  <span className={styles.groupTag} aria-label={`${group.items.length} questions`}>
                    {group.items.length}
                  </span>
                </div>

                <div className={styles.faqList} role="list">
                  {group.items.map(item => {
                    const isOpen = openItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={styles.faqItem}
                        role="listitem"
                      >
                        <button
                          className={styles.faqTrigger}
                          aria-expanded={isOpen}
                          aria-controls={`faq-body-${item.id}`}
                          onClick={() => toggle(item.id)}
                        >
                          <span className={isOpen ? `${styles.faqQ} ${styles.faqQOpen}` : styles.faqQ}>
                            {highlightText(item.question, trimmedQuery)}
                          </span>
                          <ChevronDown
                            className={isOpen ? `${styles.faqChev} ${styles.faqChevOpen}` : styles.faqChev}
                            size={20}
                            aria-hidden="true"
                          />
                        </button>
                        <div
                          className={styles.faqBody}
                          id={`faq-body-${item.id}`}
                          role="region"
                          style={{
                            maxHeight: isOpen && bodyRefs.current[item.id]
                              ? `${bodyRefs.current[item.id]!.scrollHeight}px`
                              : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.28s cubic-bezier(0.4,0,0.2,1)',
                          }}
                          ref={el => { bodyRefs.current[item.id] = el; }}
                        >
                          <div style={{ padding: '0 0 20px' }}>{item.answerJsx}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
    </>
  );
}
