import { CheckCircle, User, Calendar, Images, UserCheck, AlertTriangle, FileText } from "lucide-react";

export default function LinkedSchoolProfile() {
  return (
    <div className="flex flex-col gap-6">

      {/* Main Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Banner */}
        <div className="relative h-28 bg-primary">
          <div className="absolute -bottom-8 left-6 rounded-xl bg-white p-1 shadow-md">
            <div
              className="h-16 w-16 rounded-lg bg-slate-100 bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABUZzQMbnb6cUAqqZK1mzjFqUe0oDGrwH2tTuiLOzKxcWgKFMOZ9YAQaWbQ4N8bJzApOil1gNaXNriHVJpTQZA21kCla7jyNTRE1-Vd8G6lHbDXFKbo-aABuF4xNspgp_8WoJe_I2WvUkewAjVambslW8Y-VLTMJutWnApvG-rleZ_UiGzn1RWYxVfbp372KrguTlMgLSe0KSu9FDeHC9Q88lBYJlR--RXBXmnx7fx0BQ5s6GYkzubB_FtTFPbdzym8GwtnfJXyqOi')" }}
              title="School Logo"
            ></div>
          </div>
        </div>

        <div className="p-6 pt-12 md:p-8 md:pt-12">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div>
              <h3 className="text-xl font-medium text-slate-900">Delhi Public School</h3>
              <p className="text-sm text-slate-500">Sector 12, RK Puram, New Delhi</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
              <CheckCircle className="h-3.5 w-3.5" />
              Connected
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-transparent bg-slate-50 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-slate-700">Health Card</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-transparent bg-slate-50 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-slate-700">HPS Schedule</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-transparent bg-slate-50 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5">
              <Images className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-slate-700">Class Gallery</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-1 rounded-xl border border-transparent bg-slate-50 p-4 text-center transition-colors hover:border-primary/20 hover:bg-primary/5">
              <UserCheck className="h-6 w-6 text-primary" />
              <span className="text-[10px] font-medium leading-tight text-slate-700">Ambassador<br/>Dr. Sharma</span>
            </button>
          </div>

          <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-4 font-medium text-white transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20">
            <AlertTriangle className="h-5 w-5" />
            Emergency Button
          </button>

          <div className="flex flex-col items-center gap-4">
            <button className="w-full rounded-xl bg-primary/10 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/20">
              View School Dashboard
            </button>
            <button className="text-xs font-normal text-slate-400 transition-colors hover:text-red-500 hover:underline">
              Unlink School Profile
            </button>
          </div>
        </div>
      </div>

      {/* Recent Updates Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-5 text-sm font-semibold text-slate-900">Recent School Updates</h4>
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="w-1 shrink-0 rounded-full bg-primary"></div>
            <div>
              <p className="text-sm font-medium text-slate-900">Vision Screening Results</p>
              <p className="text-xs text-slate-500">Uploaded 2 hours ago by School Nurse</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1 shrink-0 rounded-full bg-slate-200"></div>
            <div>
              <p className="text-sm font-medium text-slate-900">Upcoming Health Talk</p>
              <p className="text-xs text-slate-500">Scheduled for Friday, 10:00 AM</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
