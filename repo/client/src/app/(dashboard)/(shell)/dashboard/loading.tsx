// Skeleton loader per resources/ui/Dashboard Home.html → loadingView.
export default function DashboardLoading() {
  return (
    <div aria-hidden>
      <div className="skel skel-line" style={{ width: 260, height: 30 }} />
      <div className="skel skel-strip" />
      <div className="section-block">
        <div className="section-head">
          <div className="skel skel-line" style={{ width: 180, height: 22 }} />
        </div>
        <div className="cards-grid">
          {[0, 1, 2].map((i) => (
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
