'use client';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 transition-all duration-300 ease-in-out"
      style={{
        zIndex: 'var(--z-nav)',
        background: scrolled ? 'rgba(8, 12, 26, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 32px rgba(0, 0, 0, 0.24)' : 'none',
      }}
    >
      <div className="container-meridian flex items-center justify-between" style={{ height: '64px' }}>
        {/* Logo */}
        <a
          href="#"
          className="group inline-flex items-center gap-2.5"
          style={{ textDecoration: 'none' }}
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {/* Paper plane icon */}
          <svg
            className="transition-transform duration-200 ease-out group-hover:-rotate-[10deg] group-hover:-translate-y-0.5"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: scrolled ? 'var(--color-text)' : 'var(--color-text)' }}
          >
            Meridian
          </span>
        </a>

        {/* Desktop Nav Links */}
        <ul className="hidden lg:flex items-center" style={{ listStyle: 'none', gap: '4px' }}>
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="relative px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-150"
                style={{
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text)';
                  e.currentTarget.style.background = 'rgba(74, 143, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side: Sign In + CTA */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <a
            href="#"
            className="hidden lg:inline-flex text-sm font-medium transition-colors duration-150"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            Sign In
          </a>
          <a
            href="#cta"
            onClick={(e) => handleNavClick(e, '#cta')}
            className="hidden lg:inline-flex btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.875rem' }}
          >
            Start Building &rarr;
          </a>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex items-center justify-center"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text)',
              width: '36px',
              height: '36px',
            }}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {isOpen ? (
                <>
                  <line x1="2" y1="2" x2="18" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="12" x2="18" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="0" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Navigation menu"
        className={isOpen ? 'block' : 'hidden'}
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 'var(--z-mobile-drawer)',
          background: 'rgba(8, 12, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="container-meridian" style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base py-4 transition-colors duration-150"
                style={{ color: 'var(--color-text)', textDecoration: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                {link.label}
              </a>
            ))}
            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="#"
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '12px' }}
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </a>
              <a
                href="#cta"
                onClick={(e) => handleNavClick(e, '#cta')}
                className="btn-primary"
                style={{ justifyContent: 'center', padding: '12px' }}
              >
                Start Building &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
