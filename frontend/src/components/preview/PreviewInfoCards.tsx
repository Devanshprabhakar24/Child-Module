export default function PreviewInfoCards() {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-primary/10 bg-primary/5 p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
          <span className="material-symbols-outlined">notification_important</span>
        </div>
        <h4 className="mb-2 font-bold text-slate-900">Auto-Generated</h4>
        <p className="text-sm text-slate-600">This message is triggered automatically upon successful registration verification.</p>
      </div>
      
      <div className="rounded-xl border border-primary/10 bg-primary/5 p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
          <span className="material-symbols-outlined">security</span>
        </div>
        <h4 className="mb-2 font-bold text-slate-900">Secure Link</h4>
        <p className="text-sm text-slate-600">Dashboard links are unique to each registration and expire after first-time activation.</p>
      </div>
      
      <div className="rounded-xl border border-primary/10 bg-primary/5 p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
          <span className="material-symbols-outlined">analytics</span>
        </div>
        <h4 className="mb-2 font-bold text-slate-900">Track Delivery</h4>
        <p className="text-sm text-slate-600">View real-time delivery status and open rates across all communication channels.</p>
      </div>
    </div>
  );
}