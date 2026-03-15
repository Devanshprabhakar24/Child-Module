import { Baby, School, Activity } from "lucide-react";

export default function AgeSelectors() {
  const ageGroups = [
    { range: "0-5 Years", desc: "Vaccination, nutrition & growth tracking", icon: Baby },
    { range: "6-12 Years", desc: "Physical fitness & cognitive development", icon: School },
    { range: "13-18 Years", desc: "Mental wellness & teen health guides", icon: Activity }
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-medium text-slate-900">Select Your Child's Age Group</h2>
          <p className="mt-4 text-slate-600">Tailored health tracking for every milestone</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {ageGroups.map((group, idx) => (
            <div key={idx} className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-100 p-8 text-center transition hover:shadow-xl">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:scale-110 transition">
                <group.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium text-slate-900">{group.range}</h3>
              <p className="mt-2 text-sm text-slate-600">{group.desc}</p>
              <div className="mt-6">
                <span className="text-sm font-medium text-primary">Explore Features  →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}