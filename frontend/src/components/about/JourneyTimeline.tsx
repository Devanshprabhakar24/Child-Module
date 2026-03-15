export default function JourneyTimeline() {
  const milestones = [
    { year: "2020", title: "The Inception", desc: "Founded with a vision to digitize pediatric health records, eliminating lost vaccination cards and scattered prescriptions." },
    { year: "2022", title: "10,000+ Parents Joined", desc: "Launched our mobile-first platform, introducing automated SMS reminders and secure digital vault features." },
    { year: "2024", title: "School Integration", desc: "Partnered with 50+ schools to allow seamless sharing of health clearances and emergency contact data." },
    { year: "Today", title: "A Holistic Ecosystem", desc: "Supporting the complete journey from birth to 18 years, including our new Go Green Initiative and AI milestone tracking." }
  ];

  return (
    <section className="mb-24 w-full">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-4xl font-normal text-slate-900">Our Journey</h2>
        <div className="mx-auto h-1.5 w-20 rounded-full bg-primary"></div>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 font-light">
          From a simple idea to a comprehensive health platform, see how we've grown to support modern parenting.
        </p>
      </div>
      <div className="relative mx-auto max-w-5xl">
        {/* The center line */}
        <div className="absolute left-1/2 hidden h-full w-1 -translate-x-1/2 rounded-full bg-slate-200 md:block"></div>
        
        <div className="space-y-12">
          {milestones.map((item, idx) => (
            <div key={idx} className={`relative flex flex-col items-center md:flex-row ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
              {/* The dot */}
              <div className="absolute left-1/2 z-10 hidden h-6 w-6 -translate-x-1/2 rounded-full border-4 border-slate-50 bg-primary shadow-sm md:block"></div>
              
              <div className={`mb-4 md:mb-0 md:w-1/2 ${idx % 2 !== 0 ? 'md:pl-12 text-left' : 'md:pr-12 md:text-right'}`}>
                <span className="text-3xl font-medium text-primary">{item.year}</span>
              </div>
              
              <div className={`md:w-1/2 ${idx % 2 !== 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-1">
                  <h3 className="mb-3 text-xl font-medium text-slate-900">{item.title}</h3>
                  <p className="leading-relaxed font-light text-slate-600">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}