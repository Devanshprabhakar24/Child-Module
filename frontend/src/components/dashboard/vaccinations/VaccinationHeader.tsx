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
  missed = 0,
}: VaccinationHeaderProps) {
  const pending = due + upcoming + missed;

  const stats = [
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      accent: "bg-emerald-500",
      iconColor: "text-emerald-500",
      valuColor: "text-emerald-600",
      bg: "bg-white",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      accent: "bg-amber-400",
      iconColor: "text-amber-400",
      valuColor: "text-amber-500",
      bg: "bg-white",
    },
    {
      label: "Missed",
      value: missed,
      icon: AlertTriangle,
      accent: "bg-red-400",
      iconColor: "text-red-400",
      valuColor: "text-red-500",
      bg: "bg-white",
    },
  ];

  return (
    <header className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-medium tracking-tight text-slate-900">Vaccination Tracker</h2>
        <p className="mt-1 text-sm text-slate-500">Manage and track your child's immunization schedule</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`relative flex items-center gap-5 overflow-hidden rounded-2xl border border-slate-100 ${s.bg} px-6 py-5 shadow-sm`}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${s.accent}`} />

              {/* Icon */}
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 ${s.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Text */}
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className={`mt-0.5 text-4xl font-bold leading-none ${s.valuColor}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
}
