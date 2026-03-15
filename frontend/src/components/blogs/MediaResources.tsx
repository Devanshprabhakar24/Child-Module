import { FileArchive, Image as ImageIcon, Download, ExternalLink, Quote } from "lucide-react";

export default function MediaResources() {
  return (
    <section className="relative w-full overflow-hidden rounded-[3rem] bg-slate-900 p-8 text-white shadow-2xl lg:p-16">
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-[100px]"></div>
      
      <div className="relative z-10 grid grid-cols-1 gap-16 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-5">
          <div>
            <h2 className="mb-6 text-3xl font-normal lg:text-4xl">Press & Media</h2>
            <p className="text-lg font-light leading-relaxed text-slate-300">
              Covering the future of digital child healthcare? We've compiled everything you need for accurate reporting and high-quality assets.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="group cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                    <FileArchive className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-normal">Official Press Kit 2026</h4>
                    <p className="mt-1 text-sm font-light text-slate-400">Logos, boilerplate, and fact sheets (PDF/ZIP)</p>
                  </div>
                </div>
                <button className="rounded-full bg-white/10 p-3 text-white transition-colors group-hover:bg-primary">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="group cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-notmal">Media Gallery</h4>
                    <p className="mt-1 text-sm font-light text-slate-400">High-res app screenshots & lifestyle photos</p>
                  </div>
                </div>
                <button className="rounded-full bg-white/10 p-3 text-white transition-colors group-hover:bg-primary">
                  <ExternalLink className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8">
            <p className="mb-4 text-xs font-normal uppercase tracking-[0.2em] text-primary">Media Inquiries</p>
            <p className="text-xl font-normal">press@wombto18.in</p>
            <p className="mt-1 font-medium text-slate-400">+91 98765 43210</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-12 lg:col-span-7">
          <h3 className="text-xs font-normal uppercase tracking-[0.2em] text-primary">In the News</h3>
          
          <div className="grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-12 opacity-70 md:grid-cols-3">
            {/* Publisher Logos / Text placehholders */}
            <div className="group flex flex-col items-center gap-1">
              <span className="cursor-default text-2xl font-black tracking-tighter text-white/80 transition-colors group-hover:text-white">
                TECH<span className="font-medium text-primary">HEALTH</span>
              </span>
            </div>
            <div className="group flex flex-col items-center gap-1">
              <span className="cursor-default font-serif text-xl italic text-white/80 transition-colors group-hover:text-white">The Daily Parent</span>
            </div>
            <div className="group flex flex-col items-center gap-1">
              <span className="cursor-default text-2xl font-bold tracking-tight text-white/80 transition-colors group-hover:text-white">
                Vanguard<span className="text-pink-500">.</span>
              </span>
            </div>
            <div className="group flex flex-col items-center gap-1">
              <span className="cursor-default border-b-2 border-emerald-500 pb-1 font-mono text-lg font-bold uppercase text-white/80 transition-colors group-hover:text-white">Med Express</span>
            </div>
            <div className="group flex flex-col items-center gap-1">
              <span className="cursor-default text-2xl font-black tracking-widest text-white/80 transition-colors group-hover:text-white">METRO</span>
            </div>
            <div className="group flex flex-col items-center gap-1">
              <span className="cursor-default text-xl font-bold italic text-white/80 transition-colors group-hover:text-white">WorldToday</span>
            </div>
          </div>
          
          <div className="relative mt-auto rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-sm lg:p-12">
            <Quote className="absolute -left-2 -top-5 h-16 w-16 text-primary opacity-40" />
            <blockquote className="relative z-10 mb-8 text-xl font-light italic leading-relaxed text-slate-200 lg:text-2xl">
              "WombTo18 is revolutionizing how parents track their children's health milestones. It is the comprehensive digital health passport every child deserves."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-12 w-1.5 rounded-full bg-primary"></div>
              <div>
                <cite className="text-lg font-normal not-italic text-white">Dr. Anjali Verma</cite>
                <p className="font-normal text-primary">Chief Editor, Pediatric Health Digest</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}