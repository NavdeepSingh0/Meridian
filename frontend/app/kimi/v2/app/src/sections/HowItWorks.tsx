'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    num: '01',
    title: 'Build your base.',
    desc: 'Open the editor. Add your experience, projects, education, and skills. Meridian keeps you on one page — clean, structured, ATS-safe.',
  },
  {
    num: '02',
    title: 'Listen to your co-pilot.',
    desc: 'Let AI review each section. Read the feedback. Apply what resonates. Undo anything that doesn\'t feel like you.',
  },
  {
    num: '03',
    title: 'Match it to the role.',
    desc: 'Paste the job description. Check your score. Fill the gaps. Export a PDF that\'s ready to land.',
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className="step-card relative"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Large watermark number */}
      <div className="step-number" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
        {step.num}
      </div>

      {/* Content */}
      <div className="relative z-10 pt-8">
        <h3
          className="text-lg font-semibold mb-3"
          style={{
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
          }}
        >
          {step.title}
        </h3>
        <p className="type-body" style={{ maxWidth: '300px' }}>
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-heading"
      className="relative overflow-hidden"
      style={{
        background: 'var(--color-bg)',
        padding: 'clamp(80px, 10vw, 140px) 0',
      }}
    >
      {/* Subtle horizontal connector line — desktop only */}
      <div className="container-meridian relative hidden lg:block">
        <div
          className="absolute left-0 right-0"
          style={{
            top: '55%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 5%, rgba(74, 143, 255, 0.15) 15%, rgba(74, 143, 255, 0.15) 85%, transparent 95%)',
            zIndex: 0,
          }}
        />
      </div>

      <div className="container-meridian relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center"
          style={{ maxWidth: '640px', marginInline: 'auto', marginBottom: 'clamp(48px, 6vw, 80px)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow-pill">The path forward</span>
          <h2 id="how-heading" className="type-section">
            Three steps from blank page<br />
            <span style={{ color: 'var(--color-text-muted)' }}>to ready to send.</span>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div
          className="relative grid gap-8 lg:gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {steps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
