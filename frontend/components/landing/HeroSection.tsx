'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--color-base)',
        paddingBottom: '80px',
      }}
    >

      {/* Teal sweep background — covers top portion */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 40, pointerEvents: 'none' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', fill: 'var(--color-primary)' }}>
          <path d="M0,0 L100,0 L100,60 C75,95 25,100 0,90 Z" />
        </svg>
      </div>

      {/* Two-column hero layout */}
      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 50,
          paddingTop: 'calc(76px + clamp(60px, 8vw, 100px))',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(32px, 5vw, 64px)',
          alignItems: 'center',
        }}
      >
        {/* LEFT COLUMN — all copy */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

          {/* Eyebrow Pill */}
          <motion.div
            className="eyebrow-pill"
            style={{ background: 'rgba(252,255,253,0.12)', borderColor: 'rgba(252,255,253,0.25)', color: '#FCFFFD', marginBottom: '24px' }}
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
            style={{ marginBottom: '20px', color: '#FCFFFD', textAlign: 'left' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.2 }}
          >
            Your first step into the{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--color-ink)' }}>professional world.</em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="type-body-lg"
            style={{ color: 'rgba(252,255,253,0.85)', maxWidth: '460px', marginBottom: '32px', lineHeight: 1.7 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.35 }}
          >
            Build a polished, ATS-ready resume in minutes. Get section-by-section guidance,
            spot the gaps before you apply, and walk into every opportunity with confidence.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.5 }}
          >
            <Link
              href="/builder"
              className="type-btn"
              style={{ background: 'var(--color-ink)', color: '#FCFFFD', padding: '14px 28px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'transform 150ms ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              Start Your Journey →
            </Link>
            <Link
              href="/checker"
              className="type-btn"
              style={{ background: 'transparent', color: '#FCFFFD', border: '1.5px solid rgba(252,255,253,0.35)', padding: '14px 28px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'border-color 150ms ease' }}
            >
              Check Your Flight Path
            </Link>
          </motion.div>

          {/* Trust Line */}
          <motion.p
            className="trust-line"
            style={{ color: 'rgba(252,255,253,0.6)', textAlign: 'left' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.65 }}
          >
            No account needed
            <span style={{ color: 'var(--color-primary)', padding: '0 6px' }} aria-hidden="true">·</span>
            Saves automatically
            <span style={{ color: 'var(--color-primary)', padding: '0 6px' }} aria-hidden="true">·</span>
            Export as PDF
          </motion.p>
        </div>

        {/* RIGHT COLUMN — browser mockup floating in the sweep */}
        <motion.div
          aria-hidden="true"
          style={{ position: 'relative', zIndex: 20 }}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.35 }}
        >
          {/* Browser chrome bar */}
          <div className="browser-chrome" style={{ borderColor: 'rgba(212, 232, 228, 0.5)' }}>
            <div className="browser-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="browser-url-bar">
              <span className="url-text">meridian.cv/builder</span>
            </div>
          </div>

          {/* Screenshot */}
          <div
            style={{
              border: '1px solid rgba(212,232,228,0.4)',
              borderTop: 'none',
              borderRadius: '0 0 16px 16px',
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '0 32px 64px rgba(28,43,40,0.20), 0 0 0 1px rgba(28,43,40,0.04)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
              maxHeight: '420px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/builder-screenshot.png"
              alt=""
              width={1600}
              height={1000}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
