const TABS = [
  "All Records",
  "Vaccination Cards",
  "Annual Check-ups",
  "Dental Records",
  "Eye Check-ups",
  "BMI Reports",
  "Lab Tests",
  "Prescriptions",
  "Medical Certificates",
  "Other",
];

interface RecordsTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function RecordsTabs({ selectedCategory, onCategoryChange }: RecordsTabsProps) {
  return (
    <div className="mb-4 border-b border-slate-200">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onCategoryChange(tab)}
            className={`whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              selectedCategory === tab
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
