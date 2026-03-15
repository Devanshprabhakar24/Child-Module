"use client";

import { useState } from "react";
import PreviewHeader from "./PreviewHeader";
import EmailContent from "./EmailContent";
import PreviewInfoCards from "./PreviewInfoCards";

export default function MessagePreviewFlow() {
  const [activeTab, setActiveTab] = useState("email");

  return (
    <div className="mx-auto max-w-[960px] overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
      
      <PreviewHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="p-6 md:p-10">
        
        {/* Dynamic Content Based on Tab */}
        {activeTab === 'email' && (
          <div className="animate-in fade-in duration-300">
            <EmailContent />
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="animate-in fade-in duration-300 py-20 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">construction</span>
            <p>WhatsApp preview template coming soon.</p>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="animate-in fade-in duration-300 py-20 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">construction</span>
            <p>SMS preview template coming soon.</p>
          </div>
        )}

        <PreviewInfoCards />

        {/* Footer Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-100 pt-8">
          <button className="w-full sm:w-auto rounded-lg border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            Edit Template
          </button>
          <button className="w-full sm:w-auto rounded-lg bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110">
            Send Test Message
          </button>
        </div>

      </main>
    </div>
  );
}