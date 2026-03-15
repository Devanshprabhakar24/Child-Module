"use client";

import { useState } from "react";
import { useChildData } from "@/hooks/useChildData";
import GreenHeader from "@/components/dashboard/green/GreenHeader";
import GrowthTimeline from "@/components/dashboard/green/GrowthTimeline";
import ShareWidget from "@/components/dashboard/green/ShareWidget";
import PhotoUpdatePlaceholder from "@/components/dashboard/green/PhotoUpdatePlaceholder";
import { Award, QrCode, Star, Map, BadgeCheck, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function GoGreenPage() {
  const { loading, error, profile, registrationId, token } = useChildData();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadCert() {
    if (!registrationId) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/registration/${registrationId}/certificate`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WombTo18_GoGreen_${registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not download certificate.");
    } finally {
      setDownloading(false);
    }
  }

  const childName = profile?.childName || "—";
  const state = profile?.state || "—";
  const regId = registrationId || "—";
  // Derive planted date from registrationId date segment: CHD-KA-20260310-000001
  const plantedDate = (() => {
    if (!registrationId) return "—";
    const parts = registrationId.split("-");
    const ds = parts[2];
    if (!ds || ds.length !== 8) return "—";
    const d = new Date(`${ds.slice(0, 4)}-${ds.slice(4, 6)}-${ds.slice(6, 8)}`);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  })();

  return (
    <div className="mx-auto w-full max-w-8xl">
      <GreenHeader />

      {/* Impact Stats */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-3xl font-bold text-primary">1</span>
          <span className="text-sm font-medium text-slate-600">Tree Planted</span>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-1/3 rounded-full bg-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-3xl font-bold text-primary">50 kg</span>
          <span className="text-sm font-medium text-slate-600">CO₂ Offset (est.)</span>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-1/2 rounded-full bg-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-3xl font-bold text-primary">1000 L</span>
          <span className="text-sm font-medium text-slate-600">Water Saved (est.)</span>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
        </div>
      )}

      {!loading && (
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Tree Details */}
          <div className="flex flex-col gap-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div
                className="h-56 w-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625758476104-f2ed6c81248f?q=80&w=1770&auto=format&fit=crop')" }}
              />
              <div className="p-6 sm:p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-slate-900">Tree Planted for {childName}</h3>
                    <p className="mt-1 text-sm font-normal text-primary">Reg ID: {regId}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
                    Active
                  </div>
                </div>
                <div className="mb-8 grid grid-cols-2 gap-y-6 text-sm">
                  <div className="flex flex-col">
                    <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Species</span>
                    <span className="text-slate-900">Neem (Azadirachta indica)</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">State</span>
                    <span className="text-slate-900">{state}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Planted Date</span>
                    <span className="text-slate-900">{plantedDate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Guardian</span>
                    <span className="text-slate-900">WombTo18 Team</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                    <Map className="h-4 w-4" /> View on Map
                  </button>
                  <button
                    onClick={handleDownloadCert}
                    disabled={downloading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {downloading ? "Downloading..." : "Download Cert"}
                  </button>
                </div>
              </div>
            </div>
            <GrowthTimeline plantedDate={plantedDate} />
          </div>

          {/* Right: Certificate + Share */}
          <div className="flex flex-col gap-8">
            {/* Certificate Card */}
            <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 sm:p-8">
              <div className="relative w-full overflow-hidden rounded-xl border-4 border-white bg-white p-8 text-center shadow-lg">
                <div className="absolute -right-8 -top-8 text-primary opacity-5">
                  <Award className="h-40 w-40" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                    <Award className="h-6 w-6" />
                  </div>
                  <h4 className="mb-2 text-xl font-medium italic text-slate-900">Certificate of Planting</h4>
                  <p className="mb-6 max-w-xs text-xs font-normal text-slate-500">
                    This certifies that a tree has been planted in the honor of
                  </p>
                  <h5 className="mb-8 text-3xl font-semibold text-primary">{childName}</h5>
                  <div className="flex w-full items-end justify-between border-t border-slate-100 pt-6 text-left">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-widest text-slate-400">WombTo18 Go Green</p>
                      <p className="text-xs font-medium text-slate-900">Green Cohort Member</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 p-1">
                      <QrCode className="h-8 w-8 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-white shadow-lg shadow-primary/20">
                <Star className="h-5 w-5" />
                <span className="text-sm font-medium tracking-tight">Proud Member of Green Cohort</span>
              </div>
            </div>
            <ShareWidget />
          </div>
        </div>
      )}

      <PhotoUpdatePlaceholder />
    </div>
  );
}
