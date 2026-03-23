import { Camera, Cake, User, Copy, Lightbulb } from "lucide-react";
import type { DashboardChild } from "@/hooks/useDashboardData";
import { formatAge, getAgeCategory } from "@/utils/ageCalculator";

interface ProfileSectionProps {
  child?: DashboardChild;
}

export default function ProfileSection({ child }: ProfileSectionProps) {
  const name = child?.childName || "Child Name";
  const isGreen = true; // In this MVP, all registered children are in Green Cohort
  const ageLabel = child?.dateOfBirth ? formatAge(child.dateOfBirth) : "—";
  const ageCategory = child?.dateOfBirth ? getAgeCategory(child.dateOfBirth) : "";
  const gender = child?.childGender || "—";
  const registrationId = child?.registrationId || "Registration ID";

  const avatarUrl =
    child?.profilePictureUrl ||
    "https://images.unsplash.com/photo-1554622965-bfaeff35e57f?q=80&w=800&auto=format&fit=crop";

  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="rounded-2xl border border-primary/10 bg-white p-8 shadow-sm lg:col-span-2">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="group relative">
            <div
              className="h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20 bg-cover bg-center"
              style={{ backgroundImage: `url('${avatarUrl}')` }}
            />
            <button className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-md">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col justify-center gap-3 md:flex-row md:items-center md:justify-start">
              <h3 className="text-2xl font-medium">{name}</h3>
              {isGreen && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Green Cohort Member 🌱
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Cake className="h-4 w-4" />
                <span className="font-medium">{ageLabel}</span>
                {ageCategory && (
                  <span className="ml-1 text-xs text-slate-400">({ageCategory})</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 border-l border-slate-200 px-4 text-slate-600">
                <User className="h-4 w-4" />
                <span>{gender}</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
              <code className="font-mono text-sm text-slate-500">{registrationId}</code>
              <button
                className="p-1 transition-colors hover:text-primary"
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(registrationId).catch(() => {});
                  }
                }}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-white shadow-lg">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <Lightbulb className="h-8 w-8" />
        </div>
        <h4 className="mb-2 text-xl font-medium">Today&apos;s Health Tip</h4>
        <p className="font-light leading-relaxed text-white/90">
          &quot;Ensure your child stays hydrated during playtime. Small sips of water every
          30 minutes help maintain energy levels.&quot;
        </p>
      </div>
    </section>
  );
}