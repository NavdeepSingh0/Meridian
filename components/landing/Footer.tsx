import Link from 'next/link';

export default function Footer() {
  return (
    <footer role="contentinfo" style={{ background: 'var(--color-ink)' }}>
      <div style={{ borderTop: '1px solid rgba(252,255,253,0.10)' }}></div>
      <div className="container" style={{ paddingTop: 'clamp(24px, 3.5vw, 40px)', paddingBottom: 'clamp(20px, 2.5vw, 28px)' }}>
        <div className="footer-row-top">
          <div className="footer-brand">
            <p className="type-wordmark" style={{ color: '#FCFFFD', marginBottom: '8px' }}>[AppName]</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 400, color: 'rgba(252,255,253,0.50)', fontFamily: 'var(--font-sans)' }}>
              Resume builder and ATS analyzer.
            </p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-link-group">
              <p className="footer-group-label">Product</p>
              <ul>
                <li><Link href="#features" className="footer-link">Features</Link></li>
                <li><Link href="#templates" className="footer-link">Templates</Link></li>
              </ul>
            </div>
            <div className="footer-link-group">
              <p className="footer-group-label">Support</p>
              <ul>
                <li><Link href="/privacy" className="footer-link">Privacy</Link></li>
                <li><Link href="/terms" className="footer-link">Terms</Link></li>
              </ul>
            </div>
            <div className="footer-link-group">
              <p className="footer-group-label">Connect</p>
              <ul>
                <li>
                  <a href="https://github.com/NavdeepSingh0" target="_blank" rel="noopener noreferrer" className="footer-link">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/navdeepsingh-dhunna/" target="_blank" rel="noopener noreferrer" className="footer-link">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="mailto:navdeep.s.dhunna@gmail.com" className="footer-link">
                    Email
                  </a>
                </li>
                <li className="footer-link" style={{ pointerEvents: 'none', opacity: 0.6 }}>
                  Chandigarh, India
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(252,255,253,0.10)', marginTop: '32px', paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 400, color: 'rgba(252,255,253,0.35)' }}>
            &copy; 2026 [AppName]. Built for job seekers.
          </p>
        </div>
      </div>
    </footer>
  );
}