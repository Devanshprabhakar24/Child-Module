'use client';

import Header from '@/components/shared/Header';
import Hero from '@/components/home/Hero';
import AgeSelectors from '@/components/home/AgeSelectors';
import RegistrationPaths from '@/components/home/RegistrationPaths';
import Features from '@/components/home/Features';
import Footer from '@/components/shared/Footer';
import FloatingActions from '@/components/shared/FloatingActions';
import Milestones from '@/components/home/Milestones';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import Commitment from '@/components/home/Commitment';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Hero />
        <Commitment />
        <Milestones />
        {/* <AgeSelectors /> */}
        <RegistrationPaths />
        <Features />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}