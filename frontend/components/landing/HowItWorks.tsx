'use client';
import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    num: 1,
    id: 'step-circle-1',
    title: 'Fill in your details',
    desc: 'Work through each section at your own pace. The editor saves every keystroke — nothing is ever lost.',
  },
  {
    num: 2,
    id: 'step-circle-2',
    title: 'Analyze and refine',
    desc: 'Run the ATS check and get specific feedback on what to improve, right where the issue is.',
  },
  {
    num: 3,
    id: 'step-circle-3',
    title: 'Export and apply',
    desc: 'Download a clean PDF or share directly. Your resume is ready for any applicant tracking system.',
  },
];

export default function HowItWorks() {
  const [passed, setPassed] = useState<boolean[]>([false, false, false]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let rafId: number;
    let ticking = false;
    let cachedTop = 0;
    let cachedHeight = 0;

    const updateCache = () => {
      const section = sectionRef.current;
      if (section) {
        const rect = section.getBoundingClientRect();
        cachedTop = rect.top + window.scrollY;
        cachedHeight = rect.height || 300;
      }
    };

    const doScrollCheck = () => {
      if (cachedHeight === 0) return;
      
      const midY = window.innerHeight * 0.7; // Trigger point
      const currentTop = cachedTop - window.scrollY;
      
      const progress = Math.max(0, midY - currentTop);
      const percent = progress / cachedHeight;
      
      const nextPassed = [
        percent > 0.2,
        percent > 0.5,
        percent > 0.8
      ];
      
      setPassed((prev) => {
        if (prev[0] === nextPassed[0] && prev[1] === nextPassed[1] && prev[2] === nextPassed[2]) {
          return prev;
        }
        return nextPassed;
      });
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(doScrollCheck);
        ticking = true;
      }
    };

    updateCache();
    window.addEventListener('resize', updateCache, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    setTimeout(updateCache, 100);
    doScrollCheck();

    return () => {
      window.removeEventListener('resize', updateCache);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="how-it-works-section"
      ref={sectionRef}
      style={{ padding: 'clamp(60px, 8vw, 100px) 0' }} // More compact padding
    >
      <div className="container">
        <h2
          id="how-heading"
          className="type-section"
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(48px, 6vw, 72px)',
            color: 'var(--color-ink)',
          }}
        >
          Three steps to a stronger resume.
        </h2>

        {/* Horizontal 3-column layout to eliminate dead space */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(32px, 5vw, 48px)',
            position: 'relative',
          }}
        >
          {steps.map((step, i) => {
            const isPassed = passed[i];

            return (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 20,
                }}
              >
                {/* Numbered circle */}
                <div
                  id={step.id}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isPassed ? '#fff' : 'var(--color-primary)',
                    border: `2px solid ${isPassed ? 'var(--color-primary)' : 'transparent'}`,
                    boxShadow: isPassed
                      ? '0 0 0 6px rgba(100,182,172,0.1), 0 8px 24px rgba(100,182,172,0.12)'
                      : '0 8px 24px rgba(100,182,172,0.22)',
                    transition:
                      'background 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.5s ease, box-shadow 0.5s ease',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.6rem',
                      fontWeight: 400,
                      lineHeight: 1,
                      color: isPassed ? 'var(--color-primary)' : '#fff',
                      transition: 'color 0.5s ease',
                    }}
                  >
                    {step.num}
                  </span>

                  {/* Checkmark badge */}
                  <svg
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      opacity: isPassed ? 1 : 0,
                      transform: isPassed ? 'scale(1)' : 'scale(0.4)',
                      transition: 'opacity 0.4s ease 0.15s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.15s',
                    }}
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle cx="10" cy="10" r="10" fill="var(--color-primary)" />
                    <polyline points="5.5,10 8.5,13 14.5,7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Text */}
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                      marginBottom: 10,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9375rem',
                      color: 'var(--color-ink-muted)',
                      lineHeight: 1.65,
                      maxWidth: '280px',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}