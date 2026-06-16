'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ATSSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="ats-analysis" className="ats-section relative overflow-hidden" ref={sectionRef}>
      <div className="container relative" style={{ zIndex: 10 }}>
        <div className="ats-section-grid">

          {/* Left column — copy */}
          <motion.div
            className="ats-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="eyebrow-pill"
              style={{ marginBottom: '24px', border: '1px solid rgba(252, 255, 253, 0.15)', background: 'rgba(252, 255, 253, 0.05)', color: 'var(--color-primary)' }}
            >
              ATS COMPASS
            </div>
            <h2 className="type-section" style={{ color: '#FCFFFD', marginBottom: '20px' }}>
              See the terrain before you fly into it.
            </h2>
            <p className="type-body-lg" style={{ color: 'rgba(252, 255, 253, 0.70)', marginBottom: '28px' }}>
              Applicant tracking systems filter out most resumes before a human ever reads them.
              Our ATS compass maps every obstacle — not a vague score, but the exact lines and
              sections that need attention, with rewrites you can apply in one click.
            </p>
            <ul className="ats-bullets">
              <li className="ats-bullet" style={{ color: 'rgba(252, 255, 253, 0.85)' }}>
                <span className="bullet-arrow" aria-hidden="true">→</span>
                Highlights the exact sentence or bullet that needs work
              </li>
              <li className="ats-bullet" style={{ color: 'rgba(252, 255, 253, 0.85)' }}>
                <span className="bullet-arrow" aria-hidden="true">→</span>
                Maps your skills against any job description you paste
              </li>
            </ul>
            <a
              href="#"
              className="btn-primary-hero"
              style={{ marginTop: '32px', display: 'inline-flex' }}
              onClick={(e) => e.preventDefault()}
            >
              Check your ATS compass →
            </a>
          </motion.div>

          {/* Right column — mockup card */}
          <motion.div
            className="ats-mockup-card relative"
            aria-hidden="true"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Sketch arrow */}
            <svg
              className="absolute pointer-events-none"
              style={{ top: '-40px', left: '-24px', width: '96px', height: '96px', zIndex: 20 }}
              viewBox="0 0 100 100"
              fill="none"
            >
              <path d="M 20,80 Q 40,20 85,35" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 18,82 Q 42,18 83,37" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d="M 70,25 L 85,35 L 75,50" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="ats-score-display relative">
              <p className="type-ats-score" style={{ color: 'var(--color-primary)' }}>87</p>
              <p className="type-label" style={{ color: 'var(--color-ink-muted)', marginTop: '4px', textAlign: 'center' }}>ATS Compatibility Score</p>
            </div>

            <div className="ats-divider" />

            <div className="ats-issues">
              <div className="ats-issue-row relative">
                <span className="section-chip">Summary</span>
                <div className="ats-issue-content">
                  <p className="ats-issue-title">Missing industry keywords</p>
                  <p className="ats-issue-suggest">Add &quot;user research&quot; and &quot;design systems&quot; to your opening</p>
                </div>
              </div>

              <div className="ats-issue-row relative mt-4">
                {/* Sketch circle */}
                <svg
                  className="absolute pointer-events-none"
                  style={{
                    top: '-8px',
                    left: '-8px',
                    width: 'calc(100% + 16px)',
                    height: 'calc(100% + 16px)',
                    zIndex: 20,
                  }}
                  viewBox="0 0 300 60"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path d="M 10,30 C 15,5 290,0 295,25 C 300,50 20,55 15,35" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 12,32 C 12,8 288,3 293,27 C 298,52 18,52 13,37" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                </svg>

                <span className="section-chip relative" style={{ zIndex: 10 }}>Experience</span>
                <div className="ats-issue-content relative" style={{ zIndex: 10 }}>
                  <p className="ats-issue-title">No quantified results in 2 bullets</p>
                  <p className="ats-issue-suggest">Replace &quot;improved performance&quot; with a specific metric</p>
                </div>
              </div>

              <div className="ats-issue-row relative mt-4">
                <span className="section-chip">Skills</span>
                <div className="ats-issue-content">
                  <p className="ats-issue-title">3 keywords from job description not found</p>
                  <p className="ats-issue-suggest">Add: Figma, Accessibility, Prototyping</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
