"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useChildData } from "@/hooks/useChildData";
import NotificationPreferences from "@/components/dashboard/settings/NotificationPreferences";
import LinkedAccounts from "@/components/dashboard/settings/LinkedAccounts";
import SubscriptionCard from "@/components/dashboard/settings/SubscriptionCard";
import EditableProfileSettings from "@/components/dashboard/settings/EditableProfileSettings";
import { User, Camera, Loader2, Zap, CheckCircle, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Prevent prerendering
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "true";
  
  const { loading, profile, registrationId, token, refetch } = useChildData();
  const [activating, setActivating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(upgraded);

  useEffect(() => {
    if (upgraded) {
      // Auto-hide success message after 10 seconds
      const timer = setTimeout(() => {
        setShowUpgradeSuccess(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [upgraded]);

  const handleProfileUpdate = () => {
    refetch();
  };

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
      console.log('Uploading photo for registration:', registrationId);
      console.log('File:', file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch(`${API_BASE}/dashboard/profile-picture/${registrationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', res.status);
      const data = await res.json();
      console.log('Upload response data:', data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload");
      }

      alert("✅ Profile picture updated successfully!");
      // Refresh the page to show new photo
      window.location.reload();
    } catch (error: any) {
      console.error('Photo upload error:', error);
      alert(`Could not upload photo: ${error.message || "Please try again"}`);
    } finally {
      setUploadingPhoto(false);
    }
  }

  const dob = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="mx-auto w-[80%] max-w-8xl space-y-10 pb-12">
      <h1 className="mb-2 text-3xl font-medium tracking-tight text-slate-900">Settings</h1>

      {/* Upgrade Success Banner */}
      {showUpgradeSuccess && (
        <div className="overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Upgrade Successful! 🎉</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Your subscription has been upgraded to the 5-Year Plan. You now have access to all features for the next 5 years!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeSuccess(false)}
              className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

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
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading profile...
          </div>
        ) : profile && token ? (
          <>
            {/* Profile Picture Upload */}
            <div className="mb-6 flex items-center gap-6">
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
              <div>
                <h3 className="text-lg font-medium text-slate-900">{profile.childName}</h3>
                <p className="text-sm text-slate-600">Update your profile picture</p>
              </div>
            </div>

            {/* Editable Profile Form */}
            <EditableProfileSettings 
              profile={{
                childName: profile.childName,
                motherName: profile.motherName,
                fatherName: profile.fatherName,
                address: profile.address,
                bloodGroup: profile.bloodGroup,
                heightCm: profile.heightCm,
                weightKg: profile.weightKg,
                dateOfBirth: profile.dateOfBirth,
                state: profile.state,
                phone: profile.phone,
                registrationId: registrationId || '',
              }}
              token={token}
              onUpdate={handleProfileUpdate}
            />
          </>
        ) : null}
      </section>

      <NotificationPreferences />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <LinkedAccounts />
        <SubscriptionCard />
      </div>
    </div>
  );
}
