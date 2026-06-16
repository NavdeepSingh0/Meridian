'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const testimonials = [
  {
    quote: "I didn't know my resume was missing half the keywords they were looking for. Meridian showed me in two minutes.",
    author: 'Software Engineering student',
    detail: 'first internship search',
  },
  {
    quote: "It felt less like a tool and more like someone who actually wanted me to get the job.",
    author: 'Recent graduate',
    detail: 'marketing',
  },
  {
    quote: "The ATS score went from 41% to 87% after one session.",
    author: 'Career changer',
    detail: '3 years experience',
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="testimonial-card flex flex-col"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%' }}
    >
      {/* Quote marks */}
      <div
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: '4rem',
          lineHeight: 1,
          color: 'var(--color-accent)',
          opacity: 0.2,
          marginBottom: '-12px',
        }}
      >
        &ldquo;
      </div>

      {/* Quote text */}
      <p
        className="flex-1"
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '1rem',
          lineHeight: 1.65,
          color: 'var(--color-text)',
          marginBottom: '24px',
        }}
      >
        {testimonial.quote}
      </p>

      {/* Attribution */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {testimonial.author}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {testimonial.detail}
        </p>
      </div>
    </motion.div>
  );
}

export default function SocialProof() {
  return (
    <section
      id="social-proof"
      aria-label="User testimonials"
      style={{
        background: 'var(--color-bg)',
        padding: 'clamp(80px, 10vw, 140px) 0',
      }}
    >
      <div className="container-meridian">
        {/* Section header */}
        <motion.div
          className="text-center"
          style={{ maxWidth: '600px', marginInline: 'auto', marginBottom: 'clamp(40px, 5vw, 64px)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="type-section" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
            Built for the beginning.
            <br />
            <span style={{ color: 'var(--color-text-muted)' }}>Designed for the destination.</span>
          </h2>
        </motion.div>

        {/* Testimonial cards */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
