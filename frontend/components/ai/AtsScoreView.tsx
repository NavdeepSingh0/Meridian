import React from 'react';
import styles from '../../app/builder/AnalysisPanel.module.css';
import { ATSResult } from '../../lib/types/analysis';

interface AtsScoreViewProps {
  atsResult: ATSResult;
  onGetFeedback: () => void;
  onReset: () => void;
  isCheckerPage?: boolean;
}

export default function AtsScoreView({ atsResult, onGetFeedback, onReset, isCheckerPage }: AtsScoreViewProps) {
  const matchedCount = atsResult.matched_keywords?.length || 0;
  const missingCount = atsResult.missing_keywords?.length || 0;
  const totalKeywords = matchedCount + missingCount;
  const matchPercentage = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
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
          <div className={styles.targetJobTitle}>{(atsResult.missing_keywords && atsResult.missing_keywords.length > 0) ? 'Custom Job Description' : 'General Best Practices'}</div>
        </div>
      </div>

      <div className={styles.keywordsCard}>
        <div className={styles.keywordsCardHeader}>
          <div className={styles.keywordsCardTitle}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '20px' }}>verified</span>
            {atsResult.missing_keywords && atsResult.missing_keywords.length > 0 ? 'Keywords Match' : 'Best Practices Match'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`${styles.keywordsCardBadge} ${atsResult.overall_score >= 70 ? styles.keywordsCardBadgeGood : ''}`}>
              {atsResult.overall_score >= 70 ? 'Good Match' : 'Needs Work'}
            </span>
          </div>
        </div>

        <div className={styles.keywordsCardBody}>
            <div className={styles.scoreSummaryRow}>
              <div className={styles.scoreText}>
                {atsResult.missing_keywords && atsResult.missing_keywords.length > 0 ? (
                  <>Your resume has <strong>{matchedCount} out of {totalKeywords}</strong> keywords that appear in the job description.</>
                ) : (
                  <>Your resume scores <strong>{atsResult.overall_score}%</strong> against standard ATS best practices.</>
                )}
              </div>
              <div className={styles.scoreDonut}>
                <svg viewBox="0 0 36 36">
                  <path stroke="var(--color-outline-variant, #E5E7EB)" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${atsResult.missing_keywords && atsResult.missing_keywords.length > 0 ? matchPercentage : atsResult.overall_score}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className={styles.scoreDonutText}>{atsResult.missing_keywords && atsResult.missing_keywords.length > 0 ? matchPercentage : atsResult.overall_score}%</span>
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
            {atsResult.matched_keywords?.map((kw, i) => (
              <div key={`match-${i}`} className={styles.keywordItem}>
                <span className={`material-symbols-outlined ${styles.keywordItemIcon}`}>check_circle</span>
                <span className={styles.keywordItemText} title={kw}>{kw}</span>
              </div>
            ))}
            {atsResult.missing_keywords?.map((kw, i) => (
              <div key={`miss-${i}`} className={styles.missingChip}>
                {kw.keyword}
              </div>
            ))}
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
        <button 
          className={styles.actionBtnPrimary}
          onClick={onGetFeedback}
        >
          Get Detailed Critique
        </button>
        <button 
          className={styles.actionBtnOutline}
          onClick={onReset}
        >
          {isCheckerPage ? (
            <><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span> Check Another Job</>
          ) : (
            <><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span> Edit Resume</>
          )}
        </button>
      </div>
    </div>
  );
}
