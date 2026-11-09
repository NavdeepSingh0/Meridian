import React from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.footerGrid}`}>
        <div>
          <p className={styles.footerBrand}>Meridian</p>
          <p className={styles.footerTag}>Your co-pilot from first draft to first interview.</p>
        </div>
        <nav aria-label="Product" className={styles.footerCol}>
          <p className={styles.footerLabel}>Product</p>
          <Link href="/builder">Resume builder</Link>
          <Link href="/checker">ATS checker</Link>
          <Link href="/documents">My resumes</Link>
        </nav>
        <nav aria-label="Connect" className={styles.footerCol}>
          <p className={styles.footerLabel}>Connect</p>
          <a href="https://github.com/NavdeepSingh0" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/navdeepsingh-dhunna/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:navdeep.s.dhunna@gmail.com">Email</a>
        </nav>
      </div>
      <div className={styles.container}>
        <p className={styles.footerCopy}>© 2026 Meridian · Built in Chandigarh, India</p>
      </div>
    </footer>
  );
}
