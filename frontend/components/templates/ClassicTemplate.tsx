import React from 'react';
import { useResumeStore } from '../../lib/store/resumeStore';
import styles from '../../app/builder/builder.module.css';

export default function ClassicTemplate() {
  const { data } = useResumeStore();

  return (
    <div className={`${styles.document} ${styles.highlightTopLg}`}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className={styles.docName}>{data.basics.name || 'Your Name'}</h1>
        <div className={styles.docContact}>
          {data.basics.email && <span>{data.basics.email}</span>}
          {data.basics.email && data.basics.phone && <span>•</span>}
          {data.basics.phone && <span>{data.basics.phone}</span>}
          {((data.basics.email || data.basics.phone) && data.basics.location?.city) && <span>•</span>}
          {data.basics.location?.city && <span>{data.basics.location.city}{data.basics.location.region ? `, ${data.basics.location.region}` : ''}</span>}
        </div>
      </div>

      {data.work.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 className={styles.docSectionTitle}>Experience</h2>
          
          {data.work.map((job, idx) => (
            <div key={idx} className={styles.jobItem}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{job.position}</h3>
                <span className={styles.jobDate}>{job.startDate} - {job.endDate}</span>
              </div>
              <div className={styles.jobCompany}>{job.name}</div>
              <ul className={styles.jobBullets}>
                {job.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {data.education.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 className={styles.docSectionTitle}>Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{edu.studyType} {edu.area}</h3>
                <span className={styles.jobDate}>{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className={styles.jobCompany} style={{ color: 'var(--b-on-surface-variant)', fontStyle: 'normal' }}>
                {edu.institution}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div>
          <h2 className={styles.docSectionTitle}>Skills</h2>
          <p className={styles.skillsText}>
            {data.skills.map((skillGroup, idx) => (
              <span key={idx}>
                <strong>{skillGroup.name}:</strong> {skillGroup.keywords.join(', ')}<br/>
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
