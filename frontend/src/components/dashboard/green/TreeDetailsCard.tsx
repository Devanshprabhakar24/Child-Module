import { Map, BadgeCheck } from "lucide-react";

export default function TreeDetailsCard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Tree Image */}
        <div
          className="h-56 w-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625758476104-f2ed6c81248f?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        ></div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-medium text-slate-900">Tree Planted for Aarav Sharma</h3>
              <p className="mt-1 text-sm font-normal text-primary">Tree ID: TREE-KA-2026-000123</p>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
              Active
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-y-6 text-sm">
            <div className="flex flex-col">
              <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Species</span>
              <span className="font-normla text-slate-900">Neem (Azadirachta indica)</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Location</span>
              <span className="font-normal text-slate-900">Bangalore, KA</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Planted Date</span>
              <span className="font-normal text-slate-900">10 Mar 2026</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Guardian</span>
              <span className="font-normal text-slate-900">WombTo18 Team</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
              <Map className="h-4 w-4" />
              View on Map
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90">
              <BadgeCheck className="h-4 w-4" />
              Download Cert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
