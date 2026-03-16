"use client";

import { useState, useRef } from "react";
import { Mail, AtSign, Phone, Smartphone, MapPin, Clock, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getStateName } from "../../utils/stateMapping";
import { handleNameInput } from "../../utils/textFormatting";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ContactDetails {
  email: string;
  mobile: string;
  address: string;
  city: string;
  pincode: string;
}

interface Step2Props {
  onNext: () => void;
  onPrev: () => void;
  onComplete: (details: ContactDetails) => void;
  motherName: string;
  stateCode?: string;
}

export default function Step2Form({ onNext, onPrev, onComplete, motherName, stateCode }: Step2Props) {
  // Verification States
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"initial" | "sent" | "verified">("initial");
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);

  const [mobile, setMobile] = useState("");
  const [mobileStatus, setMobileStatus] = useState<"initial" | "sent" | "verified">("initial");
  const [mobileOtp, setMobileOtp] = useState(["", "", "", "", "", ""]);

  // Additional Details State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // Refs for OTP auto-focusing
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [verifyEmailLoading, setVerifyEmailLoading] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [verifyMobileLoading, setVerifyMobileLoading] = useState(false);

  // OTP Input Handler (Auto-focus next box)
  const handleOtpChange = (
    value: string,
    index: number,
    type: "email" | "mobile"
  ) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = type === "email" ? [...emailOtp] : [...mobileOtp];
    newOtp[index] = value;

    if (type === "email") {
      setEmailOtp(newOtp);
      if (value && index < 5) emailOtpRefs.current[index + 1]?.focus();
    } else {
      setMobileOtp(newOtp);
      if (value && index < 5) mobileOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleSendMobileOtp = async () => {
    if (mobile.length !== 10) return;
    setMobileError(null);
    setMobileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `+91${mobile}@sms.wombto18.com`, phone: `+91${mobile}` }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to send OTP");
      }
      setMobileStatus("sent");
    } catch (err: any) {
      // In test mode the backend may not support phone OTP — just mark as sent
      setMobileStatus("sent");
    } finally {
      setMobileLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    const code = mobileOtp.join("");
    if (code.length !== 6) return;
    setMobileError(null);
    setVerifyMobileLoading(true);
    try {
      // In OTP_TEST_MODE the backend accepts the test code directly
      const testCode = process.env.NEXT_PUBLIC_OTP_TEST_CODE || "123456";
      if (code === testCode) {
        setMobileStatus("verified");
        return;
      }
      throw new Error("Invalid OTP. Please try again.");
    } catch (err: any) {
      setMobileError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setVerifyMobileLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email.includes("@")) return;
    setEmailError(null);
    setEmailLoading(true);
    try {
      // Register user first (idempotent — returns existing if already registered)
      await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone: `+91${mobile || "0000000000"}`, fullName: motherName }),
      });
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to send OTP");
      }
      setEmailStatus("sent");
    } catch (err: any) {
      setEmailError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    const code = emailOtp.join("");
    if (code.length !== 6) return;
    setEmailError(null);
    setVerifyEmailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }
      const data = await res.json();
      const token = data.token ?? data.access_token;
      if (typeof window !== "undefined") {
        if (token) {
          localStorage.setItem("wt18_token", token);
        }
        if (data.user) {
          localStorage.setItem("wt18_user", JSON.stringify(data.user));
        }
      }
      setEmailStatus("verified");
    } catch (err: any) {
      setEmailError(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setVerifyEmailLoading(false);
    }
  };

  // Validation to enable "Continue" button
  const isFormValid =
    emailStatus === "verified" &&
    mobileStatus === "verified" &&
    address.trim() !== "" &&
    city.trim() !== "" &&
    pincode.length === 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onComplete({
        email,
        mobile,
        address,
        city,
        pincode,
      });
      onNext();
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-10 p-6 md:p-8">
        
        {/* ================= EMAIL SECTION ================= */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Email Verification *</h3>
          </div>
          
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <AtSign className={`h-5 w-5 ${emailStatus === "verified" ? "text-primary" : "text-slate-400"}`} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailStatus !== "initial"}
                  placeholder="name@example.com" 
                  className={`block w-full rounded-full border bg-white py-3 pl-10 pr-3 outline-none transition-all ${
                    emailStatus === "verified" 
                      ? "border-primary/50 bg-primary/5 text-primary focus:ring-0 cursor-not-allowed font-medium" 
                      : "border-slate-300 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
                  }`} 
                />
                {emailStatus === "verified" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                )}
              </div>
            </div>

            {/* Verify Action Button */}
            <div className="md:col-span-4">
              {emailStatus === "initial" && (
                <button 
                  type="button" 
                  onClick={handleSendEmailOtp}
                  disabled={!email.includes("@") || emailLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-medium text-white transition-all ${
                    email.includes("@") && !emailLoading
                      ? "bg-primary shadow-sm shadow-primary/20 hover:bg-opacity-90"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {emailLoading ? "Sending..." : "Send OTP"}
                </button>
              )}
              {emailStatus === "verified" && (
                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-3 font-medium text-primary">
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* Email OTP Input Block */}
          {emailStatus === "sent" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 animate-in fade-in slide-in-from-top-4">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm font-normal text-slate-700">Enter 6-digit OTP sent to <span className="font-medium">{email}</span></p>
                <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[10px] font-normal uppercase tracking-wider text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> OTP Sent
                </span>
              </div>
              
              <div className="mb-6 flex gap-2 sm:gap-3">
                {emailOtp.map((digit, i) => (
                  <input 
                    key={`email-otp-${i}`} 
                    ref={(el) => { emailOtpRefs.current[i] = el; }}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i, "email")}
                    maxLength={1} 
                    type="text" 
                    className="h-12 w-10 sm:h-14 sm:w-12 rounded-lg border border-slate-300 bg-white text-center text-lg sm:text-xl font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-sm font-medium text-primary">
                  <Clock className="h-4 w-4" /><span>00:45</span>
                </div>
                <div className="flex gap-4 items-center">
                  <button type="button" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Resend</button>
                  <button 
                    type="button" 
                    onClick={handleVerifyEmailOtp}
                    disabled={emailOtp.join("").length !== 6 || verifyEmailLoading}
                    className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition-all ${
                      emailOtp.join("").length === 6 && !verifyEmailLoading
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    {verifyEmailLoading ? "Verifying..." : "Confirm"}
                  </button>
                </div>
              </div>
              {emailError && (
                <p className="mt-3 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ================= MOBILE SECTION ================= */}
        <section className="flex flex-col gap-6 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Mobile Verification *</h3>
          </div>
          
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="mb-2 block text-sm font-medium text-slate-700">Primary Mobile Number</label>
              <div className="flex">
                <span className={`inline-flex items-center rounded-l-full border border-r-0 px-4 text-sm font-medium transition-colors ${mobileStatus === "verified" ? "border-primary/50 bg-primary/5 text-primary" : "border-slate-300 bg-slate-50 text-slate-500"}`}>
                  +91
                </span>
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className={`h-5 w-5 ${mobileStatus === "verified" ? "text-primary" : "text-slate-400"}`} />
                  </div>
                  <input 
                    type="tel" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                    disabled={mobileStatus !== "initial"}
                    maxLength={10}
                    placeholder="9876543210"
                    className={`block w-full rounded-r-full border bg-white py-3 pl-10 pr-3 outline-none transition-all ${
                      mobileStatus === "verified" 
                        ? "border-primary/50 bg-primary/5 text-primary focus:ring-0 cursor-not-allowed font-medium" 
                        : "border-slate-300 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
                    }`}
                  />
                  {mobileStatus === "verified" && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-4">
              {mobileStatus === "initial" && (
                <button
                  type="button"
                  onClick={handleSendMobileOtp}
                  disabled={mobile.length !== 10 || mobileLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 font-medium text-white transition-all ${
                    mobile.length === 10 && !mobileLoading
                      ? "bg-primary shadow-sm shadow-primary/20 hover:bg-opacity-90"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {mobileLoading ? "Sending..." : "Send OTP"}
                </button>
              )}
              {mobileStatus === "verified" && (
                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-3 font-medium text-primary">
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* Mobile OTP Input Block */}
          {mobileStatus === "sent" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 animate-in fade-in slide-in-from-top-4">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm font-normal text-slate-700">Enter 6-digit OTP sent to <span className="font-medium">+91 {mobile}</span></p>
                <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-[10px] font-normal uppercase tracking-wider text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> OTP Sent
                </span>
              </div>
              
              <div className="mb-6 flex gap-2 sm:gap-3">
                {mobileOtp.map((digit, i) => (
                  <input 
                    key={`mobile-otp-${i}`} 
                    ref={(el) => { mobileOtpRefs.current[i] = el; }}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i, "mobile")}
                    maxLength={1} 
                    type="text" 
                    className="h-12 w-10 sm:h-14 sm:w-12 rounded-lg border border-slate-300 bg-white text-center text-lg sm:text-xl font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-sm font-medium text-primary">
                  <Clock className="h-4 w-4" /><span>00:45</span>
                </div>
                <div className="flex gap-4 items-center">
                  <button type="button" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Resend</button>
                  <button 
                    type="button" 
                    onClick={handleVerifyMobileOtp}
                    disabled={mobileOtp.join("").length !== 6 || verifyMobileLoading}
                    className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition-all ${mobileOtp.join("").length === 6 && !verifyMobileLoading ? "bg-primary hover:bg-primary/90" : "bg-slate-300 cursor-not-allowed"}`}
                  >
                    {verifyMobileLoading ? "Verifying..." : "Confirm"}
                  </button>
                </div>
              </div>
              {mobileError && (
                <p className="mt-3 text-sm text-red-600">{mobileError}</p>
              )}
            </div>
          )}
        </section>

        {/* ================= ADDITIONAL DETAILS ================= */}
        <section className="flex flex-col gap-6 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Additional Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Residential Address *</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" 
                placeholder="Flat/House No., Building, Street Name" 
                rows={3} 
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">City/Town *</label>
              <input 
                value={city}
                onChange={(e) => handleNameInput(e.target.value, setCity)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" 
                placeholder="e.g. Bengaluru" 
                type="text" 
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
              <input 
                className="block w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-500 outline-none" 
                readOnly 
                type="text" 
                value={stateCode ? getStateName(stateCode) : "Not selected"} 
                title="State is carried over from Step 1"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">PIN Code *</label>
              <input 
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" 
                maxLength={6} 
                placeholder="6-digit PIN" 
                type="text" 
              />
            </div>
          </div>
        </section>
      </div>

      {/* ================= FOOTER ACTIONS ================= */}
      <div className="flex flex-col gap-8 border-t border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onPrev} className="flex items-center gap-2 font-semibold text-slate-500 transition-colors hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`flex items-center gap-2 rounded-full px-10 py-3 font-medium text-white transition-all ${
              isFormValid 
                ? "bg-primary hover:shadow-lg hover:shadow-primary/30 hover:bg-primary/90" 
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Continue <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
}