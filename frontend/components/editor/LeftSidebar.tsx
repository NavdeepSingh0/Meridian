import React from 'react';
import styles from '../../app/builder/builder.module.css';
import EditorForm from './EditorForm';

interface LeftSidebarProps {
  activeSection: string;
  setActiveSection: (s: string) => void;
}

export default function LeftSidebar({ activeSection, setActiveSection }: LeftSidebarProps) {
  const sections = ['Basics', 'Experience', 'Education', 'Skills', 'Projects'];

  return (
    <aside className={styles.leftSidebar}>
      <div style={{ marginBottom: '24px', padding: '0 8px' }}>
        <h2 className={styles.sidebarTitle}>Resume Sections</h2>
        <p className={styles.sidebarSubtitle}>Edit your details</p>
      </div>
      
      <nav className={styles.navGroup}>
        {sections.map((section) => (
          <a
            key={section}
            href="#"
            className={activeSection === section ? styles.sideNavItemActive : styles.sideNavItem}
            onClick={(e) => { e.preventDefault(); setActiveSection(section); }}
          >
            <span className={styles.icon}>
              {section === 'Basics' && 'person'}
              {section === 'Experience' && 'work'}
              {section === 'Education' && 'school'}
              {section === 'Skills' && 'psychology'}
              {section === 'Projects' && 'architecture'}
            </span>
            {section}
          </a>
        ))}
      </nav>
      
      <button className={styles.addSectionBtn}>
        <span className={styles.icon}>add</span>
        Add section
      </button>

      <div style={{ marginTop: '32px', borderTop: '1px solid var(--b-outline-variant)' }}>
        <EditorForm activeSection={activeSection} />
      </div>
    </aside>
  );
}
