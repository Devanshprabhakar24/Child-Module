import { Users, School, Stethoscope, Handshake, Sprout, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function JoinCategories() {
  const primaryAudiences = [
    {
      id: "parents",
      title: "Parents & Guardians",
      icon: <Users className="h-8 w-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      desc: "Take control of your child's health journey. Track milestones, store secure digital records, and get AI-powered developmental insights.",
      actionText: "Create Free Account",
      href: "/register"
    },
    {
      id: "schools",
      title: "Schools & Educators",
      icon: <School className="h-8 w-8" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      desc: "Streamline student health clearances, securely access emergency medical profiles, and monitor campus-wide wellness trends.",
      actionText: "View School Program",
      href: "#schools"
    },
    {
      id: "healthcare",
      title: "Healthcare Providers",
      icon: <Stethoscope className="h-8 w-8" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      desc: "Join our verified pediatrician network. Issue digital vaccination certificates, offer tele-consults, and access complete patient histories.",
      actionText: "Join Provider Network",
      href: "#providers"
    }
  ];

  const partnerAudiences = [
    {
      id: "business",
      title: "Channel & Business Partners",
      icon: <Handshake className="h-8 w-8" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      desc: "Integrate your health-tech products, pharmacy services, or pediatric insurance offerings directly into the WombTo18 platform.",
      actionText: "Partner With Us",
      href: "#business"
    },
    {
      id: "csr",
      title: "CSR & ESG Partners",
      icon: <Sprout className="h-8 w-8" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      desc: "Invest in the next generation. Sponsor health tracking for underprivileged children or fund our 'Go Green' tree-planting initiative.",
      actionText: "Explore Impact",
      href: "#csr"
    }
  ];

  return (
    <section className="mb-24 w-full">
      {/* Top Row: 3 Core Users */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {primaryAudiences.map((item) => (
          <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-2">
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${item.bgColor} ${item.color} transition-transform group-hover:scale-110`}>
              {item.icon}
            </div>
            <h3 className="mb-3 text-2xl font-medium text-slate-900">{item.title}</h3>
            <p className="mb-8 text-sm font-normal leading-relaxed text-slate-600">{item.desc}</p>
            
            <Link href={item.href} className={`mt-auto inline-flex items-center gap-2 text-sm font-normal ${item.color} transition-colors group-hover:opacity-80`}>
              {item.actionText} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>

      {/* Bottom Row: 2 Strategic Partners (Centered) */}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
        {partnerAudiences.map((item) => (
          <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-2">
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${item.bgColor} ${item.color} transition-transform group-hover:scale-110`}>
              {item.icon}
            </div>
            <h3 className="mb-3 text-2xl font-medium text-slate-900">{item.title}</h3>
            <p className="mb-8 text-sm font-normal leading-relaxed text-slate-600">{item.desc}</p>
            
            <Link href={item.href} className={`mt-auto inline-flex items-center gap-2 text-sm font-normal ${item.color} transition-colors group-hover:opacity-80`}>
              {item.actionText} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}