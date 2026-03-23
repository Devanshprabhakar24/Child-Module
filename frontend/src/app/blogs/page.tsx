import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import NewsHero from "@/components/blogs/NewsHero";
import LatestStories from "@/components/blogs/LatestStories";
import MediaResources from "@/components/blogs/MediaResources";
import Newsletter from "@/components/blogs/Newsletter";

// Prevent prerendering
export const dynamic = 'force-dynamic';

export default function BlogsPage() {
  return (
    <div className="flex min-h-screen flex-col font-display selection:bg-primary/20">
      <Header />
      
      <main className="flex flex-1 flex-col items-center bg-slate-50/50 pt-20">
        <div className="flex w-full max-w-7xl flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
          <NewsHero />
          <LatestStories />
          <MediaResources />
          <Newsletter />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}