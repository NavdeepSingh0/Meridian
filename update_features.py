import re

def main():
    with open('frontend/components/landing/FeaturesSection.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract CardMockup
    card_mockup_match = re.search(r'(function CardMockup.*?^})', content, re.MULTILINE | re.DOTALL)
    card_mockup = card_mockup_match.group(1) if card_mockup_match else ""

    new_content = """'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const features = [
  {
    label: 'Real-time sync',
    headline: 'Live preview as you type',
    body: 'See your resume update in real time as you fill in each section. No save button, no refresh, no surprises — just instant clarity.',
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
    label: 'AI-powered',
    headline: 'Section-by-section feedback',
    body: 'Get precise, line-level critique on every section — not a generic score, but specific rewrites you can apply in seconds.',
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
    label: 'Before you apply',
    headline: 'ATS compatibility analysis',
    body: 'Know exactly where your resume stands against applicant tracking systems before you submit — with every issue flagged in context.',
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
  {
    label: 'Job-specific',
    headline: 'Keyword gap analysis',
    body: 'Paste any job description and instantly see which keywords are missing from your resume — ranked by how much they matter for that specific role.',
    link: 'Analyze keywords \u2192',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  }
];

function FeatureBlock({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isLeft = index % 2 === 0;

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
      <div style={{ direction: 'ltr', maxWidth: '520px' }}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(100, 182, 172, 0.15)',
              color: 'var(--color-primary)',
            }}
          >
            {feature.icon}
          </div>
          <span className="type-label" style={{ color: 'var(--color-primary)' }}>
            {feature.label}
          </span>
        </div>

        <h3 className="type-h3" style={{ marginBottom: '16px', fontFamily: '\\'Instrument Serif\\', Georgia, serif', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
          {feature.headline}
        </h3>

        <p className="type-body-lg" style={{ marginBottom: '24px' }}>
          {feature.body}
        </p>
      </div>

      <div style={{ direction: 'ltr' }}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#F5F8F7',
            border: '1px solid rgba(100, 182, 172, 0.2)',
            aspectRatio: '4/3',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
          }}
        >
          <CardMockup index={index} />
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      style={{ background: 'var(--color-base)', padding: 'clamp(80px, 10vw, 140px) 0' }}
    >
      <div className="container">
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
            <span style={{ color: 'var(--color-ink-muted)' }}>None of the guesswork.</span>
          </h2>
          <p className="type-body-lg">
            We handle the technical maze of hiring systems so you can focus on what actually matters — telling your story clearly.
          </p>
        </motion.div>

        <div className="flex flex-col" style={{ gap: 'clamp(64px, 8vw, 120px)' }}>
          {features.map((feature, i) => (
            <FeatureBlock key={feature.label} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

""" + card_mockup

    with open('frontend/components/experiment/FeaturesSection.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == "__main__":
    main()
