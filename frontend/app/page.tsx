import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsStrip from '@/components/landing/StatsStrip';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import TemplateShowcase from '@/components/landing/TemplateShowcase';
import ATSSection from '@/components/landing/ATSSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import WindingLineMap from '@/components/landing/WindingLineMap';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <div className="hidden md:block">
          <WindingLineMap />
        </div>
        <HeroSection />
        <StatsStrip />
        <FeaturesSection />
        <HowItWorks />
        <TemplateShowcase />
        <ATSSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}