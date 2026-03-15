import { ClipboardList, Stethoscope, FileText } from "lucide-react";

export default function AssessmentTools() {
  const tools = [
    {
      title: "M-CHAT Screening",
      desc: "Modified Checklist for Autism in Toddlers. A scientifically validated tool available directly in your dashboard for the 18-24 month window.",
      icon: <ClipboardList className="h-6 w-6" />
    },
    {
      title: "Pediatrician Export",
      desc: "Instantly generate a beautiful, formatted PDF report of all logged milestones to share with your doctor before checkups.",
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Tele-Consult Integration",
      desc: "If a milestone is flagged as delayed, book an integrated video consultation with a verified pediatric specialist instantly.",
      icon: <Stethoscope className="h-6 w-6" />
    }
  ];

  return (
    <section className="mb-20 w-full">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-normal text-slate-900">Clinical-Grade Tools at Home</h2>
        <p className="mx-auto max-w-2xl font-light text-lg text-slate-600">
          We equip parents with the same standardized assessment tools used by pediatricians worldwide.
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-3">
        {tools.map((tool, idx) => (
          <div key={idx} className="flex flex-col rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-colors hover:border-primary/30 hover:bg-white">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
              {tool.icon}
            </div>
            <h3 className="mb-3 text-xl font-normal text-slate-900">{tool.title}</h3>
            <p className="text-sm leading-relaxed font-light text-slate-600">{tool.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}