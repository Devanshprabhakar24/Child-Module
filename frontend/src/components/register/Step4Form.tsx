"use client";

import { useState } from "react";
import { Info, Check, ArrowRight, ArrowLeft } from "lucide-react";

interface Step4Props {
  onConfirm: () => Promise<void>;
  onPrev: () => void;
  childName: string;
}

export default function Step4Form({ onConfirm, onPrev, childName }: Step4Props) {
  const [healthConsent, setHealthConsent] = useState(true);
  const [termsConsent, setTermsConsent] = useState(false);
  const [voiceReminders, setVoiceReminders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsConsent || !healthConsent || submitting) {
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await onConfirm();
    } catch (err: any) {
      setError(err.message || "Something went wrong while completing registration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-8 p-6 md:p-8" onSubmit={handleSubmit}>

      {/* Summary Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="font-bold text-slate-800">Registration Summary</h3>
          <span className="rounded bg-slate-200 px-2 py-1 font-mono text-[10px] text-slate-600">Pending ID</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Child's Name</p>
            <p className="font-medium text-slate-900">{childName || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Registration Fee</p>
            <p className="text-lg font-bold text-slate-900">₹999.00</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info className="h-5 w-5 shrink-0 text-primary" />
        <div className="text-sm leading-relaxed text-slate-700">
          <p className="mb-1 font-semibold text-slate-900">Why we need your consent</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Receive 9 automated reminder messages at critical milestones.</li>
            <li>Securely share health data with authorized practitioners.</li>
            <li>Enable digital health data portability to schools and hospitals.</li>
          </ul>
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-5">

        {/* Health Consent */}
        <label className="group flex cursor-pointer items-start gap-4">
          <div className="relative mt-1 flex items-center">
            <input
              type="checkbox"
              required
              checked={healthConsent}
              onChange={(e) => setHealthConsent(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${healthConsent ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-transparent group-hover:border-primary/50'}`}>
              {healthConsent && <Check className="h-3 w-3 font-bold" />}
            </div>
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">Health Communication Consent (Required)</span>
            <p className="mt-0.5 text-slate-500">I agree to receive vaccination reminders, health tips, and developmental updates via SMS, WhatsApp, and Email.</p>
          </div>
        </label>

        {/* Terms Consent */}
        <label className="group flex cursor-pointer items-start gap-4">
          <div className="relative mt-1 flex items-center">
            <input
              type="checkbox"
              required
              checked={termsConsent}
              onChange={(e) => setTermsConsent(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${termsConsent ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-transparent group-hover:border-primary/50'}`}>
              {termsConsent && <Check className="h-3 w-3 font-bold" />}
            </div>
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">Terms & Privacy Policy (Required)</span>
            <p className="mt-0.5 text-slate-500">I have read and accept the <a href="#" className="font-medium text-primary hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-primary hover:underline">Privacy Policy</a>.</p>
          </div>
        </label>

        {/* Voice Reminders */}
        <label className="group flex cursor-pointer items-start gap-4">
          <div className="relative mt-1 flex items-center">
            <input
              type="checkbox"
              checked={voiceReminders}
              onChange={(e) => setVoiceReminders(e.target.checked)}
              className="peer sr-only"
            />
            <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${voiceReminders ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-transparent group-hover:border-primary/50'}`}>
              {voiceReminders && <Check className="h-3 w-3 font-bold" />}
            </div>
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">Voice Reminders (Optional)</span>
            <p className="mt-0.5 text-slate-500">I would like to receive automated IVR voice call reminders for critical vaccination dates.</p>
          </div>
        </label>

      </div>

      {/* Actions */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="flex w-[45%] items-center justify-center gap-2 rounded-full bg-primary py-3 text-lg font-medium text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
            disabled={submitting || !termsConsent || !healthConsent}
          >
            {submitting ? "Processing..." : "Confirm & Pay ₹999"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back to Step 3
          </button>
        </div>
      </div>
    </form>
  );
}
