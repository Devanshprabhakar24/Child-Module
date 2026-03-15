import { ShieldCheck, Lock, Building2, FileText, Download } from "lucide-react";

export default function Compliance() {
  return (
    <section className="mb-20 w-full">
      <div className="overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-primary/10">
        <div className="grid lg:grid-cols-5">
          
          {/* Dark Slate Left Panel */}
          <div className="flex flex-col justify-center bg-slate-900 p-12 text-white lg:col-span-2">
            <ShieldCheck className="mb-6 h-14 w-14 text-primary" />
            <h2 className="mb-4 text-3xl font-normal">Data Privacy & Security</h2>
            <p className="mb-10 font-light leading-relaxed text-slate-300">
              Your child's health data is sacred. We maintain rigorous compliance with national data protection standards and employ bank-level encryption.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-full bg-white/10 p-2 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <span className="text-lg font-normal text-slate-200">End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-full bg-white/10 p-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-lg font-normal text-slate-200">ISO 27001 Certified</span>
              </div>
            </div>
          </div>
          
          {/* White Right Panel */}
          <div className="bg-white p-12 lg:col-span-3">
            <h3 className="mb-8 text-2xl font-normal text-slate-900">Platform Trust Details</h3>
            
            <div className="mb-10 grid gap-6 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-8">
                <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-primary">Security</div>
                <Building2 className="mb-4 h-10 w-10 text-primary" />
                <h4 className="mb-1 text-xl font-medium text-slate-900">HIPAA Compliant</h4>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">Standard Met</p>
                <p className="text-sm font-light leading-relaxed text-slate-800">All medical records and communication on WombTo18 strictly adhere to global health privacy standards.</p>
              </div>
              
              <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-8">
                <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-primary">Foundation</div>
                <FileText className="mb-4 h-10 w-10 text-primary" />
                <h4 className="mb-1 text-xl font-medium text-slate-900">80G Registered</h4>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">For Donations</p>
                <p className="text-sm font-light leading-relaxed text-slate-800">Donations made to our Go Green and underprivileged child initiatives are tax-exempt under Section 80G.</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="group flex flex-1 items-center justify-between rounded-2xl border-2 border-slate-100 p-5 transition-colors hover:border-primary hover:text-primary">
                <span className="font-medium text-slate-700 transition-colors group-hover:text-primary">Privacy Policy</span>
                <Download className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1" />
              </button>
              <button className="group flex flex-1 items-center justify-between rounded-2xl border-2 border-slate-100 p-5 transition-colors hover:border-primary hover:text-primary">
                <span className="font-medium text-slate-700 transition-colors group-hover:text-primary">Terms of Service</span>
                <Download className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1" />
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}