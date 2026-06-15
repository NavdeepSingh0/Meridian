'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './checker.module.css';
import builderStyles from '../builder/builder.module.css';
import analysisStyles from '../builder/AnalysisPanel.module.css';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useAtsScore, useCritique } from '../../lib/hooks/useAnalysis';
import ClassicTemplate from '../../components/templates/ClassicTemplate';
import ModernTemplate from '../../components/templates/ModernTemplate';
import MinimalTemplate from '../../components/templates/MinimalTemplate';
import AtsScoreView from '../../components/ai/AtsScoreView';
import CritiqueFeedbackView from '../../components/ai/CritiqueFeedbackView';

export default function CheckerPage() {
  const { resumeData, selectedTemplateId, fontSize, documentMargin, injectImprovement } = useResumeStore();
  
  const [jd, setJd] = useState('');
  const [flowState, setFlowState] = useState<'idle' | 'loading' | 'scored' | 'feedback'>('idle');
  
  const atsMutation = useAtsScore();
  const critiqueMutation = useCritique();

  const handleAnalyze = () => {
    if (!jd.trim()) return;
    setFlowState('loading');
    atsMutation.mutate({ resumeData, jobDescription: jd }, {
      onSuccess: () => {
        setFlowState('scored');
      },
      onError: () => {
        setFlowState('idle');
      }
    });
  };

  const handleGetFeedback = () => {
    setFlowState('loading');
    critiqueMutation.mutate(resumeData, {
      onSuccess: () => {
        setFlowState('feedback');
      },
      onError: () => {
        setFlowState('scored');
      }
    });
  };



  if (flowState === 'loading') {
    return (
      <div className={styles.checkerTheme}>
        <header className={builderStyles.saasTopNav}>
          <div className={builderStyles.builderTopNav}>
            <div className={builderStyles.builderBrand}>
              <span className={builderStyles.brandWordmark}>Meridian</span>
              <span className={builderStyles.brandCV}>Checker</span>
            </div>
          </div>
          <div className={builderStyles.builderActions}>
            <Link href="/builder" className={builderStyles.exportBtn}>
              Return to Editor
            </Link>
          </div>
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

  const atsResult = atsMutation.data;
  const critiqueResult = critiqueMutation.data;

  let highlightedSections: { section: string; marker: number }[] = [];
  if (flowState === 'scored' && atsResult?.missing_keywords) {
    highlightedSections = [
      { section: 'Skills', marker: 1 },
      { section: 'Experience', marker: 2 }
    ];
  } else if (flowState === 'feedback' && critiqueResult) {
    highlightedSections = critiqueResult.sections.map((s, index) => {
      let mappedSection = s.section.charAt(0).toUpperCase() + s.section.slice(1);
      if (s.section === 'work') mappedSection = 'Experience';
      if (s.section === 'education') mappedSection = 'Education';
      if (s.section === 'basics') mappedSection = 'Summary';
      return { section: mappedSection, marker: index + 1 };
    });
  }

  return (
    <div className={builderStyles.builderTheme}>
      <header className={builderStyles.saasTopNav}>
        <div className={builderStyles.builderTopNav}>
          <div className={builderStyles.builderBrand}>
            <span className={builderStyles.brandWordmark}>Meridian</span>
            <span className={builderStyles.brandCV}>Checker</span>
          </div>
        </div>
        <div className={builderStyles.builderActions}>
          <Link href="/builder" className={builderStyles.exportBtn}>
            Return to Editor
          </Link>
        </div>
      </header>

      <div className={builderStyles.layoutWrapper} style={{ paddingTop: '64px' }}>
        <main className={builderStyles.canvas} style={{ marginLeft: 0, marginRight: '340px' }}>
          <div 
            className={builderStyles.paperCard} 
            style={{ 
              transform: 'scale(0.8)', 
              transformOrigin: 'top center',
              '--doc-font-size': `${fontSize}pt`,
              '--doc-margin': `${documentMargin * 48}px`
            } as React.CSSProperties}
          >
            {selectedTemplateId === 'classic' && <ClassicTemplate highlightedSections={highlightedSections} />}
            {selectedTemplateId === 'modern' && <ModernTemplate highlightedSections={highlightedSections} />}
            {selectedTemplateId === 'minimal' && <MinimalTemplate highlightedSections={highlightedSections} />}
          </div>
        </main>

        <aside className={builderStyles.rightSidebar} style={{ width: '340px' }}>
          <div className={builderStyles.analysisPanel} style={{ height: '100%', overflowY: 'auto', padding: '16px', backgroundColor: 'transparent', border: 'none' }}>
            
            {flowState === 'idle' && (
              <div className="flex flex-col gap-4">
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>ATS Compatibility Check</h2>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>Paste the job description you are targeting to see how well your resume matches.</p>
                <div className={analysisStyles.targetJobCard} style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch' }}>
                  <label className={analysisStyles.targetJobLabel}>Job Description</label>
                  <textarea 
                    className={analysisStyles.jdTextarea}
                    placeholder="Paste job description here..."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    rows={12}
                  />
                </div>
                <button 
                  onClick={handleAnalyze}
                  className={analysisStyles.aiGenerateBtn}
                  disabled={!jd.trim()}
                  style={{ opacity: jd.trim() ? 1 : 0.5 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>troubleshoot</span> 
                  Check Match
                </button>
              </div>
            )}

            {(flowState === 'scored' || flowState === 'feedback') && atsResult && (
              <div className="flex flex-col gap-4">
                {flowState === 'scored' && (
                  <AtsScoreView 
                    atsResult={atsResult} 
                    onGetFeedback={handleGetFeedback} 
                    onReset={() => setFlowState('idle')} 
                    isCheckerPage={true} 
                  />
                )}

                {flowState === 'feedback' && critiqueResult && (
                  <CritiqueFeedbackView 
                    critiqueResult={critiqueResult} 
                    onBack={() => setFlowState('scored')} 
                    onApplyImprovement={injectImprovement} 
                  />
                )}
              </div>
            )}

          </div>
        </aside>
      </div>
    </div>
  );
}
