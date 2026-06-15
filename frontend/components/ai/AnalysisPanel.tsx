import React, { useState } from 'react';
import builderStyles from '../../app/builder/builder.module.css';
import styles from '../../app/builder/AnalysisPanel.module.css';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useAtsScore, useCritique } from '../../lib/hooks/useAnalysis';
import { SectionCritique } from '../../lib/types/analysis';

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

  const mapSectionName = (rawSection: string) => {
    const lookup: Record<string, string> = {
      work: 'Experience',
      education: 'Education',
      skills: 'Skills',
      basics: 'Summary',
      projects: 'Projects',
      certificates: 'Certificates'
    };
    return lookup[rawSection] || rawSection;
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
                <div className={styles.atsScoreHeader}>
                  <p className={styles.atsScoreLabel}>ATS Score</p>
                  <div className={styles.atsScoreDisplay}>
                    <span className={styles.atsScoreNumber}>{atsResult.overall_score}</span>
                    <span className={styles.atsScoreMax}>/100</span>
                  </div>
                  {atsResult.summary && (
                    <p className={styles.atsSummaryText}>{atsResult.summary}</p>
                  )}
                </div>

                <div className={styles.targetJobCard}>
                  <div className={styles.targetJobIcon}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cases</span>
                  </div>
                  <div className={styles.targetJobInfo}>
                    <div className={styles.targetJobLabel}>Target Job</div>
                    <div className={styles.targetJobTitle}>AI Data Specialist</div>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-ink-muted)' }}>expand_more</span>
                </div>

                <div className={styles.keywordsCard}>
                  <div className={styles.keywordsCardHeader}>
                    <div className={styles.keywordsCardTitle}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '20px' }}>verified</span>
                      Keywords Match
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`${styles.keywordsCardBadge} ${atsResult.overall_score >= 70 ? styles.keywordsCardBadgeGood : ''}`}>
                        {atsResult.overall_score >= 70 ? 'Good Match' : 'Needs Work'}
                      </span>
                      <div className={styles.versionToggle}>
                        <button className={styles.versionToggleBtn}>v1</button>
                        <button className={`${styles.versionToggleBtn} ${styles.versionToggleBtnActive}`}>v2</button>
                      </div>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-ink-muted)', fontSize: '18px' }}>expand_less</span>
                    </div>
                  </div>

                  <div className={styles.keywordsCardBody}>
                    <div className={styles.scoreSummaryRow}>
                      <div className={styles.scoreText}>
                        Your resume has <strong>{atsResult.strengths?.length || 0} out of {(atsResult.strengths?.length || 0) + (atsResult.missing_keywords?.length || 0)} ({atsResult.overall_score}%)</strong> keywords that appear in the job description.
                      </div>
                      <div className={styles.scoreDonut}>
                        <svg viewBox="0 0 36 36">
                          <path stroke="var(--color-outline-variant, #E5E7EB)" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${atsResult.overall_score}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className={styles.scoreDonutText}>{atsResult.overall_score}%</span>
                      </div>
                    </div>

                    {atsResult.overall_score < 70 && (
                      <div className={styles.tipBox}>
                        <span className={`material-symbols-outlined ${styles.tipBoxIcon}`}>lightbulb</span>
                        <div className={styles.tipBoxText}>
                          Try to get your score above <strong>70%</strong> to increase your chances!
                        </div>
                      </div>
                    )}

                    <div className={styles.keywordGrid}>
                      {atsResult.strengths?.slice(0, 4).map((kw, i) => (
                        <div key={i} className={styles.keywordItem}>
                          <span className={`material-symbols-outlined ${styles.keywordItemIcon}`}>check_circle</span>
                          <span className={styles.keywordItemText} title={kw}>{kw}</span>
                        </div>
                      ))}
                      {atsResult.missing_keywords?.slice(0, 6).map((kw, i) => (
                        <div key={i} className={styles.keywordItem}>
                          <span className={`material-symbols-outlined ${styles.keywordItemMissingIcon}`}>cancel</span>
                          <span className={styles.keywordItemText} style={{ color: 'var(--color-ink-muted)' }} title={kw.keyword}>{kw.keyword}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.customKeywordSection}>
                      <div className={styles.customKeywordTitle}>Want to add a custom keyword?</div>
                      <div className={styles.customKeywordInput}>
                        <input type="text" placeholder="Add custom keyword" />
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-outline, #D1D5DB)' }}>expand_more</span>
                      </div>
                      <button className={styles.reportKeywordsBtn}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>flag</span> Report Keywords
                      </button>
                    </div>
                  </div>
                </div>

                {atsResult.strengths && atsResult.strengths.length > 0 && (
                  <div className={styles.scoredSubSection}>
                    <p className={styles.scoredSubLabel}>Strengths</p>
                    <div className={styles.scoredBulletList}>
                      {atsResult.strengths.map((s, i) => (
                        <div key={i} className={styles.scoredBulletItem}>
                          <span className={`material-symbols-outlined ${styles.scoredBulletIcon}`}>check_circle</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {atsResult.issues && atsResult.issues.length > 0 && (
                  <div className={styles.scoredSubSection}>
                    <p className={`${styles.scoredSubLabel} ${styles.issuesLabel}`}>Issues</p>
                    <div className={styles.scoredBulletList}>
                      {atsResult.issues.map((issue, i) => (
                        <div key={i} className={`${styles.scoredBulletItem} ${styles.issueBulletItem}`}>
                          <span className={`material-symbols-outlined ${styles.issueBulletIcon}`}>warning</span>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  {panelState === 'scored' ? (
                    <>
                      <button 
                        className={styles.actionBtnPrimary}
                        onClick={handleGetFeedback}
                      >
                        Get Detailed Critique
                      </button>
                      <button 
                        className={styles.actionBtnOutline}
                        onClick={resetToEditing}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                        Edit Resume
                      </button>
                    </>
                  ) : (
                    <button 
                      className={styles.actionBtnOutline}
                      onClick={resetToEditing}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                      Clear Analysis & Edit
                    </button>
                  )}
                </div>

                {panelState === 'feedback' && critiqueResult && (
                  <div className="flex flex-col gap-3 mt-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Detailed Critique</h3>
                      <button className={styles.backToScoreBtn} onClick={() => setPanelState('scored')}>
                        ← Back to score
                      </button>
                    </div>
                    {critiqueResult.sections.map((section: SectionCritique, i: number) => (
                      <div key={i} className={styles.feedbackCard}>
                        <div className={styles.feedbackCardIndicator}></div>
                        <div className={styles.feedbackCardHeader}>
                          <div className={styles.feedbackMarker}>{i + 1}</div>
                          <div>
                            <h4 className={styles.feedbackCardTitle}>{mapSectionName(section.section)}</h4>
                            <span className="text-[10px] text-gray-500">Score: {section.score}/100</span>
                          </div>
                        </div>
                        
                        {section.strengths.length > 0 && (
                          <div className="ml-8 mb-3">
                            <p className="text-[10px] text-[var(--color-primary)] uppercase tracking-wider mb-1 font-bold">Strengths</p>
                            <div className={styles.strengthList}>
                              {section.strengths.map((str, sIdx) => (
                                <div key={sIdx} className={styles.strengthItem}>
                                  <span className={`material-symbols-outlined ${styles.strengthItemIcon}`}>check_circle</span>
                                  <span>{str}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {section.improvements.length > 0 && (
                          <div className={styles.feedbackSuggestion}>
                            <p className={styles.feedbackSuggestionLabel}>Improvements</p>
                            <div className={styles.suggestionList}>
                              {section.improvements.map((imp, iIdx) => (
                                <div key={iIdx} className={styles.suggestionItem}>
                                  <span className={styles.suggestionText}>{imp}</span>
                                  <button 
                                    className={styles.applySuggestionBtn}
                                    onClick={() => injectImprovement(section.section, imp)}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span> Apply Suggestion
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}