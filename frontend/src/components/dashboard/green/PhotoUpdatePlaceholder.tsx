import { Camera } from "lucide-react";

export default function PhotoUpdatePlaceholder() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/20 bg-white p-10 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Camera className="h-8 w-8" />
      </div>
      <div>
        <h4 className="mb-2 text-lg font-medium text-slate-900">Waiting for Growth Update</h4>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
          Our field team visits every 6 months. Your next photo update is scheduled for September 2026.
        </p>
      </div>
    </section>
  );
}
