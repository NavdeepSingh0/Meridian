import React from 'react';
import { useResumeStore } from '../../lib/store/resumeStore';
import styles from '../../app/builder/builder.module.css';

interface HighlightedSection {
  section: string;
  marker: number;
}

interface ClassicTemplateProps {
  highlightedSections?: HighlightedSection[];
}

export default function ClassicTemplate({ highlightedSections = [] }: ClassicTemplateProps) {
  const { resumeData } = useResumeStore();
  const { basics, work, education, projects, skills, certificates } = resumeData;

  // Helper to check if a section is highlighted
  const getHighlightProps = (sectionName: string) => {
    const highlight = highlightedSections.find(s => s.section === sectionName);
    if (!highlight) return {};

    return {
      style: {
        backgroundColor: 'var(--color-surface)', // #DAFFEF
        borderLeft: '1.5px solid var(--color-primary)', // #64B6AC
        position: 'relative' as const,
        paddingLeft: '16px',
        marginLeft: '-16px',
        borderRadius: '0 4px 4px 0',
      },
      marker: highlight.marker
    };
  };

  const renderMarker = (marker?: number) => {
    if (!marker) return null;
    return (
      <div style={{
        position: 'absolute',
        top: '-10px',
        left: '-10px',
        width: '20px',
        height: '20px',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 'bold',
        zIndex: 10
      }}>
        {marker}
      </div>
    );
  };

  const basicsProps = getHighlightProps('basics');
  const workProps = getHighlightProps('work');
  const eduProps = getHighlightProps('education');
  const projectsProps = getHighlightProps('projects');
  const skillsProps = getHighlightProps('skills');
  const certProps = getHighlightProps('certificates');

  return (
    <div className={`${styles.document} ${styles.highlightTopLg}`}>
      <div style={{ textAlign: 'center', marginBottom: '40px', ...basicsProps.style }}>
        {renderMarker(basicsProps.marker)}
        <h1 className={styles.docName} style={{ color: basics.name ? 'inherit' : 'var(--color-ink-muted)' }}>
          {basics.name || 'Your Name'}
        </h1>
        {basics.label && (
          <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink-muted)', marginBottom: '6px', marginTop: '-4px', fontStyle: 'italic' }}>
            {basics.label}
          </p>
        )}
        <div className={styles.docContact}>
          {basics.email && <span>{basics.email}</span>}
          {basics.email && basics.phone && <span>•</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {((basics.email || basics.phone) && basics.location?.city) && <span>•</span>}
          {basics.location?.city && <span>{basics.location.city}{basics.location.region ? `, ${basics.location.region}` : ''}</span>}
          {basics.profiles && basics.profiles.length > 0 && basics.profiles.map((profile, i) => (
            <React.Fragment key={`profile-${i}`}>
              <span>•</span>
              <span>{profile.network}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {basics.summary && (
        <div style={{ marginBottom: '32px' }}>
          <h2 className={styles.docSectionTitle}>Summary</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-ink)', margin: 0 }}>
            {basics.summary}
          </p>
        </div>
      )}

      <div style={{ marginBottom: '32px', ...workProps.style }}>
        {renderMarker(workProps.marker)}
        <h2 className={styles.docSectionTitle}>Experience</h2>
        
        {work.length === 0 ? (
          <p style={{ color: 'var(--color-ink-muted)', fontStyle: 'italic', fontSize: '14px' }}>
            Your experience will appear here
          </p>
        ) : (
          work.map((job, idx) => (
            <div key={idx} className={styles.jobItem}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{job.position}</h3>
                <span className={styles.jobDate}>{job.startDate} {job.startDate && job.endDate ? '-' : ''} {job.endDate}</span>
              </div>
              <div className={styles.jobCompany}>{job.name}</div>
              <ul className={styles.jobBullets}>
                {job.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <div style={{ marginBottom: '32px', ...eduProps.style }}>
        {renderMarker(eduProps.marker)}
        <h2 className={styles.docSectionTitle}>Education</h2>
        
        {education.length === 0 ? (
          <p style={{ color: 'var(--color-ink-muted)', fontStyle: 'italic', fontSize: '14px' }}>
            Your education will appear here
          </p>
        ) : (
          education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{edu.studyType} {edu.area}</h3>
                <span className={styles.jobDate}>{edu.startDate} {edu.startDate && edu.endDate ? '-' : ''} {edu.endDate}</span>
              </div>
              <div className={styles.jobCompany} style={{ color: 'var(--b-on-surface-variant)', fontStyle: 'normal' }}>
                {edu.institution}
              </div>
            </div>
          ))
        )}
      </div>

      {projects.length > 0 && (
        <div style={{ marginBottom: '32px', ...projectsProps.style }}>
          {renderMarker(projectsProps.marker)}
          <h2 className={styles.docSectionTitle}>Projects</h2>
          {projects.map((proj, idx) => (
            <div key={idx} className={styles.jobItem}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{proj.name}</h3>
              </div>
              <div className={styles.jobCompany}>{proj.url}</div>
              <p style={{ fontSize: '14px', marginBottom: '4px' }}>{proj.description}</p>
              <ul className={styles.jobBullets}>
                {proj.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
              {proj.keywords.length > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                  <strong>Keywords:</strong> {proj.keywords.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '32px', ...skillsProps.style }}>
        {renderMarker(skillsProps.marker)}
        <h2 className={styles.docSectionTitle}>Skills</h2>
        
        {skills.length === 0 ? (
          <p style={{ color: 'var(--color-ink-muted)', fontStyle: 'italic', fontSize: '14px' }}>
            Your skills will appear here
          </p>
        ) : (
          <p className={styles.skillsText}>
            {skills.map((skillGroup, idx) => (
              <span key={idx}>
                <strong>{skillGroup.name}:</strong> {skillGroup.keywords.join(', ')}<br/>
              </span>
            ))}
          </p>
        )}
      </div>

      {certificates.length > 0 && (
        <div style={{ marginBottom: '32px', ...certProps.style }}>
          {renderMarker(certProps.marker)}
          <h2 className={styles.docSectionTitle}>Certificates</h2>
          {certificates.map((cert, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{cert.name}</h3>
                <span className={styles.jobDate}>{cert.date}</span>
              </div>
              <div className={styles.jobCompany} style={{ color: 'var(--b-on-surface-variant)', fontStyle: 'normal' }}>
                {cert.issuer} {cert.url && <span>- <a href={cert.url} style={{ color: 'inherit', textDecoration: 'underline' }}>{cert.url}</a></span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
