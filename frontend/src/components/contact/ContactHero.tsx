import { HeartHandshake } from "lucide-react";

export default function ContactHero() {
  return (
    <section className="mb-12 w-full text-center">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-normal uppercase tracking-widest text-primary">
          <HeartHandshake className="h-4 w-4" /> We're Here For You
        </div>
        <h1 className="mb-6 text-4xl font-normal tracking-tight text-slate-900 md:text-5xl">
          Let's Build a Healthier Future Together.
        </h1>
        <p className="text-lg font-light leading-relaxed text-slate-600 sm:text-xl">
          Whether you need help navigating your child's dashboard, have a question for our pediatric network, or want to partner with us, our team is ready to assist.
        </p>
      </div>
    </section>
  );
}