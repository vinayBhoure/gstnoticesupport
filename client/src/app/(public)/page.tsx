import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin, Check, ArrowRight, Clock, AlertTriangle, CheckCircle, List,
} from 'lucide-react';
import { Testimonials } from '@/components/home/Testimonials';
import { FaqAccordion } from '@/components/home/FaqAccordion';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { HeroScrollIndicator } from '@/components/ui/HeroScrollIndicator';
import { CountUp } from '@/components/ui/CountUp';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import {
  homeMeta, homeHero, homeNotices, homeSteps, homeTrust, homeOutcomes,
  homeSecurity, homePricing, homeTestimonialsHead, homeFaqHead,
  homeDisclaimer, homeFinalCta,
} from '@/data/home';
import styles from './page.module.css';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: {
    absolute: homeMeta.titleAbsolute,
  },
  description: homeMeta.description,
  alternates: {
    canonical: '/',
  },
  // openGraph/twitter are intentionally inherited from the root layout so the
  // generated share image, site name, locale and type are not dropped — a
  // page-level openGraph object would shallow-replace the root one (Next 16).
};

const [notice1, notice2, notice3, notice4] = homeNotices.cards;
const [step1, step2, step3, step4] = homeSteps.items;
const [stat1, stat2, stat3, stat4] = homeOutcomes.stats;
const [tier1, tier2, tier3, tier4] = homePricing.tiers;

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
                  {homeHero.badge}
                </span>
                <h1>{homeHero.heading}</h1>
                <p className={styles.sub}>
                  {homeHero.sub}
                </p>
                <div className={styles.cta}>
                  <a
                    className="btn btn-primary"
                    href={homeHero.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {homeHero.bookLabel}
                  </a>
                  <RequestCallbackButton className="btn btn-secondary">{homeHero.callbackLabel}</RequestCallbackButton>
                </div>
                <div className={styles.reassure}>
                  <span><Check className="ic" />{homeHero.reassurance[0]}</span>
                  <span><Check className="ic" />{homeHero.reassurance[1]}</span>
                  <span><Check className="ic" />{homeHero.reassurance[2]}</span>
                  <span><Check className="ic" />{homeHero.reassurance[3]}</span>
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
            <div className="eyebrow">{homeNotices.eyebrow}</div>
            <h2>{homeNotices.heading}</h2>
            <p>{homeNotices.sub}</p>
          </div>
          <div className={styles.noticeGrid}>
            <AnimateIn delay={0}>
              <Link className={`card ${styles.noticeCard}`} href={notice1.href}>
                <div className={styles.icWrap}><notice1.Icon style={{ width: 23, height: 23 }} /></div>
                <h3>{notice1.title}</h3>
                <p className={styles.desc}>{notice1.description}</p>
                <div className={styles.price}>{notice1.priceDisplay} <small>{notice1.priceNote}</small></div>
                <div className={styles.foot}><span className={styles.getlink}>{homeNotices.getHelpLabel} <ArrowRight style={{ width: 15, height: 15 }} /></span></div>
              </Link>
            </AnimateIn>
            <AnimateIn delay={100}>
              <Link className={`card ${styles.noticeCard}`} href={notice2.href}>
                <div className={styles.icWrap}><notice2.Icon style={{ width: 23, height: 23 }} /></div>
                <h3>{notice2.title}</h3>
                <p className={styles.desc}>{notice2.description}</p>
                <div className={styles.price}>{notice2.priceDisplay} <small>{notice2.priceNote}</small></div>
                <div className={styles.foot}><span className={styles.getlink}>{homeNotices.getHelpLabel} <ArrowRight style={{ width: 15, height: 15 }} /></span></div>
              </Link>
            </AnimateIn>
            <AnimateIn delay={200}>
              <Link className={`card ${styles.noticeCard}`} href={notice3.href}>
                <div className={styles.icWrap}><notice3.Icon style={{ width: 23, height: 23 }} /></div>
                <h3>{notice3.title}</h3>
                <p className={styles.desc}>{notice3.description}</p>
                <div className={styles.price}>{notice3.priceDisplay} <small>{notice3.priceNote}</small></div>
                <div className={styles.foot}><span className={styles.getlink}>{homeNotices.getHelpLabel} <ArrowRight style={{ width: 15, height: 15 }} /></span></div>
              </Link>
            </AnimateIn>
            <AnimateIn delay={300}>
              <Link className={`card ${styles.noticeCard}`} href={notice4.href}>
                <div className={styles.icWrap}><notice4.Icon style={{ width: 23, height: 23 }} /></div>
                <h3>{notice4.title}</h3>
                <p className={styles.desc}>{notice4.description}</p>
                <div className={styles.price}>{notice4.priceDisplay} <small>{notice4.priceNote}</small></div>
                <span className={`badge badge-amber ${styles.badgeAmber}`}>
                  <AlertTriangle style={{ width: 13, height: 13 }} />{notice4.badge}
                </span>
                <div className={styles.foot}><span className={styles.getlink}>{homeNotices.getHelpLabel} <ArrowRight style={{ width: 15, height: 15 }} /></span></div>
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="section bg-white">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{homeSteps.eyebrow}</div>
            <h2>{homeSteps.heading}</h2>
          </div>
          <div className={styles.steps}>
            <AnimateIn delay={0}>
              <div className={styles.step}>
                <div className={styles.num}>1</div>
                <div className={styles.stepBody}>
                  <h3>{step1.title}</h3>
                  <p>{step1.body}</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={120}>
              <div className={styles.step}>
                <div className={styles.num}>2</div>
                <div className={styles.stepBody}>
                  <h3>{step2.title}</h3>
                  <p>{step2.body}</p>
                  <span className={`badge badge-amber ${styles.sla}`}>
                    <Clock style={{ width: 13, height: 13 }} />{step2.sla}
                  </span>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={240}>
              <div className={styles.step}>
                <div className={styles.num}>3</div>
                <div className={styles.stepBody}>
                  <h3>{step3.title}</h3>
                  <p>{step3.body}</p>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={360}>
              <div className={styles.step}>
                <div className={styles.num}>4</div>
                <div className={styles.stepBody}>
                  <h3>{step4.title}</h3>
                  <p>{step4.body}</p>
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
            <div className="eyebrow">{homeTrust.eyebrow}</div>
            <h2>{homeTrust.heading}</h2>
            <p style={{ fontSize: 20, color: 'var(--neutral-600)' }}>
              {homeTrust.sub}
            </p>
          </div>
          <div className={styles.trustGrid}>
            {homeTrust.cards.map(({ Icon, title, desc }, i) => (
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
            <div className="eyebrow">{homeOutcomes.eyebrow}</div>
            <h2>{homeOutcomes.heading}</h2>
          </div>
          <AnimateIn>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.n}><CountUp value={stat1.value} suffix={stat1.suffix} /></div>
                <div className={styles.d}>{stat1.label}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.n}>{stat2.prefix}<CountUp value={stat2.value} suffix={stat2.suffix} /></div>
                <div className={styles.d}>{stat2.label}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.n}><CountUp value={stat3.value} suffix={stat3.suffix} /></div>
                <div className={styles.d}>{stat3.label}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.n}><CountUp value={stat4.value} suffix={stat4.suffix} /></div>
                <div className={styles.d}>{stat4.label}</div>
              </div>
            </div>
          </AnimateIn>
          <div className={styles.cases}>
            {homeOutcomes.cases.map(({ caseType, issue, outcome }, i) => (
              <AnimateIn key={caseType} delay={i * 100}>
                <div className={`card ${styles.case}`}>
                  <div className={styles.ct}>{caseType}</div>
                  <div className={styles.issue}>{issue}</div>
                  <div className={styles.out}><CheckCircle className={styles.ic} />{outcome}</div>
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
            <div className="eyebrow" style={{ color: '#7FD3A6' }}>{homeSecurity.eyebrow}</div>
            <h2 style={{ color: '#fff' }}>{homeSecurity.heading}</h2>
          </div>
          <div className={styles.pillars}>
            {homeSecurity.pillars.map(({ Icon, title, desc }, i) => (
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
            <div className="eyebrow">{homePricing.eyebrow}</div>
            <h2>{homePricing.heading}</h2>
          </div>
          <div className={styles.tiers}>
            <AnimateIn delay={0}>
              <div className={`card ${styles.tier}`}>
                <h3>{tier1.title}</h3>
                <div className={styles.price}>{tier1.priceDisplay}</div>
                <ul>
                  {tier1.features.map(f => (
                    <li key={f}><Check className={styles.ic} />{f}</li>
                  ))}
                </ul>
                <div className={styles.tierFoot}>
                  <Link className="btn btn-secondary btn-block" href={tier1.href}>{homePricing.ctaLabel}</Link>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={100}>
              <div className={`card ${styles.tier} ${styles.popular}`}>
                <span className={`badge badge-green ${styles.popBadge}`}>{tier2.popularBadge}</span>
                <h3>{tier2.title}</h3>
                <div className={styles.price}>{tier2.priceDisplay}</div>
                <ul>
                  {tier2.features.map(f => (
                    <li key={f}><Check className={styles.ic} />{f}</li>
                  ))}
                </ul>
                <div className={styles.tierFoot}>
                  <Link className="btn btn-primary btn-block" href={tier2.href}>{homePricing.ctaLabel}</Link>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={200}>
              <div className={`card ${styles.tier}`}>
                <h3>{tier3.title}</h3>
                <div className={styles.price}>{tier3.priceDisplay}</div>
                <ul>
                  {tier3.features.map(f => (
                    <li key={f}><Check className={styles.ic} />{f}</li>
                  ))}
                </ul>
                <div className={styles.tierFoot}>
                  <Link className="btn btn-secondary btn-block" href={tier3.href}>{homePricing.ctaLabel}</Link>
                </div>
              </div>
            </AnimateIn>
            <AnimateIn delay={300}>
              <div className={`card ${styles.tier}`}>
                <h3>{tier4.title}</h3>
                <div className={styles.price}>{tier4.priceDisplay}</div>
                <ul>
                  {tier4.features.map(f => (
                    <li key={f}><Check className={styles.ic} />{f}</li>
                  ))}
                </ul>
                <div className={styles.tierFoot}>
                  <span className="badge badge-amber">
                    <AlertTriangle style={{ width: 13, height: 13 }} />{tier4.predepositBadge}
                  </span>
                  <Link className="btn btn-secondary btn-block" href={tier4.href}>{homePricing.ctaLabel}</Link>
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
            <div className="eyebrow">{homeTestimonialsHead.eyebrow}</div>
            <h2>{homeTestimonialsHead.heading}</h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="section bg-50" id="faq">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">{homeFaqHead.eyebrow}</div>
            <h2>{homeFaqHead.heading}</h2>
          </div>
          <FaqAccordion />
          <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 8 }}>
            <Link className="btn btn-secondary" href={homeFaqHead.moreHref} style={{ minWidth: 200 }}>
              <List style={{ width: 17, height: 17 }} aria-hidden="true" />
              {homeFaqHead.moreLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* 11. DISCLAIMER */}
      <section className={styles.disclaimer}>
        <div className="container">
          <div className={styles.discInner}>
            <div className={styles.discRule} />
            <div className={styles.discLabel}>{homeDisclaimer.label}</div>
            <p className={styles.discBody}>
              {homeDisclaimer.body}
            </p>
          </div>
        </div>
      </section>

      {/* 12. FINAL CTA */}
      <section className={`${styles.final} bg-navy`} id="callback">
        <div className="container">
          <h2>{homeFinalCta.heading}</h2>
          <p>{homeFinalCta.sub}</p>
          <div className={styles.cta}>
            <a
              className="btn btn-primary"
              href={homeFinalCta.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {homeFinalCta.bookLabel}
            </a>
            <RequestCallbackButton className="btn btn-secondary on-dark">{homeFinalCta.callbackLabel}</RequestCallbackButton>
          </div>
        </div>
      </section>
    </>
  );
}
