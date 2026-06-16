'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const templates = [
  {
    name: 'Modern',
    desc: 'Two-column layout with bold visual hierarchy. For those who want their work to speak loudly.',
  },
  {
    name: 'Minimal',
    desc: 'Generous whitespace, understated and precise. When confidence needs no decoration.',
  },
  {
    name: 'Classic',
    desc: 'Clean serif headings, strong section structure. Timeless professionalism that never misses.',
  },
];

const cardPlacement = [
  { top: '10%', left: '0%', rotate: -12, zIndex: 1, opacity: 0.8, width: 260, height: 360 },
  { top: '5%', left: '25%', rotate: 2, zIndex: 3, opacity: 1.0, width: 280, height: 380 },
  { top: '15%', left: '50%', rotate: 18, zIndex: 2, opacity: 0.8, width: 260, height: 360 },
];

export default function TemplateShowcase() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="templates"
      aria-labelledby="templates-heading"
      className="templates-section"
      style={{ padding: 'clamp(40px, 6vw, 80px) 0' }}
      ref={sectionRef}
    >
      <div className="container">
        <div className="template-split" style={{ alignItems: 'center' }}>

          {/* LEFT — text */}
          <motion.div
            className="template-text-col"
            style={{ maxWidth: '400px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              id="templates-heading"
              className="type-section"
              style={{ color: 'var(--color-ink)', marginBottom: 24, lineHeight: 1.1, fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
            >
              Three designs, one clear path.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {templates.map((t) => (
                <p key={t.name} style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--color-ink)' }}>{t.name}:</strong> {t.desc}
                </p>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — fanned cards */}
          <div
            style={{
              position: 'relative',
              height: '420px',
              width: '100%',
              marginRight: '-40px',
            }}
          >
            {cardPlacement.map((placement, i) => (
              <motion.div
                key={templates[i].name}
                style={{
                  position: 'absolute',
                  top: placement.top,
                  left: placement.left,
                  width: placement.width,
                  height: placement.height,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  zIndex: placement.zIndex,
                  opacity: placement.opacity,
                  transformOrigin: 'center center',
                  boxShadow: i === 1
                    ? '0 24px 48px rgba(28,43,40,0.12), 0 0 0 1px rgba(28,43,40,0.04)'
                    : 'var(--shadow-card-resting)',
                  transition: 'transform 0.6s ease, box-shadow 0.6s ease',
                  backgroundColor: '#fff',
                }}
                initial={{ opacity: 0, y: 30, rotate: placement.rotate + (i === 0 ? -8 : i === 2 ? 8 : 0) }}
                animate={isInView ? { opacity: placement.opacity, y: 0, rotate: placement.rotate } : {}}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 * i }}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img
                    src={`/template-${templates[i].name.toLowerCase()}-v2.png`}
                    alt={`${templates[i].name} resume template preview`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
