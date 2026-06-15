import React from 'react';
import Link from 'next/link';
import styles from '../../app/builder/builder.module.css';

interface TopNavProps {
  onExport: () => void;
  activeTemplate: string;
  setActiveTemplate: (t: string) => void;
}

export default function TopNav({ onExport, activeTemplate, setActiveTemplate }: TopNavProps) {
  return (
    <header className={`${styles.topNav} ${styles.highlightTop}`}>
      <div className={styles.brand}>Meridian Builder</div>
      
      <nav className={styles.navLinks}>
        {['classic', 'modern', 'minimal'].map((tmpl) => (
          <button
            key={tmpl}
            onClick={() => setActiveTemplate(tmpl)}
            className={activeTemplate === tmpl ? styles.navLinkActive : styles.navLink}
            style={{ textTransform: 'capitalize', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {tmpl}
          </button>
        ))}
      </nav>
      
      <div className={styles.actions}>
        <span className={styles.savedText}>Saved to LocalStorage</span>
        <button className={styles.exportBtn} onClick={onExport}>Export PDF</button>
      </div>
    </header>
  );
}
