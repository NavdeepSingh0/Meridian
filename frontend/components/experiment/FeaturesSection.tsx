'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const features = [
  {
    label: 'Real-time sync',
    headline: 'Live preview as you type',
    body: 'See your resume update in real time as you fill in each section. No save button, no refresh, no surprises — just instant clarity.',
    link: 'Every pixel, under your control →',
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
    link: 'Your words, sharpened →',
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
    link: 'See your score →',
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
    link: 'Analyze keywords →',
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

        <h3 className="type-h3" style={{ marginBottom: '16px', fontFamily: '\'Instrument Serif\', Georgia, serif', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
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

function CardMockup({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#F5F8F7' }}>
        <div style={{ height: 38, background: '#fff', borderBottom: '1px solid #E2ECEB', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
          </div>
          <div style={{ flex: 1, height: 20, background: '#F0F4F3', borderRadius: 6, maxWidth: 180, marginInline: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, color: '#8AACAA', fontFamily: 'monospace' }}>meridian.cv/editor</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{ width: '45%', background: '#FCFFFD', borderRight: '1px solid #E2ECEB', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Experience</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 7, background: '#D4E8E4', borderRadius: 4, width: '55%' }} />
              <div style={{ height: 26, background: '#fff', border: '1.5px solid var(--color-primary)', borderRadius: 6, display: 'flex', alignItems: 'center', padding: '0 10px', boxShadow: '0 0 0 3px rgba(100,182,172,0.12)' }}>
                <div style={{ height: 6, background: '#1C2B28', borderRadius: 3, width: '80%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 7, background: '#D4E8E4', borderRadius: 4, width: '40%' }} />
              <div style={{ height: 58, background: '#fff', border: '1.5px solid #E2ECEB', borderRadius: 6, padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ height: 5, background: '#CBD9D7', borderRadius: 3 }} />
                <div style={{ height: 5, background: '#CBD9D7', borderRadius: 3, width: '88%' }} />
                <div style={{ height: 5, background: '#CBD9D7', borderRadius: 3, width: '72%' }} />
              </div>
            </div>
            <div style={{ height: 1, background: '#E8F0EE' }} />
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['React', 'Node', 'SQL', 'AWS'].map(s => (
                <span key={s} style={{ padding: '3px 8px', background: '#DAFFEF', border: '1px solid #B0D9CC', borderRadius: 5, fontSize: 8, fontWeight: 600, color: '#1C2B28' }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, background: '#fff', padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ height: 10, background: '#1C2B28', borderRadius: 3, width: '80%', marginInline: 'auto', marginBottom: 5 }} />
              <div style={{ height: 6, background: '#CBD9D7', borderRadius: 3, width: '55%', marginInline: 'auto' }} />
            </div>
            <div style={{ height: 1, background: '#E8F0EE' }} />
            <div style={{ height: 8, background: '#1C2B28', borderRadius: 3, width: '45%', marginBottom: 4 }} />
            <div style={{ height: 5, background: '#D4E8E4', borderRadius: 3 }} /><div style={{ height: 5, background: '#D4E8E4', borderRadius: 3, width: '92%' }} />
            <div style={{ height: 5, background: '#D4E8E4', borderRadius: 3, width: '78%' }} />
            <div style={{ height: 1, background: '#E8F0EE', margin: '2px 0' }} />
            <div style={{ height: 8, background: '#1C2B28', borderRadius: 3, width: '38%', marginBottom: 4 }} />
            <div style={{ height: 5, background: '#D4E8E4', borderRadius: 3 }} />
            <div style={{ height: 5, background: '#D4E8E4', borderRadius: 3, width: '85%' }} />
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 2, height: 14, background: 'var(--color-primary)', borderRadius: 1 }} />
              <div style={{ height: 5, background: '#E8F0EE', borderRadius: 3, width: '60%' }} />
            </div>
          </div>
        </div>
        <div style={{ height: 24, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', flexShrink: 0 }}>
          <span style={{ fontSize: 8, color: '#fff', fontWeight: 600 }}>● LIVE SYNC</span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)' }}>Last saved: just now</span>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#FCFFFD', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink)' }}>Experience</p>
          <span style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', background: '#FEF2F2', color: '#DC2626', borderRadius: 5, border: '1px solid #FECACA' }}>2 issues found</span>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E2ECEB', borderRadius: 12, padding: '14px 16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ height: 9, background: '#1C2B28', borderRadius: 3, width: '50%' }} />
            <div style={{ height: 7, background: '#D4E8E4', borderRadius: 3, width: '22%' }} />
          </div>
          <div style={{ height: 6, background: '#CBD9D7', borderRadius: 3, marginBottom: 4 }} />
          <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 6, padding: '8px 10px', margin: '8px 0', position: 'relative' }}>
            <p style={{ fontSize: 10, color: '#9CA3AF', textDecoration: 'line-through', textDecorationColor: '#FCA5A5', lineHeight: 1.5 }}>
              Responsible for managing the team&apos;s database tasks.
            </p>
            <div style={{ position: 'absolute', top: -1, right: -1, background: '#EF4444', borderRadius: '0 5px 0 6px', padding: '2px 6px' }}>
              <span style={{ fontSize: 7, fontWeight: 700, color: '#fff' }}>WEAK</span>
            </div>
          </div>
          <div style={{ height: 6, background: '#D4E8E4', borderRadius: 3, width: '85%' }} />
          <div style={{ height: 6, background: '#D4E8E4', borderRadius: 3, width: '70%', marginTop: 4 }} />
        </div>
        <div style={{ background: 'var(--color-ink)', borderRadius: 14, padding: '16px 18px', boxShadow: '0 16px 40px rgba(28,43,40,0.18)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -7, left: 22, width: 14, height: 14, background: 'var(--color-ink)', transform: 'rotate(45deg)', borderRadius: 2 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F87171' }} />
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#fff' }}>Passive voice + no metric</p>
          </div>
          <p style={{ fontSize: 10.5, color: 'rgba(252,255,253,0.65)', lineHeight: 1.7, marginBottom: 10 }}>
            Use a strong verb and quantify the impact.
          </p>
          <div style={{ background: 'rgba(100,182,172,0.15)', border: '1px solid rgba(100,182,172,0.3)', borderRadius: 8, padding: '9px 12px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Suggested rewrite</p>
            <p style={{ fontSize: 10.5, color: '#fff', lineHeight: 1.6 }}>
              &ldquo;Managed and optimized PostgreSQL schemas for 3 services, reducing average query time by 38%.&rdquo;
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'var(--color-ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 220, height: 220, background: 'var(--color-primary)', opacity: 0.06, borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', width: 148, height: 148, marginBottom: 28, flexShrink: 0 }}>
          <svg width="148" height="148" viewBox="0 0 148 148" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="74" cy="74" r="62" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="11" />
            <circle cx="74" cy="74" r="62" fill="none" stroke="rgba(100,182,172,0.2)" strokeWidth="11" strokeDasharray="390" />
            <circle cx="74" cy="74" r="62" fill="none" stroke="var(--color-primary)" strokeWidth="11" strokeDasharray="390" strokeDashoffset="62" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, color: '#fff', lineHeight: 1 }}>86</span>
            <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginTop: 5 }}>ATS Score</span>
          </div>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7, zIndex: 1 }}>
          {[{ label: 'Standard Fonts', pass: true }, { label: 'Column Structure', pass: true }, { label: 'File Format', pass: true }, { label: 'Keyword Density', pass: false }].map(({ label, pass }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '9px 14px', border: `1px solid ${pass ? 'rgba(100,182,172,0.15)' : 'rgba(248,113,113,0.2)'}` }}>
              <span style={{ fontSize: 11, color: 'rgba(252,255,253,0.65)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: pass ? 'var(--color-primary)' : '#F87171' }}>{pass ? '✓ Pass' : '⚠ Review'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 5, background: 'linear-gradient(to right, var(--color-primary), #A7E8D8)', flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ padding: '5px 12px', background: '#F0FAF7', border: '1px solid #D4E8E4', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-ink)' }}>Frontend Engineer · Stripe</span>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-ink)' }}>Keyword match</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)' }}>64%</span>
            </div>
            <div style={{ height: 7, background: '#E8F0EE', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: '64%', height: '100%', background: 'linear-gradient(to right, var(--color-primary), #A7E8D8)', borderRadius: 6 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1C2B28' }}>Missing — 5 keywords</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['React.js', 'PostgreSQL', 'GraphQL', 'CI/CD', 'Figma'].map((kw) => (
                <span key={kw} style={{ padding: '4px 11px', background: '#FEF2F2', color: '#B91C1C', fontSize: 10, fontWeight: 700, borderRadius: 6, border: '1px solid #FECACA' }}>{kw}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1C2B28' }}>Found — 9 keywords</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['TypeScript', 'Node.js', 'AWS', 'Docker', 'REST API'].map((kw) => (
                <span key={kw} style={{ padding: '4px 11px', background: '#F0FDF4', color: '#15803D', fontSize: 10, fontWeight: 700, borderRadius: 6, border: '1px solid #BBF7D0' }}>{kw}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}