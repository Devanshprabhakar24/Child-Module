"use client";

import { useState } from "react";

export default function AgeGroupSelector() {
  const [activeAge, setActiveAge] = useState("1-3yr");
  const ageGroups = ["0-6mo", "6-12mo", "1-3yr", "3-5yr", "5-12yr", "13-18yr"];

  return (
    <div className="mb-8 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
      {ageGroups.map((age) => (
        <button
          key={age}
          onClick={() => setActiveAge(age)}
          className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-normal transition-all ${
            activeAge === age
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {age}
        </button>
      ))}
    </div>
  );
}