"use client";

import { Building2, FileText, Bell, Contact, Image, HelpCircle, Headphones, ChevronRight } from "lucide-react";

export default function LinkedSchoolProfile() {
  const isConnected = false; // Change to true when school is connected

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-6">
        {/* No School Connected Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
              <Building2 className="h-10 w-10 text-slate-400" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">No School Connected</h3>
          <p className="mb-6 text-sm text-slate-500">
            Connect your school to access health records, notifications, and emergency features
          </p>

          {/* Benefits of Connecting */}
          <div className="mb-6 space-y-3 text-left">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Benefits of Connecting</h4>
            
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Health Records</p>
                <p className="text-xs text-slate-500">View school health checkup history</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Smart Notifications</p>
                <p className="text-xs text-slate-500">Get alerts for upcoming checkups</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-100">
                <Contact className="h-4 w-4 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Emergency Access</p>
                <p className="text-xs text-slate-500">Quick emergency contact to school</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Image className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Class Memories</p>
                <p className="text-xs text-slate-500">Access class photos and events</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Links</h3>
          <div className="space-y-2">
            <button className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-900">Health Card Guidelines</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-900">FAQs</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            <button className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <Headphones className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-900">Contact Support</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected state (existing code)
  return (
    <div className="flex flex-col gap-6">
      {/* Connected School Profile - Keep existing implementation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Delhi Public School</h3>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Connected
          </span>
        </div>
        <p className="text-sm text-slate-500">Sector 12, RK Puram, New Delhi</p>
      </div>
    </div>
  );
}
