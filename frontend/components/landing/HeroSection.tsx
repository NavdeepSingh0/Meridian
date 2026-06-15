import Link from 'next/link';

export default function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative pb-16 overflow-visible" style={{ backgroundColor: 'var(--color-base)' }}>
      {/* The Dynamic Teal Background Sweep */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ fill: 'var(--color-primary)' }}>
          {/* Maintained the ratio (middle drops lower than left) but pulled the entire structure upwards */}
          <path d="M0,0 L100,0 L100,30 C70,65 30,75 0,70 Z"></path>
        </svg>
      </div>
      {/* Content wrapper ensures z-index stays above the background sweep */}
      <div className="container relative z-10" style={{ paddingTop: 'calc(64px + clamp(80px, 12vw, 120px))' }}>
        <div style={{ maxWidth: '760px', marginInline: 'auto', textAlign: 'center' }}>
          
          <div className="eyebrow-pill" style={{ background: 'rgba(252,255,253,0.1)', borderColor: 'rgba(252,255,253,0.2)', color: '#FCFFFD' }} role="text">
            RESUME BUILDER &amp; ATS ANALYZER
          </div>
          
          <h1 id="hero-heading" className="type-hero" style={{ marginBottom: '24px', color: '#FCFFFD' }}>
            Your resume,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-ink)' }}>hire-ready.</em>
          </h1>
          
          <p className="type-body-lg hero-sub" style={{ color: 'rgba(252,255,253,0.85)' }}>
            Build a polished resume in minutes. Get section-by-section feedback, pinpoint ATS gaps, and walk into every application with a resume that works as hard as you do.
          </p>
          
          <div className="hero-cta-row">
            {/* White Button for high contrast against the dark teal */}
            <Link 
              href="/builder" 
              className="type-btn inline-flex transition-transform duration-150 ease-out hover:-translate-y-[1px] active:scale-98" 
              style={{ background: 'var(--color-ink)', color: '#FCFFFD', padding: '14px 28px', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}
            >
              Build your resume →
            </Link>
            <Link 
              href="/builder#ats" 
              className="type-btn inline-flex transition-transform duration-150 ease-out hover:-translate-y-[1px] active:scale-98"
              style={{ background: 'transparent', color: '#FCFFFD', border: '1.5px solid rgba(252,255,253,0.3)', padding: '14px 28px', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}
            >
              Check ATS score
            </Link>
          </div>
          
          <p className="trust-line" style={{ color: 'rgba(252,255,253,0.6)' }}>
            No account needed
            <span className="trust-dot" style={{ color: 'var(--color-ink)' }} aria-hidden="true"> · </span>
            Saves automatically
            <span className="trust-dot" style={{ color: 'var(--color-ink)' }} aria-hidden="true"> · </span>
            Export as PDF
          </p>
        </div>

        {/* Mockup wrapper */}
        <div className="hero-mockup-wrapper relative z-20 mt-16">
          <div className="browser-chrome" aria-hidden="true" style={{ borderColor: 'var(--color-border)' }}>
            <div className="browser-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="browser-url-bar">
              <span className="url-text">app/builder</span>
            </div>
          </div>
          
          <div className="hero-mockup-container" aria-hidden="true">
            {/* Column 1: Nav */}
            <div style={{ width: '180px', background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-ink)' }}>[AppName]</div>
              <div style={{ background: 'var(--color-base)', color: 'var(--color-ink)', borderLeft: '2px solid var(--color-primary)', padding: '8px 16px', fontSize: '0.6875rem', fontWeight: 500 }}>Personal Info</div>
              {['Summary', 'Experience', 'Education', 'Skills', 'Projects'].map(s => (
                <div key={s} style={{ color: 'var(--color-ink-muted)', padding: '8px 16px', fontSize: '0.6875rem', fontWeight: 500 }}>{s}</div>
              ))}
            </div>

            {/* Column 2: Editor */}
            <div style={{ flex: 1, background: 'var(--color-base)', borderRight: '1px solid var(--color-border)', padding: '16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-ink)', marginBottom: '12px' }}>Personal Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.5625rem', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>Full name</div>
                  <div style={{ height: '24px', border: '1px solid var(--color-border)', borderRadius: '4px', background: '#fff', padding: '0 8px', display: 'flex', alignItems: 'center', fontSize: '0.5625rem', color: 'var(--color-ink)' }}>Jordan Mitchell</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.5625rem', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>Job title</div>
                  <div style={{ height: '24px', border: '1px solid var(--color-border)', borderRadius: '4px', background: '#fff', padding: '0 8px', display: 'flex', alignItems: 'center', fontSize: '0.5625rem', color: 'var(--color-ink)' }}>Senior Product Designer</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.5625rem', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>Location</div>
                  <div style={{ height: '24px', border: '1px solid var(--color-border)', borderRadius: '4px', background: '#fff', padding: '0 8px', display: 'flex', alignItems: 'center', fontSize: '0.5625rem', color: 'var(--color-ink)' }}>San Francisco, CA</div>
                </div>
              </div>
            </div>

            {/* Column 3: Preview */}
            <div style={{ flex: 1, background: '#fff', padding: '16px' }}>
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '16px', height: '100%' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.875rem', color: 'var(--color-ink)' }}>Jordan Mitchell</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.4375rem', color: 'var(--color-ink-muted)', marginBottom: '8px' }}>Senior Product Designer · San Francisco, CA</div>
                <div style={{ borderTop: '1px solid var(--color-border)', margin: '8px 0' }}></div>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.5rem', color: 'var(--color-ink)' }}>Credwork Inc.</div>
                <div style={{ fontSize: '0.375rem', color: 'var(--color-ink-muted)', marginBottom: '6px' }}>2021–Present</div>
                <div style={{ height: '4px', background: 'var(--color-surface)', borderRadius: '2px', width: '100%', marginBottom: '4px' }}></div>
                <div style={{ height: '4px', background: 'var(--color-surface)', borderRadius: '2px', width: '88%', marginBottom: '4px' }}></div>
                <div style={{ height: '4px', background: 'var(--color-surface)', borderRadius: '2px', width: '72%' }}></div>
              </div>
            </div>

            {/* Column 4: Analysis */}
            <div style={{ width: '200px', background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', padding: '16px' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--color-ink)', marginBottom: '12px' }}>Resume Analysis</div>
              <div style={{ width: '64px', height: '64px', border: '3px solid var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInline: 'auto', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-primary)' }}>87</span>
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.5rem', color: 'var(--color-ink-muted)', textAlign: 'center', marginBottom: '12px' }}>ATS Score</div>
              <div style={{ borderTop: '1px solid var(--color-border)', marginBottom: '12px' }}></div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                <span style={{ background: 'var(--color-base)', borderRadius: '3px', padding: '2px 5px', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.4375rem', color: 'var(--color-ink)' }}>Skills</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.4375rem', color: 'var(--color-ink-muted)' }}>Missing keywords</span>
              </div>
            </div>
          </div>
        </div>
      </div>



    </section>
  );
}