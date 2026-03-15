import { FileText, Share2, Bell, Mail, MessageCircle, Send } from "lucide-react";

export default function VaccinationSidePanel() {
  return (
    <aside className="flex w-full flex-col gap-8 lg:w-80 lg:shrink-0 lg:border-l lg:border-slate-200 lg:pl-8">

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">Quick Actions</h3>
        <div className="grid gap-3">
          <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-normal text-slate-700">Download Card (PDF)</span>
          </button>
          <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50">
            <Share2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-normal text-slate-700">Share with Doctor</span>
          </button>
          <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50">
            <Bell className="h-5 w-5 text-primary" />
            <span className="text-sm font-normal text-slate-700">Reminder Settings</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">Notifications</h3>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="mb-3 text-xs font-medium text-primary">Enabled Channels</p>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-normal text-slate-700">Email</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-normal text-slate-700">WhatsApp</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 opacity-40">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <Send className="h-5 w-5 text-slate-400" />
              </div>
              <span className="text-[10px] font-normal text-slate-700">SMS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Box */}
      <div className="mt-auto pt-4 lg:pt-0">
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
          <div className="relative z-10">
            <h4 className="mb-1 text-sm font-medium">Need Help?</h4>
            <p className="mb-5 text-xs leading-relaxed text-slate-400">Chat with our pediatric consultants regarding the schedule.</p>
            <button className="w-full rounded-xl bg-primary py-3 text-sm font-normal text-white transition-all hover:brightness-110">Consult Now</button>
          </div>
          <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-primary/20 blur-2xl transition-all group-hover:bg-primary/30"></div>
        </div>
      </div>

    </aside>
  );
}
