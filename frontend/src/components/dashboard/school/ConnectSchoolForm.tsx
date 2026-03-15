"use client";

import { Building2, Search, FileText, Bell, Contact, Image, Hospital } from "lucide-react";

export default function ConnectSchoolForm() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-medium text-slate-900">Connect Your School</h3>
        </div>

        {/* The onSubmit handler here requires "use client" at the top of the file */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Find School</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border-none bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary"
                placeholder="Search for registered schools..."
                type="text"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">School Unique Code</label>
            <input
              className="w-full rounded-xl border-none bg-slate-50 px-4 py-3 font-mono text-sm tracking-wider text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary"
              type="text"
              defaultValue="SCH-WB-20250805-000056"
            />
            <p className="text-[10px] text-slate-500">Enter the 20-digit code provided by your school administration.</p>
          </div>

          <button className="w-[30%] rounded-full bg-primary py-4 font-medium text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
            Request Link Access
          </button>
        </form>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <h4 className="mb-6 text-xs font-medium uppercase tracking-wider text-slate-900">Connection Benefits</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <div className="flex items-start gap-3 rounded-lg transition-colors">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <p className="text-xs font-normal leading-tight text-slate-600 mt-1">View school health records</p>
            </div>

            <div className="flex items-start gap-3 rounded-lg transition-colors">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <p className="text-xs font-normal leading-tight text-slate-600 mt-1">HPS checkup notifications</p>
            </div>

            <div className="flex items-start gap-3 rounded-lg transition-colors">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <Contact className="h-4 w-4" />
              </div>
              <p className="text-xs font-normal leading-tight text-slate-600 mt-1">Emergency contact access</p>
            </div>

            <div className="flex items-start gap-3 rounded-lg transition-colors">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <Image className="h-4 w-4" />
              </div>
              <p className="text-xs font-normal leading-tight text-slate-600 mt-1">Class photo memories</p>
            </div>

            <div className="flex items-start gap-3 rounded-lg transition-colors">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
                <Hospital className="h-4 w-4" />
              </div>
              <p className="text-xs font-normal leading-tight text-slate-600 mt-1">Health ambassador connect</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
