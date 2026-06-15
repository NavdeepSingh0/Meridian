import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative pb-16 overflow-visible" style={{ backgroundColor: 'var(--color-base)' }}>
      {/* The Dynamic Teal Background Sweep */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ fill: 'var(--color-primary)' }}>
          {/* Maintained the ratio (middle drops lower than left) but pulled the entire structure upwards */}
          <path d="M0,0 L100,0 L100,30 C70,65 30,75 0,70 Z"></path>
        </svg>
      </div>
      {/* Content wrapper ensures z-index stays above the background sweep */}
      <div className="container relative z-10" style={{ paddingTop: 'calc(64px + clamp(80px, 12vw, 120px))' }}>
        <div style={{ maxWidth: '760px', marginInline: 'auto', textAlign: 'center' }}>
          
          <div className="eyebrow-pill" style={{ background: 'rgba(252,255,253,0.1)', borderColor: 'rgba(252,255,253,0.2)', color: '#FCFFFD' }} role="text">
            RESUME BUILDER &amp; ATS ANALYZER
          </div>
          
          <h1 id="hero-heading" className="type-hero" style={{ marginBottom: '24px', color: '#FCFFFD' }}>
            Your resume,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-ink)' }}>hire-ready.</em>
          </h1>
          
          <p className="type-body-lg hero-sub" style={{ color: 'rgba(252,255,253,0.85)' }}>
            Build a polished resume in minutes. Get section-by-section feedback, pinpoint ATS gaps, and walk into every application with a resume that works as hard as you do.
          </p>
          
          <div className="hero-cta-row">
            {/* White Button for high contrast against the dark teal */}
            <Link 
              href="/builder" 
              className="type-btn inline-flex transition-transform duration-150 ease-out hover:-translate-y-[1px] active:scale-98" 
              style={{ background: 'var(--color-ink)', color: '#FCFFFD', padding: '14px 28px', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}
            >
              Build your resume →
            </Link>
            <Link 
              href="/builder#ats" 
              className="type-btn inline-flex transition-transform duration-150 ease-out hover:-translate-y-[1px] active:scale-98"
              style={{ background: 'transparent', color: '#FCFFFD', border: '1.5px solid rgba(252,255,253,0.3)', padding: '14px 28px', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}
            >
              Check ATS score
            </Link>
          </div>
          
          <p className="trust-line" style={{ color: 'rgba(252,255,253,0.6)' }}>
            No account needed
            <span className="trust-dot" style={{ color: 'var(--color-ink)' }} aria-hidden="true"> · </span>
            Saves automatically
            <span className="trust-dot" style={{ color: 'var(--color-ink)' }} aria-hidden="true"> · </span>
            Export as PDF
          </p>
        </div>

        {/* Mockup wrapper */}
        <div className="hero-mockup-wrapper relative z-20 mt-16">
          <div className="browser-chrome" aria-hidden="true" style={{ borderColor: 'var(--color-border)' }}>
            <div className="browser-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="browser-url-bar">
              <span className="url-text">app/builder</span>
            </div>
          </div>
          
          <div className="hero-mockup-container" aria-hidden="true" style={{ padding: 0, overflow: 'hidden', background: '#fff', height: 'auto', display: 'block', maskImage: 'none', WebkitMaskImage: 'none' }}>
            <Image 
              src="/builder-screenshot.png" 
              alt="Meridian Builder Interface" 
              width={1600}
              height={1000}
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} 
            />
          </div>
        </div>
      </div>



    </section>
  );
}