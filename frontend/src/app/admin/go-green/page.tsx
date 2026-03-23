"use client";

import { useState, useEffect } from "react";
import { 
  TreePine, 
  Leaf, 
  Upload, 
  Search, 
  MapPin, 
  Calendar, 
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Camera,
  FileText,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

interface TreeData {
  treeId: string;
  registrationId: string;
  childName: string;
  motherName: string;
  species: string;
  currentStatus: string;
  plantedDate: string;
  location: string;
  estimatedCO2Absorption: number;
  plantingPartner: string;
  currentImageUrl?: string;
  notes?: string;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
  growthTimeline: Array<{
    status: string;
    date: string;
    imageUrl?: string;
    notes?: string;
    updatedBy?: string;
  }>;
}

interface GoGreenStats {
  totalTrees: number;
  totalCO2Absorption: number;
  treesByStatus: Record<string, number>;
  treesBySpecies: Record<string, number>;
  recentTrees: TreeData[];
}

const TREE_STATUSES = [
  { value: 'PLANTED', label: 'Planted', color: 'bg-green-100 text-green-800' },
  { value: 'SAPLING', label: 'Sapling', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'GROWING', label: 'Growing', color: 'bg-blue-100 text-blue-800' },
  { value: 'MATURE', label: 'Mature', color: 'bg-purple-100 text-purple-800' },
  { value: 'VERIFIED', label: 'Verified', color: 'bg-emerald-100 text-emerald-800' },
];

export default function AdminGoGreenPage() {
  const [stats, setStats] = useState<GoGreenStats | null>(null);
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [editingTree, setEditingTree] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState<string | null>(null);
  
  // Form states
  const [newStatus, setNewStatus] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('wt18_token');
      
      if (!token) {
        console.error('No authentication token found');
        window.location.href = '/admin/login';
        return;
      }
      
      const [statsRes, treesRes] = await Promise.all([
        fetch(`${API_BASE}/go-green/stats`),
        fetch(`${API_BASE}/go-green/admin/trees`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      // Check for authentication errors
      if (treesRes.status === 401) {
        console.error('Authentication failed');
        localStorage.removeItem('wt18_token');
        localStorage.removeItem('wt18_user');
        window.location.href = '/admin/login';
        return;
      }

      const [statsData, treesData] = await Promise.all([
        statsRes.json(),
        treesRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (treesData.success) setTrees(treesData.data.trees);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/go-green/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setTrees(data.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const updateTreeStatus = async (treeId: string) => {
    if (!newStatus) return;

    try {
      const token = localStorage.getItem('wt18_token');
      const res = await fetch(`${API_BASE}/go-green/admin/tree/${treeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          imageUrl: newImageUrl || undefined,
          notes: newNotes || undefined,
          updatedBy: 'Admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setTrees(prev => prev.map(tree => 
          tree.treeId === treeId ? { ...tree, ...data.data } : tree
        ));
        setEditingTree(null);
        setNewStatus("");
        setNewImageUrl("");
        setNewNotes("");
        alert("Tree status updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update tree:", error);
      alert("Failed to update tree status");
    }
  };

  const addGrowthStage = async (treeId: string) => {
    if (!newImageUrl) {
      alert("Please provide an image URL");
      return;
    }

    try {
      const token = localStorage.getItem('wt18_token');
      const res = await fetch(`${API_BASE}/go-green/admin/tree/${treeId}/growth-stage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: newImageUrl,
          notes: newNotes || undefined,
          updatedBy: 'Admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setTrees(prev => prev.map(tree => 
          tree.treeId === treeId ? { ...tree, ...data.data } : tree
        ));
        setNewImageUrl("");
        setNewNotes("");
        alert("Growth stage added successfully!");
      }
    } catch (error) {
      console.error("Failed to add growth stage:", error);
      alert("Failed to add growth stage");
    }
  };

  const loadTreeTimeline = async (treeId: string) => {
    try {
      const token = localStorage.getItem('wt18_token');
      const res = await fetch(`${API_BASE}/go-green/admin/tree/${treeId}/timeline`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setSelectedTree(data.data);
        setShowTimeline(treeId);
      }
    } catch (error) {
      console.error("Failed to load timeline:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = TREE_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const testUpload = async (file: File) => {
    try {
      const token = localStorage.getItem('wt18_token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('Testing upload with file:', file.name);

      const response = await fetch(`${API_BASE}/go-green/admin/test-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Test upload response:', data);

      if (response.ok) {
        alert(`Test upload successful! File: ${data.filename}`);
      } else {
        alert(`Test upload failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Test upload error:', error);
      alert('Test upload failed');
    }
  };

  const handleImageUpload = async (file: File, treeId: string) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('wt18_token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only JPG and PNG files are allowed.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size too large. Maximum size is 5MB.');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notes', newNotes || '');
      formData.append('updatedBy', 'Admin');

      console.log('Uploading file:', file.name, 'for tree:', treeId);

      const response = await fetch(`${API_BASE}/go-green/admin/tree/${treeId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload successful:', data);
        setNewImageUrl(data.imageUrl);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000); // Hide success message after 3 seconds
        alert("Image uploaded successfully!");
        loadData(); // Refresh the data
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Upload failed:', errorData);
        alert(`Upload failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TreePine className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-700">Loading Go Green Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TreePine className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Go Green Management</h1>
                <p className="text-sm text-gray-600">Manage tree planting and growth tracking</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <TreePine className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Trees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Leaf className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">CO₂ Absorption</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCO2Absorption} kg/yr</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Verified Trees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.treesByStatus.VERIFIED || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Growing Trees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.treesByStatus.GROWING || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by child name, registration ID, or tree ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>
        {/* Trees Management Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trees Management</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tree Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location & Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trees.map((tree) => (
                  <tr key={tree.treeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {tree.currentImageUrl ? (
                          <img 
                            src={tree.currentImageUrl.startsWith('http') ? tree.currentImageUrl : `${API_BASE}${tree.currentImageUrl}`} 
                            alt="Tree" 
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TreePine className="h-6 w-6 text-green-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tree.treeId}</p>
                          <p className="text-sm text-gray-500">{tree.species}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tree.childName}</p>
                        <p className="text-sm text-gray-500">Child of {tree.motherName}</p>
                        <p className="text-xs text-gray-400">{tree.registrationId}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tree.currentStatus)}`}>
                        {tree.currentStatus}
                      </span>
                      {tree.lastUpdatedBy && (
                        <p className="text-xs text-gray-400 mt-1">
                          Updated by {tree.lastUpdatedBy}
                        </p>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3" />
                        <span>{tree.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(tree.plantedDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadTreeTimeline(tree.treeId)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Timeline
                        </button>
                        <button
                          onClick={() => {
                            setEditingTree(tree.treeId);
                            setNewStatus(tree.currentStatus);
                            setNewImageUrl(tree.currentImageUrl || "");
                            setNewNotes(tree.notes || "");
                          }}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Tree Modal */}
      {editingTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Update Tree Status</h3>
                <button
                  onClick={() => {
                    setEditingTree(null);
                    setNewStatus("");
                    setNewImageUrl("");
                    setNewNotes("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tree Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {TREE_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tree Photo
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && editingTree) handleImageUpload(file, editingTree);
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                          uploading 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : uploadSuccess
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <Camera className="h-4 w-4" />
                        {uploading ? "Uploading..." : uploadSuccess ? "Upload Successful!" : "Upload Photo"}
                      </label>
                      
                      {/* Test Upload Button */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) testUpload(file);
                        }}
                        className="hidden"
                        id="test-upload"
                      />
                      <label
                        htmlFor="test-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        Test Upload
                      </label>
                    </div>
                    {newImageUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                        <img 
                          src={newImageUrl.startsWith('http') || newImageUrl.startsWith('blob:') ? newImageUrl : `${API_BASE}${newImageUrl}`} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            console.error('Image failed to load:', newImageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about the tree's condition, growth, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => updateTreeStatus(editingTree)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    Update Status
                  </button>
                  <button
                    onClick={() => addGrowthStage(editingTree)}
                    disabled={!newImageUrl}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                    Add Growth Stage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Tree Timeline Modal */}
      {showTimeline && selectedTree && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Tree Growth Timeline</h3>
                  <p className="text-gray-600">{selectedTree.treeId} - {selectedTree.childName}</p>
                </div>
                <button
                  onClick={() => {
                    setShowTimeline(null);
                    setSelectedTree(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Current Tree Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTree.currentStatus)}`}>
                      {selectedTree.currentStatus}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Species</label>
                    <p className="text-gray-900">{selectedTree.species}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CO₂ Absorption</label>
                    <p className="text-gray-900">{selectedTree.estimatedCO2Absorption} kg/year</p>
                  </div>
                </div>
              </div>

              {/* Growth Timeline */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Timeline
                </h4>
                
                {selectedTree.growthTimeline && selectedTree.growthTimeline.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTree.growthTimeline
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((stage, index) => (
                      <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                        {/* Timeline Indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(stage.status).replace('text-', 'bg-').replace('100', '500')}`}></div>
                          {index < selectedTree.growthTimeline.length - 1 && (
                            <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                          )}
                        </div>

                        {/* Stage Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stage.status)}`}>
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
                            <img 
                              src={stage.imageUrl} 
                              alt={`Tree at ${stage.status} stage`}
                              className="w-32 h-32 object-cover rounded-lg mb-2"
                            />
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
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No growth timeline recorded yet</p>
                    <p className="text-sm">Add photos and updates to track this tree's growth</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowTimeline(null);
                      setEditingTree(selectedTree.treeId);
                      setNewStatus(selectedTree.currentStatus);
                      setNewImageUrl(selectedTree.currentImageUrl || "");
                      setNewNotes(selectedTree.notes || "");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Edit className="h-4 w-4" />
                    Update Tree
                  </button>
                  <button
                    onClick={() => {
                      setShowTimeline(null);
                      setSelectedTree(null);
                    }}
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
    </div>
  );
}