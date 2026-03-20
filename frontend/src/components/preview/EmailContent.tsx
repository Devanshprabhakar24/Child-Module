export default function EmailContent() {
  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      
      {/* Email Header */}
      <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 p-6">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined">verified</span>
          <span className="text-lg font-bold">WombTo18</span>
        </div>
        <div className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          Official
        </div>
      </div>

      {/* Email Body */}
      <div className="p-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Welcome to WombTo18!</h1>
        <p className="mb-6 text-sm font-medium text-slate-500">Subject: Welcome to WombTo18!</p>
        
        <div className="space-y-4 leading-relaxed text-slate-700">
          <p>Dear Aarav's Parent,</p>
          <p>Congratulations on joining the <strong>WombTo18</strong> family! We are thrilled to partner with you in your child's developmental journey.</p>
          
          {/* Registration Box */}
          <div className="my-6 rounded-lg border border-primary/10 bg-primary/5 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Registration ID</p>
                <p className="font-mono text-sm font-bold text-primary">CHD-KA-20260310-000045</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                <span className="material-symbols-outlined text-sm">eco</span>
                Go Green Certificate
              </div>
            </div>
          </div>
          
          <p>Your digital dashboard is now ready. You can access all health reports, vaccination schedules, and growth tracking tools from one central location.</p>
          
          <div className="flex justify-center py-6">
            <a 
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110"
            >
              Access Dashboard
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </a>
          </div>

          {/* Attachments Section */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="mb-4 text-sm font-bold text-slate-900">2 Attachments</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 w-full sm:w-auto">
                <span className="material-symbols-outlined text-red-500 text-3xl">picture_as_pdf</span>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">Invoice_0045.pdf</p>
                  <p className="text-slate-500">124 KB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 w-full sm:w-auto">
                <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">GoGreen_Cert.pdf</p>
                  <p className="text-slate-500">850 KB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Footer */}
      <div className="bg-slate-50 p-6 text-center">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Connect with us</p>
        <div className="flex justify-center gap-4 text-slate-400">
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-primary">social_leaderboard</span>
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-primary">share</span>
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-primary">mail</span>
        </div>
      </div>
    </div>
  );
}