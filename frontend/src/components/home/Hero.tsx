import Link from "next/link";
import { BadgeCheck, Play, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">

      {/* 1. Background Image (Absolute) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          // Replace this URL with your actual WombTo18 family image
          backgroundImage: "url('https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=2000&auto=format&fit=crop')"
        }}
      />

      {/* 2. Gradient Overlay (Absolute)
          Fades from dark slate at the top to transparent at the bottom
      */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-900/10" />

      {/* 3. Centered Content (Relative & Z-10 to sit above the image/gradient) */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">

        {/* Trust Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-normal uppercase tracking-widest text-emerald-300 backdrop-blur-md sm:text-sm">
          <BadgeCheck className="h-4 w-4" />
          Trusted by 50,000+ Indian Parents
        </div>

        {/* Main Heading */}
        <h1 className="mb-6 text-4xl font-medium tracking-tight text-white sm:text-6xl md:text-7xl">
          Complete Child Health Journey from <br className="hidden md:block" />
          <span className="text-primary">0-18 Years</span>
        </h1>

        {/* Subheading */}
        <p className="mb-10 max-w-2xl text-lg font-light leading-relaxed text-slate-100 sm:text-xl">
          Empowering parents with comprehensive health tracking, vaccination reminders, and growth monitoring from birth to adulthood.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
          <button className="w-full rounded-full bg-primary px-8 py-3 text-base font-normal text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 sm:w-auto sm:text-lg">
            Register Now
          </button>

          <button className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3 text-base font-normal text-white backdrop-blur-md transition-all hover:bg-white/20 sm:w-auto sm:text-lg">
            <Play className="h-5 w-5" />
            View Demo
          </button>
        </div>

        {/* Feature Ticks */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm font-normal text-slate-50 sm:gap-8">
          <div className="flex items-center gap-1.5 ">
            <CheckCircle className="h-4.5 w-4.5 text-primary" />
            Go Green Certified
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4.5 w-4.5 text-primary" />
            Verified Doctors
          </div>
        </div>

      </div>
    </section>
  );
}
