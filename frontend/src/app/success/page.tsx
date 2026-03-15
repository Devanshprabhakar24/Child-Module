import SuccessHeader from "@/components/success/SuccessHeader";
import SuccessHero from "@/components/success/SuccessHero";
import SuccessTimeline from "@/components/success/SuccessTimeline";
import SuccessActions from "@/components/success/SuccessActions";

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-slate-900">
      <SuccessHeader />
      
      <main className="flex flex-1 justify-center px-4 py-8 md:px-0">
        <div className="flex w-full max-w-[800px] flex-col gap-8">
          
          <SuccessHero />
          
          <SuccessTimeline />
          
          <SuccessActions />
          
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="border-t border-slate-200 py-6 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} WombTo18 Child Health Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}