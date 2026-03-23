"use client";

import { useEffect, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface RegistrationData {
  email: string;
  phone: string;
  paymentStatus: string;
  goGreenCertSent: boolean;
}

export default function SuccessTimeline() {
  const [data, setData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    const regId = sessionStorage.getItem("wt18_reg_id");
    if (!regId) return;

    fetch(`${API_BASE}/registration/${encodeURIComponent(regId)}`)
      .then((r) => r.json())
      .then((json) => {
        const d = json.data || json;
        setData({
          email: d.email ?? "—",
          phone: d.phone ?? "—",
          paymentStatus: d.paymentStatus ?? "PENDING",
          goGreenCertSent: d.goGreenCertSent ?? false,
        });
      })
      .catch(() => {/* silently ignore — UI degrades gracefully */});
  }, []);

  const paid = data?.paymentStatus === "COMPLETED";

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 px-2 text-xl font-medium text-slate-900">
        <span className="material-symbols-outlined text-primary">timeline</span>
        What happens next
      </h2>

      {/* Timeline */}
      <div className="relative space-y-8 px-4">
        <div className="absolute bottom-4 left-[34px] top-4 w-0.5 bg-slate-200"></div>

        {/* Step 1 — always done */}
        <div className="relative flex items-center gap-6">
          <div className="z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white ring-4 ring-background-light">
            <span className="material-symbols-outlined text-xl">check</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-slate-900">Payment confirmed</h4>
            <p className="text-sm text-slate-500">Instant confirmation received</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative flex items-center gap-6">
          <div className={`z-10 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-background-light ${paid ? "bg-primary text-white" : "border-2 border-primary bg-white text-primary"}`}>
            {paid ? <span className="material-symbols-outlined text-xl">check</span> : <span className="text-sm font-bold">2</span>}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-slate-900">Welcome message sent</h4>
            <p className="text-sm text-slate-500">{paid ? `Sent to ${data?.email}` : "Checking communication channels..."}</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative flex items-center gap-6">
          <div className={`z-10 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-background-light ${data?.goGreenCertSent ? "bg-primary text-white" : "border-2 border-slate-200 bg-white text-slate-400"}`}>
            {data?.goGreenCertSent ? <span className="material-symbols-outlined text-xl">check</span> : <span className="text-sm font-bold">3</span>}
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${data?.goGreenCertSent ? "text-slate-900" : "text-slate-400"}`}>Go Green certificate generated</h4>
            <p className={`text-sm ${data?.goGreenCertSent ? "text-slate-500" : "italic text-slate-400"}`}>
              {data?.goGreenCertSent ? "Certificate sent to your email & WhatsApp" : "Processing digital certificate"}
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="relative flex items-center gap-6">
          <div className={`z-10 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-background-light ${paid ? "bg-primary text-white" : "border-2 border-slate-200 bg-white text-slate-400"}`}>
            {paid ? <span className="material-symbols-outlined text-xl">check</span> : <span className="text-sm font-bold">4</span>}
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${paid ? "text-slate-900" : "text-slate-400"}`}>Dashboard access activated</h4>
            <p className={`text-sm ${paid ? "text-slate-500" : "italic text-slate-400"}`}>
              {paid ? "Your dashboard is ready" : "Provisioning your personal space"}
            </p>
          </div>
        </div>
      </div>

      {/* Communication Status Cards */}
      <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-500 shadow-sm">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold uppercase text-slate-400">Email sent to</p>
              <p className="truncate text-sm font-medium text-slate-700">
                {data?.email ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-y border-primary/10 py-4 md:border-x md:border-y-0 md:px-4 md:py-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-green-500 shadow-sm">
              <span className="material-symbols-outlined">chat_bubble</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold uppercase text-slate-400">WhatsApp</p>
              <p className="truncate text-sm font-medium text-slate-700">
                {data?.phone ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
              <span className="material-symbols-outlined">sms</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold uppercase text-slate-400">SMS</p>
              <p className="truncate text-sm font-medium text-slate-700">
                {data?.phone ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
