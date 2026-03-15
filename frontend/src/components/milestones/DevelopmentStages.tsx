import { Baby, School, GraduationCap, CheckCircle2 } from "lucide-react";

export default function DevelopmentStages() {
  const stages = [
    {
      id: "early",
      title: "Early Years (0-5)",
      icon: <Baby className="h-8 w-8" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      desc: "The critical foundation phase focusing on rapid brain development, motor skills, and primary immunizations.",
      features: ["Fine & Gross Motor Skills", "Speech & Language Logging", "Teething & Sleep Patterns", "WHO Growth Charts"]
    },
    {
      id: "growth",
      title: "Growth Phase (6-12)",
      icon: <School className="h-8 w-8" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      desc: "Transitioning into structured learning, focusing on cognitive abilities, social skills, and school health records.",
      features: ["Cognitive Assessments", "BMI & Nutrition Tracking", "School Health Clearances", "Vision & Hearing Logs"]
    },
    {
      id: "transition",
      title: "Transition Phase (13-18)",
      icon: <GraduationCap className="h-8 w-8" />,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      desc: "Guiding teenagers through puberty, mental wellness challenges, and preparing their health profile for adulthood.",
      features: ["Puberty Milestones", "Mental Wellness Checks", "HPV & Teen Vaccines", "Adult Health Transition"]
    }
  ];

  return (
    <section className="mb-24 mt-16 w-full">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-normal text-slate-900 md:text-4xl">The Complete Journey</h2>
        <div className="mx-auto h-1.5 w-20 rounded-full bg-primary"></div>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-slate-600">
          We break down 18 years of complex medical and developmental data into manageable, age-appropriate phases.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {stages.map((stage) => (
          <div key={stage.id} className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-2">
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${stage.bgColor} ${stage.color} transition-transform group-hover:scale-110`}>
              {stage.icon}
            </div>
            <h3 className="mb-3 text-2xl font-normal text-slate-900">{stage.title}</h3>
            <p className="mb-8 text-sm leading-relaxed font-light text-slate-600">{stage.desc}</p>
            
            <div className="mt-auto space-y-3 border-t border-slate-50 pt-6">
              <h4 className="text-xs font-normal uppercase tracking-wider text-slate-400">What you track:</h4>
              {stage.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className={`h-4 w-4 ${stage.color}`} />
                  <span className="text-sm font-light text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}