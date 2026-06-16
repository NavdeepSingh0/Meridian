import { motion } from 'framer-motion';

export default function HeroSection() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #080C1A 0%, #0A1020 50%, #080C1A 100%)',
      }}
    >
      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(74, 143, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.5,
        }}
      />

      {/* Subtle gradient orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 143, 255, 0.08) 0%, transparent 70%)',
          top: '10%',
          right: '-10%',
          filter: 'blur(60px)',
        }}
      />

      <div className="container-meridian relative z-10 text-center" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="eyebrow-pill">Your professional journey starts here.</span>
        </motion.div>

        {/* H1 — staggered word animation */}
        <motion.h1
          id="hero-heading"
          className="type-hero"
          style={{ marginBottom: '24px', maxWidth: '800px', marginInline: 'auto' }}
        >
          {['Built', ' ', 'to', ' ', 'get', ' ', 'you', ' '].map((word, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.06 }}
            >
              {word === ' ' ? '\u00A0' : word}
            </motion.span>
          ))}
          <motion.span
            className="inline-block gradient-text"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.68 }}
          >
            in
          </motion.span>
          <span className="inline-block">&nbsp;</span>
          <motion.span
            className="inline-block gradient-text"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.74 }}
          >
            the
          </motion.span>
          <span className="inline-block">&nbsp;</span>
          <motion.span
            className="inline-block gradient-text"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.80 }}
          >
            room.
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="type-body-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          style={{
            maxWidth: '580px',
            marginInline: 'auto',
            marginBottom: '36px',
          }}
        >
          Meridian reads your resume the way a recruiter does — and the way an ATS does.
          Then it tells you exactly what to fix, what&apos;s missing, and what to say instead.
        </motion.p>

        {/* CTA Row */}
        <motion.div
          className="flex items-center justify-center flex-wrap"
          style={{ gap: '16px', marginBottom: '20px' }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <a href="#cta" onClick={(e) => handleScrollTo(e, '#cta')} className="btn-primary">
            Start Building &rarr;
          </a>
          <a href="#how-it-works" onClick={(e) => handleScrollTo(e, '#how-it-works')} className="btn-ghost">
            See how it works &darr;
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="text-sm"
          style={{ color: 'var(--color-text-tertiary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          Trusted by 2,400+ job seekers in their first 30 days.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ width: '24px', height: '36px', borderRadius: '12px', border: '2px solid rgba(240, 240, 245, 0.2)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6px' }}
        >
          <div style={{ width: '4px', height: '8px', borderRadius: '2px', background: 'var(--color-accent)' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
