"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userName, setUserName] = useState("Parent");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wt18_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.fullName) setUserName(u.fullName);
      }
    } catch {}
  }, []);

  // Automatically close mobile menu if window resizes to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-background-light font-display text-slate-900">
      
      {/* Mobile Dark Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar 
        isDesktopCollapsed={isDesktopCollapsed} 
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
        toggleDesktop={() => setIsDesktopCollapsed(!isDesktopCollapsed)} // Moved here!
      />
      
      {/* Content wrapper adjusts left margin on desktop, stays 0 on mobile */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ml-0 ${isDesktopCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        
        <DashboardHeader toggleMobile={() => setIsMobileOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Greeting is hidden on desktop header, so we show it here on mobile */}
            <div className="block lg:hidden">
              <h2 className="text-2xl font-medium text-slate-800">Hello, {userName}! 👋</h2>
              <p className="text-sm text-slate-500">Welcome back to your health portal.</p>
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}