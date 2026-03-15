export default function VaccinationProgress() {
  return (
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Overall Progress</p>
          <p className="mt-1 text-sm font-normal text-slate-600">12 of 15 vaccines completed</p>
        </div>
        <span className="text-2xl font-bold text-primary">80%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: '80%' }}></div>
      </div>
    </section>
  );
}