import SchoolHeader from "@/components/dashboard/school/SchoolHeader";
import ConnectSchoolForm from "@/components/dashboard/school/ConnectSchoolForm";
import LinkedSchoolProfile from "@/components/dashboard/school/LinkedSchoolProfile";

export default function SchoolConnectionPage() {
  return (
    <div className="mx-auto w-full max-w-8xl">
      <SchoolHeader />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Form & Info */}
        <div className="lg:col-span-7">
          <ConnectSchoolForm />
        </div>
        
        {/* Right Column: Connected Profile & Updates */}
        <div className="lg:col-span-5">
          <LinkedSchoolProfile />
        </div>
      </div>
    </div>
  );
}