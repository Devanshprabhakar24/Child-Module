import { Lightbulb, Play, BookOpen } from "lucide-react";

export default function TipsAndActivities() {
  return (
    <section className="mt-8 space-y-6">
      <h2 className="flex items-center gap-2 text-xl font-medium text-slate-900">
        <Lightbulb className="h-6 w-6 text-primary" />
        Tips & Activities
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Video Card 1 */}
        <div className="group cursor-pointer">
          <div className="relative mb-3 h-48 overflow-hidden rounded-2xl bg-slate-200 sm:h-40">
            <img
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-jr9yCy7AjZBbQpNG-uG7MrWA3M0nH21vdTLrFdvC2TTY7BUtTRfo8NhCirfLRSSOyiaNqsHS1Uz3HTq2O9vD7E_uPo__zQ7r7iFMLhGuFUdeDfd4T2PwnnQ7W6qzn0khncdzLbqjckPt4BP_s291HZi0N86q_NGmiOlBQ1nLpxy-lhXK4rrngb21m3BC0n-Qwk_ye8l-IDJNAAZbd8eDXA3RSeXPhiAAjCX-DHPZm1pj_BVuzaQt7jmSvr5pEM__hVFrjP_63Kee"
              alt="Baby learning to walk with parent"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Play className="h-14 w-14 fill-white text-white drop-shadow-lg" />
            </div>
          </div>
          <h4 className="text-sm font-medium text-slate-900">How to encourage walking</h4>
          <p className="mt-1 line-clamp-2 text-xs font-normal leading-relaxed text-slate-500">
            Gentle exercises and games to help your toddler build leg strength.
          </p>
        </div>

        {/* Video Card 2 */}
        <div className="group cursor-pointer">
          <div className="relative mb-3 h-48 overflow-hidden rounded-2xl bg-slate-200 sm:h-40">
            <img
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj7d8ZgWMXZMnPEAvMToweYbXoiY-FqvHU_g6C5_c7QIBh__M7Uqx-qf4ahLmbVrX1q3aFzAySgTjDeZGLHNYslAM7eMR9gTpOlT03e4mL2rGc4kPJCUoLBKrBsK9NRWtPRwu-RWAJMP09mZAodPqJ2eCjGG-o5n3P7TUA-HkQ1I8gcW0t8XQELTeQWha0RulvCIh-tjTQT4R7NCt0hEqA62Ky7lcS94WNqvkRFGVOFNGrq5ZNhuy3BJgbyuyfAW0dnLKfVna1aWbI"
              alt="Toddler playing with educational blocks"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Play className="h-14 w-14 fill-white text-white drop-shadow-lg" />
            </div>
          </div>
          <h4 className="text-sm font-medium text-slate-900">Age-appropriate activities</h4>
          <p className="mt-1 line-clamp-2 text-xs font-normal leading-relaxed text-slate-500">
            Keep them engaged with these top 10 cognitive stimulation games.
          </p>
        </div>

        {/* Resource Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <h4 className="text-base font-medium text-slate-900">Growth Handbook</h4>
          <p className="mb-5 mt-2 text-xs font-normal leading-relaxed text-slate-600">
            A complete guide to development stages for 1-3 year olds.
          </p>
          <button className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
            Download PDF
          </button>
        </div>
      </div>
    </section>
  );
}
