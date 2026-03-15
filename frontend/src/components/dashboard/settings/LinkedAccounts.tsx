import { Heart, School, Building2, ChevronRight } from "lucide-react";

export default function LinkedAccounts() {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
        <Heart className="h-6 w-6 text-primary" />
        Linked Accounts
      </h3>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="h-7 w-7 text-pink-500" />
              <div>
                <p className="font-normal text-slate-900">Maternal Profile</p>
                <p className="text-xs font-semibold text-primary">Linked</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-700">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <School className="h-7 w-7 text-blue-500" />
              <div>
                <p className="font-normal text-slate-900">Delhi Public School</p>
                <p className="text-xs font-medium text-slate-500">School Dashboard</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-700">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="h-7 w-7 text-red-500" />
              <div>
                <p className="font-normal text-slate-900">Preferred Hospital</p>
                <p className="text-xs font-medium italic text-slate-400">Not Linked</p>
              </div>
            </div>
            <button className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-normal text-primary transition-colors hover:bg-primary/20">
              Add
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
