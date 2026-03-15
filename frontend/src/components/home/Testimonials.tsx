export default function Testimonials() {
  const testimonials = [
    {
      quote: "Managing vaccination schedules used to be a nightmare. WombTo18 has made it so simple and stress-free. The reminders are a lifesaver!",
      name: "Priya Sharma",
      role: "Parent of 2-year-old"
    },
    {
      quote: "As a working parent, having all medical records in one place is incredible. My doctor can access them instantly. Highy recommend.",
      name: "Rahul Verma",
      role: "Parent of 8-year-old"
    },
    {
      quote: "The developmental tracking for my teenager has been very insightful. It helps us understand and support her better through these transition years.",
      name: "Ananya Gupta",
      role: "Parent of 14-year-old"
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-medium text-slate-900">Voices of Happy Parents</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="p-8 bg-slate-50 rounded-[2rem] relative border border-slate-100">
              {/* Large quote mark in the background */}
              <span className="material-symbols-outlined text-6xl text-primary/10 absolute top-4 right-8 pointer-events-none">
                format_quote
              </span>
              
              {/* Star Rating */}
              <div className="flex gap-1 text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              
              <p className="text-slate-700 italic mb-8 leading-relaxed">"{testimonial.quote}"</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}