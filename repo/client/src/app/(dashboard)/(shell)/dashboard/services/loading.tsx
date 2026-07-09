// Skeleton loader per resources/ui/Services List.html → loadingView.
export default function ServicesLoading() {
  return (
    <div aria-hidden>
      <div className="page-head" style={{ marginBottom: 24 }}>
        <div className="skel skel-line" style={{ width: 200, height: 30 }} />
      </div>
      <div className="filter-bar">
        {[64, 72, 92, 96].map((w, i) => (
          <div key={i} className="skel skel-line" style={{ width: w, height: 38, borderRadius: 999 }} />
        ))}
      </div>

      {/* Desktop skeleton table */}
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Next Action</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((i) => (
              <tr key={i} className="trow">
                <td className="td-service">
                  <span className="skel skel-line" style={{ width: '60%' }} />
                </td>
                <td>
                  <span className="skel skel-line" style={{ width: 80 }} />
                </td>
                <td>
                  <span className="skel skel-line" style={{ width: 90 }} />
                </td>
                <td>
                  <span className="skel skel-line" style={{ width: '70%' }} />
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile skeleton cards */}
      <div className="cards-stack-wrap">
        <div className="cards-stack">
          {[0, 1].map((i) => (
            <div key={i} className="skel-card">
              <div className="skel skel-line l1" />
              <div className="skel skel-line l2" />
              <div className="skel skel-line l3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
