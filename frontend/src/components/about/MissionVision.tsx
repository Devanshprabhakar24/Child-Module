import { Rocket, Eye } from "lucide-react";

export default function MissionVision() {
  return (
    <section className="mb-24 grid w-full gap-8 md:grid-cols-2">
      {/* Mission Card */}
      <div className="group relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-primary/20 bg-white p-10 shadow-xl shadow-slate-200/50 transition-transform hover:-translate-y-1">
        <div className="absolute -mr-16 -mt-16 right-0 top-0 h-32 w-32 rounded-full bg-primary/5 transition-transform group-hover:scale-110"></div>
        <div className="z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Rocket className="h-8 w-8" />
        </div>
        <div className="z-10">
          <h2 className="mb-4 text-3xl font-normal text-slate-900">Our Mission</h2>
          <p className="text-lg font-light leading-relaxed text-slate-600">
            To provide a continuous digital ecosystem of support—from early childhood vaccinations to adolescent health—ensuring parents have complete, secure access to their child's medical journey.
          </p>
        </div>
      </div>
      
      {/* Vision Card */}
      <div className="group relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white p-10 shadow-xl shadow-slate-200/50 transition-transform hover:-translate-y-1">
        <div className="absolute -mr-16 -mt-16 right-0 top-0 h-32 w-32 rounded-full bg-blue-50 transition-transform group-hover:scale-110"></div>
        <div className="z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <Eye className="h-8 w-8" />
        </div>
        <div className="z-10">
          <h2 className="mb-4 text-3xl font-normal text-slate-900">Our Vision</h2>
          <p className="text-lg font-light leading-relaxed text-slate-600">
            A future where fragmented health records are a thing of the past, and every child has a unified, intelligent health profile that empowers proactive care and a healthier adult life.
          </p>
        </div>
      </div>
    </section>
  );
}