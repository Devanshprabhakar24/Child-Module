'use client';

import { ArrowRight } from "lucide-react";

export default function NewsHero() {
  return (
    <section className="mb-16 w-full">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="mb-4 text-4xl font-normal text-slate-900 lg:text-5xl">Parenting Insights & News</h1>
          <p className="max-w-2xl text-lg font-light text-slate-600">
            Your destination for the latest health guides, platform updates, and stories from the WombTo18 community.
          </p>
        </div>
        
        <div className="group relative">
          <div className="grid grid-cols-1 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-primary/10 transition-transform duration-300 hover:-translate-y-1 lg:grid-cols-2">
            <div className="relative h-[400px] overflow-hidden bg-slate-100 lg:h-[500px]">
              <img 
                alt="Mother and child smiling" 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1554622965-bfaeff35e57f?q=80&w=1770&auto=format&fit=crop" 
              />
            </div>
            <div className="flex flex-col justify-center gap-6 p-8 lg:p-16">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-normal uppercase tracking-widest text-white shadow-md shadow-primary/30">
                  Featured Guide
                </span>
                <span className="text-xs font-normal uppercase tracking-wider text-slate-500">March 12, 2026</span>
              </div>
              <h2 className="text-3xl font-normal leading-tight text-slate-900 lg:text-4xl">
                The Complete Guide to Your Child's First Year Vaccinations
              </h2>
              <p className="text-lg font-light leading-relaxed text-slate-600">
                Understanding the IAP schedule can be overwhelming. We break down exactly what to expect, how to prepare, and how WombTo18 keeps you on track.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <button className="group/btn flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-normal text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30">
                  Read Article 
                  <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
            <button className="h-1.5 w-12 rounded-full bg-primary transition-all"></button>
            <button className="h-1.5 w-12 rounded-full bg-slate-200 transition-colors hover:bg-primary/40"></button>
            <button className="h-1.5 w-12 rounded-full bg-slate-200 transition-colors hover:bg-primary/40"></button>
          </div>
        </div>
      </div>
    </section>
  );
}