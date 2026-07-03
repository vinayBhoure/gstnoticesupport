import Link from 'next/link';
import { Link2Off, ArrowRight } from 'lucide-react';

// State 4 (malformed query — never reached the API) per resources/ui/Payment
// Verification.html → #state-invalid. No booking context is trustworthy here,
// so the only action is a link back to the dashboard.
export function InvalidLinkState() {
  return (
    <div className="pv-state" role="status" aria-live="polite">
      <span className="pv-icon ic-muted" aria-hidden>
        <Link2Off size={32} strokeWidth={1.5} />
      </span>
      <h2 id="pvHeading">This payment link is invalid or has expired.</h2>
      <p className="body">
        Please check your service status in your service page or payments history.
      </p>
      <div className="pv-actions">
        <Link className="pv-tertiary" href="/dashboard">
          Go to Dashboard
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
