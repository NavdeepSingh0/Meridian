import React from 'react';
import Link from 'next/link';
import Logo from '../shared/Logo';
import styles from './landing.module.css';

export default function LandingNav() {
  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.navBrand} aria-label="Meridian home">
          <Logo width={124} />
        </Link>
        <nav className={styles.navLinks} aria-label="Main">
          <a href="#journey">How it works</a>
          <a href="#templates">Templates</a>
          <Link href="/checker">ATS checker</Link>
        </nav>
        <div className={styles.navActions}>
          <Link href="/documents" className={styles.navSignIn}>Sign in</Link>
          <Link href="/builder" className="btn-primary-nav">Start building</Link>
        </div>
      </div>
    </header>
  );
}
