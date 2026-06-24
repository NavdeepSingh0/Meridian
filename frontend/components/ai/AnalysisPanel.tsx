import React, { useState } from 'react';
import { motion } from 'framer-motion';
import builderStyles from '../../app/builder/builder.module.css';
import styles from '../../app/builder/AnalysisPanel.module.css';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useAtsScore, useCritique, useApplySuggestion } from '../../lib/hooks/useAnalysis';
import AtsScoreView from './AtsScoreView';
import CritiqueFeedbackView from './CritiqueFeedbackView';

export default function AnalysisPanel() {
  const [activeTab, setActiveTab] = useState<'target' | 'chat'>('target');
  const [lastAppliedSuggestion, setLastAppliedSuggestion] = useState<string | null>(null);

  const { 
    resumeData, jobDescription, setJobDescription, 
    panelState, setPanelState, 
    atsResult, setAtsResult, 
    critiqueResult, setCritiqueResult, 
    resetToEditing, injectImprovement
  } = useResumeStore();

  const atsScoreMutation = useAtsScore();
  const critiqueMutation = useCritique();

  const handleAnalyze = () => {
    atsScoreMutation.mutate({ resumeData, jobDescription }, {
      onSuccess: (result) => {
        setAtsResult(result);
        setPanelState('scored');
      }
    });
  };

  const handleGetFeedback = () => {
    critiqueMutation.mutate(resumeData, {
      onSuccess: (result) => {
        setCritiqueResult(result);
        setPanelState('feedback');
      }
    });
  };



  const applySuggestionMutation = useApplySuggestion();

  const handleApplyImprovement = (section: string, suggestion: string) => {
    let sectionData = resumeData[section as keyof typeof resumeData];
    if (section === 'summary') {
      sectionData = resumeData.basics;
    }
    
    applySuggestionMutation.mutate(
      { sectionName: section, sectionData, suggestion },
      {
        onSuccess: (rewrittenSectionData) => {
          injectImprovement(section, rewrittenSectionData);
          setLastAppliedSuggestion(suggestion);
        }
      }
    );
  };

  const handleUndo = () => {
    useResumeStore.getState().undoLastAIEdit();
    setLastAppliedSuggestion(null);
  };

  const isLoading = atsScoreMutation.isPending || critiqueMutation.isPending;
  const isError = atsScoreMutation.isError || critiqueMutation.isError;

  return (
    <aside className={`${builderStyles.saasRightSidebar} tour-analysis-panel`}>
      <div className={builderStyles.sideTabBarContainer}>
        <div className={builderStyles.sideTabBar} style={{ maxWidth: '240px' }}>
          <button 
            className={`${builderStyles.sideTab} ${activeTab === 'target' ? builderStyles.sideTabActive : ''}`}
            onClick={() => setActiveTab('target')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>analytics</span> ATS Analysis
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative">
        {isLoading && (
          <div className={builderStyles.panelOverlay} style={{ justifyContent: 'flex-start', paddingTop: '32px', paddingBottom: '24px', background: 'rgba(252, 255, 253, 0.95)' }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="w-full flex flex-col gap-8 px-2"
            >
              {/* Header skeleton */}
              <div className="flex flex-col gap-3">
                 <div className="h-6 w-1/3 bg-[#D4E8E4] rounded animate-pulse" />
                 <div className="h-2.5 w-2/3 bg-[#D4E8E4] rounded opacity-60 animate-pulse" style={{ animationDelay: '100ms' }} />
                 <div className="h-2.5 w-1/2 bg-[#D4E8E4] rounded opacity-60 animate-pulse" style={{ animationDelay: '200ms' }} />
              </div>

              {/* Experience blocks skeleton */}
              {[0, 1].map(i => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-4 w-1/4 bg-[var(--color-primary)] rounded opacity-30 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    <div className="h-3 w-1/6 bg-[#D4E8E4] rounded opacity-80 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-2.5 pl-3 border-l-2 border-[#D4E8E4] border-opacity-50">
                     <div className="h-2.5 w-[92%] bg-[#D4E8E4] rounded opacity-70 animate-pulse" style={{ animationDelay: `${i * 200 + 100}ms` }} />
                     <div className="h-2.5 w-[85%] bg-[#D4E8E4] rounded opacity-70 animate-pulse" style={{ animationDelay: `${i * 200 + 200}ms` }} />
                     <div className="h-2.5 w-[88%] bg-[#D4E8E4] rounded opacity-70 animate-pulse" style={{ animationDelay: `${i * 200 + 300}ms` }} />
                  </div>
                </div>
              ))}
            </motion.div>
            
            <div className="mt-auto flex flex-col items-center gap-4 w-full px-2">
              <div className="w-full h-1 bg-[#D4E8E4] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[var(--color-primary)]"
                  initial={{ width: "20%", x: "-100%" }}
                  animate={{ x: "400%" }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.02em' }}
              >
                Synthesizing Resume Data...
              </motion.p>
            </div>
          </div>
        )}

        {isError && (
          <div className={builderStyles.panelOverlay}>
            <span className="material-symbols-outlined text-[#EF4444] text-[48px]">error</span>
            <p className={builderStyles.overlayErrorText}>Failed to analyze.</p>
            <button 
              className={builderStyles.tryAgainBtn}
              onClick={() => { atsScoreMutation.reset(); critiqueMutation.reset(); resetToEditing(); }}
            >
              Try again
            </button>
          </div>
        )}

        {activeTab === 'target' && (
          <>
            <button 
              onClick={handleAnalyze}
              className={styles.aiGenerateBtn}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>troubleshoot</span> 
              Analyze Resume
            </button>

            {panelState === 'editing' && (
              <div className={styles.targetJobCard} style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch' }}>
                <label className={styles.targetJobLabel}>Job Description</label>
                <textarea 
                  className={styles.jdTextarea}
                  placeholder="Paste a job description to check keyword alignment"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            )}

            {(panelState === 'scored' || panelState === 'feedback') && atsResult && (
              <>
                {panelState === 'scored' && atsResult && (
                  <AtsScoreView 
                    atsResult={atsResult} 
                    onGetFeedback={handleGetFeedback} 
                    onReset={resetToEditing} 
                    isCheckerPage={false} 
                  />
                )}

                {panelState === 'feedback' && critiqueResult && (
                  <CritiqueFeedbackView 
                    critiqueResult={critiqueResult} 
                    onBack={() => setPanelState('scored')} 
                    onApplyImprovement={handleApplyImprovement}
                    applyingSuggestion={applySuggestionMutation.isPending ? applySuggestionMutation.variables?.suggestion : null}
                    lastAppliedSuggestion={lastAppliedSuggestion}
                    onUndo={handleUndo}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}