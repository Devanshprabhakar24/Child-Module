import { UserPlus, Stethoscope, Handshake } from "lucide-react";

export default function RegistrationPaths() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-medium text-slate-900">How would you like to register?</h2>
          <p className="mt-4 text-slate-600">Choose the path that fits you best</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Direct Registration */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-primary/50">
            <UserPlus className="mb-6 h-12 w-12 text-primary" />
            <h3 className="text-2xl font-medium text-slate-900">Direct</h3>
            <p className="mt-4 flex-grow text-slate-600">Register directly as a parent and start tracking your child's health journey today.</p>
            <button className="mt-8 w-full rounded-full bg-primary py-3 font-normal text-white transition hover:brightness-110">Get Started</button>
          </div>
          {/* Hospital/Doctor */}
          <div className="flex flex-col rounded-3xl border border-primary bg-primary/5 p-8 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <Stethoscope className="h-12 w-12 text-primary" />
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">RECOMMENDED</span>
            </div>
            <h3 className="text-2xl font-medium text-slate-900">Hospital/Doctor</h3>
            <p className="mt-4 flex-grow text-slate-600">Connect with your pediatrician. Get digital prescriptions and automated health records.</p>
            <button className="mt-8 w-full rounded-full bg-slate-900 py-3 font-normal text-white transition hover:bg-slate-800">Connect Doctor</button>
          </div>
          {/* Channel Partner */}
          <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-primary/50">
            <Handshake className="mb-6 h-12 w-12 text-primary" />
            <h3 className="text-2xl font-medium text-slate-900">Channel Partner</h3>
            <p className="mt-4 flex-grow text-slate-600">Are you a healthcare provider or a partner? Register to join our network.</p>
            <button className="mt-8 w-full rounded-full bg-primary py-3 font-normal text-white transition hover:brightness-110">Partner With Us</button>
          </div>
        </div>
      </div>
    </section>
  );
}