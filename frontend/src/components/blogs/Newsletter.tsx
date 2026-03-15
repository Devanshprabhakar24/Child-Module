export default function Newsletter() {
  return (
    <section className="mb-10 mt-20 w-full">
      <div className="flex flex-col items-center justify-between gap-12 rounded-[3rem] border border-primary/20 bg-primary/5 p-8 lg:flex-row lg:p-16">
        <div className="max-w-xl text-center lg:text-left">
          <h2 className="mb-4 text-3xl font-normal text-slate-900">Never miss a milestone</h2>
          <p className="text-lg leading-relaxed font-light text-slate-700">
            Join our weekly newsletter for curated health tips, parenting guides, and platform updates delivered straight to your inbox.
          </p>
        </div>
        <form className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
          <input 
            className="flex-1 rounded-2xl border-none bg-white px-6 py-4 text-slate-900 shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-primary" 
            placeholder="Enter your email" 
            type="email" 
            required 
          />
          <button 
            type="submit" 
            className="rounded-2xl bg-primary px-8 py-4 font-medium text-white transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}