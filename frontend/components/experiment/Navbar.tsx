'use client';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav role="navigation" aria-label="Main navigation" className={`nav-container ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">

        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, flexShrink: 0 }} aria-hidden="true">
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px dashed var(--color-primary)', opacity: 0.4 }} />
            <div style={{ position: 'absolute', width: 20, height: 20, top: 4, left: 4, borderRadius: '50%', border: '1px solid var(--color-primary)', opacity: 0.2 }} />
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-ink)', transform: 'rotate(45deg)' }}>
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="type-wordmark" style={{ color: 'var(--color-ink)' }}>Meridian</span>
        </a>

        {/* Nav links — always visible, no Tailwind breakpoints */}
        <ul style={{ display: 'flex', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0, gap: '6px' }}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={(e) => scrollToSection(e, link.href)} className="nav-link-pill">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions — always visible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="#" className="btn-secondary-nav" style={{ display: 'inline-flex' }} onClick={(e) => e.preventDefault()}>
            Sign in
          </a>
          <a href="#" className="btn-primary-nav" style={{ display: 'inline-flex' }} onClick={(e) => e.preventDefault()}>
            Get Started →
          </a>
        </div>

      </div>
    </nav>
  );
}
