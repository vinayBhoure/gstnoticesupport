// Skeleton per resources/ui/Admin Bookings.html → loadingView.
export default function AdminBookingsLoading() {
  return (
    <div aria-hidden>
      <div className="skel" style={{ width: 220, height: 32, marginBottom: 24 }} />
      <div className="skel skel-bar" />
      <div className="table-card">
        <div className="skel-th" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skel skel-trow" />
        ))}
      </div>
    </div>
  );
}
