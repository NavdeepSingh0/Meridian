import React from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import styles from '../../../app/builder/builder.module.css';

export default function BasicsForm() {
  const { resumeData, updateBasics, updateLocation } = useResumeStore();
  const { basics } = resumeData;

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
        <label className={styles.inputLabel}>Summary</label>
        <textarea 
          className={styles.textareaField}
          value={basics.summary}
          onChange={(e) => updateBasics('summary', e.target.value)}
          placeholder="Brief overview of your professional background..."
        />
      </div>
    </div>
  );
}
