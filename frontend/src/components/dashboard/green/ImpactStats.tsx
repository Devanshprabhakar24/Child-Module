export default function ImpactStats() {
  return (
    <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Stat 1 */}
      <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="text-3xl font-bold text-primary">1</span>
        <span className="text-sm font-medium text-slate-600">Tree Planted</span>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
          <div className="h-full w-1/3 rounded-full bg-primary"></div>
        </div>
      </div>
      
      {/* Stat 2 */}
      <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="text-3xl font-bold text-primary">50 kg</span>
        <span className="text-sm font-medium text-slate-600">CO2 Offset</span>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
          <div className="h-full w-1/2 rounded-full bg-primary"></div>
        </div>
      </div>
      
      {/* Stat 3 */}
      <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="text-3xl font-bold text-primary">1000 L</span>
        <span className="text-sm font-medium text-slate-600">Water Saved</span>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
          <div className="h-full w-3/4 rounded-full bg-primary"></div>
        </div>
      </div>
    </section>
  );
}