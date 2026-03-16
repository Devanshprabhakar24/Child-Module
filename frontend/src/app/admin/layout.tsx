"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Syringe,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  Edit3,
  TreePine,
  ChevronRight,
  Shield,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/vaccinations", icon: Syringe, label: "Vaccinations" },
  { href: "/admin/children", icon: Users, label: "Children" },
  { href: "/admin/go-green", icon: TreePine, label: "Go Green" },
  { href: "/admin/health-records", icon: FileText, label: "Health Records" },
  { href: "/admin/cms", icon: Edit3, label: "Content (CMS)" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Skip auth check for login page
    if (isLoginPage) {
      setChecking(false);
      setIsAuthorized(true);
      return;
    }

    // Check if user is admin
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem("wt18_user");
        const token = localStorage.getItem("wt18_token");

        if (!token || !raw) {
          window.location.href = "/admin/login";
          return;
        }

        const user = JSON.parse(raw);

        if (user.role !== "ADMIN") {
          alert("Access denied. Admin privileges required.");
          window.location.href = "/login";
          return;
        }

        if (user.fullName) setAdminName(user.fullName);
        setIsAuthorized(true);
      } catch {
        window.location.href = "/admin/login";
      } finally {
        setChecking(false);
      }
    }
  }, [isLoginPage, pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("wt18_token");
      localStorage.removeItem("wt18_user");
      window.location.href = "/admin/login";
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // Render login page without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-slate-100 bg-white transition-all duration-300 lg:static lg:h-full ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo Section */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex items-center gap-3">
            
            {!isCollapsed && (
              <span className="text-lg font-semibold text-slate-900">WombTo18</span>
            )}
          </div>
          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 lg:flex"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group relative flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "text-slate-600 hover:bg-slate-100"
                } ${isCollapsed ? "lg:justify-center lg:px-2.5" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? "" : "shrink-0"}`} />
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="border-t border-slate-100 px-4 py-4">
          {!isCollapsed ? (
            <>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <span className="text-sm font-bold">
                    {adminName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {adminName}
                  </p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-full p-2.5 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-slate-900">WombTo18</span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
