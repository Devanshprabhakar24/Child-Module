"use client";

import { useState, useMemo } from "react";
import { Info, User, Search, ChevronDown, RotateCcw, ArrowRight } from "lucide-react";

export interface ChildDetails {
  motherName: string;
  childName: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  stateCode: string;
}

interface Step1Props {
  onNext: () => void;
  onComplete: (details: ChildDetails) => void;
}

export default function Step1Form({ onNext, onComplete }: Step1Props) {
  // Form State
  const [motherName, setMotherName] = useState("");
  const [childName, setChildName] = useState("");
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | "other" | null>("male");
  const [dob, setDob] = useState("");
  const [stateRegion, setStateRegion] = useState("");

  // Auto-Calculate Age and Group based on DOB
  const { ageText, groupText } = useMemo(() => {
    if (!dob) return { ageText: "--", groupText: "--" };

    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }

    if (today.getDate() < birthDate.getDate()) {
      months--;
      if (months < 0) {
        months = 11;
      }
    }

    let calculatedAge = "";
    if (years > 0) calculatedAge += `${years} Year${years > 1 ? "s" : ""}`;
    if (months > 0) calculatedAge += `${years > 0 ? ", " : ""}${months} Month${months > 1 ? "s" : ""}`;
    if (years === 0 && months === 0) calculatedAge = "Newborn";

    let calculatedGroup = "";
    if (years <= 5) calculatedGroup = "0-5 Years Group";
    else if (years <= 12) calculatedGroup = "6-12 Years Group";
    else calculatedGroup = "13-18 Years Group";

    return { ageText: calculatedAge, groupText: calculatedGroup };
  }, [dob]);

  // Validation: Check if all required fields have a value
  const isFormValid = 
    motherName.trim() !== "" && 
    childName.trim() !== "" && 
    selectedGender !== null && 
    dob !== "" && 
    stateRegion !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onComplete({
        motherName,
        childName,
        gender: selectedGender as "male" | "female" | "other",
        dateOfBirth: dob,
        stateCode: stateRegion,
      });
      onNext();
    }
  };

  const handleReset = () => {
    setMotherName("");
    setChildName("");
    setSelectedGender("male");
    setDob("");
    setStateRegion("");
  };

  return (
    <form className="space-y-8 p-6 md:p-8" onSubmit={handleSubmit} onReset={handleReset}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between text-sm font-medium text-slate-700">
            Mother's Name *
            <span title="Full legal name of the mother or primary guardian">
              <Info className="h-4 w-4 cursor-help text-slate-400" />
            </span>
          </label>
          <input 
            className="h-12 w-full rounded-lg border border-slate-200 px-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" 
            placeholder="e.g. Reena Kumari" 
            type="text" 
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between text-sm font-medium text-slate-700">
            Child's Name *
            <span title="Full legal name of the child">
              <Info className="h-4 w-4 cursor-help text-slate-400" />
            </span>
          </label>
          <input 
            className="h-12 w-full rounded-lg border border-slate-200 px-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" 
            placeholder="e.g. Aarav Kumar" 
            type="text" 
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
          Child's Gender *
        </label>
        <div className="grid grid-cols-3 gap-4">
          {(["male", "female", "other"] as const).map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => setSelectedGender(gender)}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${selectedGender === gender ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-600 hover:border-primary/50"}`}
            >
              <User className="h-8 w-8" />
              <span className="text-sm font-medium capitalize">{gender}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
            Date of Birth *
            <span title="Used to calculate vaccination schedules">
              <Info className="h-4 w-4 cursor-help text-slate-400" />
            </span>
          </label>
          <input 
            className="h-12 w-full rounded-lg border border-slate-200 px-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" 
            type="date"
            max={new Date().toISOString().split("T")[0]} // Prevent future dates
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Auto-Calculated Age</label>
          <div className="flex h-12 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4">
            <span className={`font-normal ${dob ? "text-slate-900 font-medium" : "text-slate-400"}`}>
              {ageText}
            </span>
            {dob && (
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {groupText}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
          State / Region *
        </label>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <select 
            className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 pl-10 pr-4 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={stateRegion}
            onChange={(e) => setStateRegion(e.target.value)}
          >
            <option disabled value="">Search &amp; Select State</option>
            {/* States */}
            <option value="AP">Andhra Pradesh</option>
            <option value="AR">Arunachal Pradesh</option>
            <option value="AS">Assam</option>
            <option value="BR">Bihar</option>
            <option value="CT">Chhattisgarh</option>
            <option value="GA">Goa</option>
            <option value="GJ">Gujarat</option>
            <option value="HR">Haryana</option>
            <option value="HP">Himachal Pradesh</option>
            <option value="JH">Jharkhand</option>
            <option value="KA">Karnataka</option>
            <option value="KL">Kerala</option>
            <option value="MP">Madhya Pradesh</option>
            <option value="MH">Maharashtra</option>
            <option value="MN">Manipur</option>
            <option value="ML">Meghalaya</option>
            <option value="MZ">Mizoram</option>
            <option value="NL">Nagaland</option>
            <option value="OD">Odisha</option>
            <option value="PB">Punjab</option>
            <option value="RJ">Rajasthan</option>
            <option value="SK">Sikkim</option>
            <option value="TN">Tamil Nadu</option>
            <option value="TS">Telangana</option>
            <option value="TR">Tripura</option>
            <option value="UP">Uttar Pradesh</option>
            <option value="UK">Uttarakhand</option>
            <option value="WB">West Bengal</option>
            {/* Union Territories */}
            <option value="AN">Andaman &amp; Nicobar Islands</option>
            <option value="CH">Chandigarh</option>
            <option value="DD">Dadra &amp; Nagar Haveli and Daman &amp; Diu</option>
            <option value="DL">Delhi</option>
            <option value="JK">Jammu &amp; Kashmir</option>
            <option value="LA">Ladakh</option>
            <option value="LD">Lakshadweep</option>
            <option value="PY">Puducherry</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
        <button 
          type="reset" 
          className="flex w-full items-center justify-center gap-2 rounded-lg px-8 py-3 font-semibold text-slate-500 transition-colors hover:bg-slate-100 sm:w-auto"
        >
          <RotateCcw className="h-5 w-5" /> Clear Form
        </button>
        <button 
          type="submit" 
          disabled={!isFormValid}
          className={`flex w-full items-center justify-center gap-2 rounded-full px-12 py-3 font-medium text-white shadow-lg transition-all sm:w-auto ${
            isFormValid 
              ? "bg-primary shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5" 
              : "bg-slate-300 cursor-not-allowed shadow-none"
          }`}
        >
          Continue <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}