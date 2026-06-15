'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  return (
    <nav role="navigation" aria-label="Main navigation" className={`nav-container ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">
        
        <Link href="/" className="inline-flex items-center gap-3" style={{ textDecoration: 'none' }}>
          {/* The Meridian Navigational Monogram */}
          <div className="relative w-6 h-6 flex items-center justify-center select-none" aria-hidden="true">
            {/* The Meridian Line (Longitude Arc) */}
            <div className="absolute inset-0 rounded-full border border-dashed" style={{ borderColor: 'var(--color-primary)', opacity: 0.6 }}></div>
            {/* The Flight Path Triangle (The Paper Plane arriving at the precise node) */}
            <svg className="w-3 h-3 absolute" style={{ color: 'var(--color-ink)', transform: 'rotate(45deg) translate(-1px, 1px)' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* The Wordmark Rendering */}
          <span className="type-wordmark" style={{ color: 'var(--color-ink)' }}>
            Meridian <span style={{ color: 'var(--color-primary)', fontWeight: 400 }}>CV</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center" style={{ listStyle: 'none', gap: '8px' }}>
          <li><Link href="#features" className="nav-link-pill">Features</Link></li>
          <li><Link href="#how-it-works" className="nav-link-pill">How it works</Link></li>
          <li><Link href="#templates" className="nav-link-pill">Templates</Link></li>
          <li><Link href="#ats-analysis" className="nav-link-pill">ATS Analyzer</Link></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/builder?mode=signin" className="btn-secondary-nav hidden lg:inline-flex">Sign in</Link>
          <Link href="/builder" className="btn-primary-nav hidden lg:inline-flex">Get started →</Link>
          
          <button 
            className="lg:hidden flex" 
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} 
            aria-expanded={isOpen} 
            aria-controls="mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-ink)' }}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {isOpen ? (
                <>
                  <line x1="2" y1="2" x2="18" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="2" y1="12" x2="18" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="0" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" role="dialog" aria-label="Navigation menu" className={isOpen ? 'block' : 'hidden'} style={{ position: 'fixed', top: scrolled ? '60px' : '76px', left: 0, right: 0, zIndex: 'var(--z-mobile-drawer)', background: 'var(--color-base)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', transition: 'top 0.3s ease' }}>
        <div className="container" style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
            <Link href="#features" className="nav-link" style={{ padding: '16px 0', fontSize: '1rem', color: 'var(--color-ink)' }} onClick={() => setIsOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="nav-link" style={{ padding: '16px 0', fontSize: '1rem', color: 'var(--color-ink)' }} onClick={() => setIsOpen(false)}>How it works</Link>
            <Link href="#templates" className="nav-link" style={{ padding: '16px 0', fontSize: '1rem', color: 'var(--color-ink)' }} onClick={() => setIsOpen(false)}>Templates</Link>
            <Link href="#ats-analysis" className="nav-link" style={{ padding: '16px 0', fontSize: '1rem', color: 'var(--color-ink)' }} onClick={() => setIsOpen(false)}>ATS Analyzer</Link>
            <div style={{ borderTop: '1px solid var(--color-border)', margin: '8px 0' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '12px 0' }}>
              <Link href="/builder?mode=signin" className="btn-secondary-nav" style={{ justifyContent: 'center', padding: '12px' }} onClick={() => setIsOpen(false)}>Sign in</Link>
              <Link href="/builder" className="btn-primary-nav" style={{ justifyContent: 'center', padding: '12px' }} onClick={() => setIsOpen(false)}>Get started →</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}