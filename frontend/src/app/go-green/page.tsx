"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TreePine, 
  Leaf, 
  Download, 
  Search, 
  MapPin, 
  Calendar, 
  Award,
  Users,
  TrendingUp,
  Eye,
  ExternalLink
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface TreeData {
  treeId: string;
  registrationId: string;
  childName: string;
  motherName: string;
  species: string;
  status: string;
  plantedDate: string;
  location: string;
  estimatedCO2Absorption: number;
  plantingPartner: string;
}

interface GoGreenStats {
  totalTrees: number;
  totalCO2Absorption: number;
  treesByStatus: Record<string, number>;
  treesBySpecies: Record<string, number>;
  recentTrees: TreeData[];
}

export default function GoGreenPage() {
  const [stats, setStats] = useState<GoGreenStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/go-green/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to load Go Green stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/go-green/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const downloadCertificate = async (registrationId: string) => {
    try {
      const res = await fetch(`${API_BASE}/registration/${registrationId}/certificate`);
      if (!res.ok) throw new Error("Failed to download certificate");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WombTo18_GoGreen_${registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANTED': return 'bg-green-100 text-green-800';
      case 'GROWING': return 'bg-blue-100 text-blue-800';
      case 'MATURE': return 'bg-purple-100 text-purple-800';
      case 'VERIFIED': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <TreePine className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-green-700">Loading Go Green Initiative...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TreePine className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">WombTo18 Go Green Initiative</h1>
                  <p className="text-sm text-gray-600">Growing a greener future, one child at a time</p>
                </div>
              </div>
            </div>
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
              <div className="flex items-center gap-3">
                <TreePine className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Trees Planted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrees.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
              <div className="flex items-center gap-3">
                <Leaf className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">CO₂ Absorption</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCO2Absorption.toLocaleString()} kg/year</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Children Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrees.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Verified Trees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.treesByStatus.VERIFIED || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Your Tree</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by child name, registration ID, or tree ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || searchQuery.length < 2}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((tree) => (
                  <div key={tree.treeId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{tree.childName}</h4>
                        <p className="text-sm text-gray-600">Child of {tree.motherName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tree.status)}`}>
                        {tree.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <TreePine className="h-4 w-4" />
                        <span>{tree.treeId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{tree.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(tree.plantedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTree(tree)}
                        className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => downloadCertificate(tree.registrationId)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Trees */}
        {stats && stats.recentTrees.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recently Planted Trees</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.recentTrees.map((tree) => (
                <div key={tree.treeId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{tree.childName}</h4>
                      <p className="text-sm text-gray-600">Child of {tree.motherName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tree.status)}`}>
                      {tree.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <TreePine className="h-4 w-4" />
                      <span>{tree.species}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{tree.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      <span>{tree.estimatedCO2Absorption} kg CO₂/year</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTree(tree)}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => downloadCertificate(tree.registrationId)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Tree Details Modal */}
      {selectedTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedTree.childName}'s Tree</h3>
                  <p className="text-gray-600">Child of {selectedTree.motherName}</p>
                </div>
                <button
                  onClick={() => setSelectedTree(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tree ID</label>
                    <p className="text-lg font-mono text-gray-900">{selectedTree.treeId}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                    <p className="text-gray-900">{selectedTree.species}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTree.status)}`}>
                      {selectedTree.status}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Planted Date</label>
                    <p className="text-gray-900">{new Date(selectedTree.plantedDate).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{selectedTree.location}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CO₂ Absorption</label>
                    <p className="text-gray-900">{selectedTree.estimatedCO2Absorption} kg/year</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Planting Partner</label>
                    <p className="text-gray-900">{selectedTree.plantingPartner}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration ID</label>
                    <p className="text-sm font-mono text-gray-600">{selectedTree.registrationId}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => downloadCertificate(selectedTree.registrationId)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Certificate
                </button>
                <button
                  onClick={() => setSelectedTree(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}