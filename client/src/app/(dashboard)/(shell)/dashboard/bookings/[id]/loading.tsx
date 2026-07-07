// Skeleton loader per resources/ui/Service Detail.html → loadingView.
export default function BookingDetailLoading() {
  return (
    <div aria-hidden>
      <div className="skel skel-block" style={{ width: 220, height: 26, marginBottom: 24 }} />
      <div className="two-col">
        <div>
          <div className="detail-card" style={{ marginBottom: 20 }}>
            <div className="skel skel-block" style={{ width: 140, height: 20, marginBottom: 20 }} />
            <div className="skel skel-block" style={{ width: '100%' }} />
            <div className="skel skel-block" style={{ width: '90%' }} />
            <div className="skel skel-block" style={{ width: '80%' }} />
            <div className="skel skel-block" style={{ width: '85%' }} />
          </div>
          <div className="detail-card">
            <div className="skel skel-block" style={{ width: 160, height: 20, marginBottom: 20 }} />
            <div className="skel skel-block" style={{ width: '100%', height: 36, marginBottom: 8 }} />
            <div className="skel skel-block" style={{ width: '100%', height: 36, marginBottom: 8 }} />
          </div>
        </div>
        <div className="action-panel">
          <div className="skel skel-block" style={{ width: '70%', height: 18, margin: '0 auto 16px' }} />
          <div className="skel skel-block" style={{ width: '100%', height: 56, marginBottom: 10 }} />
          <div className="skel skel-block" style={{ width: '100%', height: 48 }} />
        </div>
      </div>
    </div>
  );
}
