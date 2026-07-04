import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './about.module.css';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import { ORG } from '@/lib/site';
import { HeroScrollIndicator } from '@/components/ui/HeroScrollIndicator';
import { aboutMeta, aboutHero, aboutMission, aboutCompany, aboutWhy, aboutCta } from '@/data/about';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: aboutMeta.title,
  description: aboutMeta.description,
};

export default function AboutPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className={`${styles.pageHero} bg-white`} style={{ position: 'relative' }}>
        <div className="container">
          <h1>{aboutHero.heading}</h1>
          <p className={styles.sub}>
            {aboutHero.sub}
          </p>
          <div className={styles.ctaRow}>
            <Link className="btn btn-primary" href="/dashboard/bookings/new">
              {aboutHero.bookLabel}
            </Link>
            <RequestCallbackButton className="btn btn-secondary">{aboutHero.callbackLabel}</RequestCallbackButton>
          </div>
        </div>
        <HeroScrollIndicator />
      </section>

      {/* MISSION & VISION */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head" style={{ marginBottom: '36px' }}>
            <div className="eyebrow">{aboutMission.eyebrow}</div>
            <h2>{aboutMission.heading}</h2>
          </div>
          <div className={styles.mvGrid}>
            <div className={styles.mvPanel}>
              <span className={styles.mvLabel}>{aboutMission.mission.label}</span>
              <h3>{aboutMission.mission.heading}</h3>
              <p>{aboutMission.mission.body}</p>
            </div>
            <div className={styles.mvPanel}>
              <span className={styles.mvLabel}>{aboutMission.vision.label}</span>
              <h3>{aboutMission.vision.heading}</h3>
              <p>{aboutMission.vision.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY IDENTITY */}
      <section className="section bg-50">
        <div className="container">
          <div className="sec-head left" style={{ marginBottom: '36px' }}>
            <div className="eyebrow">{aboutCompany.eyebrow}</div>
            <h2>{aboutCompany.heading}</h2>
          </div>
          <div className={styles.companyGrid}>
            <div className={styles.companyText}>
              {aboutCompany.paragraphs.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <aside className={styles.companyRef} aria-label={aboutCompany.asideAriaLabel}>
              <h3>{ORG.legalName}</h3>
              <div className={styles.refRow}>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>{aboutCompany.refLabels.address}</span>
                  <span className={styles.refValue}>
                    {ORG.address.street},<br />
                    {ORG.address.locality}, {ORG.address.region} {ORG.address.postalCode}
                  </span>
                </div>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>{aboutCompany.refLabels.grievance}</span>
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
            <div className="eyebrow">{aboutWhy.eyebrow}</div>
            <h2>{aboutWhy.heading}</h2>
          </div>
          <div className={styles.whyGrid}>
            {aboutWhy.items.map(({ Icon, title, desc }) => (
              <div key={title} className={styles.whyItem}>
                <div className={styles.icWrap} aria-hidden="true"><Icon size={22} /></div>
                <div className={styles.whyBody}>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.ctaBanner} id="book">
        <div className="container">
          <h2>{aboutCta.heading}</h2>
          <p>{aboutCta.sub}</p>
          <div className={styles.btnRow}>
            <Link className="btn btn-primary" href="/dashboard/bookings/new">
              {aboutCta.bookLabel}
            </Link>
            <RequestCallbackButton className="btn btn-secondary on-dark">
              {aboutCta.callbackLabel}
            </RequestCallbackButton>
          </div>
        </div>
      </section>
    </>
  );
}
