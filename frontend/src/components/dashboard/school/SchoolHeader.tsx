import { Link } from "lucide-react";

export default function SchoolHeader() {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="text-3xl font-medium tracking-tight text-slate-900">School Connection</h2>
        <p className="mt-1 text-sm text-slate-500">Sync your child's educational and health journey.</p>
      </div>
      <button className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
        <Link className="h-5 w-5" />
        Link School
      </button>
    </header>
  );
}
