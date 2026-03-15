"use client";

import { useState, useRef } from "react";
import { useChildData } from "@/hooks/useChildData";
import NotificationPreferences from "@/components/dashboard/settings/NotificationPreferences";
import LinkedAccounts from "@/components/dashboard/settings/LinkedAccounts";
import { User, Camera, CreditCard, Receipt, BadgeCheck, Loader2, Zap } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function SettingsPage() {
  const { loading, profile, registrationId, token } = useChildData();
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [activating, setActivating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  async function handleDownloadInvoice() {
    if (!registrationId) return;
    setDownloadingInvoice(true);
    try {
      const res = await fetch(`${API_BASE}/payments/${registrationId}/invoice`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WombTo18_Invoice_${registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not download invoice.");
    } finally {
      setDownloadingInvoice(false);
    }
  }

  async function handleActivateServices() {
    if (!registrationId || !profile?.dateOfBirth) return;
    setActivating(true);
    try {
      const res = await fetch(`${API_BASE}/dashboard/activate-services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId,
          dateOfBirth: profile.dateOfBirth,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      alert(
        `✅ Services activated!\n\n` +
        `• ${data.data.milestonesCreated} vaccination milestones created\n` +
        `• ${data.data.remindersScheduled} reminders scheduled\n\n` +
        `Check the Vaccination Tracker to see your schedule.`
      );
    } catch {
      alert("Could not activate services. Please try again.");
    } finally {
      setActivating(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !registrationId) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch(`${API_BASE}/dashboard/profile-picture/${registrationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      // Refresh the page to show new photo
      window.location.reload();
    } catch {
      alert("Could not upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  const dob = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const renewalDate = (() => {
    if (!registrationId) return "—";
    const parts = registrationId.split("-");
    const ds = parts[2];
    if (!ds || ds.length !== 8) return "—";
    const d = new Date(`${ds.slice(0, 4)}-${ds.slice(4, 6)}-${ds.slice(6, 8)}`);
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  })();

  return (
    <div className="mx-auto w-[80%] max-w-8xl space-y-10 pb-12">
      <h1 className="mb-2 text-3xl font-medium tracking-tight text-slate-900">Settings</h1>

      {/* Activate Services Banner */}
      <section className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Activate All Services</h3>
              <p className="mt-1 text-sm text-slate-600">
                One-click setup: vaccination tracker + automated reminders (SMS & WhatsApp)
              </p>
            </div>
          </div>
          <button
            onClick={handleActivateServices}
            disabled={activating || !registrationId || !profile?.dateOfBirth}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {activating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Activate Now
              </>
            )}
          </button>
        </div>
      </section>

      {/* Profile Settings */}
      <section>
        <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
          <User className="h-6 w-6 text-primary" />
          Profile Settings
        </h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading profile...
            </div>
          ) : (
            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="relative shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-primary/10">
                  {profile?.profilePictureUrl ? (
                    <img src={profile.profilePictureUrl} alt="Child" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-primary/40" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="profile-picture-input"
                />
                <label
                  htmlFor="profile-picture-input"
                  className={`absolute -bottom-3 -right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform hover:scale-105 ${uploadingPhoto ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </label>
              </div>
              <div className="grid flex-1 grid-cols-1 gap-y-6 sm:grid-cols-2 md:gap-x-12 md:gap-y-8">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Child&apos;s Name</label>
                  <p className="font-medium text-slate-900">{profile?.childName || "—"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Date of Birth</label>
                  <p className="font-medium text-slate-900">{dob}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Mother&apos;s Name</label>
                  <p className="font-medium text-slate-900">{profile?.motherName || "—"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">State</label>
                  <p className="font-medium text-slate-900">{profile?.state || "—"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Contact</label>
                  <p className="font-medium text-slate-900">{profile?.phone || "—"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Registration ID</label>
                  <p className="font-mono text-sm font-medium text-slate-900">{registrationId || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <NotificationPreferences />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <LinkedAccounts />

        {/* Subscription Card */}
        <section>
          <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
            <CreditCard className="h-6 w-6 text-primary" />
            Subscription
          </h3>
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white shadow-lg shadow-primary/20">
            <div className="relative z-10">
              <p className="text-sm font-semibold text-white/90">WombTo18 Annual Plan</p>
              <p className="mt-1 text-3xl font-bold">₹960 + GST</p>
              <p className="mt-6 text-xs font-medium text-white/90">
                Renews on {renewalDate}
              </p>
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice || !registrationId}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-60"
              >
                <Receipt className="h-4 w-4" />
                {downloadingInvoice ? "Downloading..." : "Download Invoice"}
              </button>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-10 mix-blend-overlay">
              <BadgeCheck className="h-40 w-40" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
