import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface VaccinationHeaderProps {
  completed?: number;
  due?: number;
  upcoming?: number;
  missed?: number;
}

export default function VaccinationHeader({ 
  completed = 0, 
  due = 0, 
  upcoming = 0,
  missed = 0 
}: VaccinationHeaderProps) {
  const pending = due + upcoming + missed;
  
  return (
    <header className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-medium tracking-tight text-slate-900">Vaccination Tracker</h2>
        <p className="mt-1 text-sm text-slate-500">Manage and track your child's immunization schedule</p>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Completed */}
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-500 shadow-md">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-700">{completed}</p>
          </div>
        </div>
        
        {/* Pending */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500 shadow-md">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Pending</p>
            <p className="text-2xl font-bold text-amber-700">{pending}</p>
          </div>
        </div>
        
        {/* Missed */}
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500 shadow-md">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-red-600">Missed</p>
            <p className="text-2xl font-bold text-red-700">{missed}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
