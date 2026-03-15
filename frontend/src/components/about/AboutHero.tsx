export default function AboutHero() {
  return (
    <section className="mb-16 w-full">
      <div 
        className="relative flex min-h-[450px] flex-col justify-end overflow-hidden rounded-[2.5rem] bg-cover bg-center shadow-xl" 
        style={{ backgroundImage: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.2) 80%), url("https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=1770&auto=format&fit=crop")' }}
      >
        <div className="relative z-10 max-w-3xl p-8 md:p-12">
          <span className="mb-6 inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-normal uppercase tracking-widest text-white shadow-lg shadow-primary/30">
            About Our Mission
          </span>
          <h1 className="mb-6 text-4xl font-medium tracking-tight text-white md:text-5xl lg:text-6xl">
            Empowering Every Child's Journey from Birth to Adulthood
          </h1>
          <p className="text-lg font-light leading-relaxed text-slate-200 sm:text-xl">
            WombTo18 is dedicated to bridging the gap in healthcare and development tracking for children during their most critical formative years.
          </p>
        </div>
      </div>
    </section>
  );
}