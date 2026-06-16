'use client';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Your Toolkit' },
    { href: '#how-it-works', label: 'The Journey' },
    { href: '#templates', label: 'Designs' },
    { href: '#ats-analysis', label: 'ATS Compass' },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav role="navigation" aria-label="Main navigation" className={`nav-container ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">

        {/* Logo group — Waypoint icon + wordmark */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="inline-flex items-center gap-2.5"
          style={{ textDecoration: 'none' }}
        >
          {/* Waypoint icon — compass rose + paper plane */}
          <div className="relative flex items-center justify-center select-none" style={{ width: 28, height: 28 }} aria-hidden="true">
            {/* Dashed circle border — compass rose */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: '1.5px dashed var(--color-primary)', opacity: 0.4 }}
            />
            {/* Inner solid ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: 20,
                height: 20,
                top: 4,
                left: 4,
                border: '1px solid var(--color-primary)',
                opacity: 0.2,
              }}
            />
            {/* Paper plane at center */}
            <svg
              width={10}
              height={10}
              viewBox="0 0 24 24"
              fill="none"
              style={{
                color: 'var(--color-ink)',
                transform: 'rotate(45deg)',
              }}
            >
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Wordmark */}
          <span className="type-wordmark" style={{ color: 'var(--color-ink)' }}>
            Meridian
          </span>
        </a>

        {/* Journey nav links — centered */}
        <ul className="hidden lg:flex items-center" style={{ listStyle: 'none', gap: '6px' }}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="nav-link-pill"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right action cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="#" className="btn-secondary-nav hidden lg:inline-flex" onClick={(e) => e.preventDefault()}>
            Sign in
          </a>
          <a href="#" className="btn-primary-nav hidden lg:inline-flex" onClick={(e) => e.preventDefault()}>
            Get Started →
          </a>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-ink)', padding: '4px' }}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
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
          top: scrolled ? '60px' : '76px',
          left: 0,
          right: 0,
          zIndex: 'var(--z-mobile-drawer)',
          background: 'var(--color-base)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          transition: 'top 0.3s ease',
        }}
      >
        <div className="container" style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link"
                style={{ padding: '16px 0', fontSize: '1rem', color: 'var(--color-ink)' }}
                onClick={(e) => scrollToSection(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <div style={{ borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '12px 0' }}>
              <a href="#" className="btn-secondary-nav" style={{ justifyContent: 'center', padding: '12px' }} onClick={(e) => e.preventDefault()}>
                Sign in
              </a>
              <a href="#" className="btn-primary-nav" style={{ justifyContent: 'center', padding: '12px' }} onClick={(e) => e.preventDefault()}>
                Get Started →
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
