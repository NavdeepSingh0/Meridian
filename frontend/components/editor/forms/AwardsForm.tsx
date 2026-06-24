import React from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import styles from '../../../app/builder/builder.module.css';

export default function AwardsForm() {
  const { resumeData, addAwardEntry, updateAwardEntry, removeAwardEntry } = useResumeStore();
  const { awards } = resumeData;

  return (
    <div className={styles.accordionContent}>
      {awards.map((award, index) => (
        <div key={index} className={styles.repeatableEntry}>
          <button 
            className={styles.removeEntryBtn} 
            onClick={() => removeAwardEntry(index)}
            title="Remove Award"
          >
            <span className={styles.icon} style={{ fontSize: '18px' }}>close</span>
          </button>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Title</label>
            <input 
              className={styles.inputField}
              value={award.title}
              onChange={(e) => updateAwardEntry(index, 'title', e.target.value)}
              placeholder="Employee of the Year"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>Date</label>
              <input 
                className={styles.inputField}
                value={award.date}
                onChange={(e) => updateAwardEntry(index, 'date', e.target.value)}
                placeholder="2023"
              />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>Awarder</label>
              <input 
                className={styles.inputField}
                value={award.awarder}
                onChange={(e) => updateAwardEntry(index, 'awarder', e.target.value)}
                placeholder="Company Name"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Summary</label>
            <textarea 
              className={styles.textareaField}
              value={award.summary}
              onChange={(e) => updateAwardEntry(index, 'summary', e.target.value)}
              placeholder="Brief description of the award..."
            />
          </div>
        </div>
      ))}
      
      <button className={styles.addEntryBtn} onClick={addAwardEntry}>
        <span className={styles.icon} style={{ fontSize: '18px' }}>add</span>
        Add Award
      </button>
    </div>
  );
}
