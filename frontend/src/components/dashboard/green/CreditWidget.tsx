"use client";

import { useState, useEffect } from 'react';
import { Sprout, Trees, TrendingUp, Award, History, HelpCircle, Leaf } from 'lucide-react';

interface CreditWidgetProps {
  registrationId: string;
  onCreditsEarned?: (amount: number) => void;
}

interface TierInfo {
  level: string;
  badgeIcon: string;
  color: string;
  minCredits: number;
  maxCredits: number;
}

interface CreditData {
  total: number;
  current: number;
  level: string;
  nextTreeAt: number;
  treesPlanted: number;
  co2Offset: number;
  lastCreditDate?: string;
}

interface TierProgress {
  current: string;
  next: string | null;
  progress: number;
  creditsForNextTier: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    credits: CreditData;
    tier: TierProgress;
  };
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function CreditWidget({ registrationId, onCreditsEarned }: CreditWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<CreditData | null>(null);
  const [tier, setTier] = useState<TierProgress | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (registrationId) {
      fetchCredits();
    }
  }, [registrationId, refreshKey]);

  // Listen for credit update events (from other components)
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent<{ amount: number }>) => {
      if (onCreditsEarned) {
        onCreditsEarned(event.detail.amount);
      }
      // Refresh credits after a short delay
      setTimeout(() => fetchCredits(), 1000);
    };

    const handleRefreshCredits = () => {
      fetchCredits();
    };

    window.addEventListener('credit-update' as any, handleCreditUpdate as any);
    window.addEventListener('refresh-credits' as any, handleRefreshCredits as any);
    return () => {
      window.removeEventListener('credit-update' as any, handleCreditUpdate as any);
      window.removeEventListener('refresh-credits' as any, handleRefreshCredits as any);
    };
  }, [onCreditsEarned]);

  const fetchCredits = async () => {
    try {
      const token = localStorage.getItem('wt18_token');
      if (!token || !registrationId) {
        setLoading(false);
        return;
      }

      console.log('Fetching credits for:', registrationId);
      
      const response = await fetch(`${API_BASE}/go-green/credits/${registrationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Credit API response status:', response.status);

      if (response.ok) {
        const result: ApiResponse = await response.json();
        console.log('Credit data:', result.data);
        setCredits(result.data.credits);
        setTier(result.data.tier);
      } else {
        console.error('Failed to fetch credits:', response.status);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchCredits();
  };

  const getTierIcon = (level: string) => {
    const icons: Record<string, string> = {
      SEEDLING: '🌱',
      SAPLING: '🌿',
      YOUNG: '🌳',
      MATURE: '🌲',
      GUARDIAN: '🌴',
      FOREST: '🏆',
    };
    return icons[level] || '🌱';
  };

  const getTierColor = (level: string) => {
    const colors: Record<string, string> = {
      SEEDLING: 'text-slate-500',
      SAPLING: 'text-emerald-600',
      YOUNG: 'text-blue-600',
      MATURE: 'text-amber-600',
      GUARDIAN: 'text-purple-600',
      FOREST: 'text-pink-600',
    };
    return colors[level] || 'text-slate-500';
  };

  const getTierBgColor = (level: string) => {
    const colors: Record<string, string> = {
      SEEDLING: 'bg-slate-500',
      SAPLING: 'bg-emerald-500',
      YOUNG: 'bg-blue-500',
      MATURE: 'bg-amber-500',
      GUARDIAN: 'bg-purple-500',
      FOREST: 'bg-pink-500',
    };
    return colors[level] || 'bg-slate-500';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!credits || !tier) {
    return null;
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Leaf className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Green Credits</h3>
              <p className="text-xs text-slate-500">Earn credits, plant trees, save the planet</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600"
              title="Refresh Credits"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setShowGuide(true)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="How to Earn Credits"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="View History"
            >
              <History className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Credit Display */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Total Credits */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <Sprout className="h-4 w-4" />
              <span className="text-xs font-medium">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-emerald-900">{credits.total.toLocaleString()}</p>
          </div>

          {/* Current Tier */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <Award className="h-4 w-4" />
              <span className="text-xs font-medium">Current Level</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getTierIcon(tier.current)}</span>
              <p className="text-lg font-bold text-slate-900">{tier.current}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Progress to {tier.next || 'Forest Creator'}
            </span>
            <span className="text-xs font-medium text-slate-600">{tier.progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getTierBgColor(tier.current)}`}
              style={{ width: `${Math.min(100, tier.progress)}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-slate-600">
            🎯 <span className="font-semibold">{tier.creditsForNextTier.toLocaleString()}</span> more credits to reach next tier
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
          <div className="text-center">
            <Trees className={`mx-auto mb-1 h-5 w-5 ${getTierColor(credits.level)}`} />
            <p className="text-lg font-bold text-slate-900">{credits.treesPlanted}</p>
            <p className="text-[10px] text-slate-500">Trees Planted</p>
          </div>
          <div className="text-center">
            <TrendingUp className="mx-auto mb-1 h-5 w-5 text-cyan-600" />
            <p className="text-lg font-bold text-slate-900">{credits.co2Offset}</p>
            <p className="text-[10px] text-slate-500">kg CO₂/Year</p>
          </div>
          <div className="text-center">
            <Leaf className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
            <p className="text-lg font-bold text-slate-900">{credits.current.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">Available</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-tree-redemption'))}
            disabled={credits.current < 500}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🌳 Plant Tree
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            History
          </button>
        </div>
      </div>

      {/* Credit History Modal */}
      {showHistory && (
        <CreditHistoryModal
          registrationId={registrationId}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* How to Earn Guide Modal */}
      {showGuide && (
        <CreditGuideModal
          onClose={() => setShowGuide(false)}
        />
      )}
    </>
  );
}

// Credit History Modal Component
function CreditHistoryModal({ registrationId, onClose }: { registrationId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [registrationId]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('wt18_token');
      const response = await fetch(`${API_BASE}/go-green/credits/${registrationId}/history?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      VACCINATION: '💉',
      HEALTH_RECORD: '📄',
      ENGAGEMENT: '🌱',
      BONUS: '🎁',
      REDEMPTION: '🌳',
    };
    return icons[type] || '📄';
  };

  const getTypeColor = (type: string, amount: number) => {
    if (amount < 0) return 'text-red-600 bg-red-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Credit History</h3>
            <p className="text-sm text-slate-500">Track all your credit earnings and redemptions</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4 max-h-[60vh]">
          {loading ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <p className="mt-2 text-sm text-slate-500">Loading history...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <History className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">No transactions yet</p>
              <p className="mt-1 text-xs text-slate-500">Start earning credits by completing vaccinations!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div
                  key={tx._id || index}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTypeColor(tx.type, tx.amount)}`}>
                      <span className="text-lg">{getTypeIcon(tx.type)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{tx.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${tx.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {tx.amount < 0 ? '-' : '+'}{Math.abs(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-500">Balance: {tx.balanceAfter}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Credit Guide Modal Component
function CreditGuideModal({ onClose }: { onClose: () => void }) {
  const earningMethods = [
    {
      icon: '💉',
      title: 'Vaccinations',
      items: [
        { action: '1st Vaccine (Birth)', credits: 50 },
        { action: '2nd-4th Vaccines', credits: 100 },
        { action: '5th-6th Vaccines', credits: 150 },
        { action: 'Series Complete Bonus', credits: 200 },
      ],
    },
    {
      icon: '📄',
      title: 'Health Records',
      items: [
        { action: 'Upload Record', credits: 10 },
        { action: 'Growth Check', credits: 25 },
        { action: 'Annual Checkup', credits: 50 },
      ],
    },
    {
      icon: '🌱',
      title: 'Engagement',
      items: [
        { action: 'Share Certificate', credits: 5 },
        { action: 'Complete Profile', credits: 50 },
        { action: 'Refer a Friend', credits: 100 },
        { action: 'Login Streak (7 days)', credits: 25 },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">How to Earn Credits</h3>
            <p className="text-sm text-slate-500">Complete actions to earn credits and plant trees</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4 max-h-[60vh]">
          <div className="space-y-6">
            {earningMethods.map((method, index) => (
              <div key={index}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{method.icon}</span>
                  <h4 className="text-lg font-bold text-slate-900">{method.title}</h4>
                </div>
                <div className="space-y-2">
                  {method.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm text-slate-700">{item.action}</span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        +{item.credits}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tree Redemption Info */}
          <div className="mt-6 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-900">
              🌳 Tree Redemption
            </h4>
            <div className="space-y-2 text-xs text-emerald-700">
              <div className="flex items-center justify-between">
                <span>🌿 Sapling (Neem)</span>
                <span className="font-bold">500 credits</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🌳 Young (Peepal)</span>
                <span className="font-bold">1,000 credits</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🌲 Mature (Banyan)</span>
                <span className="font-bold">2,000 credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
