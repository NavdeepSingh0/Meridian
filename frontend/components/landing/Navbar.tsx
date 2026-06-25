'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthModal from '../auth/AuthModal';
import Logo from '../shared/Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Your Toolkit' },
    { href: '#how-it-works', label: 'The Journey' },
    { href: '#templates', label: 'Designs' },
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
          style={{ textDecoration: 'none' }}
        >
          <Logo width={160} />
        </a>

        {/* Nav links — hidden on mobile */}
        <ul className="hidden md:flex items-center m-0 p-0 gap-1.5" style={{ listStyle: 'none' }}>
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
          <button className="btn-secondary-nav" style={{ display: 'inline-flex', cursor: 'pointer', border: 'none' }} onClick={() => setShowAuthModal(true)}>
            Sign in
          </button>
          <Link href="/builder" className="btn-primary-nav" style={{ display: 'inline-flex' }}>
            Get Started →
          </Link>
        </div>

      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />
    </nav>
  );
}
