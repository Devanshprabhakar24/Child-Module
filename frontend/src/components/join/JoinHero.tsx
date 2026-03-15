import { Network } from "lucide-react";

export default function JoinHero() {
  return (
    <section className="mb-16 w-full">
      <div className="flex flex-col items-center text-center gap-8">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-normal uppercase tracking-widest text-primary">
            <Network className="h-4 w-4" /> The WombTo18 Ecosystem
          </div>
          <h1 className="mb-6 text-4xl font-normal tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Building a Healthier Future, <span className="text-primary">Together.</span>
          </h1>
          <p className="text-lg font-light leading-relaxed text-slate-600 sm:text-xl">
            Child healthcare isn't a solo journey. It requires a connected network of parents, educators, doctors, and visionaries. Find your place in our ecosystem today.
          </p>
        </div>
      </div>
    </section>
  );
}