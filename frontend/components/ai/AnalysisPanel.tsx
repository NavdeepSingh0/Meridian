import React, { useState } from 'react';
import builderStyles from '../../app/builder/builder.module.css';
import styles from '../../app/builder/AnalysisPanel.module.css';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useAtsScore, useCritique, useApplySuggestion } from '../../lib/hooks/useAnalysis';
import AtsScoreView from './AtsScoreView';
import CritiqueFeedbackView from './CritiqueFeedbackView';

export default function AnalysisPanel() {
  const [activeTab, setActiveTab] = useState<'target' | 'chat'>('target');

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
        }
      }
    );
  };

  const isLoading = atsScoreMutation.isPending || critiqueMutation.isPending;
  const isError = atsScoreMutation.isError || critiqueMutation.isError;

  return (
    <aside className={builderStyles.saasRightSidebar}>
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
          <div className={builderStyles.panelOverlay}>
            <div className="material-symbols-outlined text-[var(--color-primary)] text-[48px] animate-spin">refresh</div>
            <p className={builderStyles.overlayText}>Analyzing Resume...</p>
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