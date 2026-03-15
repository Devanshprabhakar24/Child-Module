import Link from "next/link";

export default function Milestones() {
  return (
    <section className="py-24 bg-white" id="milestones">
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-medium text-slate-900 tracking-tight mb-4">The Journey Milestones</h2>
          <p className="text-lg font-light text-slate-600">A seamless progression of health care tailored to your child's growth. We stay with you from the very first heartbeat to adulthood.</p>
        </div>
        
        <div className="relative">
          {/* Dashed Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-24 left-10 right-10 h-0 border-t-2 border-dashed border-slate-200 z-0"></div>
          
          <div className="grid gap-10 lg:grid-cols-3">
            
            {/* Card 1: Early Years */}
            <div className="relative z-10 bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 group">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">baby_changing_station</span>
              </div>
              <div className="space-y-3">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Early Years</span>
                <h3 className="text-2xl font-medium text-slate-900">0-5 Years</h3>
                <p className="text-slate-600">Comprehensive vaccination schedules, nutrition guides, and essential motor skill tracking.</p>
                <div className="pt-4">
                  <Link href="#" className="inline-flex items-center text-primary font-medium hover:gap-2 transition-all">
                    Explore Features <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Card 2: Growth Phase */}
            <div className="relative z-10 bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 group lg:translate-y-8">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <div className="space-y-3">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Growth Phase</span>
                <h3 className="text-2xl font-medium text-slate-900">6-12 Years</h3>
                <p className="text-slate-600">Focus on physical fitness, cognitive development records, and school health checkups.</p>
                <div className="pt-4">
                  <Link href="#" className="inline-flex items-center text-primary font-medium hover:gap-2 transition-all">
                    Explore Features <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Card 3: Transition */}
            <div className="relative z-10 bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 group lg:translate-y-16">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">self_improvement</span>
              </div>
              <div className="space-y-3">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Transition</span>
                <h3 className="text-2xl font-medium text-slate-900">13-18 Years</h3>
                <p className="text-slate-600">Holistic support for mental wellness, teen health guides, and adult transition planning.</p>
                <div className="pt-4">
                  <Link href="#" className="inline-flex items-center text-primary font-medium hover:gap-2 transition-all">
                    Explore Features <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}