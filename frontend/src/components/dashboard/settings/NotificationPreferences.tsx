"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationPreferences() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [ivrEnabled, setIvrEnabled] = useState(false);
  const [activeTiming, setActiveTiming] = useState("on_due");

  return (
    <section>
      <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
        <Bell className="h-6 w-6 text-primary" />
        Notification Preferences
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">

          {/* Toggle 1 */}
          <div className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50">
            <div>
              <p className="font-medium text-slate-900">SMS Alerts</p>
              <p className="text-sm text-slate-500">Critical health & vaccine updates</p>
            </div>
            <button
              onClick={() => setSmsEnabled(!smsEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${smsEnabled ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${smsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50">
            <div>
              <p className="font-medium text-slate-900">WhatsApp Updates</p>
              <p className="text-sm text-slate-500">Weekly development tips & reports</p>
            </div>
            <button
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${whatsappEnabled ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${whatsappEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50">
            <div>
              <p className="font-medium text-slate-900">IVR Calls</p>
              <p className="text-sm text-slate-500">Emergency & appointment reminders</p>
            </div>
            <button
              onClick={() => setIvrEnabled(!ivrEnabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${ivrEnabled ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ivrEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Reminder Timing Options */}
          <div className="p-6">
            <label className="mb-4 block text-sm font-medium text-slate-900">Reminder Timing</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTiming("before")}
                className={`rounded-lg px-5 py-2.5 text-sm font-normal transition-all ${activeTiming === "before" ? "bg-primary text-white shadow-md shadow-primary/20" : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"}`}
              >
                2 Days Before (D-2)
              </button>
              <button
                onClick={() => setActiveTiming("on_due")}
                className={`rounded-lg px-5 py-2.5 text-sm font-normal transition-all ${activeTiming === "on_due" ? "bg-primary text-white shadow-md shadow-primary/20" : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"}`}
              >
                On Due Date (D)
              </button>
              <button
                onClick={() => setActiveTiming("after")}
                className={`rounded-lg px-5 py-2.5 text-sm font-normal transition-all ${activeTiming === "after" ? "bg-primary text-white shadow-md shadow-primary/20" : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"}`}
              >
                2 Days After (D+2)
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
