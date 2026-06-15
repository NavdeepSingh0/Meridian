'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

const CARD_SCROLL_STEP_VH = 60;

const features = [
  {
    num: '01',
    title: 'Live preview as you type',
    desc: 'See your resume update in real time as you fill in each section. No save button, no refresh, no surprises — just instant clarity.',
    tag: 'Real-time sync',
  },
  {
    num: '02',
    title: 'Section-by-section feedback',
    desc: 'Get precise, line-level critique on every section — not a generic score, but specific rewrites you can apply in seconds.',
    tag: 'AI-powered',
  },
  {
    num: '03',
    title: 'ATS compatibility analysis',
    desc: 'Know exactly where your resume stands against applicant tracking systems before you submit — with every issue flagged in context.',
    tag: 'Before you apply',
  },
  {
    num: '04',
    title: 'Keyword gap analysis',
    desc: 'Paste any job description and instantly see which keywords are missing from your resume — ranked by how much they matter for that specific role.',
    tag: 'Job-specific',
  }
];

// Resting transforms: each card's default stacked position
const parsedDeckTransforms = [
  { x: -18, y: 22, r: -5.5, s: 0.92, zIndex: 4, opacity: 0.55 },
  { x: 22, y: -10, r: 4.5, s: 0.94, zIndex: 3, opacity: 0.65 },
  { x: -12, y: -20, r: -2.5, s: 0.95, zIndex: 2, opacity: 0.75 },
  { x: 14, y: 12, r: 4, s: 0.94, zIndex: 1, opacity: 0.68 },
];

const segmentStep = 1 / (features.length - 1);
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;



/* ─── State Calculators ───────────────────────────────────────────────────────── */



function getTextState(index: number, p: number) {
  const activePoint = index * segmentStep;
  const start = activePoint - segmentStep;
  const end = activePoint + segmentStep;

  if (p <= start) return { opacity: 0, y: 20 };
  
  if (p < activePoint) {
    const t = (p - start) / segmentStep;
    // Crisp fade in from 0.5 to 0.7
    const opacity = t < 0.5 ? 0 : t >= 0.7 ? 1 : (t - 0.5) / 0.2;
    // Snappy ease out Y translation
    const yT = t < 0.4 ? 0 : t >= 0.8 ? 1 : (t - 0.4) / 0.4;
    const easeOut = 1 - Math.pow(1 - yT, 3);
    return { opacity, y: lerp(20, 0, easeOut) };
  }
  
  if (p < end) {
    const t = (p - activePoint) / segmentStep;
    // Crisp fade out from 0.3 to 0.5
    const opacity = t < 0.3 ? 1 : t > 0.5 ? 0 : 1 - ((t - 0.3) / 0.2);
    // Snappy ease in Y translation
    const yT = t < 0.2 ? 0 : t > 0.6 ? 1 : (t - 0.2) / 0.4;
    const easeIn = yT * yT * yT;
    return { opacity, y: lerp(0, -20, easeIn) };
  }
  
  return { opacity: 0, y: -20 };
}

function getDotState(dotIndex: number, p: number) {
  const targetProgress = dotIndex * segmentStep;
  const start = targetProgress - segmentStep;
  const end = targetProgress + segmentStep;

  let scaleX = 1;
  if (p > start && p < end) {
    // Distance from target as a fraction of segmentStep
    const dist = Math.abs(p - targetProgress) / segmentStep; // 0 to 1
    // Hold expanded state when text is fully visible (dist < 0.3)
    if (dist < 0.3) {
      scaleX = 3.2;
    } else if (dist < 0.5) {
      const t = 1 - ((dist - 0.3) / 0.2); // 1 to 0
      scaleX = lerp(1, 3.2, t);
    }
  }

  const colorStart = targetProgress - segmentStep * 0.4;
  const colorEnd = targetProgress + segmentStep * 0.4;
  const bgType = (p >= colorStart && p <= colorEnd) ? 'var(--color-primary)' : 'var(--color-border)';

  return { scaleX, bgType };
}

/* ─── Components ────────────────────────────────────────────────────────────── */

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Replaces requestAnimationFrame + getBoundingClientRect with pure scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end']
  });

  const [autoIndex, setAutoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoIndex(prev => (prev + 1) % features.length);
    }, 3500); // Shuffle every 3.5 seconds
    return () => clearInterval(interval);
  }, []);

  const totalVH = features.length * CARD_SCROLL_STEP_VH + 100;

  return (
    <section
      id="features"
      ref={sectionRef}
      aria-labelledby="features-heading"
      style={{ position: 'relative', height: `${totalVH}vh`, background: 'var(--color-base)' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 'clamp(20px, 3vh, 40px) 0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '580px', marginInline: 'auto', marginBottom: 'clamp(28px, 4vh, 52px)' }}>
            <h2 id="features-heading" className="type-section" style={{ color: 'var(--color-ink)', marginBottom: '12px' }}>
              Everything your resume needs.
            </h2>
            <p className="type-body-lg" style={{ color: 'var(--color-ink-muted)', maxWidth: '440px', marginInline: 'auto' }}>
              From first draft to final export — every tool is built in, without the clutter.
            </p>
          </div>

          <div className="features-split">
            <div className="card-deck-wrapper">
              {features.map((_, i) => (
                <MotionCard key={i} index={i} activeIndex={autoIndex} />
              ))}
            </div>

            <div style={{ position: 'relative', minHeight: '300px', display: 'flex', alignItems: 'center' }}>
              {features.map((feature, i) => (
                <MotionTextPanel key={i} index={i} feature={feature} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MotionCard({ index, activeIndex }: { index: number; activeIndex: number }) {
  const resting = parsedDeckTransforms[index];
  const activeZ = 20 - index;

  const active = { x: 0, y: -10, r: 0, s: 1.03, opacity: 1, shadow: 1, zIndex: activeZ };
  const dismissed = { x: 0, y: -140, r: -8, s: 1.05, opacity: 0, shadow: 0, zIndex: resting.zIndex };

  let targetState;
  if (index === activeIndex) {
    targetState = active;
  } else if (index < activeIndex) {
    targetState = dismissed;
  } else {
    targetState = { ...resting, shadow: 0, zIndex: resting.zIndex };
  }

  return (
    <motion.div
      className="deck-card"
      animate={{
        x: targetState.x,
        y: targetState.y,
        rotate: targetState.r,
        scale: targetState.s,
        opacity: targetState.opacity,
        zIndex: targetState.zIndex,
      }}
      transition={{ type: "spring", stiffness: 60, damping: 14 }}
    >
      <motion.div
        className="deck-card-shadow"
        animate={{ opacity: targetState.shadow }}
        transition={{ type: "spring", stiffness: 60, damping: 14 }}
      />
      <div className="deck-card-inner">
        <CardMockup index={index} />
      </div>
    </motion.div>
  );
}

function MotionTextPanel({ index, feature, progress }: { index: number; feature: typeof features[0]; progress: MotionValue<number> }) {
  // Use continuous function transforms to prevent stuttering across keyframes
  const textOpacity = useTransform(progress, (p) => getTextState(index, p).opacity);
  const textTranslateY = useTransform(progress, (p) => getTextState(index, p).y);
  const pointerEvents = useTransform(progress, (p) => getTextState(index, p).opacity > 0.85 ? 'auto' : 'none');

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: textOpacity,
        y: textTranslateY,
        pointerEvents: pointerEvents,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-primary)', lineHeight: 1, opacity: 0.85 }}>
          {feature.num}
        </span>
        <div style={{ height: 1, width: 36, background: 'var(--color-border)' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-ink-muted)' }}>
          {feature.tag}
        </span>
      </div>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.7rem, 2.5vw, 2.4rem)', fontWeight: 400, color: 'var(--color-ink)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 18 }}>
        {feature.title}
      </h3>

      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.0625rem', color: 'var(--color-ink-muted)', lineHeight: 1.75, maxWidth: '380px', marginBottom: 36 }}>
        {feature.desc}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {features.map((_, dotIndex) => (
          <DotIndicator key={dotIndex} dotIndex={dotIndex} progress={progress} />
        ))}
        <span style={{ marginLeft: 10, fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-ink-muted)', opacity: 0.6 }}>
          {feature.num} / 0{features.length}
        </span>
      </div>
    </motion.div>
  );
}

function DotIndicator({ dotIndex, progress }: { dotIndex: number; progress: MotionValue<number> }) {
  // Continuous function transform for smooth scaling without stuttering
  const scaleXVal = useTransform(progress, (p) => getDotState(dotIndex, p).scaleX);
  const bgFill = useTransform(progress, (p) => getDotState(dotIndex, p).bgType);

  return (
    <motion.div
      style={{
        height: 4,
        borderRadius: 2,
        width: 10,
        transformOrigin: 'left center',
        transition: 'background 0.2s ease',
        scaleX: scaleXVal,
        backgroundColor: bgFill,
      }}
    />
  );
}

/* ─── Card Mockups ─────────────────────────────────────────────────────────── */

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