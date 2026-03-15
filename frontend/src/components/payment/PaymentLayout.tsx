import Link from "next/link";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-slate-900">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-10 flex-grow flex flex-col">
        
        {/* Payment Header */}
        <header className="flex items-center justify-between border-b border-primary/10 py-6">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-medium tracking-tight text-slate-900">WombTo18</h1>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-normal text-primary md:flex">
              <span className="material-symbols-outlined text-sm">lock</span>
              Secure Payment
            </div>
            <div className="flex items-center gap-2 text-sm font-normal text-slate-600">
              <span className="material-symbols-outlined text-lg">headset_mic</span>
              <span>1800-XXX-XXXX</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mb-20 mt-10 flex flex-col items-start justify-center gap-8 lg:flex-row">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto pb-10 text-center text-xs text-slate-400">
          <p>© 2026 WombTo18 Health Services. All transactions are encrypted and secured.</p>
        </footer>
      </div>
    </div>
  );
}