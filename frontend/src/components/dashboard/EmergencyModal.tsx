"use client";

import { useEffect, useState } from "react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const [childName, setChildName] = useState("—");
  const [phone, setPhone] = useState("—");

  useEffect(() => {
    // Only access storage on the client side
    if (typeof window !== 'undefined') {
      try {
        const name = sessionStorage.getItem("wt18_child_name");
        if (name) setChildName(name);
        const raw = localStorage.getItem("wt18_user");
        if (raw) {
          const u = JSON.parse(raw);
          if (u.phone) setPhone(u.phone);
        }
      } catch {}
    }
  }, [isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border-2 border-red-500/20 bg-background-light shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="border-b border-slate-100 bg-white p-6 text-center">
          <h1 className="text-2xl font-medium text-slate-900">Emergency Health Connect</h1>
          <p className="mt-1 text-sm text-slate-500">WombTo18 Priority Assistance</p>
        </header>

        {/* Scrollable Content */}
        <div className="max-h-[65vh] space-y-6 overflow-y-auto p-6">

          {/* School Health */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              <h2 className="text-xs font-medium uppercase tracking-wider text-slate-800">School Health Contact</h2>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-lg font-medium text-slate-900">Dr. Sharma</p>
                  <p className="text-sm text-slate-500">Health Ambassador, Delhi Public School</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-normal text-white transition-colors hover:bg-primary/90">
                  <span className="material-symbols-outlined text-lg">call</span>
                  Call
                </button>
                <button className="flex items-center justify-center gap-2 rounded-full bg-slate-100 py-3 font-normal text-slate-700 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined text-lg">chat</span>
                  WhatsApp
                </button>
              </div>
            </div>
          </section>

          {/* Nearest Hospital */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">local_hospital</span>
              <h2 className="text-xs font-medium uppercase tracking-wider text-slate-800">Nearest Hospital</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <div
                className="relative h-32 w-full bg-slate-200 bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNf49twK3mz3H0ta73e-aHmVr3vb7SHkD37b0PP6R-hB2XCu0RUgIE40en2CpHY65YHw7DswVZtceYN08JqN61s4VDrVvxVvTEckcoQkYw6jT_3748jkbXJ2d8fEwebN7ubX5jNRbU-MuDEaxX2-BKgDZSoDtC8cj95dDi00l467ioOd2OE-voWcQ6zJ7N7T0kCJvdk8uoqbV5cGhKC6qI8o_cYSk9gHja3KzldmnQITydY4IiBfQxTclji8vjEpAOCiklr_eCpKbi')" }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="animate-pulse rounded-full bg-red-500 p-1 shadow-lg">
                    <span className="material-symbols-outlined text-xl text-white">location_on</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-normal text-slate-900">Apollo Clinic</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">1.2 km away</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                      <span className="font-normal italic text-primary">Open 24/7</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-full bg-red-500 py-3 font-normal text-white transition-colors hover:bg-red-600">
                    <span className="material-symbols-outlined text-lg">call</span>
                    Call
                  </button>
                  <a
                    href="https://www.google.com/maps/search/hospitals+near+me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-slate-100 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    <span className="material-symbols-outlined text-base">directions</span>
                    Directions
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Emergency Services */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">radiology</span>
              <h2 className="text-xs font-medium uppercase tracking-wider text-slate-800">Public Emergency Services</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-red-500 hover:bg-red-50">
                <span className="material-symbols-outlined text-2xl text-red-500">ambulance</span>
                <span className="text-lg font-normal text-slate-900">108</span>
                <span className="text-[10px] font-normal uppercase tracking-tighter text-slate-500">Ambulance</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-red-500 hover:bg-red-50">
                <span className="material-symbols-outlined text-2xl text-red-500">fire_truck</span>
                <span className="text-lg font-normal text-slate-900">101</span>
                <span className="text-[10px] font-normal uppercase tracking-tighter text-slate-500">Fire</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-red-500 hover:bg-red-50">
                <span className="material-symbols-outlined text-2xl text-red-500">local_police</span>
                <span className="text-lg font-normal text-slate-900">100</span>
                <span className="text-[10px] font-normal uppercase tracking-tighter text-slate-500">Police</span>
              </button>
            </div>
          </section>

          {/* Child Emergency Profile */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">assignment_ind</span>
              <h2 className="text-xs font-medium uppercase tracking-wider text-primary">Child&apos;s Emergency Profile</h2>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-500">Child Name</p>
                <p className="text-sm font-bold text-slate-900">{childName}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-500">Contact</p>
                <p className="text-sm font-bold text-slate-900">{phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-medium uppercase text-slate-500">Emergency Numbers</p>
                <p className="text-sm font-medium text-slate-700">108 (Ambulance) · 101 (Fire) · 100 (Police)</p>
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/20 py-3 text-sm font-normal text-primary transition-colors hover:bg-primary/30">
              <span className="material-symbols-outlined text-lg">share</span>
              Share Profile via WhatsApp
            </button>
          </section>

        </div>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white p-1">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="material-symbols-outlined">close</span>
            Close Emergency Dashboard
          </button>
        </footer>
      </div>
    </div>
  );
}
