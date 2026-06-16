'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    label: 'The Canvas',
    headline: 'Your resume, built the right way from the start.',
    body: "Start from a clean slate or bring in what you have. Meridian's editor keeps you on a single page — because that's what gets read. Adjust spacing, fonts, and layout in real time. No fighting with Word. No broken PDF exports.",
    link: 'Every pixel, under your control \u2192',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    ),
  },
  {
    label: 'The Co-Pilot',
    headline: 'An expert eye on every line you write.',
    body: "Paste in your experience. Meridian reads it the way a hiring manager would — and tells you what's vague, what's weak, and exactly how to say it better. One click applies the suggestion. One click takes it back. You're always in control.",
    link: 'Your words, sharpened \u2192',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M9 9h6" />
        <path d="M9 13h4" />
      </svg>
    ),
  },
  {
    label: 'The Navigator',
    headline: 'Know exactly where you stand before you apply.',
    body: "Paste the job description. Meridian maps your resume against it — pulling out the keywords you have, the ones you're missing, and your overall readiness score. You'll see the gaps highlighted live, right in the editor. No more applying blind.",
    link: 'See your score \u2192',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
];

function FeatureBlock({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isLeft = index % 2 === 0; // Even indices (0, 2) = left side feature, path curves right

  return (
    <motion.div
      ref={ref}
      className="grid gap-12 lg:gap-16 items-center"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        direction: isLeft ? 'ltr' : 'rtl',
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Text content */}
      <div style={{ direction: 'ltr', maxWidth: '520px' }}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(74, 143, 255, 0.1)',
              color: 'var(--color-accent)',
            }}
          >
            {feature.icon}
          </div>
          <span className="type-label" style={{ color: 'var(--color-accent)' }}>
            {feature.label}
          </span>
        </div>

        <h3 className="type-h3" style={{ marginBottom: '16px', fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
          {feature.headline}
        </h3>

        <p className="type-body-lg" style={{ marginBottom: '24px' }}>
          {feature.body}
        </p>

        <a
          href="#"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors duration-150"
          style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#7BB3FF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
        >
          {feature.link}
        </a>
      </div>

      {/* Visual card */}
      <div style={{ direction: 'ltr' }}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--color-bg-lift)',
            border: '1px solid rgba(74, 143, 255, 0.1)',
            aspectRatio: '4/3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <FeatureVisual index={index} />
        </div>
      </div>
    </motion.div>
  );
}

function FeatureVisual({ index }: { index: number }) {
  if (index === 0) {
    // The Canvas — Editor mockup
    return (
      <div className="w-full h-full flex flex-col gap-3" style={{ maxWidth: '340px' }}>
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
          </div>
          <div className="flex-1 h-4 rounded mx-2" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        {/* Editor content */}
        <div className="flex-1 flex gap-3 px-2">
          <div className="w-1/3 flex flex-col gap-2">
            <div className="h-2 rounded w-3/4" style={{ background: 'rgba(74,143,255,0.3)' }} />
            <div className="h-2 rounded w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-2 rounded w-5/6" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-2 rounded w-full mt-2" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-2 rounded w-4/5" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 rounded w-2/3 mb-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="h-2 rounded w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-2 rounded w-11/12" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-2 rounded w-4/5" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-2 rounded w-full mt-2" style={{ background: 'rgba(74,143,255,0.15)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    // The Co-Pilot — AI critique mockup
    return (
      <div className="w-full flex flex-col gap-3" style={{ maxWidth: '340px' }}>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-2.5 rounded w-1/2 mb-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="h-2 rounded w-full mb-1.5" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-2 rounded w-5/6" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(74,143,255,0.08)', border: '1px solid rgba(74,143,255,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <div className="h-2 rounded w-24" style={{ background: 'rgba(74,143,255,0.4)' }} />
          </div>
          <div className="h-2 rounded w-full mb-1.5" style={{ background: 'rgba(74,143,255,0.15)' }} />
          <div className="h-2 rounded w-4/5" style={{ background: 'rgba(74,143,255,0.15)' }} />
        </div>
      </div>
    );
  }

  // The Navigator — ATS Score mockup
  return (
    <div className="w-full flex flex-col items-center gap-4" style={{ maxWidth: '280px' }}>
      {/* Score ring */}
      <div className="relative" style={{ width: '140px', height: '140px' }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r="58"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="364"
            strokeDashoffset="51"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '2.5rem', color: 'var(--color-text)', lineHeight: 1 }}>86</span>
          <span className="text-xs font-medium mt-1" style={{ color: 'var(--color-accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>ATS Score</span>
        </div>
      </div>
      {/* Keyword bars */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: '85%', background: 'var(--color-accent)' }} />
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>85%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: '62%', background: 'var(--color-accent)' }} />
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>62%</span>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      style={{ background: 'var(--color-bg)', padding: 'clamp(80px, 10vw, 140px) 0' }}
    >
      <div className="container-meridian">
        {/* Section header */}
        <motion.div
          className="text-center"
          style={{ maxWidth: '580px', marginInline: 'auto', marginBottom: 'clamp(48px, 6vw, 80px)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow-pill">What Meridian does</span>
          <h2 id="features-heading" className="type-section" style={{ marginBottom: '16px' }}>
            Every tool you need.<br />
            <span style={{ color: 'var(--color-text-muted)' }}>None of the guesswork.</span>
          </h2>
          <p className="type-body-lg">
            We handle the technical maze of hiring systems so you can focus on what actually matters — telling your story clearly.
          </p>
        </motion.div>

        {/* Feature blocks */}
        <div className="flex flex-col" style={{ gap: 'clamp(64px, 8vw, 120px)' }}>
          {features.map((feature, i) => (
            <FeatureBlock key={feature.label} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
