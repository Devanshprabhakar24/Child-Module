import { Plus, Info } from "lucide-react";

export default function MilestoneProgress() {
  return (
    <div className="flex flex-col gap-6 lg:col-span-1">

      {/* Progress Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h3 className="mb-6 font-medium text-slate-900">Overall Progress</h3>

        <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            <circle className="text-primary/10" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
            <circle className="text-primary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="154" strokeLinecap="round" strokeWidth="12"></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-medium text-slate-900">65%</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Achieved</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-4 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span className="font-medium">On Track</span>
            </div>
            <span className="font-medium text-slate-900">12</span>
          </div>
          <div className="flex items-center justify-between px-4 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="h-3 w-3 rounded-full bg-amber-400"></div>
              <span className="font-medium">Delayed</span>
            </div>
            <span className="font-medium text-slate-900">3</span>
          </div>
        </div>
      </div>

      {/* Add Milestone Button */}
      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-medium text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90">
        <Plus className="h-5 w-5" />
        Add New Milestone
      </button>

      {/* Alerts */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <Info className="shrink-0 h-5 w-5 text-amber-500" />
          <p className="text-xs font-normal leading-relaxed text-amber-800">
            Consult your pediatrician if any milestone is delayed by 2+ months beyond the typical age range.
          </p>
        </div>
      </div>

    </div>
  );
}
