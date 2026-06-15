'use client';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import React from 'react';

const templates = [
  {
    name: 'Modern',
    desc: 'Two-column layout with bold visual hierarchy.',
  },
  {
    name: 'Minimal',
    desc: 'Generous whitespace, understated and precise.',
  },
  {
    name: 'Classic',
    desc: 'Clean serif headings, strong section structure.',
  },
];

// Fanned out like the Excalidraw sketch — spread horizontally, overlapping
const cardPlacement = [
  // Left card (tilted left)
  {
    top: '10%',
    left: '0%',
    rotate: -12,
    zIndex: 1,
    opacity: 0.8,
    width: 260,
    height: 360,
  },
  // Middle card (straight/slight right tilt, overlaps both)
  {
    top: '5%',
    left: '25%',
    rotate: 2,
    zIndex: 3,
    opacity: 1.0,
    width: 280,
    height: 380,
  },
  // Right card (tilted right)
  {
    top: '15%',
    left: '50%',
    rotate: 18,
    zIndex: 2,
    opacity: 0.8,
    width: 260,
    height: 360,
  },
];

export default function TemplateShowcase() {
  const textRef = useScrollReveal();

  return (
    <section
      id="templates"
      aria-labelledby="templates-heading"
      className="templates-section"
      style={{ padding: 'clamp(40px, 6vw, 80px) 0' }} // Reduced vertical padding
    >
      <div className="container">
        <div className="template-split" style={{ alignItems: 'center' }}>

          {/* LEFT — simple text matching Excalidraw */}
          <div
            ref={textRef as React.RefObject<HTMLDivElement>}
            className="template-text-col"
            style={{ maxWidth: '400px' }}
          >
            <h2
              id="templates-heading"
              className="type-section"
              style={{ color: 'var(--color-ink)', marginBottom: 24, lineHeight: 1.1, fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
            >
              Three premium templates
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {templates.map((t) => (
                <p key={t.name} style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--color-ink)' }}>{t.name}:</strong> {t.desc}
                </p>
              ))}
            </div>
          </div>

          {/* RIGHT — wide fanned card spread, matching sketch */}
          <div
            style={{
              position: 'relative',
              height: '420px', // Shorter section height
              width: '100%',
              marginRight: '-40px', // Bleed right
            }}
          >
            {cardPlacement.map((placement, i) => (
              <div
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
                  transform: `rotate(${placement.rotate}deg)`,
                  transformOrigin: 'center center',
                  boxShadow: i === 1
                    ? '0 24px 48px rgba(28,43,40,0.12), 0 0 0 1px rgba(28,43,40,0.04)'
                    : 'var(--shadow-card-resting)',
                  transition: 'transform 0.6s ease, box-shadow 0.6s ease',
                  backgroundColor: '#fff',
                }}
              >
                {/* Resume image */}
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={`/template-${templates[i].name.toLowerCase()}-v2.png`}
                    alt={`${templates[i].name} resume template preview`}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                    sizes="340px"
                    priority={i === 1} // Middle card is priority
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}