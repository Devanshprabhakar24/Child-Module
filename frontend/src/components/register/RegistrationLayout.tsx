import Link from "next/link";

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background-light font-display text-slate-900">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white px-6 py-4 md:px-20">
        <Link href="/" className="flex items-center gap-4 text-primary">
          
          <h2 className="text-xl font-medium leading-tight tracking-tight text-slate-900">WombTo18</h2>
        </Link>
        <Link href="/" className="flex flex-1 items-center justify-end gap-4">
          <span className="hidden text-sm font-medium text-slate-500 md:block">Need help?</span>
          {/* <div 
            className="h-10 w-10 rounded-full border-2 border-primary/20 bg-cover bg-center bg-no-repeat" 
            title="User profile placeholder" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAEUzqkGDRxzu_6FU_lEZrNOEkiHtZF7HdRH8qqma_6QPyfMP3JNad_qSagpCe_8frDDa2y4O1V4P2k_sA9ZAVGn2rbV2RYwwvVQSsBs7D888W0A1vJ5ylBXhahGCmmcSvwvlhPJNBdy0T-YqdZTcyWGWuytUcpX4oar79nvdYi4DSTYLU91SownZFzQwksb10dK9T_Vo70FaUYkjQANGBLHzfwGwVDVpvtVMbH3s1cM6ncWeDl1dperYq8ilquHoPzvLoqd8DBpWIP")' }}
          /> */}
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="w-full max-w-[800px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {children}
        </div>

        <div className="mt-8 flex items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined text-primary">security</span>
          <p className="text-sm">Your data is encrypted and secure with health-grade standards.</p>
        </div>
      </main>
    </div>
  );
}