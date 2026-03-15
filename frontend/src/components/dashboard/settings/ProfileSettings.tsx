import Image from "next/image";
import { User, Camera } from "lucide-react";

export default function ProfileSettings() {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
        <User className="h-6 w-6 text-primary" />
        Profile Settings
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start gap-8 md:flex-row">

          {/* Avatar with Camera Icon */}
          <div className="relative group shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-amber-50">
              <Image
                alt="Child's photo"
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1581841899040-8b5e38bae033?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                width={112}
                height={112}
                style={{ objectFit: "cover" }}
              />
            </div>
            <button className="absolute -bottom-3 -right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform hover:scale-105">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Details Grid */}
          <div className="grid flex-1 grid-cols-1 gap-y-6 sm:grid-cols-2 md:gap-x-12 md:gap-y-8">
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Child's Name</label>
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">Aarav Sharma</p>
                <button className="text-[11px] font-normal text-primary hover:underline">Edit</button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Date of Birth</label>
              <p className="font-medium text-slate-900">12 May 2024</p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Parent Contact</label>
              <p className="font-medium text-slate-900">+91 98765 43210</p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Location</label>
              <p className="font-medium text-slate-900">New Delhi, India</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
