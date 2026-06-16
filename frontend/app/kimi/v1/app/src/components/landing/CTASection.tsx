'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function CTASection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section aria-labelledby="cta-heading" className="cta-section" ref={sectionRef}>
      <div className="container">
        <div style={{ maxWidth: '640px', marginInline: 'auto', textAlign: 'center' }}>
          <motion.h2
            id="cta-heading"
            className="type-section"
            style={{ color: 'var(--color-ink)', marginBottom: '20px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            The runway is clear. Time to take off.
          </motion.h2>
          <motion.p
            className="type-body-lg"
            style={{ color: 'var(--color-ink-muted)', marginBottom: '36px' }}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            No account required. Build, navigate, and export in under five minutes. Your first step starts now.
          </motion.p>
          <motion.div
            className="hero-cta-row"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <a href="#" id="cta-build-btn" className="btn-primary-hero" onClick={(e) => e.preventDefault()}>
              Start Your Journey →
            </a>
            <a href="#features" className="btn-ghost-hero" onClick={(e) => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Explore the Toolkit
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
