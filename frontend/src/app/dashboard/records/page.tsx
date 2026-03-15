import RecordsHeader from "@/components/dashboard/records/RecordsHeader";
import RecordsTabs from "@/components/dashboard/records/RecordsTabs";
import RecordsGrid from "@/components/dashboard/records/RecordsGrid";

export default function HealthRecordsPage() {
  return (
    <div className="mx-auto max-w-8xl">
      <RecordsHeader />
      <RecordsTabs />
      <RecordsGrid />
    </div>
  );
}