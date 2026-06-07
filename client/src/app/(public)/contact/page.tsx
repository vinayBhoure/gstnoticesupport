import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, PhoneIncoming } from 'lucide-react';
import styles from './contact.module.css';
import { ContactForm } from './ContactForm';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Contact Us | GST Notice Support',
  description: 'Reach the GST Notice Support team by phone, WhatsApp, or email. We respond to every enquiry within 24 hours. Mon–Sat, 9 AM–7 PM IST.',
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
      <section className={styles.pageHero}>
        <div className="container">
          <h1>Get in Touch</h1>
          <p className={styles.sub}>
            Have a GST notice or a question about our services? Reach us by phone, email, or
            WhatsApp. We respond within 24 hours on working days.
          </p>
        </div>
      </section>

      {/* CONTACT SPLIT */}
      <section className={styles.contactSection} id="contact">
        <div className="container">
          <div className={styles.contactGrid}>

            {/* LEFT — CONTACT FORM */}
            <div className={styles.formCard}>
              <h3>Send Us a Message</h3>
              <ContactForm />
            </div>

            {/* RIGHT — CONTACT DETAILS */}
            <div className={styles.detailsCol}>
              <h3>Other Ways to Reach Us</h3>

              <div className={styles.channelList}>

                {/* Phone */}
                <div className={styles.channelRow}>
                  <div className={styles.channelIc} aria-hidden="true">
                    <Phone size={20} />
                  </div>
                  <div className={styles.channelBody}>
                    <span className={styles.channelLabel}>Phone</span>
                    <span className={styles.channelValue}>
                      <a href="tel:+919343297622">+91 93432 97622</a>
                    </span>
                    <span className={styles.channelHours}>Tap to call · Mon–Sat, 9 AM–7 PM IST</span>
                  </div>
                </div>

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
                    <span className={styles.channelLabel}>WhatsApp</span>
                    <a
                      className={styles.btnWaChannel}
                      href="https://wa.me/919343297622?text=Hello%2C%20I%20have%20a%20query%20about%20a%20GST%20notice."
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat on WhatsApp — opens WhatsApp"
                    >
                      <WaIcon />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className={styles.channelRow}>
                  <div className={styles.channelIc} aria-hidden="true">
                    <Mail size={20} />
                  </div>
                  <div className={styles.channelBody}>
                    <span className={styles.channelLabel}>Email</span>
                    <span className={styles.channelValue}>
                      <a href="mailto:support@gstnoticesupport.in">support@gstnoticesupport.in</a>
                    </span>
                    <span className={styles.channelHours}>We respond within 24 hours on working days</span>
                  </div>
                </div>

                {/* Office Address */}
                <div className={styles.channelRow}>
                  <div className={styles.channelIc} aria-hidden="true">
                    <MapPin size={20} />
                  </div>
                  <div className={styles.channelBody}>
                    <span className={styles.channelLabel}>Office Address</span>
                    <address className={styles.addrText}>
                      4th Floor, Prestige Centre, MG Road<br />
                      Bengaluru, Karnataka 560001<br />
                      India
                    </address>
                    <span className={styles.channelHours} style={{ display: 'block', marginTop: '6px' }}>
                      Services delivered remotely — no in-person visit required
                    </span>
                  </div>
                </div>

                {/* Hours */}
                <div className={styles.channelRow}>
                  <div className={styles.channelIc} aria-hidden="true">
                    <Clock size={20} />
                  </div>
                  <div className={styles.channelBody}>
                    <span className={styles.channelLabel}>Office Hours</span>
                    <span className={styles.channelValue}>Monday – Saturday</span>
                    <span className={styles.channelHours}>
                      9 AM – 7 PM IST · Closed on Sundays &amp; national holidays
                    </span>
                  </div>
                </div>

              </div>{/* /channelList */}

              {/* Grievance Officer */}
              <div className={styles.grievanceRow}>
                <strong>Grievance Officer:</strong> Ananya Rao<br />
                <a href="mailto:grievance@gstnoticesupport.in">grievance@gstnoticesupport.in</a>
                &nbsp;·&nbsp;For escalations and unresolved complaints only.
              </div>

              {/* Request Callback Banner */}
              <div className={styles.callbackBanner} id="callback">
                <div className={styles.cbText}>
                  <strong>Prefer a callback?</strong>
                  <span>Leave your number and a convenient time — we will call you.</span>
                </div>
                <a className="btn btn-secondary" href="tel:+919343297622" aria-label="Request a callback">
                  <PhoneIncoming size={17} aria-hidden="true" />
                  Request a Callback
                </a>
              </div>

            </div>{/* /detailsCol */}
          </div>{/* /contactGrid */}
        </div>
      </section>
    </>
  );
}
