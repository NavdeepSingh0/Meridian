'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
      <header className={builderStyles.saasTopNav} style={{ position: 'relative' }}>
        <div className={builderStyles.builderTopNav}>
          <div className={builderStyles.builderBrand}>
            <span className={builderStyles.brandWordmark}>Meridian</span>
            <span className={builderStyles.brandCV}>Checker</span>
          </div>
        </div>
        
        {/* Step Indicator */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0, 106, 98, 0.1)', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-primary)' }}>Resume Ready</span>
          </div>
          <div style={{ width: '32px', height: '1px', backgroundColor: 'var(--color-border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: flowState === 'idle' ? 0.5 : 1, filter: flowState === 'idle' ? 'grayscale(100%)' : 'none', transition: 'all 0.3s ease' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', fontSize: '12px', fontWeight: 600, backgroundColor: flowState === 'idle' ? 'var(--color-border)' : 'var(--color-primary)', color: flowState === 'idle' ? 'var(--color-ink-muted)' : '#fff' }}>
              2
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: flowState === 'idle' ? 'var(--color-ink-muted)' : 'var(--color-primary)' }}>
              Analysis Results
            </span>
          </div>
        </div>

        <div className={builderStyles.builderActions}>
          <Link href="/builder" className={builderStyles.exportBtn}>
            Return to Editor
          </Link>
        </div>
      </header>

      <div className={builderStyles.saasLayoutWrapper}>
        <main className={builderStyles.saasMainCanvas} style={{ marginLeft: 0, marginRight: '360px', padding: '48px 32px' }}>
          <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
            <div 
              className={builderStyles.paperCard} 
              style={{ 
                transform: 'scale(0.85)', 
                transformOrigin: 'top center',
                marginBottom: '-15%',
                '--doc-font-size': `${fontSize}pt`,
                '--doc-margin': `${documentMargin * 48}px`
              } as React.CSSProperties}
            >
              {selectedTemplateId === 'classic' && <ClassicTemplate highlightedSections={highlightedSections} />}
              {selectedTemplateId === 'modern' && <ModernTemplate highlightedSections={highlightedSections} />}
              {selectedTemplateId === 'minimal' && <MinimalTemplate highlightedSections={highlightedSections} />}
            </div>
          </div>
        </main>

        <aside className={builderStyles.saasRightSidebar}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            
            {flowState === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', backgroundColor: 'rgba(0, 106, 98, 0.08)', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>scanner</span>
                    ATS Scanner
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px', lineHeight: 1.2 }}>Match your resume</h2>
                  <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>Find out if your resume will pass the automated screen for your target role.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>score</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Overall ATS Score</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.4 }}>Get a rating out of 100 based on standard parsing rules.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '24px' }}>manage_search</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Keyword Gaps</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.4 }}>See exactly which skills the ATS is looking for.</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '240px' }}>
                  <label className={analysisStyles.targetJobLabel} style={{ marginBottom: '8px' }}>Job Description</label>
                  <textarea 
                    className={analysisStyles.jdTextarea}
                    style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', fontSize: '14px', resize: 'none', transition: 'border-color 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', width: '100%' }}
                    placeholder="Paste the full job description here..."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '8px' }}>
                    {jd.length} characters
                  </div>
                </div>

                <button 
                  onClick={handleAnalyze}
                  className={analysisStyles.actionBtnPrimary}
                  disabled={!jd.trim()}
                  style={{ opacity: jd.trim() ? 1 : 0.5, marginTop: 'auto', padding: '14px', fontSize: '15px', width: '100%' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>troubleshoot</span> 
                  Analyze Match
                </button>
              </div>
            )}

            {flowState === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%', paddingTop: '32px', paddingLeft: '8px', paddingRight: '8px' }}>
                {/* Header skeleton */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ height: '24px', width: '33%', backgroundColor: '#D4E8E4', borderRadius: '4px', animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                   <div style={{ height: '10px', width: '66%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.6, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '100ms' }} />
                   <div style={{ height: '10px', width: '50%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.6, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '200ms' }} />
                </div>

                {/* Content skeleton */}
                {[0, 1].map(i => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ height: '16px', width: '25%', backgroundColor: 'var(--color-primary)', borderRadius: '4px', opacity: 0.3, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 200}ms` }} />
                      <div style={{ height: '12px', width: '16%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.8, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '12px', borderLeft: '2px solid rgba(212, 232, 228, 0.5)' }}>
                       <div style={{ height: '10px', width: '92%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.7, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 200 + 100}ms` }} />
                       <div style={{ height: '10px', width: '85%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.7, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 200 + 200}ms` }} />
                       <div style={{ height: '10px', width: '88%', backgroundColor: '#D4E8E4', borderRadius: '4px', opacity: 0.7, animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: `${i * 200 + 300}ms` }} />
                    </div>
                  </div>
                ))}
                
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#D4E8E4', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: 'var(--color-primary)', width: '50%', animation: 'progress 1.5s ease-in-out infinite alternate' }} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.02em', animation: 'pulse-text 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                    Checking ATS Compatibility...
                  </p>
                </div>
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
