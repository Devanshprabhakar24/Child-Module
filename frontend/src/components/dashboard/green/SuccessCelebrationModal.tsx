"use client";

import { useEffect, useState } from 'react';
import { Award, Download, Share2, Trees, X } from 'lucide-react';

interface SuccessCelebrationModalProps {
  isOpen: boolean;
  treeData: any;
  onClose: () => void;
}

export default function SuccessCelebrationModal({
  isOpen,
  treeData,
  onClose,
}: SuccessCelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Auto-hide confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShare = async (platform: string) => {
    const text = `🌳 I just planted a ${treeData?.tier} tree in ${treeData?.dedicateTo || 'my child'}'s name! Join me in making a difference. #WombTo18 #GoGreen`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (!isOpen || !treeData) return null;

  return (
    <>
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: ['#10b981', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-5xl shadow-lg">
                🎉
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Congratulations!</h2>
            <p className="mt-2 text-emerald-100">
              A tree will be planted in {treeData.dedicateTo || 'your child'}'s name!
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Tree Details Card */}
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-2xl text-white shadow-lg">
                    🌳
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Tree Planted Successfully</h3>
                    <p className="text-sm text-slate-500">{treeData.treeId}</p>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700">
                  {treeData.tier}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-slate-500">Species</p>
                  <p className="text-sm font-bold text-slate-900">{treeData.species || 'Neem'}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-slate-500">CO₂ Offset</p>
                  <p className="text-sm font-bold text-slate-900">{treeData.co2Absorption || 15} kg/year</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-slate-500">Certificate</p>
                  <p className="text-sm font-bold text-slate-900">{treeData.certificateTier || 'Bronze'}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-slate-500">Planting Date</p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(treeData.estimatedPlantingDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Remaining Credits */}
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-700">Remaining Credits</p>
              <p className="text-2xl font-bold text-blue-900">{treeData.remainingCredits || 0} 🌱</p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => window.open(treeData.certificateUrl, '_blank')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50"
              >
                <Download className="h-5 w-5" />
                Download Certificate
              </button>

              <div>
                <p className="mb-3 text-center text-sm font-medium text-slate-600">Share your achievement</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex-1 rounded-xl bg-green-500 py-3 font-semibold text-white transition-colors hover:bg-green-600"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex-1 rounded-xl bg-sky-500 py-3 font-semibold text-white transition-colors hover:bg-sky-600"
                  >
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
