"use client";

import { useState } from "react";
import { Check, AlertTriangle, Image as ImageIcon, Plus, ChevronDown, ChevronUp } from "lucide-react";

export default function DevelopmentAccordions() {
  const [openSection, setOpenSection] = useState<string | null>("Physical Development");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="flex flex-col gap-4 lg:col-span-2">

      {/* Physical Development (Expanded by default) */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
        <div
          onClick={() => toggleSection("Physical Development")}
          className="flex cursor-pointer items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5 hover:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">🏃</span>
            <h3 className="font-medium text-slate-900">Physical Development</h3>
          </div>
          {openSection === "Physical Development" ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>

        {openSection === "Physical Development" && (
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-5 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Sitting without support</p>
                  <p className="text-[11px] font-normal text-slate-500">Achieved at 8 months</p>
                </div>
              </div>
              <button className="text-primary hover:text-primary/80" title="View Memories">
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Crawling</p>
                  <p className="text-[11px] font-normal text-slate-500">Achieved at 10 months</p>
                </div>
              </div>
              <button className="text-primary hover:text-primary/80" title="View Memories">
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Walking independently</p>
                  <p className="text-[11px] font-normal text-amber-600">Due: 12-15 mo (Currently 14 mo)</p>
                </div>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900" title="Add Memory / Mark Complete">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-5 opacity-60 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full border-2 border-slate-200"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Running steadily</p>
                  <p className="text-[11px] font-normal text-slate-500">Expected: 18-24 mo</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cognitive Development */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
        <div
          onClick={() => toggleSection("Cognitive Development")}
          className="flex cursor-pointer items-center justify-between p-5 hover:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">🧠</span>
            <h3 className="font-medium text-slate-900">Cognitive Development</h3>
          </div>
          {openSection === "Cognitive Development" ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Language Development */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
        <div
          onClick={() => toggleSection("Language Development")}
          className="flex cursor-pointer items-center justify-between p-5 hover:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">🗣️</span>
            <h3 className="font-medium text-slate-900">Language Development</h3>
          </div>
          {openSection === "Language Development" ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Social Development */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
        <div
          onClick={() => toggleSection("Social Development")}
          className="flex cursor-pointer items-center justify-between p-5 hover:bg-slate-50"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">👥</span>
            <h3 className="font-medium text-slate-900">Social Development</h3>
          </div>
          {openSection === "Social Development" ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>

    </div>
  );
}
