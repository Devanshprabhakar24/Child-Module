import {
  Bell,
  Stethoscope,
  MessageCircle,
  Send,
  Mail,
  ArrowRight,
} from "lucide-react";
import type { DashboardMilestone } from "@/hooks/useDashboardData";

interface RemindersSectionProps {
  milestones?: DashboardMilestone[];
}

export default function RemindersSection({ milestones = [] }: RemindersSectionProps) {
  const upcoming = milestones
    .filter((m) => ["UPCOMING", "DUE"].includes(m.status))
    .slice(0, 3);

  const reminders =
    upcoming.length > 0
      ? upcoming.map((m) => ({
          title: m.vaccineName || m.title,
          time: new Date(m.dueDate).toLocaleDateString("en-IN"),
        }))
      : [
          {
            title: "No upcoming reminders",
            time: "You are up to date on this child's schedule.",
          },
        ];

  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-medium">
          <Bell className="h-5 w-5 text-slate-400" />
          Upcoming Reminders
        </h3>
        <div className="space-y-4">
          {reminders.map((rem, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-transparent p-3 transition-colors hover:border-slate-100 hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{rem.title}</p>
                  <p className="text-xs text-slate-500">{rem.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                  <Send className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900 p-8 text-center">
        <h3 className="mb-4 text-xl font-medium text-white">Want a deeper look?</h3>
        <p className="mb-8 max-w-sm font-light text-slate-400">Access comprehensive health trends, school reports, and environmental impact badges for Aarav.</p>
        <button className="flex w-[50%] transform items-center justify-center gap-3 rounded-full bg-primary py-4 font-normal text-white transition-all hover:scale-[1.02] hover:bg-primary/90">
          <span>View Full Dashboard</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
