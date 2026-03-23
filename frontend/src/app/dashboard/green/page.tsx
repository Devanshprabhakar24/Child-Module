"use client";

import { useState, useEffect } from "react";
import { useChildData } from "@/hooks/useChildData";
import GreenHeader from "@/components/dashboard/green/GreenHeader";
import ShareWidget from "@/components/dashboard/green/ShareWidget";
import CreditWidget from "@/components/dashboard/green/CreditWidget";
import TreeRedemptionModal from "@/components/dashboard/green/TreeRedemptionModal";
import SuccessCelebrationModal from "@/components/dashboard/green/SuccessCelebrationModal";
import FloatingCredit, { useFloatingCredit } from "@/components/dashboard/green/FloatingCredit";
import { Award, QrCode, Star, MapPin, BadgeCheck, Loader2, TrendingUp, Check, Sprout, Trees, Camera, X, FileText, TreePine } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Prevent prerendering
export const dynamic = 'force-dynamic';

interface TreeData {
  _id: string;
  treeId: string;
  registrationId: string;
  species: string;
  currentStatus: string;
  plantedDate: string;
  location: string;
  coordinates?: string;
  estimatedCO2Absorption: number;
  growthTimeline: Array<{
    status: string;
    date: string;
    imageUrl?: string;
    notes?: string;
    updatedBy?: string;
  }>;
  currentImageUrl?: string;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
  notes?: string;
}

export default function GoGreenPage() {
  const { loading, error, profile, registrationId, token } = useChildData();
  const [downloading, setDownloading] = useState(false);
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [treeLoading, setTreeLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showTreeModal, setShowTreeModal] = useState(false);
  
  // Credit system state
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [treeRedeemData, setTreeRedeemData] = useState<any>(null);
  const { floatingCredits, showFloatingCredit, removeFloatingCredit } = useFloatingCredit();

  // Listen for tree redemption success
  useEffect(() => {
    const handleTreeRedeemed = (event: CustomEvent) => {
      setTreeRedeemData(event.detail);
      setShowSuccessModal(true);
    };

    const handleOpenRedemption = () => {
      if (registrationId) {
        setShowRedemptionModal(true);
      }
    };

    window.addEventListener('tree-redeemed' as any, handleTreeRedeemed as any);
    window.addEventListener('open-tree-redemption' as any, handleOpenRedemption as any);

    return () => {
      window.removeEventListener('tree-redeemed' as any, handleTreeRedeemed as any);
      window.removeEventListener('open-tree-redemption' as any, handleOpenRedemption as any);
    };
  }, [registrationId]);

  // Fetch tree data
  useEffect(() => {
    if (registrationId) {
      fetchTreeData();
    } else {
      setTreeLoading(false);
    }
  }, [registrationId]);

  const fetchTreeData = async () => {
    if (!registrationId) {
      setTreeLoading(false);
      setApiError('No registration ID found');
      return;
    }

    setApiError(null);
    try {
      const response = await fetch(`${API_BASE}/go-green/tree/registration/${registrationId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTreeData(data.data);
          setApiError(null);
        } else {
          setApiError('No tree data found for this registration');
        }
      } else if (response.status === 404) {
        setApiError('Tree not found for this registration');
      } else {
        setApiError(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiError('Failed to connect to server. Please check if the backend is running.');
    } finally {
      setTreeLoading(false);
    }
  };

  async function handleDownloadCert() {
    if (!registrationId) {
      alert("Registration ID not found. Please refresh the page and try again.");
      return;
    }
    
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/registration/${registrationId}/certificate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Certificate download failed:', res.status, errorText);
        
        if (res.status === 404) {
          alert("Certificate not found. Please contact support.");
        } else if (res.status === 500) {
          alert("Server error while generating certificate. Please try again later.");
        } else {
          alert(`Failed to download certificate (Error ${res.status}). Please try again.`);
        }
        return;
      }
      
      const blob = await res.blob();
      if (blob.size === 0) {
        alert("Certificate file is empty. Please contact support.");
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WombTo18_GoGreen_${registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      // Show success message
      console.log("Certificate downloaded successfully");
      
    } catch (error) {
      console.error('Certificate download error:', error);
      alert("Network error while downloading certificate. Please check your connection and try again.");
    } finally {
      setDownloading(false);
    }
  }

  const childName = profile?.childName || "—";
  const state = treeData?.location || profile?.state || "—";
  const regId = registrationId || "—";
  
  // Get planted date from tree data or derive from registrationId
  const plantedDate = (() => {
    if (treeData?.plantedDate) {
      return new Date(treeData.plantedDate).toLocaleDateString("en-IN", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    }
    if (!registrationId) return "—";
    const parts = registrationId.split("-");
    const ds = parts[2];
    if (!ds || ds.length !== 8) return "—";
    const d = new Date(`${ds.slice(0, 4)}-${ds.slice(4, 6)}-${ds.slice(6, 8)}`);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  })();
  // Helper function to get proper image URL
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `${API_BASE}${imageUrl}`;
    if (imageUrl.includes('go-green')) {
      const filename = imageUrl.split('/').pop();
      return `${API_BASE}/go-green/files/${filename}`;
    }
    return `${API_BASE}${imageUrl}`;
  };

  // Get the latest tree photo or use default
  const getTreeImage = () => {
    if (treeData?.currentImageUrl) {
      const url = getImageUrl(treeData.currentImageUrl);
      if (url) return url;
    }
    
    // Check growth timeline for latest image
    if (treeData?.growthTimeline && treeData.growthTimeline.length > 0) {
      // Sort by date to get the latest stage
      const sortedTimeline = [...treeData.growthTimeline].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      for (const stage of sortedTimeline) {
        if (stage.imageUrl) {
          const url = getImageUrl(stage.imageUrl);
          if (url) return url;
        }
      }
    }
    
    return "https://images.unsplash.com/photo-1625758476104-f2ed6c81248f?q=80&w=1770&auto=format&fit=crop";
  };

  return (
    <div className="mx-auto w-full max-w-8xl">
      <GreenHeader />

      {/* Credit Widget */}
      {registrationId && (
        <section className="mb-8">
          <CreditWidget
            registrationId={registrationId}
            onCreditsEarned={(amount) => {
              showFloatingCredit(amount);
            }}
          />
        </section>
      )}

      {/* Impact Stats */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-3xl font-bold text-primary">1</span>
          <span className="text-sm font-medium text-slate-600">Tree Planted</span>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-full rounded-full bg-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-3xl font-bold text-primary">15 kg</span>
          <span className="text-sm font-medium text-slate-600">CO₂ Offset (est.)</span>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-1/3 rounded-full bg-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-3xl font-bold text-primary">500 L</span>
          <span className="text-sm font-medium text-slate-600">Water Saved (est.)</span>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-1/4 rounded-full bg-primary" />
          </div>
        </div>
      </section>
      {(loading || treeLoading) && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your tree information...
        </div>
      )}

      {!loading && !treeLoading && apiError && apiError.includes('Failed to connect') && (
        <div className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Loader2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-orange-900">Connecting to Tree Database</h3>
              <p className="mt-2 text-sm text-orange-700">
                We're working to connect to our tree database. Your tree information will appear shortly.
              </p>
              <button
                onClick={fetchTreeData}
                className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tree Info Section */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Tree Details */}
        <div className="flex flex-col gap-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
              className="h-56 w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${getTreeImage()}')` }}
            />
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-medium text-slate-900">
                    {treeData ? `Tree Planted for ${childName}` : `Tree Being Prepared for ${childName}`}
                  </h3>
                  <p className="mt-1 text-sm font-normal text-primary">
                    {treeData?.treeId || `Reg ID: ${regId}`}
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
                  treeData?.currentStatus === 'VERIFIED' 
                    ? 'bg-green-100 text-green-600'
                    : treeData?.currentStatus === 'MATURE'
                    ? 'bg-purple-100 text-purple-600'
                    : treeData?.currentStatus === 'GROWING'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {treeData?.currentStatus || 'Preparing'}
                </div>
              </div>
              <div className="mb-8 grid grid-cols-2 gap-y-6 text-sm">
                <div className="flex flex-col">
                  <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Species</span>
                  <span className="text-slate-900">{treeData?.species || 'Neem (Azadirachta indica)'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">State</span>
                  <span className="text-slate-900">{state}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Planted Date</span>
                  <span className="text-slate-900">{plantedDate || 'To be scheduled'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">Guardian</span>
                  <span className="text-slate-900">WombTo18 Team</span>
                </div>
              </div>
              
              {!treeData && (
                <div className="rounded-lg bg-blue-50 p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">🌱 Your Tree Journey Begins Soon!</h4>
                  <p className="text-sm text-blue-800">
                    We're preparing to plant a tree in honor of {childName}. You'll receive updates with photos as your tree grows!
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setShowTreeModal(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <MapPin className="h-4 w-4" /> Check Status
                </button>
                <button
                  onClick={handleDownloadCert}
                  disabled={downloading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {downloading ? "Downloading..." : "Download Cert"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Certificate + Share */}
        <div className="flex flex-col gap-8">
          {/* Certificate Card */}
          <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 sm:p-8">
            <div className="relative w-full overflow-hidden rounded-xl border-4 border-white bg-white p-8 text-center shadow-lg">
              <div className="absolute -right-8 -top-8 text-primary opacity-5">
                <Award className="h-40 w-40" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="mb-2 text-xl font-medium italic text-slate-900">
                  {treeData ? 'Certificate of Planting' : 'Certificate of Commitment'}
                </h4>
                <p className="mb-6 max-w-xs text-xs font-normal text-slate-500">
                  {treeData 
                    ? 'This certifies that a tree has been planted in the honor of'
                    : 'This certifies our commitment to plant a tree in honor of'
                  }
                </p>
                <h5 className="mb-8 text-3xl font-semibold text-primary">{childName}</h5>
                <div className="flex w-full items-end justify-between border-t border-slate-100 pt-6 text-left">
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-widest text-slate-400">WombTo18 Go Green</p>
                    <p className="text-xs font-medium text-slate-900">Green Cohort Member</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 p-1">
                    <QrCode className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-white shadow-lg shadow-primary/20">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium tracking-tight">Proud Member of Green Cohort</span>
            </div>
          </div>
          <ShareWidget />
        </div>
      </div>
      {/* Tree Details Modal */}
      {showTreeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Tree Growth Timeline</h3>
                  <p className="text-gray-600">
                    {treeData?.treeId || `Tree for ${childName}`} - {childName}
                  </p>
                </div>
                <button
                  onClick={() => setShowTreeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Current Tree Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tree Image */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <img 
                        src={getTreeImage()}
                        alt={`Tree for ${childName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1625758476104-f2ed6c81248f?q=80&w=400&auto=format&fit=crop";
                        }}
                      />
                    </div>
                  </div>
                  {/* Tree Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                        treeData?.currentStatus === 'VERIFIED' 
                          ? 'bg-green-100 text-green-800'
                          : treeData?.currentStatus === 'MATURE'
                          ? 'bg-purple-100 text-purple-800'
                          : treeData?.currentStatus === 'GROWING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {treeData?.currentStatus || 'Preparing for Planting'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Species</label>
                      <p className="text-gray-900 mt-1">{treeData?.species || 'Neem (Azadirachta indica)'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CO₂ Absorption</label>
                      <p className="text-gray-900 mt-1">{treeData?.estimatedCO2Absorption || 40} kg/year (estimated)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900 mt-1">{state}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Planted Date</label>
                      <p className="text-gray-900 mt-1">{plantedDate || 'To be scheduled'}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Growth Timeline */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Timeline
                </h4>
                
                {treeData?.growthTimeline && treeData.growthTimeline.length > 0 ? (
                  <div className="space-y-4">
                    {treeData.growthTimeline
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((stage, index) => (
                      <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                        {/* Timeline Indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${
                            stage.status === 'VERIFIED' 
                              ? 'bg-green-500'
                              : stage.status === 'MATURE'
                              ? 'bg-purple-500'
                              : stage.status === 'GROWING'
                              ? 'bg-blue-500'
                              : 'bg-primary'
                          }`}></div>
                          {index < treeData.growthTimeline.length - 1 && (
                            <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                          )}
                        </div>

                        {/* Stage Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              stage.status === 'VERIFIED' 
                                ? 'bg-green-100 text-green-800'
                                : stage.status === 'MATURE'
                                ? 'bg-purple-100 text-purple-800'
                                : stage.status === 'GROWING'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {stage.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(stage.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {stage.imageUrl && (
                            <div className="mb-3">
                              <img 
                                src={getImageUrl(stage.imageUrl) || "https://images.unsplash.com/photo-1625758476104-f2ed6c81248f?q=80&w=400&auto=format&fit=crop"} 
                                alt={`Tree at ${stage.status} stage`}
                                className="w-32 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1625758476104-f2ed6c81248f?q=80&w=400&auto=format&fit=crop";
                                }}
                              />
                            </div>
                          )}

                          {stage.notes && (
                            <p className="text-gray-700 text-sm mb-2">{stage.notes}</p>
                          )}

                          {stage.updatedBy && (
                            <p className="text-xs text-gray-500">Updated by {stage.updatedBy}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <TreePine className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Tree Preparation in Progress</p>
                        <p className="text-sm">Your tree will be planted soon and photos will appear here as it grows</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadCert}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    {downloading ? "Downloading..." : "Download Certificate"}
                  </button>
                  <button
                    onClick={() => setShowTreeModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tree Redemption Modal */}
      {registrationId && (
        <TreeRedemptionModal
          registrationId={registrationId}
          childName={profile?.childName || 'Child'}
          isOpen={showRedemptionModal}
          onClose={() => setShowRedemptionModal(false)}
          onSuccess={(data) => {
            setTreeRedeemData(data);
            setShowSuccessModal(true);
          }}
        />
      )}

      {/* Success Celebration Modal */}
      <SuccessCelebrationModal
        isOpen={showSuccessModal}
        treeData={treeRedeemData}
        onClose={() => {
          setShowSuccessModal(false);
          setTreeRedeemData(null);
        }}
      />

      {/* Floating Credit Animations */}
      {floatingCredits.map((credit) => (
        <FloatingCredit
          key={credit.id}
          amount={credit.amount}
          x={credit.x}
          y={credit.y}
          onComplete={() => removeFloatingCredit(credit.id)}
        />
      ))}
    </div>
  );
}