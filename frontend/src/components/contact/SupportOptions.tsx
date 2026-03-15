import { AlertTriangle, LifeBuoy, Handshake } from "lucide-react";
import Link from "next/link";

export default function SupportOptions() {
  const options = [
    {
      title: "Medical Emergency",
      desc: "Do not use the contact form. If you require immediate medical assistance, use the Emergency Dashboard.",
      icon: <AlertTriangle className="h-6 w-6" />,
      actionText: "Open Emergency Connect",
      href: "/dashboard", // Links them to dashboard where the red button lives
      color: "red"
    },
    {
      title: "Help Center & FAQs",
      desc: "Find quick answers to common questions about vaccination schedules, profile linking, and app features.",
      icon: <LifeBuoy className="h-6 w-6" />,
      actionText: "Visit Help Center",
      href: "#",
      color: "primary"
    },
    {
      title: "Partner With Us",
      desc: "Are you a school administrator or hospital director? Let's integrate your institution with WombTo18.",
      icon: <Handshake className="h-6 w-6" />,
      actionText: "View Partnership Plans",
      href: "#",
      color: "blue"
    }
  ];

  return (
    <section className="mb-20 w-full">
      <div className="grid gap-6 md:grid-cols-3">
        {options.map((opt, idx) => (
          <div key={idx} className="flex flex-col rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${
              opt.color === 'red' ? 'bg-red-50 text-red-500' : 
              opt.color === 'blue' ? 'bg-blue-50 text-blue-500' : 
              'bg-primary/10 text-primary'
            }`}>
              {opt.icon}
            </div>
            <h3 className="mb-3 text-xl font-medium text-slate-900">{opt.title}</h3>
            <p className="mb-8 text-sm leading-relaxed font-normal text-slate-600">{opt.desc}</p>
            <Link 
              href={opt.href}
              className={`mt-auto inline-flex items-center gap-2 text-sm font-normal ${
                opt.color === 'red' ? 'text-red-500 hover:text-red-600' : 
                opt.color === 'blue' ? 'text-blue-500 hover:text-blue-600' : 
                'text-primary hover:text-primary/80'
              }`}
            >
              {opt.actionText} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}