import { Sparkles, ArrowRight } from "lucide-react";

export default function MilestonesHero() {
  return (
    <section className="mb-16 w-full">
      <div className="flex flex-col gap-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-normal uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" /> Comprehensive Tracking
          </div>
          <h1 className="mb-6 text-4xl font-normal tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Track Every Leap, Bound, and First Word.
          </h1>
          <p className="text-lg font-light leading-relaxed text-slate-600 sm:text-xl">
            From cognitive leaps to physical growth spurts, WombTo18 provides a medically-backed roadmap for your child's entire developmental journey.
          </p>
        </div>
        
        <div className="mt-8 relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-primary/10">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20 z-10"></div>
          <img 
            alt="Child taking first steps" 
            className="h-[400px] w-full object-cover sm:h-[500px]" 
            src="https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1770&auto=format&fit=crop" 
          />
          <div className="absolute bottom-0 left-0 z-20 w-full p-8 md:p-12 lg:w-2/3">
            <h2 className="mb-4 text-3xl font-normal text-white md:text-4xl">
              Don't miss a single moment.
            </h2>
            <p className="mb-8 text-lg font-light text-slate-200">
              Join thousands of parents who use our intelligent dashboard to log milestones, identify delays early, and celebrate growth.
            </p>
            <button className="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-normal text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30">
              Start Tracking Now
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}