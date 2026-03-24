'use client';

import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import MilestonesHero from "@/components/milestones/MilestonesHero";
import DevelopmentStages from "@/components/milestones/DevelopmentStages";
import AiTracking from "@/components/milestones/AiTracking";
import AssessmentTools from "@/components/milestones/AssessmentTools";

export const dynamic = 'force-dynamic';

export default function MilestonesPage() {
  return (
    <div className="flex min-h-screen flex-col font-display selection:bg-primary/20">
      <Header />
      
      <main className="flex flex-1 flex-col items-center bg-slate-50/50 pt-20">
        <div className="flex w-full max-w-7xl flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
          <MilestonesHero />
          <DevelopmentStages />
          <AiTracking />
          <AssessmentTools />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}