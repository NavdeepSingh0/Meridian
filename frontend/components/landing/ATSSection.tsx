import Link from 'next/link';

export default function ATSSection() {
  return (
    <section id="ats-analysis" className="ats-section relative overflow-hidden">
      <div className="container relative z-10">
        <div className="ats-section-grid">
          
          <div className="ats-copy">
            <div className="eyebrow-pill" style={{ marginBottom: '24px', border: '1px solid rgba(252, 255, 253, 0.15)', background: 'rgba(252, 255, 253, 0.05)', color: 'var(--color-primary)' }}>ATS ANALYSIS</div>
            <h2 className="type-section" style={{ color: '#FCFFFD', marginBottom: '20px' }}>
              Know exactly why you&apos;re being filtered out.
            </h2>
            <p className="type-body-lg" style={{ color: 'rgba(252, 255, 253, 0.70)', marginBottom: '28px' }}>
              Applicant tracking systems reject most resumes before a human ever reads them.
              Our ATS analyzer shows you the exact issues — not a generic score, but the specific
              lines and sections that need attention, with suggested rewrites you can apply in one click.
            </p>
            <ul className="ats-bullets">
              <li className="ats-bullet" style={{ color: 'rgba(252, 255, 253, 0.85)' }}>
                <span className="bullet-arrow" aria-hidden="true">→</span>
                Highlights the exact sentence or bullet with an issue
              </li>
              <li className="ats-bullet" style={{ color: 'rgba(252, 255, 253, 0.85)' }}>
                <span className="bullet-arrow" aria-hidden="true">→</span>
                Compares your skills against any job description you paste
              </li>
            </ul>
            <Link href="/builder#ats" className="btn-primary-hero" style={{ marginTop: '32px', display: 'inline-flex' }}>
              Check your ATS score
            </Link>
          </div>

          {/* The Mockup Card with Sketch Markup */}
          <div className="ats-mockup-card relative" aria-hidden="true">
            
            {/* Illustrative Sketch Arrow pointing to the score */}
            <svg className="absolute -top-10 -left-6 w-24 h-24 pointer-events-none z-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 20,80 Q 40,20 85,35" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 18,82 Q 42,18 83,37" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d="M 70,25 L 85,35 L 75,50" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div className="ats-score-display relative">
              <p className="type-ats-score" style={{ color: 'var(--color-primary)' }}>87</p>
              <p className="type-label" style={{ color: 'var(--color-ink-muted)', marginTop: '4px', textAlign: 'center' }}>ATS Compatibility Score</p>
            </div>
            
            <div className="ats-divider"></div>
            
            <div className="ats-issues">
              <div className="ats-issue-row relative">
                <span className="section-chip">Summary</span>
                <div className="ats-issue-content">
                  <p className="ats-issue-title">Missing industry keywords</p>
                  <p className="ats-issue-suggest">Add &quot;user research&quot; and &quot;design systems&quot; to your opening</p>
                </div>
              </div>

              <div className="ats-issue-row relative mt-4">
                
                {/* Illustrative Sketch Circle around the specific issue */}
                <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none z-20" viewBox="0 0 300 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 10,30 C 15,5 290,0 295,25 C 300,50 20,55 15,35" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 12,32 C 12,8 288,3 293,27 C 298,52 18,52 13,37" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                </svg>

                <span className="section-chip relative z-10">Experience</span>
                <div className="ats-issue-content relative z-10">
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
          </div>

        </div>
      </div>
    </section>
  );
}