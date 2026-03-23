"use client";

import { useEffect, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function SuccessHero() {
  const [regId, setRegId] = useState("—");
  const [payId, setPayId] = useState("—");
  const [childName, setChildName] = useState("—");
  const [regDate, setRegDate] = useState("—");
  const [amount, setAmount] = useState(999);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Only access sessionStorage on the client side
    if (typeof window !== 'undefined') {
      const registrationId = sessionStorage.getItem("wt18_reg_id") ?? "—";
      setRegId(registrationId);
      setPayId(sessionStorage.getItem("wt18_pay_id") ?? "—");
      setChildName(sessionStorage.getItem("wt18_child_name") ?? "—");
      setRegDate(sessionStorage.getItem("wt18_reg_date") ?? new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }));
      
      // Fetch actual amount from registration
      if (registrationId && registrationId !== "—") {
        fetchRegistrationAmount(registrationId);
      }
    }
  }, []);

  const fetchRegistrationAmount = async (registrationId: string) => {
    try {
      const response = await fetch(`${API_BASE}/registration/${registrationId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data?.subscriptionAmount) {
          setAmount(data.data.subscriptionAmount);
        }
      }
    } catch (error) {
      console.error("Failed to fetch registration amount:", error);
      // Keep default 999 if fetch fails
    }
  };

  const handleDownloadInvoice = async () => {
    if (typeof window === 'undefined') return;
    
    const id = sessionStorage.getItem("wt18_reg_id");
    if (!id) return;
    
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(id)}/invoice`);
      if (!res.ok) throw new Error("Invoice not ready yet");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WombTo18_Invoice_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center rounded-3xl border border-primary/5 bg-white p-8 text-center shadow-sm">
        <div className="relative mb-6">
          <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-primary/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-5xl text-white">check</span>
            </div>
          </div>
          <div className="absolute -right-2 -top-2 text-primary">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <div className="absolute -bottom-1 -left-4 text-primary opacity-50">
            <span className="material-symbols-outlined text-2xl">celebration</span>
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
          Payment Successful!
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Transaction ID: <span className="font-mono text-primary">{payId}</span>
        </p>
      </section>

      {/* Confirmation Card */}
      <section className="rounded-2xl border border-primary/5 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-primary/10 md:aspect-square md:w-1/3">
            <div className="absolute inset-0 flex items-center justify-center text-primary/30">
              <span className="material-symbols-outlined text-7xl">task_alt</span>
            </div>
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <h3 className="text-2xl font-medium text-slate-900">Registration Complete</h3>
              <p className="text-sm text-slate-500">Welcome to the WombTo18 family, {childName}!</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registration ID</p>
                <p className="font-mono font-medium text-slate-700">{regId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Amount Paid</p>
                <p className="text-lg font-bold text-primary">₹{amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date & Time</p>
                <p className="text-sm font-medium text-slate-700">{regDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Success
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                {downloading ? "Downloading..." : "Download Invoice"}
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'WombTo18 Registration Complete',
                      text: `Successfully registered with WombTo18! Registration ID: ${regId}`,
                      url: window.location.href
                    }).catch(err => console.log('Share cancelled'));
                  } else {
                    // Fallback: Copy to clipboard
                    navigator.clipboard.writeText(`Registration ID: ${regId}\nAmount Paid: ₹${amount.toFixed(2)}`);
                    alert('Registration details copied to clipboard!');
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-lg">share</span>
                Share
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
