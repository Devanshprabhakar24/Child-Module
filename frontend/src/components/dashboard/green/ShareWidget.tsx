"use client";

import { MessageCircle, ThumbsUp, Mail, Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareWidget() {
  const [copied, setCopied] = useState(false);

  const shareMessage = "I'm making a positive environmental impact with WombTo18's Go Green initiative! Join me in planting trees for a better future. 🌱🌍";
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wombto18.com';

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(shareMessage + '\n\n' + shareUrl);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Join WombTo18 Go Green Initiative');
    const body = encodeURIComponent(shareMessage + '\n\nLearn more: ' + shareUrl);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h4 className="mb-5 text-xs font-medium uppercase tracking-wider text-slate-400">Spread the word</h4>

      <div className="grid grid-cols-4 gap-4">
        <button 
          onClick={handleWhatsAppShare}
          className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50"
          title="Share on WhatsApp"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm hover:brightness-110 transition-all">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-normal text-slate-700">WhatsApp</span>
        </button>

        <button 
          onClick={handleFacebookShare}
          className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50"
          title="Share on Facebook"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm hover:brightness-110 transition-all">
            <ThumbsUp className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-normal text-slate-700">Facebook</span>
        </button>

        <button 
          onClick={handleEmailShare}
          className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50"
          title="Share via Email"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:brightness-110 transition-all">
            <Mail className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-normal text-slate-700">Email</span>
        </button>

        <button 
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50"
          title={copied ? "Link copied!" : "Copy link"}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all ${
            copied 
              ? 'bg-emerald-500 text-white' 
              : 'bg-slate-200 text-slate-600 hover:brightness-95'
          }`}>
            {copied ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <Share2 className="h-6 w-6" />
            )}
          </div>
          <span className="text-[10px] font-normal text-slate-700">
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </button>
      </div>
    </div>
  );
}
