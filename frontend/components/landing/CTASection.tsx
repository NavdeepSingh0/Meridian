import Link from 'next/link';

export default function CTASection() {
  return (
    <section aria-labelledby="cta-heading" className="cta-section">
      <div className="container">
        <div style={{ maxWidth: '640px', marginInline: 'auto', textAlign: 'center' }}>
          <h2 id="cta-heading" className="type-section" style={{ color: 'var(--color-ink)', marginBottom: '20px' }}>
            Your next role starts with a better resume.
          </h2>
          <p className="type-body-lg" style={{ color: 'var(--color-ink-muted)', marginBottom: '36px' }}>
            No account required. Build, analyze, and export in under five minutes.
          </p>
          <div className="hero-cta-row">
            <Link href="/builder" id="cta-build-btn" className="btn-primary-hero">Build your resume →</Link>
            <Link href="/builder#ats" className="btn-ghost-hero">See how it works</Link>
          </div>
        </div>
      </div>
    </section>
  );
}