import React from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import styles from '../../../app/builder/builder.module.css';

export default function EducationForm() {
  const { resumeData, addEducationEntry, updateEducationEntry, removeEducationEntry } = useResumeStore();
  const { education } = resumeData;

  return (
    <div className={styles.accordionContent}>
      {education.map((edu, index) => (
        <div key={index} className={styles.repeatableEntry}>
          <button 
            className={styles.removeEntryBtn} 
            onClick={() => removeEducationEntry(index)}
            title="Remove Education"
          >
            <span className={styles.icon} style={{ fontSize: '18px' }}>close</span>
          </button>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Institution</label>
            <input 
              className={styles.inputField}
              value={edu.institution}
              onChange={(e) => updateEducationEntry(index, 'institution', e.target.value)}
              placeholder="Rhode Island School of Design"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>Study Type</label>
              <input 
                className={styles.inputField}
                value={edu.studyType}
                onChange={(e) => updateEducationEntry(index, 'studyType', e.target.value)}
                placeholder="B.S."
              />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>Area</label>
              <input 
                className={styles.inputField}
                value={edu.area}
                onChange={(e) => updateEducationEntry(index, 'area', e.target.value)}
                placeholder="Interaction Design"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>Start Date</label>
              <input 
                className={styles.inputField}
                value={edu.startDate}
                onChange={(e) => updateEducationEntry(index, 'startDate', e.target.value)}
                placeholder="2014"
              />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>End Date</label>
              <input 
                className={styles.inputField}
                value={edu.endDate}
                onChange={(e) => updateEducationEntry(index, 'endDate', e.target.value)}
                placeholder="2018"
              />
            </div>
          </div>
        </div>
      ))}
      
      <button className={styles.addEntryBtn} onClick={addEducationEntry}>
        <span className={styles.icon} style={{ fontSize: '18px' }}>add</span>
        Add Education
      </button>
    </div>
  );
}
