import { TrendingUp, Globe2, Code2, Sprout } from "lucide-react";

export default function PartnerImpact() {
  const benefits = [
    {
      icon: <Globe2 className="h-6 w-6" />,
      title: "Unprecedented Reach",
      desc: "Gain direct access to a verified, highly-engaged network of parents and families actively investing in their children's health.",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Seamless Integration",
      desc: "Our robust APIs allow hospitals, clinics, and schools to securely sync health clearances and patient records in real-time.",
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      icon: <Sprout className="h-6 w-6" />,
      title: "Measurable ESG Impact",
      desc: "Generate transparent CSR reports and participate in our 'Go Green' initiative, planting a tree for every child registered.",
      color: "text-primary",
      bg: "bg-primary/10"
    }
  ];

  return (
    <section className="mb-24 w-full">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-normal text-slate-900 md:text-4xl">
          More Than Just a Platform
        </h2>
        <p className="mx-auto max-w-2xl font-light text-lg text-slate-600">
          Partnering with WombTo18 means actively participating in raising the standard of pediatric care and social responsibility globally.
        </p>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Large Visual Card (Spans 2 Columns on Desktop) */}
        <div className="relative group min-h-[350px] overflow-hidden rounded-[2.5rem] bg-slate-100 lg:col-span-2">
          <img 
            src="https://images.unsplash.com/photo-1576267423048-15c0040fec78?q=80&w=1770&auto=format&fit=crop" 
            alt="Children playing and learning" 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
          
          <div className="absolute bottom-8 left-8 right-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">The WombTo18 Effect</p>
              <h3 className="text-2xl font-medium text-white sm:text-3xl">Transforming early <br/>childhood development.</h3>
            </div>
            
            {/* Glassmorphism Stat Badge */}
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-normal text-white">50K+</p>
                <p className="text-xs font-normal uppercase tracking-wider text-slate-300">Impacted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Solid Brand Callout Card */}
        <div className="flex flex-col justify-center rounded-[2.5rem] bg-primary p-10 text-white shadow-xl shadow-primary/20">
          <h3 className="mb-4 text-3xl font-medium leading-tight">
            Join the movement.
          </h3>
          <p className="mb-8 font-light text-primary-50 opacity-90 leading-relaxed">
            We are actively looking for visionary healthcare providers, corporate sponsors, and educational institutions to expand our ecosystem.
          </p>
          <div className="mt-auto flex items-center gap-2 text-sm font-normal uppercase tracking-widest text-white/80">
            <span className="h-px w-8 bg-white/50"></span> Partnership Perks
          </div>
        </div>

        {/* 3 Smaller Feature Cards (Bottom Row) */}
        {benefits.map((benefit, idx) => (
          <div key={idx} className="flex flex-col rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50">
            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${benefit.bg} ${benefit.color}`}>
              {benefit.icon}
            </div>
            <h4 className="mb-3 text-xl font-medium text-slate-900">{benefit.title}</h4>
            <p className="text-sm leading-relaxed text-slate-600">{benefit.desc}</p>
          </div>
        ))}

      </div>
    </section>
  );
}