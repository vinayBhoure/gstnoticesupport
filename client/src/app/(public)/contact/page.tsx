import type { Metadata } from 'next';
import { Mail, MapPin, Clock, PhoneIncoming } from 'lucide-react';
import styles from './contact.module.css';
import { ContactForm } from './ContactForm';
import { RequestCallbackButton } from '@/components/ui/RequestCallbackButton';
import { HeroScrollIndicator } from '@/components/ui/HeroScrollIndicator';
import { ORG } from '@/lib/site';
import { contactMeta, contactHero, contactContent } from '@/data/contact';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: contactMeta.title,
  description: contactMeta.description,
};

const WaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ContactPage() {
  return (
    <>
      {/* PAGE HERO */}
      <section className={styles.pageHero} style={{ position: 'relative' }}>
        <div className="container">
          <h1>{contactHero.heading}</h1>
          <p className={styles.sub}>
            {contactHero.sub}
          </p>
        </div>
        <HeroScrollIndicator />
      </section>

      {/* CONTACT SPLIT */}
      <section className={styles.contactSection} id="contact">
        <div className="container">
          <div className={styles.contactGrid}>

            {/* LEFT — CONTACT FORM */}
            <div className={styles.formCard}>
              <h3>{contactContent.formCardHeading}</h3>
              <ContactForm />
            </div>

            {/* RIGHT — CONTACT DETAILS */}
            <div className={styles.detailsCol}>
              <h3>{contactContent.detailsHeading}</h3>

              <div className={styles.channelList}>

                {/* WhatsApp */}
                <div className={styles.channelRow}>
                  <div
                    className={styles.channelIc}
                    style={{ background: 'rgba(37,211,102,.08)', borderColor: 'rgba(37,211,102,.2)', color: '#128C7E' }}
                    aria-hidden="true"
                  >
                    <WaIcon />
                  </div>
                  <div className={styles.channelBody}>
                    <span className={styles.channelLabel}>{contactContent.whatsapp.label}</span>
                    <a
                      className={styles.btnWaChannel}
                      href={contactContent.whatsapp.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={contactContent.whatsapp.ariaLabel}
                    >
                      <WaIcon />
                      {contactContent.whatsapp.ctaLabel}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className={styles.channelRow}>
                  <div className={styles.channelIc} aria-hidden="true">
                    <Mail size={20} />
                  </div>
                  <div className={styles.channelBody}>
                    <span className={styles.channelLabel}>{contactContent.email.label}</span>
                    <span className={styles.channelValue}>
                      <a href={`mailto:${ORG.email}`}>{ORG.email}</a>
                    </span>
                    <span className={styles.channelHours}>{contactContent.email.hours}</span>
                  </div>
                </div>

                {/* Office Address */}
                <div className={styles.channelRow}>
                  <div className={styles.channelIc} aria-hidden="true">
                    <MapPin size={20} />
                  </div>
                  <div className={styles.channelBody}>
                    <span className={styles.channelLabel}>{contactContent.address.label}</span>
                    <address className={styles.addrText}>
                      <strong>{contactContent.address.headOfficeLabel}</strong><br />
                      {ORG.address.street}<br />
                      {ORG.address.locality}, {ORG.address.region} {ORG.address.postalCode}
                    </address>
                    {ORG.branches.map((branch) => (
                      <address className={styles.addrText} style={{ marginTop: '10px' }} key={branch.locality}>
                        <strong>{contactContent.address.branchOfficeLabel}</strong><br />
                        {branch.locality}, {branch.region} {branch.postalCode}
                      </address>
                    ))}
                    <span className={styles.channelHours} style={{ display: 'block', marginTop: '6px' }}>
                      {contactContent.address.country} · {contactContent.address.note}
                    </span>
                  </div>
                </div>

                {/* Hours */}
                <div className={styles.channelRow}>
                  <div className={styles.channelIc} aria-hidden="true">
                    <Clock size={20} />
                  </div>
                  <div className={styles.channelBody}>
                    <span className={styles.channelLabel}>{contactContent.hours.label}</span>
                    <span className={styles.channelValue}>{contactContent.hours.days}</span>
                    <span className={styles.channelHours}>
                      {contactContent.hours.detail}
                    </span>
                  </div>
                </div>

              </div>{/* /channelList */}

              {/* Grievance */}
              <div className={styles.grievanceRow}>
                <strong>{contactContent.grievance.label}</strong> {ORG.grievanceOfficer}
                &nbsp;·&nbsp;{contactContent.grievance.text}{' '}
                <a href={`mailto:${ORG.email}`}>{ORG.email}</a>.
              </div>

              {/* Request Callback Banner */}
              <div className={styles.callbackBanner} id="callback">
                <div className={styles.cbText}>
                  <strong>{contactContent.callback.title}</strong>
                  <span>{contactContent.callback.sub}</span>
                </div>
                <RequestCallbackButton className="btn btn-secondary">
                  <PhoneIncoming size={17} aria-hidden="true" />
                  {contactContent.callback.ctaLabel}
                </RequestCallbackButton>
              </div>

            </div>{/* /detailsCol */}
          </div>{/* /contactGrid */}
        </div>
      </section>
    </>
  );
}
