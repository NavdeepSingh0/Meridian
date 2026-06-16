'use client';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stats = [
  { watermark: '98', value: '98%', label: 'ATS parse rate — your resume clears every gate' },
  { watermark: '<5', value: '< 5 min', label: 'From blank page to ready-to-send' },
  { watermark: '3', value: '3', label: 'Clean, professional designs — pick your wings' },
];

export default function StatsStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} aria-label="Product statistics" className="stats-section overflow-hidden">
      <div className="container relative">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="stat-item relative z-10 flex flex-col md:flex-row items-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 * i }}
            >
              {/* Watermark numeral */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8rem] md:text-[12rem] leading-none select-none pointer-events-none"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-primary)',
                  opacity: 0.06,
                  zIndex: -1,
                }}
              >
                {stat.watermark}
              </div>
              <p className="type-stat" style={{ color: 'var(--color-primary)' }}>{stat.value}</p>
              <p className="type-body stat-label relative mt-2 md:mt-4 px-2" style={{ background: 'rgba(218,255,239,0.5)' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
