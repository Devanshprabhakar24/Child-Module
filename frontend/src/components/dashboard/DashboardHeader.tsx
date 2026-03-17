"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Menu, LogOut, User, AlertTriangle, Syringe, FileText } from "lucide-react";
import EmergencyModal from "./EmergencyModal";

interface HeaderProps {
  toggleMobile: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function DashboardHeader({ toggleMobile }: HeaderProps) {
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userName, setUserName] = useState("Parent");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1554622965-bfaeff35e57f?q=80&w=1770&auto=format&fit=crop");

  useEffect(() => {
    async function loadProfilePicture() {
      // Only access localStorage on the client side
      if (typeof window === 'undefined') return;
      
      try {
        const raw = localStorage.getItem("wt18_user");
        const token = localStorage.getItem("wt18_token");
        
        if (raw) {
          const u = JSON.parse(raw);
          if (u.email) setUserEmail(u.email);
          // Don't set userName from user account, we'll get it from child profile
        }

        // Fetch child's profile and use mother's name
        if (token) {
          const familyRes = await fetch(`${API_BASE}/dashboard/family`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (familyRes.ok) {
            const familyJson = await familyRes.json();
            const kids = familyJson.data?.children || familyJson.data || [];
            const firstChild = kids[0];
            
            if (firstChild?.profilePictureUrl) {
              setAvatarUrl(firstChild.profilePictureUrl);
            }
            
            // Use mother's name from child profile instead of user account name
            if (firstChild?.motherName) {
              setUserName(firstChild.motherName);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load profile picture:", error);
      }
    }

    loadProfilePicture();
  }, []);
  
  // Refs for the dropdowns to handle "click outside" to close
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-primary/10 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-8">
        
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          {/* Mobile Brand Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">WombTo18</h1>
          </div>

          {/* Desktop Greeting */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-slate-800 lg:text-2xl">Hello, {userName}! 👋</h2>
            <p className="text-sm text-slate-500">Welcome back to your health portal.</p>
          </div>
        </div>
        
        {/* RIGHT SIDE (Actions & Mobile Hamburger) */}
        <div className="flex items-center gap-3 sm:gap-6">
          
          <button 
            onClick={() => setIsEmergencyOpen(true)}
            className="flex items-center gap-2 rounded-full bg-red-500 px-3 py-2 font-medium text-white shadow-lg transition-all hover:scale-105 active:scale-95 sm:px-6 sm:py-2.5" 
            style={{ animation: "pulse 2s infinite", boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" }}
          >
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden text-sm sm:inline">EMERGENCY</span>
          </button>
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsDropdownOpen(false); // Close profile if open
              }}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 sm:flex"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
            </button>

            {/* Notification Menu Overlay */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-80 origin-top-right overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <button className="text-xs font-medium text-primary hover:underline">Mark all as read</button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {/* Unread Notification */}
                  <div className="flex cursor-pointer items-start gap-3 border-b border-slate-50 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Syringe className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Vaccination Due</p>
                      <p className="mt-0.5 text-xs text-slate-600">Aarav's Pentavalent-1 vaccine is due today.</p>
                      <p className="mt-1 text-[10px] font-bold text-primary">10 mins ago</p>
                    </div>
                  </div>
                  
                  {/* Read Notification */}
                  <div className="flex cursor-pointer items-start gap-3 border-b border-slate-50 p-4 transition-colors hover:bg-slate-50">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">New Health Record</p>
                      <p className="mt-0.5 text-xs text-slate-600">Dr. Sharma uploaded a new prescription.</p>
                      <p className="mt-1 text-[10px] font-medium text-slate-400">2 hours ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 p-2 text-center">
                  <button className="w-full rounded-lg py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotificationOpen(false); // Close notifications if open
              }}
              className="block h-9 w-9 shrink-0 rounded-full border-2 border-transparent bg-cover bg-center transition-all focus:border-primary focus:outline-none sm:h-10 sm:w-10" 
              style={{ backgroundImage: `url('${avatarUrl}')` }}
            />
            
            {/* Dropdown Menu Overlay */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 origin-top-right overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{userName}</p>
                  <p className="truncate text-xs font-medium text-slate-500">{userEmail || "Parent Account"}</p>
                </div>
                
                <div className="p-2">
                  <button 
                    onClick={() => {setIsDropdownOpen(false)
                      window.location.href = "/dashboard/settings";
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </button>
                  
                  {/* Redirects or handles signout logic */}
                  <button 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem("wt18_token");
                        localStorage.removeItem("wt18_user");
                        window.location.href = "/login";
                      }
                    }}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={toggleMobile}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <EmergencyModal 
        isOpen={isEmergencyOpen} 
        onClose={() => setIsEmergencyOpen(false)} 
      />
    </>
  );
}