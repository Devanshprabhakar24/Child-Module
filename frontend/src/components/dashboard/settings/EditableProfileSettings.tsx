"use client";

import { useState } from "react";
import { User, Edit2, Save, X, Loader2 } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface ProfileData {
  childName: string;
  motherName: string;
  fatherName?: string;
  address?: string | {
    houseNo: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pinCode: string;
    addressType: 'HOME' | 'WORK' | 'OTHER';
  };
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  dateOfBirth: string;
  state: string;
  phone: string;
  registrationId: string;
}

interface EditableProfileSettingsProps {
  profile: ProfileData;
  token: string;
  onUpdate: () => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditableProfileSettings({ profile, token, onUpdate }: EditableProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Format address object to string for display
  const formatAddress = (addr: any): string => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    
    // If it's an object, format it nicely
    const parts = [
      addr.houseNo,
      addr.street,
      addr.landmark,
      addr.city,
      addr.state,
      addr.pinCode
    ].filter(Boolean);
    
    return parts.join(', ');
  };
  
  const [formData, setFormData] = useState({
    childName: profile.childName || '',
    motherName: profile.motherName || '',
    fatherName: profile.fatherName || '',
    address: formatAddress(profile.address),
    bloodGroup: profile.bloodGroup || '',
    heightCm: profile.heightCm || '',
    weightKg: profile.weightKg || '',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      childName: profile.childName || '',
      motherName: profile.motherName || '',
      fatherName: profile.fatherName || '',
      address: formatAddress(profile.address),
      bloodGroup: profile.bloodGroup || '',
      heightCm: profile.heightCm || '',
      weightKg: profile.weightKg || '',
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        childName: formData.childName,
        motherName: formData.motherName,
        fatherName: formData.fatherName || undefined,
        address: formData.address || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        heightCm: formData.heightCm ? Number(formData.heightCm) : undefined,
        weightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
      };

      console.log('🔄 Updating profile:', profile.registrationId);
      console.log('📤 Update data:', updateData);

      const res = await fetch(`${API_BASE}/registration/${profile.registrationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log('📥 Response status:', res.status);
      
      if (!res.ok) {
        const error = await res.json();
        console.error('❌ Error response:', error);
        throw new Error(error.message || 'Failed to update profile');
      }

      const result = await res.json();
      console.log('✅ Success response:', result);

      alert('✅ Profile updated successfully!');
      setIsEditing(false);
      
      // Force page reload to show updated data
      window.location.reload();
    } catch (error: any) {
      console.error('❌ Update error:', error);
      alert(`Could not update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const dob = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-lg font-medium text-slate-900">
          <User className="h-6 w-6 text-primary" />
          Profile Information
        </h3>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-x-12 md:gap-y-8">
        {/* Child's Name */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Child&apos;s Name <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.childName}
              onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          ) : (
            <p className="font-medium text-slate-900">{profile.childName || "—"}</p>
          )}
        </div>

        {/* Date of Birth (Read-only) */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Date of Birth</label>
          <p className="font-medium text-slate-900">{dob}</p>
        </div>

        {/* Mother's Name */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Mother&apos;s Name <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          ) : (
            <p className="font-medium text-slate-900">{profile.motherName || "—"}</p>
          )}
        </div>

        {/* Father's Name */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Father&apos;s Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Optional"
            />
          ) : (
            <p className="font-medium text-slate-900">{profile.fatherName || "—"}</p>
          )}
        </div>

        {/* Blood Group */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Blood Group</label>
          {isEditing ? (
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Blood Group</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          ) : (
            <p className="font-medium text-slate-900">{profile.bloodGroup || "—"}</p>
          )}
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Height (cm)</label>
          {isEditing ? (
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: e.target.value as any })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g., 85.5"
            />
          ) : (
            <p className="font-medium text-slate-900">{profile.heightCm ? `${profile.heightCm} cm` : "—"}</p>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Weight (kg)</label>
          {isEditing ? (
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: e.target.value as any })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g., 12.5"
            />
          ) : (
            <p className="font-medium text-slate-900">{profile.weightKg ? `${profile.weightKg} kg` : "—"}</p>
          )}
        </div>

        {/* State (Read-only) */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">State</label>
          <p className="font-medium text-slate-900">{profile.state || "—"}</p>
        </div>

        {/* Contact (Read-only) */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Contact</label>
          <p className="font-medium text-slate-900">{profile.phone || "—"}</p>
        </div>

        {/* Registration ID (Read-only) */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Registration ID</label>
          <p className="font-mono text-sm font-medium text-slate-900">{profile.registrationId || "—"}</p>
        </div>

        {/* Address - Full width */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Address</label>
          {isEditing ? (
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Enter full address"
            />
          ) : (
            <p className="font-medium text-slate-900">{formatAddress(profile.address) || "—"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
