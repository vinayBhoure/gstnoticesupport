import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ShieldCheck } from 'lucide-react';

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
            <div>GST Notice Support Pvt. Ltd.</div>
            <div className="mono" style={{ marginTop: 10 }}>CIN: U74999KA2024PTC000000</div>
            <div className="mono">GSTIN: 29ABCDE1234F1Z5</div>
            <div className="addr">
              4th Floor, Prestige Centre, MG Road,<br />
              Bengaluru, Karnataka 560001
            </div>
          </div>

          {/* Services */}
          <div>
            <h5>Services</h5>
            <ul>
              <li><Link href="/services/asmt-10">ASMT-10 Scrutiny Notice</Link></li>
              <li><Link href="/services/scn-reply">Show Cause Notice (SCN)</Link></li>
              <li><Link href="/services/commissioner-appeal">Commissioner Appeal</Link></li>
              <li><Link href="/services/gstat-appeal">GSTAT Appeal</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5>Resources</h5>
            <ul>
              <li><Link href="/faq">GST Notice Guides</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5>Contact</h5>
            <ul>
              <li><a href="tel:+919343297622">+91 93432 97622</a></li>
              <li><a href="mailto:help@gstnoticesupport.in">help@gstnoticesupport.in</a></li>
              <li>Grievance Officer: A. Sharma</li>
              <li>
                <a href="mailto:grievance@gstnoticesupport.in" className="mono">
                  grievance@gstnoticesupport.in
                </a>
              </li>
            </ul>
            <a
              className="btn btn-wa"
              href="https://wa.me/919343297622?text=Hello%2C%20I%20have%20a%20query%20about%20a%20GST%20notice."
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="ic" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="strip">
          <div className="pols">
            <Link href="/privacy">Privacy Policy</Link><span>|</span>
            <Link href="/terms">Terms</Link><span>|</span>
            <Link href="/refund">Refund Policy</Link>
          </div>
          <span className="ssl">
            <ShieldCheck style={{ width: 15, height: 15 }} />
            SSL Secured
          </span>
          <span>© 2026 GST Notice Support Pvt. Ltd. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
