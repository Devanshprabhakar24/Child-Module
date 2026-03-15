import { TrendingUp, Check, Sprout, Trees } from "lucide-react";

interface Props {
  plantedDate?: string;
}

export default function GrowthTimeline({ plantedDate }: Props) {
  const year = plantedDate ? plantedDate.split(" ")[2] : "—";
  const nextYear = year !== "—" ? String(Number(year) + 1) : "—";
  const matureYear = year !== "—" ? String(Number(year) + 4) : "—";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h4 className="mb-8 flex items-center gap-2 font-medium text-slate-900">
        <TrendingUp className="h-5 w-5 text-primary" />
        Tree Growth Timeline
      </h4>
      <div className="relative flex items-start justify-between">
        <div className="absolute left-0 top-5 z-0 h-1 w-full bg-slate-100" />
        <div className="absolute left-0 top-5 z-0 h-1 w-1/2 bg-primary" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white ring-8 ring-white">
            <Check className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-slate-900">Sapling</span>
          <span className="text-[10px] font-medium text-slate-400">{plantedDate || "—"}</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 text-slate-400 ring-8 ring-white">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-slate-500">Growing</span>
          <span className="text-[10px] font-medium text-slate-400">Est. {nextYear}</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 text-slate-400 ring-8 ring-white">
            <Trees className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-slate-500">Mature</span>
          <span className="text-[10px] font-medium text-slate-400">Est. {matureYear}</span>
        </div>
      </div>
    </div>
  );
}
