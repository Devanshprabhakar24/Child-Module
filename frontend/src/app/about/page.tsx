import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import AboutHero from "@/components/about/AboutHero";
import MissionVision from "@/components/about/MissionVision";
import JourneyTimeline from "@/components/about/JourneyTimeline";
import Leadership from "@/components/about/Leadership";
import Compliance from "@/components/about/Compliance";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col font-display selection:bg-primary/20">
      <Header />
      
      <main className="flex flex-1 flex-col items-center bg-slate-50/50 pt-20">
        <div className="flex w-full max-w-7xl flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
          <AboutHero />
          <MissionVision />
          <JourneyTimeline />
          <Leadership />
          <Compliance />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}