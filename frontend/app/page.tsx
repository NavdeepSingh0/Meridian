import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import Journey from '@/components/landing/Journey';
import FinalCta from '@/components/landing/FinalCta';
import LandingFooter from '@/components/landing/LandingFooter';
import FlightPath from '@/components/landing/flight/FlightPath';
import styles from '@/components/landing/landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingNav />
      <main className={styles.main}>
        <FlightPath />
        <Hero />
        <Journey />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
