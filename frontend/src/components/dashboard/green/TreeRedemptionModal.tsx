"use client";

import { useState, useEffect } from 'react';
import { X, Trees, Sprout, TrendingUp, Award, CheckCircle } from 'lucide-react';

interface TreeRedemptionModalProps {
  registrationId: string;
  childName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

interface TreeOption {
  tier: string;
  treeType: string;
  creditsRequired: number;
  co2Absorption: number;
  certificate: string;
  canRedeem: boolean;
  creditsNeeded: number;
}

interface CreditData {
  currentCredits: number;
  availableTrees: TreeOption[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TreeRedemptionModal({
  registrationId,
  childName,
  isOpen,
  onClose,
  onSuccess,
}: TreeRedemptionModalProps) {
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [dedicateTo, setDedicateTo] = useState(childName);

  useEffect(() => {
    if (isOpen && registrationId) {
      fetchTreeOptions();
    }
  }, [isOpen, registrationId]);

  const fetchTreeOptions = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('wt18_token');
      const response = await fetch(`${API_BASE}/go-green/tree/options?registrationId=${registrationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCreditData(result.data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load tree options');
      }
    } catch (error) {
      console.error('Error fetching tree options:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedTier) return;

    setRedeeming(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('wt18_token');
      
      console.log('🌳 Redeeming tree:', {
        registrationId,
        tier: selectedTier,
        dedicateTo,
        location: 'India',
      });
      
      const response = await fetch(`${API_BASE}/go-green/tree/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          registrationId,
          tier: selectedTier,
          dedicateTo,
          location: 'India', // Default location
        }),
      });

      const result = await response.json();
      
      console.log('🌳 Redemption response:', result);

      if (response.ok && result.success) {
        console.log('✅ Tree redeemed successfully:', result.data);
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('tree-redeemed', {
          detail: result.data,
        }));
        
        // Dispatch refresh credits event
        window.dispatchEvent(new CustomEvent('refresh-credits'));

        // Call success callback
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        // Close modal
        onClose();
        
        // Show success message
        alert(`🎉 Success! ${result.data.message}\n\nTree ID: ${result.data.treeId}\nCredits Used: ${result.data.creditsUsed}\nRemaining: ${result.data.remainingCredits}`);
      } else {
        const errorMessage = result.message || 'Failed to redeem tree';
        console.error('❌ Redemption failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error redeeming tree:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const getTierIcon = (tier: string) => {
    const icons: Record<string, string> = {
      SAPLING: '🌿',
      YOUNG: '🌳',
      MATURE: '🌲',
      GUARDIAN: '🌴',
      FOREST: '🏆',
    };
    return icons[tier] || '🌱';
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      SAPLING: 'from-emerald-500 to-teal-500',
      YOUNG: 'from-blue-500 to-cyan-500',
      MATURE: 'from-amber-500 to-orange-500',
      GUARDIAN: 'from-purple-500 to-pink-500',
      FOREST: 'from-pink-500 to-rose-500',
    };
    return colors[tier] || 'from-slate-500 to-gray-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="absolute -bottom-10 left-8 flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl">
                🌳
              </div>
            </div>
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white">Plant a Tree</h2>
              <p className="text-emerald-100">Redeem your credits for a real tree</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-8 pb-8 pt-14 max-h-[calc(90vh-160px)]">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              <p className="mt-4 text-sm text-slate-500">Loading tree options...</p>
            </div>
          ) : !creditData ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <span className="text-3xl">❌</span>
              </div>
              <p className="text-lg font-semibold text-slate-900">Failed to load tree options</p>
              <p className="mt-2 text-sm text-slate-500">{error || 'Please try again later'}</p>
              <button
                onClick={fetchTreeOptions}
                className="mt-4 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-red-900">Error</h4>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
              {/* Current Credits */}
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Your Current Balance</p>
                      <p className="text-2xl font-bold text-emerald-900">{creditData.currentCredits.toLocaleString()} credits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600">Dedicate to</p>
                    <input
                      type="text"
                      value={dedicateTo}
                      onChange={(e) => setDedicateTo(e.target.value)}
                      className="mt-1 w-48 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Tree Options */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Choose Your Tree</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {creditData.availableTrees.map((tree) => (
                    <div
                      key={tree.tier}
                      onClick={() => tree.canRedeem && setSelectedTier(tree.tier)}
                      className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                        selectedTier === tree.tier
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20'
                          : tree.canRedeem
                          ? 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
                          : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      {/* Selected Indicator */}
                      {selectedTier === tree.tier && (
                        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}

                      {/* Header */}
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getTierColor(tree.tier)} text-2xl text-white shadow-lg`}>
                            {getTierIcon(tree.tier)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{tree.tier}</h4>
                            <p className="text-xs text-slate-500">{tree.treeType}</p>
                          </div>
                        </div>
                        {!tree.canRedeem && (
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                            🔒 Locked
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-slate-50 p-2">
                          <div className="flex items-center gap-1 text-slate-600">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-xs">CO₂ Offset</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{tree.co2Absorption} kg/year</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Award className="h-3.5 w-3.5" />
                            <span className="text-xs">Certificate</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{tree.certificate}</p>
                        </div>
                      </div>

                      {/* Cost */}
                      <div className="flex items-center justify-between">
                        <div>
                          {tree.canRedeem ? (
                            <p className="text-sm font-bold text-emerald-600">
                              ✅ Available
                            </p>
                          ) : (
                            <p className="text-sm font-medium text-red-600">
                              Need {tree.creditsNeeded.toLocaleString()} more credits
                            </p>
                          )}
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                          {tree.creditsRequired.toLocaleString()} credits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-900">
                  ℹ️ What Happens Next?
                </h4>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>🌱 Your tree will be planted within 30 days</li>
                  <li>📍 You'll receive GPS coordinates and photos</li>
                  <li>📜 A certificate will be generated instantly</li>
                  <li>🎉 Credits will be deducted from your balance</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={!selectedTier || redeeming}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {redeeming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Processing...
                    </span>
                  ) : (
                    `Plant ${selectedTier ? getTierIcon(selectedTier) : ''} Tree`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
