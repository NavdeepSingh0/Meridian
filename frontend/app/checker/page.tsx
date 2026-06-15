'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './checker.module.css';
import builderStyles from '../builder/builder.module.css';

export default function CheckerPage() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    // Simulate ATS analysis delay
    const timer = setTimeout(() => {
      setLoadingComplete(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!loadingComplete) {
    return (
      <div className={styles.checkerTheme}>
        <header className={styles.topNav}>
          <div className={styles.brand}>Meridian</div>
          <Link href="/builder" className={styles.exitBtn}>
            Exit to builder
          </Link>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.loadingCard}>
            <h1 className={styles.title}>Reviewing your resume</h1>
            <p className={`${styles.subtitle} ${styles.pulseText}`}>Checking ATS compatibility...</p>
            
            <div className={styles.progressTrack}>
              <div className={`${styles.progressFill} ${styles.progressAnimate}`}></div>
            </div>
            
            <div className={styles.statusIndicator}>
              <span className={styles.statusIcon}>description</span>
              <span className={styles.statusLabel}>Analyzing structure & keywords</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={builderStyles.builderTheme}>
      {/* Top Navbar */}
      <header className={`${builderStyles.topNav} ${builderStyles.highlightTop}`}>
        <div className={builderStyles.brand}>Meridian ATS Checker</div>
        <div className={builderStyles.actions}>
          <Link href="/builder" className={builderStyles.exportBtn}>
            Return to Editor
          </Link>
        </div>
      </header>

      <div className={builderStyles.layoutWrapper} style={{ paddingTop: '64px' }}>
        {/* Full Width Layout: Center Canvas + Right Sidebar (No Left Sidebar) */}
        <main className={builderStyles.canvas} style={{ marginLeft: 0, marginRight: '340px' }}>
          <div className={`${builderStyles.document} ${builderStyles.highlightTopLg}`}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 className={builderStyles.docName}>Jordan Davis</h1>
              <div className={builderStyles.docContact}>
                <span>hello@jordandavis.design</span>
                <span>•</span>
                <span>+1 (555) 123-4567</span>
                <span>•</span>
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Example Highlighted Resume Section */}
            <div style={{ marginBottom: '32px' }}>
              <h2 className={builderStyles.docSectionTitle}>Experience</h2>
              
              <div className={builderStyles.feedbackCard} style={{ margin: '0 -24px', padding: '16px 24px', backgroundColor: 'transparent', border: 'none' }}>
                <div className={builderStyles.jobHeader}>
                  <h3 className={builderStyles.jobTitle}>Senior Product Designer</h3>
                  <span className={builderStyles.jobDate}>Oct 2021 - Present</span>
                </div>
                <div className={builderStyles.jobCompany}>Acme Corp</div>
                <ul className={builderStyles.jobBullets}>
                  <li>Led the redesign of the core SaaS platform, improving task completion rate by 22%.</li>
                </ul>
              </div>

              <div style={{ position: 'relative', margin: '16px -16px' }}>
                {/* Highlight box */}
                <div style={{ backgroundColor: 'rgba(218, 255, 239, 0.4)', borderLeft: '2px solid var(--b-primary)', padding: '16px', borderRadius: '0 8px 8px 0' }}>
                   <div style={{ position: 'absolute', left: '-10px', top: '24px' }} className={builderStyles.feedbackMarker}>1</div>
                   <div className={builderStyles.jobHeader}>
                    <h3 className={builderStyles.jobTitle}>Product Designer</h3>
                    <span className={builderStyles.jobDate}>Jan 2019 - Sep 2021</span>
                  </div>
                  <div className={builderStyles.jobCompany}>Credwork • Remote</div>
                  <ul className={builderStyles.jobBullets}>
                    <li>Designed the full UI/UX of the mobile app and built interactive prototypes.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Combined Scored + Feedback view */}
        <aside className={builderStyles.rightSidebar} style={{ width: '340px' }}>
          <div className={builderStyles.analysisPanel} style={{ height: '100%', overflowY: 'auto', padding: '0', backgroundColor: 'transparent', border: 'none' }}>
            
            {/* ATS Score Header */}
            <div style={{ padding: '0 0 24px 0', borderBottom: '1px solid var(--b-outline-variant)' }}>
              <h3 className={builderStyles.panelTitle}>ATS Score</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span className={builderStyles.atsScoreValue}>82</span>
                <span className={builderStyles.atsScoreMax}>/100</span>
              </div>
              <p className={builderStyles.atsScoreText} style={{ marginBottom: 0, marginTop: '8px' }}>
                Strong keyword coverage. Two sections could use more quantified results.
              </p>
            </div>

            {/* Feedback List */}
            <div style={{ flex: 1, padding: '24px 0' }}>
              <h3 className={builderStyles.panelTitle} style={{ marginBottom: '16px' }}>Detailed Feedback</h3>
              
              <div className={builderStyles.feedbackCard}>
                <div className={builderStyles.feedbackCardIndicator}></div>
                <div className={builderStyles.feedbackCardHeader}>
                  <div className={builderStyles.feedbackMarker}>1</div>
                  <div>
                    <h4 className={builderStyles.feedbackCardTitle}>Experience — Credwork role</h4>
                    <p className={builderStyles.feedbackCardDesc}>This bullet lacks a measurable result.</p>
                  </div>
                </div>
                <div className={builderStyles.feedbackSuggestion}>
                  <p className={builderStyles.feedbackSuggestionLabel}>Suggestion</p>
                  <p className={builderStyles.feedbackSuggestionText}>&quot;Increased user retention by 15% through iterative interface refinements&quot;</p>
                </div>
              </div>

              {/* Missing Keywords */}
              <div style={{ marginTop: '24px' }}>
                <h4 className={builderStyles.panelSectionTitle} style={{ color: '#ba1a1a' }}>MISSING KEYWORDS</h4>
                <div className={builderStyles.missingKeywordsWrapper}>
                  <span className={builderStyles.keywordChip}>Docker</span>
                  <span className={builderStyles.keywordChip}>CI/CD</span>
                </div>
              </div>
            </div>
            
          </div>
        </aside>
      </div>
    </div>
  );
}
