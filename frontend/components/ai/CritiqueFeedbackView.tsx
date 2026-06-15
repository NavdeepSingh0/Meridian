import React from 'react';
import styles from '../../app/builder/AnalysisPanel.module.css';
import { CritiqueResult, SectionCritique } from '../../lib/types/analysis';

interface CritiqueFeedbackViewProps {
  critiqueResult: CritiqueResult;
  onBack: () => void;
  onApplyImprovement: (section: string, suggestion: string) => void;
  applyingSuggestion?: string | null;
}

export default function CritiqueFeedbackView({ critiqueResult, onBack, onApplyImprovement, applyingSuggestion }: CritiqueFeedbackViewProps) {
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

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Detailed Critique</h3>
        <button className={styles.backToScoreBtn} onClick={onBack}>
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
                      onClick={() => onApplyImprovement(section.section, imp)}
                      disabled={applyingSuggestion !== undefined && applyingSuggestion !== null}
                    >
                      {applyingSuggestion === imp ? (
                        <>
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>refresh</span> Applying...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span> Apply Suggestion
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
