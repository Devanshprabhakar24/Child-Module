import { Plus } from "lucide-react";

export default function VaccinationHeader() {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h2 className="text-3xl font-medium tracking-tight text-slate-900">Vaccination Tracker</h2>
        <p className="mt-1 text-sm text-slate-500">Manage and track your child's immunization schedule</p>
      </div>
      <button className="flex items-center justify-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300">
        <Plus className="h-4 w-4" />
        Add Vaccine
      </button>
    </header>
  );
}
