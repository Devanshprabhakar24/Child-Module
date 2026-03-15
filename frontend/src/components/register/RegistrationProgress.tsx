import { Fingerprint } from "lucide-react";

interface RegistrationProgressProps {
  title: string;
  subtitle?: string;
  overline?: string;
  step: number;
  totalSteps: number;
  registrationId?: string;
}

export default function RegistrationProgress({
  title,
  subtitle,
  step,
  totalSteps,
  registrationId
}: RegistrationProgressProps) {

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">Step {step} of {totalSteps}</p>
            <h1 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{progressPercentage}%</p>
          </div>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {registrationId && (
          <div className="mt-1 flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-slate-400" />
            <p className="font-mono text-xs uppercase tracking-tight text-slate-400">
              Registration ID: <span className="text-slate-600">{registrationId}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}