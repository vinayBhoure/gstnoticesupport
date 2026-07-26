import Link from 'next/link';
import styles from './legal.module.css';

type LegalHeroProps = {
  title: string;
  effectiveDate: string;
  lead: string;
  // Extra meta chips after the effective date (e.g. governing-law jurisdiction on Terms).
  metaExtra?: React.ReactNode;
};

// Hero shared by /terms, /privacy, /refund (resources/ui .legal-hero — issues #11/#12).
export function LegalHero({ title, effectiveDate, lead, metaExtra }: LegalHeroProps) {
  return (
    <section className={styles.legalHero}>
      <div className="container">
        <div className={styles.crumbs}>
          <Link href="/">Home</Link>
          <span className={styles.sep} aria-hidden>
            /
          </span>
          <span>{title}</span>
        </div>
        <h1>{title}</h1>
        <div className={styles.meta}>
          <span>Effective: {effectiveDate}</span>
          {metaExtra && (
            <>
              <span className={styles.dot} aria-hidden />
              {metaExtra}
            </>
          )}
        </div>
        <p className={styles.lead}>{lead}</p>
      </div>
    </section>
  );
}
