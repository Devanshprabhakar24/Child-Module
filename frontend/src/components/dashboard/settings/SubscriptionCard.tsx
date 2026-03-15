import { CreditCard, Receipt, BadgeCheck } from "lucide-react";

export default function SubscriptionCard() {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-3 text-lg font-medium text-slate-900">
        <CreditCard className="h-6 w-6 text-primary" />
        Subscription
      </h3>

      <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white shadow-lg shadow-primary/20">
        <div className="relative z-10">
          <p className="text-sm font-semibold text-white/90">Premium Annual Plan</p>
          <p className="mt-1 text-3xl font-bold">₹999/year</p>
          <p className="mt-6 text-xs font-medium text-white/90">Renews on 10 Mar 2027</p>

          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30">
            <Receipt className="h-4 w-4" />
            Download Invoice
          </button>
        </div>

        {/* Background Decor */}
        <div className="absolute -bottom-8 -right-8 opacity-10 mix-blend-overlay">
          <BadgeCheck className="h-40 w-40" />
        </div>
      </div>
    </section>
  );
}
