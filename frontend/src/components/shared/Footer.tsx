import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white py-24 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">WombTo18</h2>
            </div>
            <p className="text-base font-light text-slate-800 leading-relaxed">
              A registered organization dedicated to securing the future form birth to  the next generation through end-to-end support systems.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white transition-all">
                <span className="material-symbols-outlined">share</span>
              </Link>
              <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-[var(--brand-pink)] hover:bg-[var(--brand-pink)] hover:text-white transition-all">
                <span className="material-symbols-outlined">alternate_email</span>
              </Link>
              <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[var(--brand-green)] hover:bg-[var(--brand-green)] hover:text-white transition-all">
                <span className="material-symbols-outlined">rss_feed</span>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-slate-900">Programs</h4>
            <ul className="space-y-4 text-base font-normal text-slate-500">
              <li><Link href="#" className="hover:text-[var(--brand-blue)]">Maternal Health</Link></li>
              <li><Link href="#" className="hover:text-[var(--brand-pink)]">Early Education</Link></li>
              <li><Link href="#" className="hover:text-[var(--brand-yellow)]">Teen Skill Center</Link></li>
              <li><Link href="#" className="hover:text-[var(--brand-green)]">Scholarship Fund</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-slate-900">Transparency</h4>
            <ul className="space-y-4 text-base font-normal text-slate-500">
              <li><Link href="#" className="hover:text-[var(--brand-blue)]">Annual Reports</Link></li>
              <li><Link href="#" className="hover:text-[var(--brand-pink)]">Certifications</Link></li>
              <li><Link href="#" className="hover:text-[var(--brand-yellow)]">Financial Audit</Link></li>
              <li><Link href="#" className="hover:text-[var(--brand-green)]">Impact Stories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-slate-900">Contact</h4>
            <ul className="space-y-4 text-base font-normal text-slate-500">
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-[var(--brand-blue)] text-lg">mail</span> contact@wombto18.org</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-[var(--brand-pink)] text-lg">call</span> +1 (555) 000-1234</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-[var(--brand-green)] text-lg">location_on</span> Mumbai HQ, India</li>
            </ul>
          </div>
        </div>
        <div className="mt-24 border-t border-slate-100 pt-12 text-center text-sm font-normal text-slate-400">
          <p>© 2026 WombTo18. All rights reserved. </p>
        </div>
      </div>
    </footer>
  );
}