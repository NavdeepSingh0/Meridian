import Navbar from '@/components/experiment/Navbar';
import HeroSection from '@/components/experiment/HeroSection';
import StatsStrip from '@/components/experiment/StatsStrip';
import FeaturesSection from '@/components/experiment/FeaturesSection';
import HowItWorks from '@/components/experiment/HowItWorks';
import TemplateShowcase from '@/components/experiment/TemplateShowcase';
import ATSSection from '@/components/experiment/ATSSection';
import CTASection from '@/components/experiment/CTASection';
import Footer from '@/components/experiment/Footer';
import WindingLineMap from '@/components/experiment/WindingLineMap';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <WindingLineMap />
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