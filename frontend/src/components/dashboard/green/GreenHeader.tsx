import { Trees, Users, HandHeart } from "lucide-react";

export default function GreenHeader() {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trees className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-slate-900">Go Green Initiative</h2>
          <p className="mt-1 text-sm text-slate-500">Growing together for a sustainable future</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50">
          <Users className="h-4 w-4" />
          Invite Friends
        </button>
        <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-primary/20">
          <HandHeart className="h-4 w-4" />
          Next Drive
        </button>
      </div>
    </header>
  );
}
