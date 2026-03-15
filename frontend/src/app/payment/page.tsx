import PaymentLayout from "@/components/payment/PaymentLayout";
import PaymentMethods from "@/components/payment/PaymentMethods";

export default function PaymentPage() {
  return (
    <PaymentLayout>
      
      {/* Left Side: Order Summary */}
      <div className="order-2 w-full lg:order-1 lg:w-1/3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-slate-900">Payment Summary</h3>
          
          <div className="relative mb-6 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-6xl text-primary/40">receipt_long</span>
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-3 text-center shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Amount to Pay</p>
              <p className="text-2xl font-bold text-primary">₹999.00</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase text-slate-500">Service</span>
              <p className="font-medium text-slate-900">Child Health Subscription</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase text-slate-500">Registration ID</span>
              <p className="font-medium text-slate-700">CHD-KA-20260310-000045</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase text-slate-500">Child Name</span>
              <p className="font-medium text-slate-700">Aarav Sharma</p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <span className="text-sm font-medium text-slate-500">Subtotal</span>
            <span className="font-bold text-slate-900">₹999.00</span>
          </div>
        </div>
      </div>

      {/* Right Side: Payment Methods Form */}
      <PaymentMethods />

    </PaymentLayout>
  );
}