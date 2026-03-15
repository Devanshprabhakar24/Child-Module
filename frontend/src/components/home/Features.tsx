import { FileText, Bell, Lock } from "lucide-react";

export default function Features() {
  const img =
  "https://plus.unsplash.com/premium_photo-1663126713952-49e8e128c9c1?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0";
  return (
    <section className="bg-primary/5 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-medium text-slate-900">Why WombTo18 is different?</h2>
            <div className="mt-10 space-y-8">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-slate-900">Paperless Records</h4>
                  <p className="mt-1 text-slate-600">Store all health documents digitally. Never lose a prescription or vaccination record again.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-slate-900">Smart Reminders</h4>
                  <p className="mt-1 text-slate-600">Get timely alerts for upcoming vaccinations and routine health checkups.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-slate-900">Secure & Private</h4>
                  <p className="mt-1 text-slate-600">Your child's health data is encrypted and protected with enterprise-grade security.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 h-[420px]">
  
            {/* Top Left */}
            <div
              className="rounded-tl-3xl shadow-xl bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "200% 200%",
                backgroundPosition: "left top",
              }}
            />

            {/* Top Right */}
            <div
              className="rounded-tr-3xl shadow-xl bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "200% 200%",
                backgroundPosition: "right top",
              }}
            />

            {/* Bottom Left */}
            <div
              className="rounded-bl-3xl shadow-xl bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "200% 200%",
                backgroundPosition: "left bottom",
              }}
            />

            {/* Bottom Right */}
            <div
              className="rounded-br-3xl shadow-xl bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "200% 200%",
                backgroundPosition: "right bottom",
              }}
            />

          </div>
        </div>
      </div>
    </section>
  );
}