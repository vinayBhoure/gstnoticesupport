// Skeleton loader per resources/ui/Payment History.html → loadingView.
export default function PaymentsLoading() {
  return (
    <div aria-hidden>
      <div className="page-head" style={{ marginBottom: 32 }}>
        <div className="skel skel-line" style={{ width: 240, height: 30 }} />
      </div>

      {/* Desktop skeleton table */}
      <div className="payment-table-wrap">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Service</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="col-receipt">Receipt</th>
              <th className="col-view" />
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((i) => (
              <tr key={i} className="payment-row">
                <td>
                  <span className="skel skel-line" style={{ width: 80 }} />
                </td>
                <td>
                  <span className="skel skel-line" style={{ width: 140 }} />
                </td>
                <td>
                  <span className="skel skel-line" style={{ width: 110 }} />
                </td>
                <td>
                  <span className="skel skel-line" style={{ width: 60 }} />
                </td>
                <td>
                  <span className="skel skel-line" style={{ width: 90 }} />
                </td>
                <td className="col-receipt">
                  <span className="skel skel-line" style={{ width: 24, height: 24, margin: '0 auto' }} />
                </td>
                <td className="col-view">
                  <span className="skel skel-line" style={{ width: 24, height: 24, margin: '0 auto' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile skeleton cards */}
      <div className="payment-cards">
        {[0, 1].map((i) => (
          <div key={i} className="skel-card">
            <div className="skel skel-line l1" />
            <div className="skel skel-line l2" />
            <div className="skel skel-line l3" />
          </div>
        ))}
      </div>
    </div>
  );
}
