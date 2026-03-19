"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChildProfile {
  registrationId: string;
  childName: string;
  childGender: string;
  dateOfBirth: string;
  ageGroup: string;
  ageInYears: number;
  motherName: string;
  fatherName?: string;
  phone: string;
  state: string;
  greenCohort: boolean;
  profilePictureUrl?: string;
}

export interface VaccineMilestone {
  _id: string;
  registrationId: string;
  title: string;
  description?: string;
  vaccineName?: string;
  category: string;
  status: "UPCOMING" | "DUE" | "COMPLETED" | "MISSED";
  dueDate: string;
  completedDate?: string;
  notes?: string;
}

export interface VaccinationTracker {
  total: number;
  completed: number;
  upcoming: number;
  missed: number;
  milestones: VaccineMilestone[];
}

interface UseChildDataResult {
  loading: boolean;
  error: string | null;
  profile: ChildProfile | null;
  vaccination: VaccinationTracker | null;
  milestones: VaccineMilestone[];
  registrationId: string | null;
  token: string | null;
}

export function useChildData(): UseChildDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [vaccination, setVaccination] = useState<VaccinationTracker | null>(null);
  const [milestones, setMilestones] = useState<VaccineMilestone[]>([]);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tok = typeof window !== "undefined" ? localStorage.getItem("wt18_token") : null;
    if (!tok) {
      if (typeof window !== "undefined") window.location.href = "/login";
      return;
    }
    setToken(tok);

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Get registration ID from URL parameter first, then fall back to family data
        let regId: string | null = null;
        
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          regId = params.get("id");
          
          // Log for debugging
          console.log("URL parameter ID:", regId);
        }

        // If no ID in URL, get from family data
        if (!regId) {
          console.log("No ID in URL, fetching from family data...");
          const familyRes = await fetch(`${API_BASE}/dashboard/family`, {
            headers: { Authorization: `Bearer ${tok}` },
            signal: controller.signal,
          });

          if (familyRes.status === 401) {
            localStorage.removeItem("wt18_token");
            localStorage.removeItem("wt18_user");
            window.location.href = "/login";
            return;
          }

          const familyJson = await familyRes.json().catch(() => ({}));
          const kids = familyJson.data?.children || familyJson.data || [];
          regId = kids[0]?.registrationId;
          console.log("Family data ID:", regId);
        }

        if (!regId) {
          console.error("No registration ID found!");
          setLoading(false);
          return;
        }
        
        console.log("Using registration ID:", regId);
        setRegistrationId(regId);

        // 2) Full child dashboard (profile + vaccination + milestones)
        const [childRes, vacRes, milRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/child/${encodeURIComponent(regId)}`, {
            headers: { Authorization: `Bearer ${tok}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/dashboard/vaccination/${encodeURIComponent(regId)}`, {
            headers: { Authorization: `Bearer ${tok}` },
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/dashboard/milestones/${encodeURIComponent(regId)}`, {
            headers: { Authorization: `Bearer ${tok}` },
            signal: controller.signal,
          }),
        ]);

        if (childRes.ok) {
          const childJson = await childRes.json();
          console.log("Child profile loaded:", childJson.data?.profile?.childName);
          setProfile(childJson.data?.profile || null);
        } else if (childRes.status === 404) {
          // Registration ID doesn't exist, fetch family data and use first child
          console.error("Registration not found, fetching family data...");
          
          const familyRes = await fetch(`${API_BASE}/dashboard/family`, {
            headers: { Authorization: `Bearer ${tok}` },
            signal: controller.signal,
          });

          if (familyRes.ok) {
            const familyJson = await familyRes.json().catch(() => ({}));
            const kids = familyJson.data?.children || familyJson.data || [];
            const fallbackId = kids[0]?.registrationId;
            
            if (fallbackId && typeof window !== "undefined") {
              console.log("Using fallback registration ID:", fallbackId);
              // Update URL to correct registration ID
              const newUrl = `${window.location.pathname}?id=${fallbackId}`;
              window.history.replaceState({}, '', newUrl);
              
              // Reload with correct ID
              window.location.reload();
              return;
            }
          }
          
          console.error("Failed to load child profile:", childRes.status);
        } else {
          console.error("Failed to load child profile:", childRes.status);
        }

        if (vacRes.ok) {
          const vacJson = await vacRes.json();
          setVaccination(vacJson.data || null);
        }

        if (milRes.ok) {
          const milJson = await milRes.json();
          setMilestones(Array.isArray(milJson.data) ? milJson.data : []);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error loading child data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []); // Empty dependency array - only runs once on mount

  return { loading, error, profile, vaccination, milestones, registrationId, token };
}
