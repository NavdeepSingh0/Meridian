import React from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import styles from '../../../app/builder/builder.module.css';

export default function CertificatesForm() {
  const { resumeData, addCertificateEntry, updateCertificateEntry, removeCertificateEntry } = useResumeStore();
  const { certificates } = resumeData;

  return (
    <div className={styles.accordionContent}>
      {certificates.map((cert, index) => (
        <div key={index} className={styles.repeatableEntry}>
          <button 
            className={styles.removeEntryBtn} 
            onClick={() => removeCertificateEntry(index)}
            title="Remove Certificate"
          >
            <span className={styles.icon} style={{ fontSize: '18px' }}>close</span>
          </button>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Name</label>
            <input 
              className={styles.inputField}
              value={cert.name}
              onChange={(e) => updateCertificateEntry(index, 'name', e.target.value)}
              placeholder="AWS Certified Solutions Architect"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Issuer</label>
            <input 
              className={styles.inputField}
              value={cert.issuer}
              onChange={(e) => updateCertificateEntry(index, 'issuer', e.target.value)}
              placeholder="Amazon Web Services"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>Date</label>
              <input 
                className={styles.inputField}
                value={cert.date}
                onChange={(e) => updateCertificateEntry(index, 'date', e.target.value)}
                placeholder="2023"
              />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>URL</label>
              <input 
                className={styles.inputField}
                type="url"
                value={cert.url}
                onChange={(e) => updateCertificateEntry(index, 'url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      ))}
      
      <button className={styles.addEntryBtn} onClick={addCertificateEntry}>
        <span className={styles.icon} style={{ fontSize: '18px' }}>add</span>
        Add Certificate
      </button>
    </div>
  );
}
