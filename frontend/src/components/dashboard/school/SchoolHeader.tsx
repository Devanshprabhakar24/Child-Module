"use client";

import { Link } from "lucide-react";

export default function SchoolHeader() {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-6 md:flex-row md:items-center">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">School Connection</h2>
        <p className="mt-1 text-sm text-slate-600">Sync your child's educational and health journey</p>
      </div>
      <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 shadow-sm">
        <Link className="h-4 w-4" />
        Link School
      </button>
    </header>
  );
}
