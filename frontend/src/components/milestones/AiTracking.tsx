import { BrainCircuit, LineChart, BellRing } from "lucide-react";

export default function AiTracking() {
  return (
    <section className="mb-24 w-full">
      <div className="overflow-hidden rounded-[3rem] border border-slate-100 bg-slate-50 shadow-2xl shadow-primary/5">
        <div className="grid lg:grid-cols-2">
          
          {/* Content Side */}
          <div className="flex flex-col justify-center p-10 md:p-16">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-normal uppercase tracking-widest text-primary">
              <BrainCircuit className="h-4 w-4" /> Proprietary AI
            </div>
            <h2 className="mb-6 text-3xl font-normal text-slate-900 md:text-4xl">
              AI-Powered Developmental Insights
            </h2>
            <p className="mb-10 text-lg font-light leading-relaxed text-slate-600">
              Stop guessing. Our AI engine analyzes the milestones you log against global pediatric datasets to provide personalized insights and early warnings, directly in your dashboard.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
                  <LineChart className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-normal text-slate-900">Predictive Growth Curves</h4>
                  <p className="mt-1 text-sm leading-relaxed font-light text-slate-500">
                    Visually project your child's height and weight trajectory based on current percentiles and genetic factors.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                  <BellRing className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-normal text-slate-900">Smart Delay Flags</h4>
                  <p className="mt-1 text-sm leading-relaxed font-light text-slate-500">
                    Receive gentle, proactive alerts if your child misses critical sequential milestones, allowing for early intervention consulting.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Visual/Image Side */}
          <div className="relative min-h-[400px] bg-slate-200 lg:min-h-full">
            {/* A bright, relevant image of a parent and child using a tablet/learning */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596066190600-3af9aadaaea1?q=80&w=1769&auto=format&fit=crop')] bg-cover bg-center"></div>
            
            {/* Soft gradient fade from left to right to blend with the white container */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/20 to-transparent"></div>
            
            {/* Floating UI Element - Light Mode */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-72 rounded-2xl border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-md md:right-12">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Motor Skills</span>
                <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-normal uppercase text-green-700">On Track</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[85%] rounded-full bg-primary"></div>
                </div>
                <p className="text-xs font-normal text-slate-500">
                  Walking unassisted detected exactly at month 13 average.
                </p>
              </div>
            </div>
            
            {/* Second Floating UI Element - Just for visual depth */}
            <div className="absolute bottom-8 left-8 w-64 rounded-2xl border border-white/40 bg-white/80 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Cognitive Leap</p>
                  <p className="text-sm font-medium text-slate-900">Expected in 2 weeks</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}