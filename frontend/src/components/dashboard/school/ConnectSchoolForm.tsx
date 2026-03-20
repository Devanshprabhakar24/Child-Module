"use client";

import { Building2, Search, FileText, Bell, Contact, Image, TrendingUp, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { INDIAN_STATES_SCHOOLS, getDistrictsByState, getSchoolsByDistrict, searchSchools } from "@/data/schools";
import AddSchoolRequestModal from "./AddSchoolRequestModal";
import RequestSentModal from "./RequestSentModal";

export default function ConnectSchoolForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showRequestSentModal, setShowRequestSentModal] = useState(false);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");

  // Get districts based on selected state
  const districts = useMemo(() => {
    return selectedState ? getDistrictsByState(selectedState) : [];
  }, [selectedState]);

  // Get schools based on selected state and district
  const schools = useMemo(() => {
    return selectedState && selectedDistrict 
      ? getSchoolsByDistrict(selectedState, selectedDistrict) 
      : [];
  }, [selectedState, selectedDistrict]);

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchSchools(searchQuery).slice(0, 10); // Limit to 10 results
  }, [searchQuery]);

  // Handle state change
  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedDistrict(""); // Reset district
    setSelectedSchool(""); // Reset school
  };

  // Handle district change
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedSchool(""); // Reset school
  };

  // Handle school selection
  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchool(schoolId);
    // Find and store the school name
    const school = schools.find((s) => s.id === schoolId);
    if (school) {
      setSelectedSchoolName(school.name);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchool && selectedSchoolName) {
      setShowRequestSentModal(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Connect Your School Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Connect Your School</h3>
            <p className="text-xs text-slate-500">Find and link your school to access features</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Find School Search */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Find School</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Search for registered schools..."
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((school) => (
                    <button
                      key={school.id}
                      type="button"
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      onClick={() => {
                        setSearchQuery(school.name);
                        setSelectedSchool(school.id);
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="font-medium text-slate-900">{school.name}</div>
                      <div className="text-xs text-slate-500">{school.type} School</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* State Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">State</label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select State</option>
                {INDIAN_STATES_SCHOOLS.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* District Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">District</label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedState}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Select School Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Select School</label>
            <div className="relative">
              <select
                value={selectedSchool}
                onChange={(e) => handleSchoolChange(e.target.value)}
                disabled={!selectedDistrict}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select School</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.type})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!selectedSchool}
            className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600 shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Request Link Access
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Can't find your school?{" "}
          <button
            type="button"
            onClick={() => setShowAddSchoolModal(true)}
            className="font-medium text-emerald-600 hover:underline"
          >
            Contact Admin
          </button>{" "}
          to add it
        </p>

        {/* Connection Benefits */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Connection Benefits</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-xs text-slate-600">View school health records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-xs text-slate-600">HPS checkup notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100">
                <Contact className="h-4 w-4 text-pink-600" />
              </div>
              <span className="text-xs text-slate-600">Emergency contact access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Image className="h-4 w-4 text-slate-600" />
              </div>
              <span className="text-xs text-slate-600">Class photo memories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why Connect Your School? */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-slate-900">Why Connect Your School?</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Health Records Sync</h4>
              <p className="text-xs text-slate-500">Access your child school health checkup history and track their growth over time</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-amber-50">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Smart Notifications</h4>
              <p className="text-xs text-slate-500">Get instant alerts for upcoming health checkups and vaccination drives</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-100 to-pink-50">
              <Contact className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Emergency Access</h4>
              <p className="text-xs text-slate-500">Quick one-click emergency contact to school administration when needed</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50">
              <Image className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Class Memories</h4>
              <p className="text-xs text-slate-500">View and download class photos, event pictures, and special moments</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-50">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Health Ambassador</h4>
              <p className="text-xs text-slate-500">Connect with your school health ambassador for guidance and support</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Growth Tracking</h4>
              <p className="text-xs text-slate-500">Monitor your child health metrics and development milestones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add School Request Modal */}
      <AddSchoolRequestModal isOpen={showAddSchoolModal} onClose={() => setShowAddSchoolModal(false)} />

      {/* Request Sent Modal */}
      <RequestSentModal
        isOpen={showRequestSentModal}
        onClose={() => setShowRequestSentModal(false)}
        schoolName={selectedSchoolName}
      />
    </div>
  );
}
