import { MessageCircle, ThumbsUp, Mail, Share2 } from "lucide-react";

export default function ShareWidget() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h4 className="mb-5 text-xs font-medium uppercase tracking-wider text-slate-400">Spread the word</h4>

      <div className="grid grid-cols-4 gap-4">
        <button className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm hover:brightness-110">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-normal text-slate-700">WhatsApp</span>
        </button>

        <button className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm hover:brightness-110">
            <ThumbsUp className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-normal text-slate-700">Facebook</span>
        </button>

        <button className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:brightness-110">
            <Mail className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-normal text-slate-700">Email</span>
        </button>

        <button className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 shadow-sm hover:brightness-95">
            <Share2 className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-normal text-slate-700">Copy Link</span>
        </button>
      </div>
    </div>
  );
}
