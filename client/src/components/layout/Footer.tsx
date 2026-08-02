import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { ORG } from '@/lib/site';
import { FOOTER_COLUMNS, FOOTER_LABELS, FOOTER_POLICIES } from '@/data/common';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          {/* Company */}
          <div>
            <div className="fbrand">
              <Image src="/logo.png" alt="" width={38} height={38} />
              <span className="bn">GST<span>Notice</span>Support</span>
            </div>
            <div>{ORG.legalName}</div>
            <div className="addr">
              {/* {ORG.address.street},<br /> */}
              {ORG.address.locality}, {ORG.address.region} {ORG.address.postalCode} (Head Office)
            </div>
            {ORG.branches.map((branch) => (
              <div className="addr" key={branch.locality} style={{ marginTop: '4px' }}>
                {branch.locality}, {branch.region} {branch.postalCode} (Branch)
              </div>
            ))}
          </div>

          {/* Services */}
          <div>
            <h5>{FOOTER_COLUMNS.services.heading}</h5>
            <ul>
              {FOOTER_COLUMNS.services.links.map(link => (
                <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5>{FOOTER_COLUMNS.resources.heading}</h5>
            <ul>
              {FOOTER_COLUMNS.resources.links.map(link => (
                <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5>{FOOTER_LABELS.contactHeading}</h5>
            <ul>
              <li><a href={`mailto:${ORG.email}`}>{ORG.email}</a></li>
              <li>{FOOTER_LABELS.grievanceLabel} {ORG.grievanceOfficer}</li>
            </ul>
            <a
              className="btn btn-wa"
              href={FOOTER_LABELS.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="ic" />
              {FOOTER_LABELS.whatsappCta}
            </a>
          </div>
        </div>

        <div className="strip">
          <div className="pols">
            <Link href={FOOTER_POLICIES[0].href}>{FOOTER_POLICIES[0].label}</Link><span>|</span>
            <Link href={FOOTER_POLICIES[1].href}>{FOOTER_POLICIES[1].label}</Link><span>|</span>
            <Link href={FOOTER_POLICIES[2].href}>{FOOTER_POLICIES[2].label}</Link>
          </div>
          <span className="ssl">
            <ShieldCheck style={{ width: 15, height: 15 }} />
            {FOOTER_LABELS.sslLabel}
          </span>
          <span>{FOOTER_LABELS.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
