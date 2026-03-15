"use client";

import Link from "next/link";

export default function ContactAuthForm() {
  return (
    <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
      
      <div className="flex flex-col gap-10 p-6 md:p-8">
        {/* Section 1: Email Verification */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">mail</span>
            <h3 className="text-lg font-semibold text-slate-900">Email Verification</h3>
          </div>
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-xl text-slate-400">alternate_email</span>
                </div>
                <input 
                  className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                  placeholder="name@example.com" 
                  type="email" 
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-opacity-90">
                Verify Email
              </button>
            </div>
          </div>

          {/* OTP Section (Active State) */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <p className="mb-4 text-sm font-medium text-slate-700">Enter 6-digit OTP sent to your email</p>
            <div className="mb-4 flex gap-3">
              {[...Array(6)].map((_, i) => (
                <input 
                  key={i}
                  className="h-14 w-12 rounded-lg border border-slate-300 bg-white text-center text-xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  maxLength={1} 
                  type="text" 
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono font-medium text-primary">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>00:45</span>
              </div>
              <button type="button" className="text-sm font-medium text-primary decoration-2 underline-offset-4 hover:underline">
                Resend OTP
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Mobile Verification */}
        <section className="flex flex-col gap-6 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">smartphone</span>
            <h3 className="text-lg font-semibold text-slate-900">Mobile Verification</h3>
          </div>
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="mb-2 block text-sm font-medium text-slate-700">Primary Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-500">
                  +91
                </span>
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-xl text-slate-400">call</span>
                  </div>
                  <input 
                    className="block w-full rounded-r-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                    type="tel" 
                    defaultValue="9876543210" 
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-4">
              <button 
                type="button"
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 font-semibold text-slate-500" 
                disabled
              >
                Verify Mobile
              </button>
            </div>
          </div>

          {/* Verified Mobile Status */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex h-10 w-8 items-center justify-center rounded-md border border-primary bg-primary/10 font-bold text-primary">•</div>
              ))}
            </div>
            <span className="material-symbols-outlined text-2xl font-bold text-primary">check_circle</span>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <span className="material-symbols-outlined text-lg text-amber-600">warning</span>
            <p className="text-xs leading-tight text-amber-700">
              This number is already registered 1 time. Please ensure you are not creating a duplicate account for the same child.
            </p>
          </div>
        </section>

        {/* Section 3: Additional Details */}
        <section className="flex flex-col gap-6 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <h3 className="text-lg font-semibold text-slate-900">Additional Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Secondary Mobile Number (Optional)</label>
              <input 
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                placeholder="Alternative contact number" 
                type="tel" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Residential Address</label>
              <textarea 
                className="block w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                placeholder="Flat/House No., Building, Street Name" 
                rows={3} 
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">City/Town</label>
              <input 
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                placeholder="e.g. Bengaluru" 
                type="text" 
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
              <div className="group relative">
                <input 
                  className="block w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none" 
                  readOnly 
                  type="text" 
                  defaultValue="Karnataka" 
                />
                <div className="absolute right-3 top-3.5 flex items-center">
                  <span className="material-symbols-outlined text-sm text-slate-400" title="Auto-filled from Step 1">info</span>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">PIN Code</label>
              <input 
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                maxLength={6} 
                placeholder="6-digit PIN" 
                type="text" 
              />
            </div>
          </div>
        </section>
      </div>

      {/* Form Footer Actions & Badges */}
      <div className="flex flex-col gap-8 border-t border-slate-200 bg-slate-50 p-8">
        <div className="flex items-center justify-between">
          <Link 
            href="/register"
            className="flex items-center gap-2 font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </Link>
          <button 
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-primary px-10 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            Continue
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            Your data is secure
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-sm text-primary">lock</span>
            OTP protected
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-sm text-primary">encrypted</span>
            End-to-end encrypted
          </div>
        </div>
      </div>
    </form>
  );
}