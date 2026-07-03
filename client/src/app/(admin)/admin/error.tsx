'use client';

import { AlertCircle, RotateCw } from 'lucide-react';

// Route-level error card per resources/ui/Admin *.html → errorView.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-card" role="alert" style={{ marginTop: 20 }}>
      <AlertCircle className="ic-lead" aria-hidden />
      <p className="txt">
        <b>Couldn&apos;t load this page.</b> Check your connection and try again.
      </p>
      <button className="btn btn-secondary" type="button" onClick={() => reset()}>
        <RotateCw className="ic" aria-hidden /> Retry
      </button>
    </div>
  );
}
