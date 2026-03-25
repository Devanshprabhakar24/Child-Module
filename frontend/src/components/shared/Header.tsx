"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Detect scroll to toggle navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  // Use solid header when scrolled or not on homepage
  // Check if we're on homepage by looking at window.location
  const [isHomepage, setIsHomepage] = useState(true);
  
  useEffect(() => {
    setIsHomepage(window.location.pathname === "/");
  }, []);

  const useSolidHeader = isScrolled || !isHomepage;

  return (
    <>
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          useSolidHeader 
            ? "bg-white/90 backdrop-blur-md border-b border-primary/10 shadow-sm" 
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${useSolidHeader ? "py-4" : "py-6"}`}>
          
          <div className="flex items-center gap-2 cursor-pointer">
            <Link href="/" className="text-xl font-medium tracking-tight">
              <span className={useSolidHeader ? "text-[#10b981]" : "text-white"}>Womb</span>
              <span className={useSolidHeader ? "text-[#ec4899]" : "text-pink-300"}>To</span>
              <span className={useSolidHeader ? "text-[var(--brand-pink)]" : "text-white"}>18</span>
            </Link>
          </div>
          
          <div>
            <nav className="hidden flex-1 justify-center gap-10 lg:flex">
              {[
                { name: "Milestones", href: "/milestones", hoverClass: "hover:text-[var(--brand-blue)]" },
                { name: "Blogs", href: "/blogs", hoverClass: "hover:text-[var(--brand-pink)]" },
                { name: "Join Us", href: "/join", hoverClass: "hover:text-[var(--brand-green)]" },
                { name: "Contact Us", href: "/contact", hoverClass: "hover:text-[var(--brand-purple)]" },
                { name: "About", href: "/about", hoverClass: "hover:text-[var(--brand-orange)]" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  className={`text-sm font-normal transition-colors ${
                    useSolidHeader 
                      ? `text-slate-600 ${item.hoverClass}` 
                      : "text-slate-200 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href="/login"
                onClick={() => openModal("login")}
                className={`px-4 py-2 text-sm font-normal transition rounded-lg ${
                  useSolidHeader 
                    ? "text-primary hover:bg-primary/5" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                Login
              </Link>
              
              <Link href="/register"
                onClick={() => openModal("register")}
                className={`rounded-full px-5 py-2 text-sm font-normal shadow-lg transition-all ${
                  useSolidHeader
                    ? "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
                    : "bg-white text-primary shadow-black/10 hover:bg-slate-50"
                }`}
              >
                <span className="hidden sm:inline">Register Now</span>
                <span className="sm:hidden">Register</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}