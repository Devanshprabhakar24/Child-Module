import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import JoinHero from "@/components/join/JoinHero";
import JoinCategories from "@/components/join/JoinCategories";
import PartnerImpact from "@/components/join/PartnerImpact";
import JoinCTA from "@/components/join/JoinCTA";

export default function JoinUsPage() {
  return (
    <div className="flex min-h-screen flex-col font-display selection:bg-primary/20">
      <Header />
      
      <main className="flex flex-1 flex-col items-center bg-slate-50/50 pt-20">
        <div className="flex w-full max-w-7xl flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
          <JoinHero />
          <JoinCategories />
          <PartnerImpact />
          <JoinCTA />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}