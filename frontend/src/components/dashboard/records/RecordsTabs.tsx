export default function RecordsTabs() {
  const tabs = [
    "All Records", 
    "Vaccination Cards", 
    "Annual Check-ups", 
    "Dental Records", 
    "Eye Check-ups", 
    "BMI Reports", 
    "Lab Tests", 
    "Prescriptions"
  ];

  return (
    <div className="mb-6 border-b border-slate-200">
      <div className="no-scrollbar flex items-center gap-8 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button 
            key={index}
            className={`whitespace-nowrap py-4 text-sm font-normal transition-colors ${
              index === 0 
                ? "border-b-2 border-primary font-bold text-primary" 
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}