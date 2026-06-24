import React from 'react';
import { useResumeStore } from '../../lib/store/resumeStore';
import styles from '../../app/builder/builder.module.css';

interface HighlightedSection {
  section: string;
  marker: number;
}

interface MinimalTemplateProps {
  highlightedSections?: HighlightedSection[];
  data?: any;
}

// ── Module-level sub-components ───────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.62em',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      color: '#111',
      borderBottom: '2px solid #111',
      paddingBottom: '0.3em',
      marginBottom: '0.8em',
      marginTop: 0,
    }}>
      {children}
    </h2>
  );
}

function NumberMarker({ marker }: { marker: number }) {
  return (
    <div style={{
      position: 'absolute', top: '-8px', left: '-10px',
      width: '18px', height: '18px',
      backgroundColor: 'var(--color-primary)', color: '#fff',
      borderRadius: '50%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '9px', fontWeight: 700, zIndex: 10,
    }}>
      {marker}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function MinimalTemplate({ highlightedSections = [], data }: MinimalTemplateProps) {
  const storeData = useResumeStore((state) => state.resumeData);
  const activeData = data || storeData;
  const { basics, work, education, projects, skills, certificates, awards } = activeData;

  const getHighlightProps = (sectionName: string) => {
    const highlight = highlightedSections.find(s => s.section === sectionName);
    if (!highlight) return { style: {}, marker: undefined };
    return {
      style: {
        backgroundColor: 'rgba(100, 182, 172, 0.06)',
        borderLeft: '2px solid var(--color-primary)',
        paddingLeft: '0.9em',
        marginLeft: '-0.9em',
        position: 'relative' as const,
      },
      marker: highlight.marker,
    };
  };

  const basicsProps = getHighlightProps('basics');
  const workProps = getHighlightProps('work');
  const eduProps = getHighlightProps('education');
  const projectsProps = getHighlightProps('projects');
  const skillsProps = getHighlightProps('skills');
  const certProps = getHighlightProps('certificates');

  const contacts = [
    basics.email,
    basics.phone,
    basics.location?.city ? `${basics.location.city}${basics.location.region ? `, ${basics.location.region}` : ''}` : '',
    ...(basics.profiles?.map(p => p.url.replace(/^https?:\/\//, '')) ?? []),
  ].filter(Boolean);

  return (
    <div
      className={styles.document}
      style={{
        padding: 'var(--doc-margin, 48px)',
        fontSize: 'var(--doc-font-size, 10pt)',
        fontFamily: 'var(--font-sans)',
        color: '#111',
        lineHeight: 1.5,
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.4em', ...basicsProps.style }}>
        {basicsProps.marker && <NumberMarker marker={basicsProps.marker} />}
        <h1 style={{
          fontSize: '2.4em',
          fontWeight: 300,
          letterSpacing: '-0.03em',
          margin: '0 0 0.12em',
          color: '#000',
          lineHeight: 1,
        }}>
          {basics.name || 'Your Name'}
        </h1>
        {basics.label && (
          <p style={{ fontSize: '0.95em', color: '#444', margin: '0 0 0.7em', fontWeight: 400 }}>
            {basics.label}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15em 0em', fontSize: '0.8em', color: '#666' }}>
          {contacts.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ margin: '0 0.5em', color: '#bbb' }}>·</span>}
              <span>{c}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Summary ── */}
      {basics.summary && (
        <div style={{ marginBottom: '1.2em' }}>
          <p style={{ margin: 0, fontSize: '0.88em', color: '#333', lineHeight: 1.65 }}>
            {basics.summary}
          </p>
          <div style={{ borderBottom: '1px solid #EBEBEB', marginTop: '1.2em' }} />
        </div>
      )}

      {/* ── Experience ── */}
      {work.length > 0 && (
        <div style={{ marginBottom: '1.2em', ...workProps.style }}>
          {workProps.marker && <NumberMarker marker={workProps.marker} />}
          <SectionTitle>Experience</SectionTitle>
          {work.map((job, idx) => (
            <div key={idx} style={{ marginBottom: idx < work.length - 1 ? '1em' : 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', gap: '0 1em', marginBottom: '0.15em' }}>
                <div>
                  <strong style={{ fontSize: '0.92em', color: '#111' }}>{job.position}</strong>
                  {job.name && <span style={{ fontSize: '0.88em', color: '#555' }}> — {job.name}</span>}
                </div>
                <span style={{ fontSize: '0.78em', color: '#888', whiteSpace: 'nowrap' }}>
                  {job.startDate}{job.startDate && job.endDate ? ' – ' : ''}{job.endDate}
                </span>
              </div>
              {job.highlights.length > 0 && (
                <ul style={{ margin: '0.3em 0 0', paddingLeft: '1.2em', fontSize: '0.85em', color: '#333' }}>
                  {job.highlights.map((h, i) => (
                    <li key={i} style={{ marginBottom: '0.2em', lineHeight: 1.55 }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '1.2em', ...projectsProps.style }}>
          {projectsProps.marker && <NumberMarker marker={projectsProps.marker} />}
          <SectionTitle>Projects</SectionTitle>
          {projects.map((proj, idx) => (
            <div key={idx} style={{ marginBottom: idx < projects.length - 1 ? '1em' : 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', gap: '0 1em', marginBottom: '0.12em' }}>
                <div>
                  <strong style={{ fontSize: '0.92em', color: '#111' }}>{proj.name}</strong>
                  {proj.url && (
                    <span style={{ fontSize: '0.78em', color: '#888', marginLeft: '0.5em' }}>
                      {proj.url.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>
                {proj.endDate && (
                  <span style={{ fontSize: '0.78em', color: '#888', whiteSpace: 'nowrap' }}>{proj.endDate}</span>
                )}
              </div>
              {proj.description && (
                <div style={{ fontSize: '0.82em', color: '#555', marginBottom: '0.3em', fontStyle: 'italic' }}>{proj.description}</div>
              )}
              {proj.highlights.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.85em', color: '#333' }}>
                  {proj.highlights.map((h, i) => (
                    <li key={i} style={{ marginBottom: '0.2em', lineHeight: 1.55 }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Education ── */}
      {education.length > 0 && (
        <div style={{ marginBottom: '1.2em', ...eduProps.style }}>
          {eduProps.marker && <NumberMarker marker={eduProps.marker} />}
          <SectionTitle>Education</SectionTitle>
          {education.map((edu, idx) => (
            <div key={idx} style={{
              display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline',
              gap: '0 1em', marginBottom: idx < education.length - 1 ? '0.5em' : 0,
            }}>
              <div>
                <strong style={{ fontSize: '0.92em', color: '#111' }}>
                  {edu.studyType}{edu.studyType && edu.area ? ' ' : ''}{edu.area}
                </strong>
                {edu.institution && <span style={{ fontSize: '0.85em', color: '#555' }}> — {edu.institution}</span>}
                {edu.score && <span style={{ fontSize: '0.8em', color: '#888' }}> · {edu.score}</span>}
              </div>
              <span style={{ fontSize: '0.78em', color: '#888', whiteSpace: 'nowrap' }}>
                {edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <div style={{ marginBottom: '1.2em', ...skillsProps.style }}>
          {skillsProps.marker && <NumberMarker marker={skillsProps.marker} />}
          <SectionTitle>Skills</SectionTitle>
          <div style={{ fontSize: '0.85em', lineHeight: 1.7, color: '#333' }}>
            {skills.map((sg, idx) => (
              <React.Fragment key={idx}>
                <strong style={{ color: '#111' }}>{sg.name}:</strong>{' '}
                {sg.keywords.join(', ')}
                {idx < skills.length - 1 && '   '}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ── Certificates ── */}
      {certificates.length > 0 && (
        <div style={{ marginBottom: '1.2em', ...certProps.style }}>
          {certProps.marker && <NumberMarker marker={certProps.marker} />}
          <SectionTitle>Certifications</SectionTitle>
          {certificates.map((cert, idx) => (
            <div key={idx} style={{
              display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline',
              gap: '0 1em', marginBottom: idx < certificates.length - 1 ? '0.4em' : 0,
            }}>
              <div>
                <strong style={{ fontSize: '0.9em', color: '#111' }}>{cert.name}</strong>
                {cert.issuer && <span style={{ fontSize: '0.82em', color: '#555' }}> — {cert.issuer}</span>}
              </div>
              {cert.date && <span style={{ fontSize: '0.78em', color: '#888', whiteSpace: 'nowrap' }}>{cert.date}</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Awards & Recognition ── */}
      {awards.length > 0 && (
        <div style={{ marginBottom: '1.2em' }}>
          <SectionTitle>Awards &amp; Recognition</SectionTitle>
          {awards.map((award, idx) => (
            <div key={idx} style={{ fontSize: '0.85em', color: '#333', marginBottom: idx < awards.length - 1 ? '0.35em' : 0, lineHeight: 1.55 }}>
              {award.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
