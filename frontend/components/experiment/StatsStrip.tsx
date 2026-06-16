'use client';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

const testimonials = [
  {
    quote:
      "I had applied to maybe 40 companies and heard back from four. Meridian flagged things in my resume I genuinely didn't know were wrong. Rewrote two sections, sent the next batch — six callbacks that week.",
    name: 'Aryan Mehta',
    detail: 'Delhi Technological University',
    role: 'SWE Intern → Microsoft India',
    initials: 'AM',
    accent: '#64B6AC',
  },
  {
    quote:
      "Being an international student applying in Canada, I had no idea what Canadian recruiters actually looked for. The ATS breakdown made it obvious. Got my co-op lined up before most of my friends even had interviews.",
    name: 'Simran Kaur',
    detail: 'University of Waterloo, CS',
    role: 'Co-op → Shopify',
    initials: 'SK',
    accent: '#A7E8D8',
  },
  {
    quote:
      "I kept getting told my resume was strong. Meridian disagreed, and it was right. Three keyword gaps, one weak bullet, one format issue. Fixed all of it in an hour. Goldman offer came a month later.",
    name: 'Ethan Clarke',
    detail: 'UCL, London',
    role: 'Summer Analyst → Goldman Sachs',
    initials: 'EC',
    accent: '#64B6AC',
  },
];

export default function StatsStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      aria-label="Student testimonials"
      style={{
        background: 'var(--color-ink)',
        padding: 'clamp(48px, 6vw, 64px) 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '50%',
          background:
            'radial-gradient(circle, rgba(100,182,172,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Section label */}
        <motion.p
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            marginBottom: '40px',
            opacity: 0,
          }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 }}
        >
          From students who made it
        </motion.p>

        {/* Testimonial cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              style={{
                background: 'rgba(252, 255, 253, 0.04)',
                border: '1px solid rgba(252, 255, 253, 0.08)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden',
              }}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.2 + 0.15 * i }}
              whileHover={{
                borderColor: 'rgba(100, 182, 172, 0.25)',
                backgroundColor: 'rgba(252, 255, 253, 0.07)',
              }}
            >
              {/* Decorative quote mark */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '20px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '5rem',
                  lineHeight: 1,
                  color: t.accent,
                  opacity: 0.15,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                &quot;
              </span>

              {/* Quote text */}
              <blockquote
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'rgba(252, 255, 253, 0.8)',
                  margin: 0,
                  paddingTop: '16px',
                }}
              >
                {t.quote}
              </blockquote>

              <div style={{ flexGrow: 1 }} />

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: 'rgba(252, 255, 253, 0.06)',
                }}
              />

              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: `rgba(100, 182, 172, 0.18)`,
                    border: `1.5px solid ${t.accent}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: t.accent,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t.initials}
                  </span>
                </div>

                {/* Name + detail */}
                <div style={{ flex: '1 1 min-content' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#FCFFFD',
                      marginBottom: '2px',
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.75rem',
                      color: 'rgba(252, 255, 253, 0.4)',
                      lineHeight: 1.4,
                      marginBottom: '8px',
                    }}
                  >
                    {t.detail}
                  </p>
                  {/* Role pill — stacked under name for better wrapping */}
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: 'rgba(100, 182, 172, 0.12)',
                      border: `1px solid ${t.accent}35`,
                      borderRadius: '100px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: t.accent,
                    }}
                  >
                    {t.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
