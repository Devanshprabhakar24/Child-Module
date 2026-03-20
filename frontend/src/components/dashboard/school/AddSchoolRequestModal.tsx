"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { INDIAN_STATES_SCHOOLS } from "@/data/schools";

interface AddSchoolRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSchoolRequestModal({ isOpen, onClose }: AddSchoolRequestModalProps) {
  const [formData, setFormData] = useState({
    schoolName: "",
    state: "",
    district: "",
    yourName: "",
    yourEmail: "",
    yourPhone: "",
    additionalInfo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset form after 2 seconds and close modal
    setTimeout(() => {
      setFormData({
        schoolName: "",
        state: "",
        district: "",
        yourName: "",
        yourEmail: "",
        yourPhone: "",
        additionalInfo: "",
      });
      setSubmitSuccess(false);
      onClose();
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-200 p-6 pb-4">
          <h2 className="text-2xl font-semibold text-slate-900">Request to Add School</h2>
          <p className="mt-1 text-sm text-slate-500">Submit a request to add your school to our network</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* School Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="schoolName" className="text-sm font-medium text-slate-700">
              School Name <span className="text-red-500">*</span>
            </label>
            <input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Enter school name"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* State */}
          <div className="flex flex-col gap-2">
            <label htmlFor="state" className="text-sm font-medium text-slate-700">
              State <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select State</option>
                {INDIAN_STATES_SCHOOLS.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* District */}
          <div className="flex flex-col gap-2">
            <label htmlFor="district" className="text-sm font-medium text-slate-700">
              District <span className="text-red-500">*</span>
            </label>
            <input
              id="district"
              name="district"
              type="text"
              required
              value={formData.district}
              onChange={handleChange}
              placeholder="Enter district"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Your Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="yourName" className="text-sm font-medium text-slate-700">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="yourName"
              name="yourName"
              type="text"
              required
              value={formData.yourName}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Your Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="yourEmail" className="text-sm font-medium text-slate-700">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              id="yourEmail"
              name="yourEmail"
              type="email"
              required
              value={formData.yourEmail}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Your Phone */}
          <div className="flex flex-col gap-2">
            <label htmlFor="yourPhone" className="text-sm font-medium text-slate-700">
              Your Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="yourPhone"
              name="yourPhone"
              type="tel"
              required
              value={formData.yourPhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Additional Information */}
          <div className="flex flex-col gap-2">
            <label htmlFor="additionalInfo" className="text-sm font-medium text-slate-700">
              Additional Information (Optional)
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={4}
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Any additional details about the school..."
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : submitSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Request Submitted!
              </span>
            ) : (
              "Submit Request"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
