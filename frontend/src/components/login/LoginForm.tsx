"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginForm() {
  const [loginMethod, setLoginMethod] = useState<"regId" | "mobile">("regId");

  // Registration ID tab fields
  const [registrationId, setRegistrationId] = useState("");
  const [regEmail, setRegEmail] = useState("");

  // Mobile/Email tab field
  const [emailOrPhone, setEmailOrPhone] = useState("");

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive the email to use for OTP based on active tab
  const activeEmail =
    loginMethod === "regId" ? regEmail.trim() : emailOrPhone.trim();

  const canSendOtp =
    loginMethod === "regId"
      ? registrationId.trim().length > 0 && regEmail.trim().includes("@")
      : emailOrPhone.trim().includes("@");

  const handleSendOtp = async () => {
    setError(null);
    if (!activeEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoadingSend(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Show specific error message from backend
        throw new Error(data.message || "Failed to send OTP");
      }
      setOtpSent(true);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      
      // If email not found, suggest registration
      if (errorMessage.includes("not found") || errorMessage.includes("register")) {
        setTimeout(() => {
          if (confirm("Email not found. Would you like to register a new account?")) {
            window.location.href = "/register";
          }
        }, 100);
      }
    } finally {
      setLoadingSend(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoadingVerify(true);
    try {
      let res: Response;
      let data: any;

      if (loginMethod === "regId") {
        // Use /auth/login — Registration ID + Email + OTP
        res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registrationId: registrationId.trim(),
            email: regEmail.trim(),
            otp: code,
          }),
        });
      } else {
        // Use /auth/verify-otp — Email + OTP
        res = await fetch(`${API_BASE}/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: activeEmail, otp: code }),
        });
      }

      data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Invalid OTP. Please try again.");

      const token = data.token ?? data.access_token;
      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem("wt18_token", token);
        if (data.user) localStorage.setItem("wt18_user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleTabChange = (tab: "regId" | "mobile") => {
    setLoginMethod(tab);
    setOtpSent(false);
    setOtp(Array(6).fill(""));
    setError(null);
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-primary/10 bg-white shadow-xl">
      <div className="p-8">

        {/* Header */}
        <header className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-4 flex items-center gap-2">
            <h1 className="text-2xl font-medium tracking-tight text-slate-900">WombTo18</h1>
          </Link>
          <h2 className="mb-2 text-3xl font-medium text-slate-800">Welcome Back!</h2>
          <p className="text-sm text-slate-500">Access your child&apos;s health journey</p>
        </header>

        {/* Login Method Tabs */}
        <div className="mb-6">
          <div className="flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleTabChange("regId")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${loginMethod === "regId" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Registration ID
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("mobile")}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${loginMethod === "mobile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Mobile / Email
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleVerifyLogin}>

          {loginMethod === "regId" ? (
            <>
              {/* Registration ID input */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Registration ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
                  <input
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="CHD-KA-20260310-000045"
                    type="text"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                  />
                </div>
              </div>
              {/* Email input */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                  <input
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="name@example.com"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Enter the email used during registration.
                </p>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">contact_mail</span>
                <input
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="name@example.com"
                  type="email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                We will send a secure OTP to verify your identity.
              </p>
            </div>
          )}

          {/* Send OTP Button */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-medium text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
            type="button"
            onClick={handleSendOtp}
            disabled={!canSendOtp || loadingSend || otpSent}
          >
            {loadingSend ? "Sending..." : otpSent ? "OTP Sent ✓" : "Send OTP"}
            {!otpSent && <span className="material-symbols-outlined text-sm">send</span>}
          </button>

          {/* OTP Input Section */}
          {otpSent && (
            <div className="pt-2">
              <label className="mb-3 block text-center text-sm font-medium text-slate-700">
                Enter 6-digit OTP
                {process.env.NODE_ENV !== "production" && (
                  <span className="ml-2 text-xs text-amber-500">(test mode: 123456)</span>
                )}
              </label>
              <div className="flex justify-between gap-2 px-2">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    className="h-12 w-10 rounded-lg border-2 border-slate-200 bg-slate-50 text-center text-xl font-normal text-slate-900 focus:border-primary focus:ring-0 outline-none transition-colors"
                    maxLength={1}
                    type="text"
                    inputMode="numeric"
                    value={otp[i] ?? ""}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="pt-1 text-center text-sm text-red-600">{error}</p>
          )}

          {otpSent && (
            <button
              className="mt-2 w-full rounded-full bg-primary px-4 py-3 font-medium text-white shadow-md transition-all hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
              type="submit"
              disabled={otp.join("").length !== 6 || loadingVerify}
            >
              {loadingVerify ? "Verifying..." : "Verify & Login"}
            </button>
          )}
        </form>

        {/* Security Badges */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            OTP Protected
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">lock_reset</span>
            No password needed
          </div>
          <a className="text-primary hover:underline" href="#">Need help?</a>
        </div>
      </div>

      {/* Card Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 p-6">
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-primary hover:underline" href="/register">
              Register Now
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
