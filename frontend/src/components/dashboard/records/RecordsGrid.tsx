import { FileText, Upload } from "lucide-react";

export default function RecordsGrid() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <FileText className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-2 font-medium text-slate-900">No Health Records Yet</h3>
      <p className="mb-6 text-sm text-slate-500">
        Upload prescriptions, lab reports, dental exams, and other health documents here.
      </p>
      <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
        <Upload className="h-4 w-4" />
        Upload Record
      </button>
    </div>
  );
}
