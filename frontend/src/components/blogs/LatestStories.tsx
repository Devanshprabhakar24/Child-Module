'use client';

import { Calendar, ArrowRight } from "lucide-react";

export default function LatestStories() {
  const stories = [
    {
      badge: "Health & Wellness", 
      badgeColors: "text-blue-700 bg-blue-50",
      title: "Understanding Growth Percentiles: What Parents Need to Know",
      excerpt: "Don't panic over numbers. Learn how pediatricians use growth charts to track your child's unique developmental trajectory over time.",
      date: "Mar 08, 2026",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1770&auto=format&fit=crop"
    },
    {
      badge: "Platform Update", 
      badgeColors: "text-primary bg-primary/10",
      title: "WombTo18 Introduces 'Go Green' Cohort Tracking",
      excerpt: "Our new initiative plants a tree for every child registered. Track your tree's growth alongside your child's milestones directly in the dashboard.",
      date: "Mar 02, 2026",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1774&auto=format&fit=crop"
    },
    {
      badge: "Parenting", 
      badgeColors: "text-amber-700 bg-amber-50",
      title: "5 Superfoods for Your Toddler's Brain Development",
      excerpt: "Incorporate these nutrient-dense, kid-friendly foods into your weekly meal plans to support cognitive growth during the critical early years.",
      date: "Feb 28, 2026",
      image: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?q=80&w=1964&auto=format&fit=crop"
    }
  ];

  return (
    <section className="mb-24 mt-16 w-full">
      <div className="mb-10 flex flex-col justify-between gap-6 border-b border-slate-100 pb-6 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-normal text-slate-900">Latest Articles</h2>
          <p className="mt-2 font-light text-slate-500">Expert advice, community stories, and platform news.</p>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          <button className="shrink-0 rounded-full bg-primary px-6 py-2 text-sm font-normal text-white shadow-md shadow-primary/20">All Topics</button>
          <button className="shrink-0 rounded-full bg-slate-100 px-6 py-2 text-sm font-normal text-slate-600 transition-colors hover:bg-primary/10 hover:text-primary">Health</button>
          <button className="shrink-0 rounded-full bg-slate-100 px-6 py-2 text-sm font-normal text-slate-600 transition-colors hover:bg-primary/10 hover:text-primary">Parenting</button>
          <button className="shrink-0 rounded-full bg-slate-100 px-6 py-2 text-sm font-normal text-slate-600 transition-colors hover:bg-primary/10 hover:text-primary">Updates</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story, idx) => (
          <article key={idx} className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
              <img 
                alt={story.title} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={story.image} 
              />
              <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-normal uppercase tracking-widest shadow-sm backdrop-blur-md ${story.badgeColors}`}>
                {story.badge}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-8">
              <h3 className="mb-3 line-clamp-2 text-xl font-normal text-slate-900 transition-colors group-hover:text-primary">
                {story.title}
              </h3>
              <p className="mb-6 line-clamp-3 text-sm font-light leading-relaxed text-slate-500">
                {story.excerpt}
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2 text-xs font-normal uppercase tracking-wider text-slate-400">
                  <Calendar className="h-4 w-4" />
                  {story.date}
                </div>
                <button className="group/link flex items-center gap-1 text-sm font-normal text-primary">
                  Read More <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <button className="rounded-full border-2 border-slate-200 px-8 py-3 text-sm font-normal text-slate-600 transition-colors hover:border-primary hover:text-primary">
          Load More Articles
        </button>
      </div>
    </section>
  );
}