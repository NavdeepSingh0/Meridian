'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="cta"
      ref={ref}
      aria-labelledby="cta-heading"
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--color-bg) 0%, #0C1222 50%, #080C1A 100%)',
        padding: 'clamp(100px, 12vw, 180px) 0',
      }}
    >
      {/* Radial glow behind CTA */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 143, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="container-meridian relative z-10">
        <motion.div
          className="text-center"
          style={{ maxWidth: '640px', marginInline: 'auto' }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Heading */}
          <h2 id="cta-heading" className="type-section" style={{ marginBottom: '20px' }}>
            The first step is the hardest.
            <br />
            <span style={{ color: 'var(--color-accent)' }}>Let&apos;s take it together.</span>
          </h2>

          {/* Subtext */}
          <p
            className="type-body-lg"
            style={{ marginBottom: '40px' }}
          >
            Your next chapter starts with one page.
            Meridian helps you make it count.
          </p>

          {/* Primary CTA */}
          <motion.a
            href="#"
            className="btn-primary inline-flex items-center justify-center"
            style={{
              padding: '18px 40px',
              fontSize: '1.0625rem',
              minWidth: '280px',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your Journey &mdash; It&apos;s Free
          </motion.a>

          {/* Trust line */}
          <motion.p
            className="mt-6 text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            No credit card. No commitment. Just your best first impression.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
