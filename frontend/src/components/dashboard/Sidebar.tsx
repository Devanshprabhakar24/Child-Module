"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Syringe,
  FileText,
  Sparkles,
  School,
  Trees,
  Settings,
  X,
  Menu,
} from "lucide-react";

interface SidebarProps {
  isDesktopCollapsed: boolean;
  isMobileOpen: boolean;
  closeMobile: () => void;
  toggleDesktop: () => void;
}

export default function Sidebar({ isDesktopCollapsed, isMobileOpen, closeMobile, toggleDesktop }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Vaccination Tracker", icon: Syringe, href: "/dashboard/vaccinations" },
    { name: "Health Records", icon: FileText, href: "/dashboard/records" },
    { name: "Milestones", icon: Sparkles, href: "/dashboard/milestones" },
    { name: "School", icon: School, href: "/dashboard/school" },
    { name: "Go Green", icon: Trees, href: "/dashboard/green" },
  ];

  return (
    <aside 
      className={`
        fixed bottom-0 top-0 z-50 flex flex-col bg-white transition-transform duration-300 ease-in-out
        
        /* MOBILE VIEW */
        right-0 w-[85%] max-w-sm rounded-l-2xl shadow-2xl lg:rounded-none lg:shadow-none
        ${isMobileOpen ? "translate-x-0" : "translate-x-full"} 
        
        /* DESKTOP VIEW */
        lg:left-0 lg:right-auto lg:translate-x-0 lg:border-r lg:border-primary/10 lg:z-20
        ${isDesktopCollapsed ? "lg:w-20" : "lg:w-72"} 
      `}
    >
      {/* Top Header & Toggle Buttons */}
      <div className={`flex h-[73px] items-center border-b border-primary/10 transition-all ${isDesktopCollapsed ? "lg:justify-center" : "px-6 justify-between"}`}>
        
        {/* Logo (Hidden on desktop when collapsed) */}
        <div className={`flex items-center gap-3 ${isDesktopCollapsed ? "lg:hidden" : ""}`}>
          
          <h1 className="text-xl font-medium tracking-tight text-slate-800">
            WombTo18
          </h1>
        </div>
        
        {/* Mobile Close Button */}
        <button onClick={closeMobile} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 lg:hidden">
          <X className="h-5 w-5" />
        </button>

        {/* Desktop Collapse/Expand Toggle Button */}
        <button
          onClick={toggleDesktop}
          className={`hidden lg:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 ${isDesktopCollapsed ? "" : "ml-auto"}`}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Child Profile Mini-Card */}
      {/* <div className={`mx-4 mb-6 mt-6 rounded-full border border-primary/10 bg-primary/5 p-4 transition-all ${isDesktopCollapsed ? "lg:mx-2 lg:p-2" : ""}`}>
        <div className={`flex items-center gap-3 ${isDesktopCollapsed ? "lg:justify-center" : ""}`}>
          <div 
            className="h-12 w-12 shrink-0 rounded-full border-2 border-primary bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554622965-bfaeff35e57f?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
          />
          <div className={`overflow-hidden ${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
            <p className="truncate text-sm font-bold text-slate-900">Aarav Sharma</p>
            <p className="text-xs font-medium text-slate-500">Primary Ward</p>
          </div>
        </div>
      </div> */}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-4 pt-4">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              onClick={closeMobile}
              title={isDesktopCollapsed ? item.name : ""}
              className={`flex items-center gap-4 rounded-r-full px-4 py-3 transition-colors lg:py-2
                ${isActive
                  ? "bg-primary font-normal text-white shadow-md shadow-primary/20"
                  : "font-normal text-slate-600 hover:bg-primary/10 hover:text-primary"}
                ${isDesktopCollapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""}`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={`whitespace-nowrap ${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        <div className="my-6 border-t border-slate-100 lg:my-4"></div>

        <Link href="/dashboard/settings" title={isDesktopCollapsed ? "Settings" : ""} className={`flex items-center gap-4 rounded-xl px-4 py-3.5 font-normal text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:py-2.5 ${isDesktopCollapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""}`}>
          <Settings className="h-5 w-5 shrink-0" />
          <span className={isDesktopCollapsed ? "lg:hidden" : "block"}>Settings</span>
        </Link>
      </nav>

      {/* Bottom Status Panel */}
      <div className="mt-auto p-4">
        <div className={`flex flex-col gap-2 rounded-2xl  p-4 transition-all ${isDesktopCollapsed ? "lg:items-center lg:px-2 lg:py-1 lg:rounded-full" : "rounded-full"}`}>
          <p className={`text-center text-[10px] font-medium uppercase tracking-wider text-primary ${isDesktopCollapsed ? "lg:hidden" : "block"}`}>
            Active Subscription
          </p>
          <button
            title={isDesktopCollapsed ? "Green Cohort Member" : ""}
            className={`flex items-center justify-center gap-2 rounded-xl bg-primary font-medium text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 ${isDesktopCollapsed ? "lg:h-10 lg:w-10 lg:p-0 lg:rounded-full" : "w-full py-3 text-sm lg:rounded-full"}`}
          >
            <span className={isDesktopCollapsed ? "lg:hidden" : "block"}>Green Cohort Member</span>
            <span>🌱</span>
          </button>
        </div>
      </div>
    </aside>
  );
}