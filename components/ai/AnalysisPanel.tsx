import React, { useState } from 'react';
import styles from '../../app/builder/builder.module.css';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useAtsScore, useCritique } from '../../lib/hooks/useAnalysis';

export default function AnalysisPanel() {
  const [panelState, setPanelState] = useState<'editing' | 'loading' | 'scored' | 'feedback'>('editing');
  const [jobDescription, setJobDescription] = useState('');
  
  const { data: resume } = useResumeStore();
  const atsScoreMutation = useAtsScore();
  const critiqueMutation = useCritique();

  const handleAnalyze = async () => {
    setPanelState('loading');
    
    try {
      await atsScoreMutation.mutateAsync({ resume, jobDescription });
      setPanelState('scored');
    } catch (e) {
      console.error(e);
      setPanelState('editing');
      alert("Failed to analyze resume.");
    }
  };

  const handleGetFeedback = async () => {
    setPanelState('loading');
    try {
      await critiqueMutation.mutateAsync(resume);
      setPanelState('feedback');
    } catch (e) {
      console.error(e);
      setPanelState('scored');
      alert("Failed to get feedback.");
    }
  };

  if (panelState === 'loading') {
    return (
      <aside className={styles.rightSidebar}>
        <div className={`${styles.analysisPanel} ${styles.highlightTop}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.icon} style={{ fontSize: '48px', color: 'var(--b-primary)', animation: 'spin 2s linear infinite' }}>refresh</div>
          <p style={{ marginTop: '16px' }}>Analyzing Resume...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.rightSidebar}>
      {panelState === 'editing' && (
        <div className={`${styles.analysisPanel} ${styles.highlightTop}`}>
          <label className={styles.analysisLabel}>Analysis</label>
          <textarea 
            className={styles.jdTextarea} 
            placeholder="Paste a job description to check keyword alignment"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <button 
            className={`${styles.analyzeBtn} ${styles.highlightTop}`}
            onClick={handleAnalyze}
            disabled={!jobDescription}
            style={{ opacity: jobDescription ? 1 : 0.5 }}
          >
            <span className={styles.icon}>analytics</span>
            Analyze resume
          </button>
          <p className={styles.analysisDesc}>
            Get an ATS score and detailed feedback on your resume.
          </p>
        </div>
      )}
      
      {panelState === 'scored' && atsScoreMutation.data && (
        <div className={styles.analysisPanel} style={{ height: '100%', overflowY: 'auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 className={styles.panelTitle}>ATS Score</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className={styles.atsScoreValue}>{atsScoreMutation.data.score}</span>
              <span className={styles.atsScoreMax}>/100</span>
            </div>
          </div>
          <p className={styles.atsScoreText}>
            {atsScoreMutation.data.feedback}
          </p>
          
          <hr className={styles.hrDivider} />
          
          <div style={{ marginTop: 'auto' }}>
            <h4 className={styles.panelTitle} style={{ marginBottom: '12px' }}>Keyword Matches</h4>
            <div className={styles.missingKeywordsWrapper}>
              {atsScoreMutation.data.keyword_matches.map((kw, i) => (
                <span key={i} className={styles.keywordChip} style={{ background: 'var(--b-secondary-container)' }}>{kw}</span>
              ))}
            </div>
            
            <h4 className={styles.panelTitle} style={{ marginBottom: '12px', marginTop: '24px' }}>Missing Keywords</h4>
            <div className={styles.missingKeywordsWrapper}>
              {atsScoreMutation.data.missing_keywords.map((kw, i) => (
                <span key={i} className={styles.keywordChip}>{kw}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid var(--b-outline-variant)' }}>
            <button 
              className={`${styles.analyzeBtn} ${styles.highlightTop}`}
              style={{ flex: 1, margin: 0, padding: '12px 24px' }}
              onClick={handleGetFeedback}
            >
              Get feedback
            </button>
            <button 
              className={styles.exportBtn}
              style={{ padding: '12px 24px' }}
              onClick={() => setPanelState('editing')}
            >
              Edit
            </button>
          </div>
        </div>
      )}
      
      {panelState === 'feedback' && critiqueMutation.data && (
        <div className={styles.analysisPanel} style={{ height: '100%', overflowY: 'auto', padding: '0' }}>
          <div style={{ padding: '24px', paddingBottom: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <h3 className={styles.panelTitle}>Feedback</h3>
              <button 
                onClick={() => setPanelState('scored')}
                style={{ fontSize: '12px', color: 'var(--b-primary)', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <span className={styles.icon} style={{ fontSize: '14px' }}>arrow_back</span> Back to score
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '0 24px' }}>
            {critiqueMutation.data.feedback.issues.map((issue, i) => (
              <div key={i} className={styles.feedbackCard}>
                <div className={styles.feedbackCardIndicator}></div>
                <div className={styles.feedbackCardHeader}>
                  <div className={styles.feedbackMarker}>{i + 1}</div>
                  <div>
                    <h4 className={styles.feedbackCardTitle}>{issue.section}</h4>
                    <p className={styles.feedbackCardDesc}>{issue.issue}</p>
                  </div>
                </div>
                <div className={styles.feedbackSuggestion}>
                  <p className={styles.feedbackSuggestionLabel}>Suggestion</p>
                  <p className={styles.feedbackSuggestionText}>{issue.suggestion}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--b-outline-variant)' }}>
            <button 
              className={styles.exportBtn}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px' }}
              onClick={() => setPanelState('editing')}
            >
              <span className={styles.icon} style={{ fontSize: '18px' }}>edit</span> Edit Resume
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
