import React from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import { useUserStore } from '../../../lib/store/userStore';
import { useGenerateText } from '../../../lib/hooks/useAnalysis';
import { getErrorMessage } from '../../../lib/api/client';
import { toast } from '../../shared/Toast';
import styles from '../../../app/builder/builder.module.css';

export default function BasicsForm() {
  const { resumeData, updateBasics, updateLocation, jobDescription } = useResumeStore();
  const { basics } = resumeData;
  const signedIn = !!useUserStore((s) => s.firebaseUser);
  const generate = useGenerateText();

  const handleGenerateSummary = () => {
    if (!signedIn) {
      toast.error('Sign in to use AI writing help.');
      return;
    }
    generate.mutate(
      { kind: 'summary', resume: resumeData, jobDescription },
      {
        onSuccess: (text) => updateBasics('summary', text),
        onError: (err) => toast.error(getErrorMessage(err, "Couldn't write a summary.")),
      },
    );
  };

  return (
    <div className={styles.accordionContent}>
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Name</label>
        <input 
          className={styles.inputField}
          value={basics.name}
          onChange={(e) => updateBasics('name', e.target.value)}
          placeholder="Elena Rostova"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Professional Title</label>
        <input 
          className={styles.inputField}
          value={basics.label}
          onChange={(e) => updateBasics('label', e.target.value)}
          placeholder="Senior Product Designer"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Email</label>
        <input 
          className={styles.inputField}
          type="email"
          value={basics.email}
          onChange={(e) => updateBasics('email', e.target.value)}
          placeholder="hello@example.com"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Phone</label>
        <input 
          className={styles.inputField}
          type="tel"
          value={basics.phone}
          onChange={(e) => updateBasics('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>City</label>
        <input 
          className={styles.inputField}
          value={basics.location.city}
          onChange={(e) => updateLocation('city', e.target.value)}
          placeholder="San Francisco"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Region</label>
        <input 
          className={styles.inputField}
          value={basics.location.region}
          onChange={(e) => updateLocation('region', e.target.value)}
          placeholder="CA"
        />
      </div>

      <div className={styles.inputGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor="basics-summary" className={styles.inputLabel}>Summary</label>
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={generate.isPending}
            className={styles.aiSparkleBtn}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: 'var(--color-primary-active)', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: generate.isPending ? 0.5 : 1 }}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>
              {generate.isPending ? 'sync' : 'auto_awesome'}
            </span>
            {generate.isPending ? 'Writing…' : basics.summary.trim() ? 'Rewrite with AI' : 'Write with AI'}
          </button>
        </div>
        <textarea
          id="basics-summary"
          className={styles.textareaField}
          value={basics.summary}
          onChange={(e) => updateBasics('summary', e.target.value)}
          placeholder="Brief overview of your professional background..."
        />
      </div>
    </div>
  );
}
