import React from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import { useAiGenerate } from '../../../lib/hooks/useAiGenerate';
import styles from '../../../app/builder/builder.module.css';

export default function SummaryForm() {
  const { resumeData, updateBasics, jobDescription } = useResumeStore();
  const { generate, isGenerating } = useAiGenerate();

  const handleGenerate = async () => {
    const result = await generate('summary', resumeData, jobDescription);
    updateBasics('summary', result);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <label className={styles.formLabel} style={{ marginBottom: 0 }}>Professional Summary</label>
          <button 
            className={styles.aiSparkleBtn} 
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: isGenerating ? 0.5 : 1 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {isGenerating ? 'refresh' : 'auto_awesome'}
            </span>
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </button>
        </div>
        <textarea
          className={styles.formTextarea}
          value={resumeData.basics.summary}
          onChange={(e) => updateBasics('summary', e.target.value)}
          placeholder="Write 2-4 sentences highlighting your most relevant experience, key achievements, and career goals."
          rows={5}
        />
      </div>
    </div>
  );
}
