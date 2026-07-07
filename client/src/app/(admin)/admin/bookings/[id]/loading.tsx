// Skeleton per resources/ui/Admin Booking Detail.html → loadingView.
export default function AdminBookingDetailLoading() {
  return (
    <div aria-hidden style={{ marginTop: 20 }}>
      <div className="skel" style={{ height: 34, width: '46%', marginBottom: 24 }} />
      <div className="detail-grid">
        <div className="col-left">
          <div className="skel-stat" style={{ minHeight: 0 }}>
            <div className="skel" style={{ height: 16, width: '40%' }} />
            <div className="skel" style={{ height: 13, width: '90%' }} />
            <div className="skel" style={{ height: 13, width: '85%' }} />
            <div className="skel" style={{ height: 13, width: '70%' }} />
          </div>
          <div className="skel-stat" style={{ minHeight: 0 }}>
            <div className="skel" style={{ height: 16, width: '50%' }} />
            <div className="skel" style={{ height: 13, width: '95%' }} />
            <div className="skel" style={{ height: 13, width: '88%' }} />
          </div>
        </div>
        <div className="col-right">
          <div className="skel-stat" style={{ minHeight: 0 }}>
            <div className="skel" style={{ height: 16, width: '30%' }} />
            <div className="skel" style={{ height: 90, width: '100%' }} />
          </div>
          <div className="skel-stat" style={{ minHeight: 0 }}>
            <div className="skel" style={{ height: 16, width: '45%' }} />
            <div className="skel" style={{ height: 44, width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
