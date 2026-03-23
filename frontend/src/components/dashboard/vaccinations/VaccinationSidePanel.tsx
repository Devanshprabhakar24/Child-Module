"use client";

import { useState } from "react";
import { FileText, Share2, Bell, Mail, MessageCircle, Send, Loader2, X } from "lucide-react";
import { useChildData } from "@/hooks/useChildData";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function VaccinationSidePanel() {
  const { registrationId, token } = useChildData();
  const [downloading, setDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [reminderChannels, setReminderChannels] = useState({
    email: true,
    whatsapp: true,
    sms: false,
  });

  const handleDownloadCard = async () => {
    if (!registrationId || !token) {
      alert("Please log in to download vaccination card");
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE}/dashboard/vaccination-card/${registrationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download vaccination card");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Vaccination_Card_${registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Could not download vaccination card. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWithDoctor = async () => {
    if (!doctorEmail.trim()) {
      alert("Please enter doctor's email address");
      return;
    }

    if (!registrationId || !token) {
      alert("Please log in to share vaccination card");
      return;
    }

    setSharing(true);
    try {
      const response = await fetch(`${API_BASE}/dashboard/share-vaccination-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId,
          doctorEmail: doctorEmail.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share vaccination card");
      }

      alert("Vaccination card shared successfully!");
      setShowShareModal(false);
      setDoctorEmail("");
    } catch (error) {
      console.error("Share error:", error);
      alert("Could not share vaccination card. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const handleUpdateReminders = async () => {
    if (!registrationId || !token) {
      alert("Please log in to update reminder settings");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/dashboard/update-reminder-settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId,
          channels: reminderChannels,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminder settings");
      }

      alert("Reminder settings updated successfully!");
      setShowReminderModal(false);
    } catch (error) {
      console.error("Update error:", error);
      alert("Could not update reminder settings. Please try again.");
    }
  };

  return (
    <>
      <aside className="flex w-full flex-col gap-8 lg:w-80 lg:shrink-0 lg:border-l lg:border-slate-200 lg:pl-8">

        {/* Quick Actions */}
        <div>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-400">Quick Actions</h3>
          <div className="grid gap-3">
            <button 
              onClick={handleDownloadCard}
              disabled={downloading}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              <span className="text-sm font-normal text-slate-700">
                {downloading ? "Generating PDF..." : "Download Card (PDF)"}
              </span>
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50"
            >
              <Share2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-normal text-slate-700">Share with Doctor</span>
            </button>
            <button 
              onClick={() => setShowReminderModal(true)}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50"
            >
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

      {/* Share with Doctor Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">Share with Doctor</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Enter your doctor's email address to share the vaccination card PDF.
            </p>
            <input
              type="email"
              value={doctorEmail}
              onChange={(e) => setDoctorEmail(e.target.value)}
              placeholder="doctor@example.com"
              className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleShareWithDoctor}
                disabled={sharing}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sharing ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Settings Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">Reminder Settings</h3>
              <button
                onClick={() => setShowReminderModal(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Choose how you want to receive vaccination reminders.
            </p>
            <div className="mb-6 space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reminderChannels.email}
                  onChange={(e) => setReminderChannels({ ...reminderChannels, email: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-slate-700">Email</span>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reminderChannels.whatsapp}
                  onChange={(e) => setReminderChannels({ ...reminderChannels, whatsapp: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                </div>
              </label>
              <label className="flex items-center gap-3 opacity-50">
                <input
                  type="checkbox"
                  checked={reminderChannels.sms}
                  disabled
                  className="h-5 w-5 rounded border-slate-300 text-slate-400"
                />
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">SMS (Coming Soon)</span>
                </div>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateReminders}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-110"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
