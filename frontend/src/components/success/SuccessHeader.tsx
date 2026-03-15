import Link from "next/link";

export default function SuccessHeader() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-primary/10 bg-white px-6 py-4 md:px-10">
      <Link href="/" className="flex items-center gap-3">
        
        <h2 className="text-xl font-medium leading-tight tracking-tight text-slate-900">WombTo18</h2>
      </Link>
      
      <div className="flex gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary/20">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary/20">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}