import { motion } from 'framer-motion';

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative pb-16 overflow-visible" style={{ backgroundColor: 'var(--color-base)' }}>
      {/* The Dynamic Teal Background Sweep */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ fill: 'var(--color-primary)' }}>
          <path d="M0,0 L100,0 L100,30 C70,65 30,75 0,70 Z" />
        </svg>
      </div>

      {/* Content wrapper ensures z-index stays above the background sweep */}
      <div className="container relative" style={{ zIndex: 10, paddingTop: 'calc(64px + clamp(80px, 12vw, 120px))' }}>
        <div style={{ maxWidth: '760px', marginInline: 'auto', textAlign: 'center' }}>

          {/* Eyebrow Pill */}
          <motion.div
            className="eyebrow-pill"
            style={{ background: 'rgba(252,255,253,0.1)', borderColor: 'rgba(252,255,253,0.2)', color: '#FCFFFD' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 }}
          >
            YOUR PROFESSIONAL TAKEOFF
          </motion.div>

          {/* Headline */}
          <motion.h1
            id="hero-heading"
            className="type-hero"
            style={{ marginBottom: '24px', color: '#FCFFFD' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.2 }}
          >
            Your first step into the<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-ink)' }}>professional world.</em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="type-body-lg hero-sub"
            style={{ color: 'rgba(252,255,253,0.85)', maxWidth: '580px', marginInline: 'auto', marginBottom: '36px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.35 }}
          >
            Build a polished, ATS-ready resume in minutes. Get section-by-section guidance,
            spot the gaps before you apply, and walk into every opportunity with confidence.
            Meridian travels the path with you — from first draft to final send.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            className="hero-cta-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.5 }}
          >
            <a
              href="#"
              className="type-btn inline-flex transition-transform duration-150 ease-out hover:-translate-y-[1px] active:scale-98"
              style={{ background: 'var(--color-ink)', color: '#FCFFFD', padding: '14px 28px', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}
              onClick={(e) => e.preventDefault()}
            >
              Start Your Journey →
            </a>
            <a
              href="#"
              className="type-btn inline-flex transition-transform duration-150 ease-out hover:-translate-y-[1px] active:scale-98"
              style={{ background: 'transparent', color: '#FCFFFD', border: '1.5px solid rgba(252,255,253,0.3)', padding: '14px 28px', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}
              onClick={(e) => e.preventDefault()}
            >
              Check Your Flight Path
            </a>
          </motion.div>

          {/* Trust Line */}
          <motion.p
            className="trust-line"
            style={{ color: 'rgba(252,255,253,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.6 }}
          >
            No account needed
            <span className="trust-dot" style={{ color: 'var(--color-ink)' }} aria-hidden="true"> · </span>
            Saves automatically
            <span className="trust-dot" style={{ color: 'var(--color-ink)' }} aria-hidden="true"> · </span>
            Export as PDF
          </motion.p>
        </div>

        {/* Mockup wrapper */}
        <motion.div
          className="hero-mockup-wrapper relative"
          style={{ zIndex: 20, marginTop: '4rem' }}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.5 }}
        >
          <div className="browser-chrome" aria-hidden="true" style={{ borderColor: 'var(--color-border)' }}>
            <div className="browser-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="browser-url-bar">
              <span className="url-text">meridian.cv/builder</span>
            </div>
          </div>

          <div
            className="hero-mockup-container"
            aria-hidden="true"
            style={{ padding: 0, overflow: 'hidden', background: '#fff', height: 'auto', display: 'block', maskImage: 'none', WebkitMaskImage: 'none' }}
          >
            <img
              src="/builder-screenshot.png"
              alt="Meridian Builder Interface"
              width={1600}
              height={1000}
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
