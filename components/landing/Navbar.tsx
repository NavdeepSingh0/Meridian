'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <nav role="navigation" aria-label="Main navigation" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 'var(--z-nav)', background: 'rgba(252, 255, 253, 0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
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

        <ul className="hidden lg:flex" style={{ listStyle: 'none', gap: '32px' }}>
          <li><Link href="#features" className="nav-link">Features</Link></li>
          <li><Link href="#how-it-works" className="nav-link">How it works</Link></li>
          <li><Link href="#templates" className="nav-link">Templates</Link></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="nav-signin hidden lg:block">Sign in</button>
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

      <div id="mobile-menu" role="dialog" aria-label="Navigation menu" className={isOpen ? 'block' : 'hidden'} style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 'var(--z-mobile-drawer)', background: 'var(--color-base)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href="#features" className="nav-link" style={{ padding: '24px 0', fontSize: '1rem', color: 'var(--color-ink)' }} onClick={() => setIsOpen(false)}>Features</Link>
            <Link href="#how-it-works" className="nav-link" style={{ padding: '24px 0', fontSize: '1rem', color: 'var(--color-ink)' }} onClick={() => setIsOpen(false)}>How it works</Link>
            <Link href="#templates" className="nav-link" style={{ padding: '24px 0', fontSize: '1rem', color: 'var(--color-ink)' }} onClick={() => setIsOpen(false)}>Templates</Link>
            <div style={{ borderTop: '1px solid var(--color-border)', margin: '0' }}></div>
            <Link href="/builder" className="btn-primary-nav" style={{ width: '100%', justifyContent: 'center', padding: '14px', margin: '16px 0' }} onClick={() => setIsOpen(false)}>Get started →</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}