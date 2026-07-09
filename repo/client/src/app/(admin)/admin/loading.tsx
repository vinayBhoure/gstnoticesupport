// Skeleton per resources/ui/Admin Overview.html → loadingView.
export default function AdminOverviewLoading() {
  return (
    <div aria-hidden>
      <div className="skel" style={{ width: 200, height: 32 }} />
      <div className="kpi-row">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skel-stat">
            <div className="skel s1" />
            <div className="skel s2" />
            <div className="skel s3" />
          </div>
        ))}
      </div>
      <div className="section-block" style={{ marginTop: 48 }}>
        <div className="section-head">
          <div className="skel" style={{ width: 200, height: 22 }} />
        </div>
        <div className="table-card">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skel skel-trow" style={{ margin: '19px 20px', height: 18 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
