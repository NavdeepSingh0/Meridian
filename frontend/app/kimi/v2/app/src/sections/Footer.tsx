export default function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--color-bg)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="container-meridian" style={{ paddingTop: 'clamp(32px, 4vw, 48px)', paddingBottom: 'clamp(24px, 3vw, 32px)' }}>
        <div
          className="flex flex-col lg:flex-row justify-between gap-10"
        >
          {/* Brand */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2.5 mb-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              <span
                className="text-sm font-semibold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Meridian
              </span>
            </div>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)', maxWidth: '240px' }}
            >
              Your professional starting point. Build a resume that gets you in the room.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-10 lg:gap-16">
            {/* Product */}
            <div>
              <p
                className="text-xs font-medium uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Product
              </p>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="#features"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <p
                className="text-xs font-medium uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Support
              </p>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <p
                className="text-xs font-medium uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Connect
              </p>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="https://github.com/NavdeepSingh0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/navdeepsingh-dhunna/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:navdeep.s.dhunna@gmail.com"
                    className="text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                  >
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            marginTop: '32px',
            paddingTop: '20px',
          }}
        >
          <p
            className="text-xs text-center"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            &copy; 2026 Meridian. Built for job seekers.
          </p>
        </div>
      </div>
    </footer>
  );
}
