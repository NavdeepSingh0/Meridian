import React from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import styles from '../../../app/builder/builder.module.css';

export default function HeadlineForm() {
  const { resumeData, updateBasics } = useResumeStore();

  return (
    <div className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Professional Headline</label>
        <input
          type="text"
          className={styles.formInput}
          value={resumeData.basics.label}
          onChange={(e) => updateBasics('label', e.target.value)}
          placeholder="e.g. Senior Software Engineer"
        />
        <p className={styles.helperText} style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-ink-muted)' }}>
          A short, punchy title that summarizes your expertise.
        </p>
      </div>
    </div>
  );
}
