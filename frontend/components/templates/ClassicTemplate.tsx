import React from 'react';
import { useResumeStore } from '../../lib/store/resumeStore';
import styles from '../../app/builder/builder.module.css';

interface HighlightedSection {
  section: string;
  marker: number;
}

interface ClassicTemplateProps {
  highlightedSections?: HighlightedSection[];
  data?: any;
}

// ── Module-level sub-components (must not be defined inside render) ──────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.65em',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: 'var(--color-primary)',
      borderBottom: '1px solid var(--color-primary)',
      paddingBottom: '0.3em',
      marginBottom: '0.9em',
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

export default function ClassicTemplate({ highlightedSections = [], data }: ClassicTemplateProps) {
  const storeData = useResumeStore((state) => state.resumeData);
  const activeData = data || storeData;
  const { basics, work, education, projects, skills, certificates, awards } = activeData;

  const getHighlightProps = (sectionName: string) => {
    const highlight = highlightedSections.find(s => s.section === sectionName);
    if (!highlight) return { style: {}, marker: undefined };
    return {
      style: {
        backgroundColor: 'rgba(100, 182, 172, 0.08)',
        borderLeft: '2px solid var(--color-primary)',
        paddingLeft: '0.9em',
        marginLeft: '-0.9em',
        borderRadius: '0 4px 4px 0',
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

  const profileStr = basics.profiles?.map((p: any) => {
    const clean = p.url.replace(/^https?:\/\//, '');
    return `${p.network}: ${clean}`;
  }).join('  ·  ');

  return (
    <div
      className={styles.document}
      style={{
        padding: 'var(--doc-margin, 48px)',
        fontSize: 'var(--doc-font-size, 10pt)',
        fontFamily: 'var(--font-sans)',
        color: '#1a1a1a',
        lineHeight: 1.5,
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '1.6em', ...basicsProps.style }}>
        {basicsProps.marker && <NumberMarker marker={basicsProps.marker} />}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.6em',
          fontWeight: 700,
          color: '#111',
          margin: '0 0 0.15em',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          {basics.name || 'Your Name'}
        </h1>

        {basics.label && (
          <p style={{ fontSize: '0.95em', color: '#555', margin: '0 0 0.6em', fontWeight: 400, fontStyle: 'italic' }}>
            {basics.label}
          </p>
        )}

        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '0.3em 0.8em', fontSize: '0.8em', color: '#555',
        }}>
          {basics.email && <span>{basics.email}</span>}
          {basics.email && basics.phone && <span style={{ color: '#bbb' }}>·</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {(basics.email || basics.phone) && basics.location?.city && <span style={{ color: '#bbb' }}>·</span>}
          {basics.location?.city && (
            <span>{basics.location.city}{basics.location.region ? `, ${basics.location.region}` : ''}</span>
          )}
          {profileStr && <span style={{ color: '#bbb' }}>·</span>}
          {profileStr && <span>{profileStr}</span>}
        </div>
      </div>

      {/* ── Summary ── */}
      {basics.summary && (
        <div style={{ marginBottom: '1.4em' }}>
          <SectionTitle>Summary</SectionTitle>
          <p style={{ fontSize: '0.9em', lineHeight: 1.65, color: '#333', margin: 0 }}>
            {basics.summary}
          </p>
        </div>
      )}

      {/* ── Experience ── */}
      {work.length > 0 && (
        <div style={{ marginBottom: '1.4em', ...workProps.style }}>
          {workProps.marker && <NumberMarker marker={workProps.marker} />}
          <SectionTitle>Experience</SectionTitle>
          {work.map((job: any, idx: any) => (
            <div key={idx} style={{ marginBottom: idx < work.length - 1 ? '1.1em' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15em' }}>
                <h3 style={{ fontSize: '0.95em', fontWeight: 700, color: '#111', margin: 0 }}>
                  {job.position} {job.location && <span style={{ fontWeight: 400, color: '#555' }}>— {job.location}</span>}
                </h3>
                <span style={{ fontSize: '0.85em', color: '#555' }}>
                  {job.startDate} {job.startDate && job.endDate ? '–' : ''} {job.endDate}
                </span>
              </div>
              <div style={{ fontSize: '0.85em', color: 'var(--color-primary)', fontWeight: 600, fontStyle: 'italic', marginBottom: '0.4em' }}>
                {job.name}
              </div>
              {job.highlights.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.87em', color: '#333' }}>
                  {job.highlights.map((h: any, i: any) => (
                    <li key={i} style={{ marginBottom: '0.25em', lineHeight: 1.55 }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '1.4em', ...projectsProps.style }}>
          {projectsProps.marker && <NumberMarker marker={projectsProps.marker} />}
          <SectionTitle>Projects</SectionTitle>
          {projects.map((proj: any, idx: any) => (
            <div key={idx} style={{ marginBottom: idx < projects.length - 1 ? '1.1em' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15em' }}>
                <h3 style={{ fontSize: '0.95em', fontWeight: 700, color: '#111', margin: 0 }}>{proj.name}</h3>
                {(proj.startDate || proj.endDate) && (
                  <span style={{ fontSize: '0.85em', color: '#555' }}>
                    {proj.startDate} {proj.startDate && proj.endDate ? '–' : ''} {proj.endDate}
                  </span>
                )}
              </div>
              {proj.description && (
                <div style={{ fontSize: '0.82em', color: '#555', fontStyle: 'italic', marginBottom: '0.4em' }}>{proj.description}</div>
              )}
              {proj.url && (
                <div style={{ fontSize: '0.78em', color: 'var(--color-primary)', marginBottom: '0.3em' }}>
                  {proj.url.replace(/^https?:\/\//, '')}
                </div>
              )}
              {proj.highlights.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.87em', color: '#333' }}>
                  {proj.highlights.map((h: any, i: any) => (
                    <li key={i} style={{ marginBottom: '0.25em', lineHeight: 1.55 }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Education ── */}
      {education.length > 0 && (
        <div style={{ marginBottom: '1.4em', ...eduProps.style }}>
          {eduProps.marker && <NumberMarker marker={eduProps.marker} />}
          <SectionTitle>Education</SectionTitle>
          {education.map((edu: any, idx: any) => (
            <div key={idx} style={{ marginBottom: idx < education.length - 1 ? '0.8em' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '0.95em', fontWeight: 700, color: '#111', margin: 0 }}>
                  {edu.studyType}{edu.studyType && edu.area ? ' ' : ''}{edu.area}
                </h3>
                <span style={{ fontSize: '0.78em', color: '#666', flexShrink: 0, marginLeft: '1em' }}>
                  {edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}
                </span>
              </div>
              <div style={{ fontSize: '0.85em', color: '#555', marginTop: '0.1em' }}>
                {edu.institution}{edu.score ? ` · ${edu.score}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <div style={{ marginBottom: '1.4em', ...skillsProps.style }}>
          {skillsProps.marker && <NumberMarker marker={skillsProps.marker} />}
          <SectionTitle>Skills</SectionTitle>
          <div style={{ fontSize: '0.87em', lineHeight: 1.7, color: '#333' }}>
            {skills.map((sg: any, idx: any) => (
              <span key={idx}>
                <strong style={{ color: '#111', fontWeight: 600 }}>{sg.name}: </strong>
                {sg.keywords.join(', ')}
                {idx < skills.length - 1 && '   '}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Certificates ── */}
      {certificates.length > 0 && (
        <div style={{ marginBottom: '1.4em', ...certProps.style }}>
          {certProps.marker && <NumberMarker marker={certProps.marker} />}
          <SectionTitle>Certifications</SectionTitle>
          {certificates.map((cert: any, idx: any) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: idx < certificates.length - 1 ? '0.5em' : 0 }}>
              <div>
                <span style={{ fontSize: '0.9em', fontWeight: 600, color: '#111' }}>{cert.name}</span>
                {cert.issuer && <span style={{ fontSize: '0.82em', color: '#555' }}> · {cert.issuer}</span>}
              </div>
              {cert.date && <span style={{ fontSize: '0.78em', color: '#666', flexShrink: 0, marginLeft: '1em' }}>{cert.date}</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Awards & Recognition ── */}
      {awards.length > 0 && (
        <div style={{ marginBottom: '1.4em' }}>
          <SectionTitle>Awards &amp; Recognition</SectionTitle>
          <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.87em', color: '#333' }}>
            {awards.map((award: any, idx: any) => (
              <li key={idx} style={{ marginBottom: '0.35em', lineHeight: 1.55 }}>
                {award.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
