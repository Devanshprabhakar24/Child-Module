"use client";

import { useRouter } from "next/navigation";

interface PreviewHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function PreviewHeader({ activeTab, setActiveTab }: PreviewHeaderProps) {
  const router = useRouter();

  return (
    <div>
      {/* Top Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-primary/10 px-6 py-6 md:px-10">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-xl">child_care</span>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900">Message Preview</h2>
        </div>
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-100 px-6 md:px-10">
        <div className="flex gap-8">
          {(['email', 'whatsapp', 'sms'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 border-b-[3px] pb-4 pt-5 text-sm font-semibold transition-all ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {tab === 'email' ? 'mail' : tab === 'whatsapp' ? 'chat' : 'sms'}
              </span>
              <span className="capitalize">{tab === 'whatsapp' ? 'WhatsApp' : tab.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}