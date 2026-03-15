import Link from "next/link";
import { Mail } from "lucide-react";

export default function JoinCTA() {
  return (
    <section className="mb-10 w-full">
      <div className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border border-primary/20 bg-primary/5 p-8 text-center sm:p-16 lg:flex-row lg:text-left">
        <div className="max-w-2xl">
          <h2 className="mb-4 text-3xl font-medium text-slate-900">Ready to transform child healthcare?</h2>
          <p className="text-lg leading-relaxed font-light text-slate-700">
            If you represent a school, hospital, or corporation and want to discuss custom integration or CSR sponsorships, our partnership team is ready to talk.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
          <Link 
            href="/contact" 
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-light text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-primary/90"
          >
            <Mail className="h-5 w-5" />
            Contact Partnerships
          </Link>
        </div>
      </div>
    </section>
  );
}