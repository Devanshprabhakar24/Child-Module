"use client";

import Link from "next/link";
import { useState } from "react";

export default function PaymentMethods() {
  const [activeTab, setActiveTab] = useState("upi");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("paytm");

  const popularBanks = [
    { id: "hdfc", name: "HDFC" },
    { id: "sbi", name: "SBI" },
    { id: "icici", name: "ICICI" },
    { id: "axis", name: "Axis" },
    { id: "kotak", name: "Kotak" },
    { id: "pnb", name: "PNB" },
  ];

  const wallets = [
    { id: "paytm", name: "Paytm", icon: "account_balance_wallet", balance: "Link Account" },
    { id: "amazon", name: "Amazon Pay", icon: "shopping_cart", balance: "Link Account" },
    { id: "phonepe", name: "PhonePe Wallet", icon: "payments", balance: "Link Account" },
    { id: "mobikwik", name: "MobiKwik", icon: "account_balance_wallet", balance: "Link Account" },
  ];

  return (
    <div className="order-1 w-full lg:order-2 lg:w-1/2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
          {(['upi', 'card', 'netbanking', 'wallets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 whitespace-nowrap border-b-2 py-4 px-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'netbanking' ? 'Net Banking' : tab}
            </button>
          ))}
        </div>

        {/* 1. UPI Content */}
        {activeTab === 'upi' && (
          <div className="p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Enter UPI ID</label>
                <div className="relative">
                  <input 
                    className="h-12 w-full rounded-lg border border-slate-200 pl-4 pr-24 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" 
                    placeholder="yourname" 
                    type="text" 
                  />
                  <div className="absolute right-0 top-0 flex h-full items-center border-l border-slate-200 px-4 font-medium text-slate-400 bg-slate-50 rounded-r-lg">
                    @okaxis
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">A payment request will be sent to your UPI app</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">OR</span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 transition-colors hover:border-primary/30">
                <div className="mb-4 h-32 w-32 rounded-lg bg-white p-2 shadow-sm">
                  <img 
                    alt="Payment QR Code" 
                    className="h-full w-full object-cover opacity-80" 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/QR_Code_example.png" 
                  />
                </div>
                <p className="text-sm font-bold text-slate-700">Scan QR Code to pay</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Open any UPI app to scan</p>
              </div>
            </div>

            <Link href="/success" className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary font-normal text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:-translate-y-0.5">
              <span>Generate Payment Link</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        )}

        {/* 2. Credit/Debit Card Content */}
        {activeTab === 'card' && (
          <div className="p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Card Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">credit_card</span>
                  <input 
                    className="h-12 w-full rounded-lg border border-slate-200 pl-12 pr-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary font-mono tracking-widest text-sm" 
                    placeholder="0000 0000 0000 0000" 
                    type="text" 
                    maxLength={19}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Expiry Date</label>
                  <input 
                    className="h-12 w-full rounded-lg border border-slate-200 px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm" 
                    placeholder="MM/YY" 
                    type="text" 
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">CVV</label>
                  <div className="relative">
                    <input 
                      className="h-12 w-full rounded-lg border border-slate-200 px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm" 
                      placeholder="123" 
                      type="password" 
                      maxLength={4}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg cursor-help" title="3 or 4 digits on the back of your card">info</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Name on Card</label>
                <input 
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary text-sm uppercase" 
                  placeholder="e.g. AARAV SHARMA" 
                  type="text" 
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="save-card" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" defaultChecked />
                <label htmlFor="save-card" className="text-xs font-medium text-slate-600 cursor-pointer">
                  Securely save card for faster payments next time
                </label>
              </div>
            </div>

            <Link href="/success" className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary font-normal text-white shadow-lg transition-all hover:bg-slate-800 hover:-translate-y-0.5">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>Pay Now</span>
            </Link>
          </div>
        )}

        {/* 3. Net Banking Content */}
        {activeTab === 'netbanking' && (
          <div className="p-6 sm:p-8 animate-in fade-in duration-300">
            <label className="mb-3 block text-sm font-semibold text-slate-700">Popular Banks</label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {popularBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank.id)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 transition-all ${
                    selectedBank === bank.id 
                      ? "border-primary bg-primary/5 text-primary shadow-sm" 
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined mb-1 text-2xl">account_balance</span>
                  <span className="text-[11px] font-bold">{bank.name}</span>
                </button>
              ))}
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">Other Banks</label>
            <div className="relative">
              <select 
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="h-12 w-full appearance-none rounded-lg border border-slate-200 pl-4 pr-10 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary text-sm"
              >
                <option value="" disabled>Select your bank</option>
                <option value="boi">Bank of India</option>
                <option value="canara">Canara Bank</option>
                <option value="idfc">IDFC First Bank</option>
                <option value="indusind">IndusInd Bank</option>
                <option value="yes">Yes Bank</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>

            <Link href="/success" className={`mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full font-normal shadow-lg transition-all hover:-translate-y-0.5 ${selectedBank ? "bg-primary text-white shadow-primary/20 hover:bg-primary/90" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}>
              <span>Proceed to Bank</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        )}

        {/* 4. Wallets Content */}
        {activeTab === 'wallets' && (
          <div className="p-6 sm:p-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <label 
                  key={wallet.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    selectedWallet === wallet.id 
                      ? "border-primary bg-primary/5" 
                      : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedWallet === wallet.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-slate-100 text-slate-500"}`}>
                      <span className="material-symbols-outlined text-[20px]">{wallet.icon}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${selectedWallet === wallet.id ? "text-primary" : "text-slate-900"}`}>{wallet.name}</p>
                      <p className="text-xs font-normal text-slate-500">{wallet.balance}</p>
                    </div>
                  </div>
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedWallet === wallet.id ? "border-primary" : "border-slate-300"}`}>
                    {selectedWallet === wallet.id && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                </label>
              ))}
            </div>

            <Link href="/success" className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary font- normal text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:-translate-y-0.5">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              <span>Link & Pay</span>
            </Link>
          </div>
        )}
      </div>

      {/* Trust Badges below the form */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 opacity-60 transition-all duration-300 hover:grayscale-0">
        <div className="flex items-center gap-2">
          {/* Razorpay Logo Placeholder */}
          <div 
            className="h-8 w-24 bg-contain bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg')" }}
          ></div>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 bg-white">
          <span className="material-symbols-outlined text-sm text-slate-700">verified_user</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-700">PCI-DSS Compliant</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 bg-white">
          <span className="material-symbols-outlined text-sm text-slate-700">security</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-700">100% Secure</span>
        </div>
      </div>
    </div>
  );
}