import Navbar from './sections/Navbar';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import HowItWorks from './sections/HowItWorks';
import SocialProof from './sections/SocialProof';
import CTASection from './sections/CTASection';
import Footer from './sections/Footer';
import WindingLineMap from './sections/WindingLineMap';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <WindingLineMap />
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
