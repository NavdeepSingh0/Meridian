import React from 'react';
import { useResumeStore } from '../../lib/store/resumeStore';
import styles from '../../app/builder/builder.module.css';

interface HighlightedSection {
  section: string;
  marker: number;
}

interface ModernTemplateProps {
  highlightedSections?: HighlightedSection[];
  data?: any;
}

// ── Module-level sub-components ───────────────────────────────────────────────
function LeftSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.6em',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      color: 'rgba(255,255,255,0.55)',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      paddingBottom: '0.35em',
      marginBottom: '0.8em',
      marginTop: 0,
    }}>
      {children}
    </h2>
  );
}

function RightSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.62em',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: '#1C2B27',
      borderBottom: '2px solid #1C2B27',
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

export default function ModernTemplate({ highlightedSections = [], data }: ModernTemplateProps) {
  const storeData = useResumeStore((state) => state.resumeData);
  const activeData = data || storeData;
  const { basics, work, education, projects, skills, certificates, awards } = activeData;

  const getHighlightProps = (sectionName: string) => {
    const highlight = highlightedSections.find(s => s.section === sectionName);
    if (!highlight) return { style: {}, marker: undefined };
    return {
      style: {
        backgroundColor: 'rgba(100, 182, 172, 0.1)',
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

  const SIDEBAR_BG = '#1C2B27';

  return (
    <div
      className={styles.document}
      style={{
        padding: 0,
        fontSize: 'var(--doc-font-size, 10pt)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        minHeight: '100%',
        overflow: 'hidden',
        backgroundColor: '#fff',
        color: '#1a1a1a',
      }}
    >
      {/* ══════════════════════════════
          LEFT SIDEBAR — 30%
         ══════════════════════════════ */}
      <div style={{
        flex: '0 0 30%',
        backgroundColor: SIDEBAR_BG,
        color: '#FFFFFF',
        padding: 'var(--doc-margin, 48px) 1.8em',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.8em',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}>
        {/* Name & Contact */}
        <div style={{ ...basicsProps.style, color: 'inherit' }}>
          {basicsProps.marker && <NumberMarker marker={basicsProps.marker} />}
          <h1 style={{
            fontSize: '1.8em',
            fontWeight: 700,
            margin: '0 0 0.2em',
            lineHeight: 1.1,
            color: '#FFF',
            letterSpacing: '-0.02em',
          }}>
            {basics.name || 'Your Name'}
          </h1>
          {basics.label && (
            <p style={{ fontSize: '0.88em', color: 'var(--color-primary)', margin: '0 0 1.2em', fontWeight: 500 }}>
              {basics.label}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', fontSize: '0.78em', color: 'rgba(255,255,255,0.7)' }}>
            {basics.email && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.95em', color: 'var(--color-primary)', flexShrink: 0, marginTop: '0.05em' }}>mail</span>
                <span>{basics.email}</span>
              </div>
            )}
            {basics.phone && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.95em', color: 'var(--color-primary)', flexShrink: 0, marginTop: '0.05em' }}>phone</span>
                <span>{basics.phone}</span>
              </div>
            )}
            {basics.location?.city && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.95em', color: 'var(--color-primary)', flexShrink: 0, marginTop: '0.05em' }}>location_on</span>
                <span>{basics.location.city}{basics.location.region ? `, ${basics.location.region}` : ''}</span>
              </div>
            )}
            {basics.profiles?.map((p: any, i: any) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.95em', color: 'var(--color-primary)', flexShrink: 0, marginTop: '0.05em' }}>link</span>
                <span style={{ wordBreak: 'break-all' }}>{p.url.replace(/^https?:\/\//, '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ ...skillsProps.style, color: 'inherit' }}>
            {skillsProps.marker && <NumberMarker marker={skillsProps.marker} />}
            <LeftSectionTitle>Skills</LeftSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9em' }}>
              {skills.map((sg: any, idx: any) => (
                <div key={idx}>
                  <div style={{ fontSize: '0.78em', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '0.4em' }}>
                    {sg.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em' }}>
                    {sg.keywords.map((kw: any, i: any) => (
                      <span key={i} style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)',
                        padding: '0.2em 0.55em',
                        borderRadius: '3px',
                        fontSize: '0.72em',
                        fontWeight: 500,
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards in sidebar */}
        {awards.length > 0 && (
          <div>
            <LeftSectionTitle>Awards</LeftSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
              {awards.map((award: any, idx: any) => (
                <div key={idx} style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  {award.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════
          RIGHT MAIN — 70%
         ══════════════════════════════ */}
      <div style={{
        flex: 1,
        padding: 'var(--doc-margin, 48px) 2.2em',
        backgroundColor: '#FFFFFF',
        overflowWrap: 'break-word',
      }}>

        {/* Summary */}
        {basics.summary && (
          <div style={{ marginBottom: '1.4em' }}>
            <RightSectionTitle>Profile</RightSectionTitle>
            <p style={{ fontSize: '0.88em', lineHeight: 1.65, color: '#444', margin: 0 }}>
              {basics.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {work.length > 0 && (
          <div style={{ marginBottom: '1.4em', ...workProps.style }}>
            {workProps.marker && <NumberMarker marker={workProps.marker} />}
            <RightSectionTitle>Experience</RightSectionTitle>
            {work.map((job: any, idx: any) => (
              <div key={idx} style={{ marginBottom: idx < work.length - 1 ? '1.1em' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.12em' }}>
                  <h3 style={{ fontSize: '0.95em', fontWeight: 700, color: '#111', margin: 0 }}>
                    {job.position} {job.location && <span style={{ fontWeight: 400, color: '#555' }}>— {job.location}</span>}
                  </h3>
                  <span style={{ fontSize: '0.82em', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {job.startDate} {job.startDate && job.endDate ? '–' : ''} {job.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '0.85em', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.4em' }}>{job.name}</div>
                {job.highlights.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.87em', color: '#333' }}>{job.highlights.map((h: any, i: any) => <li key={i} style={{ marginBottom: '0.2em' }}>{h}</li>)}</ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: '1.4em', ...projectsProps.style }}>
            {projectsProps.marker && <NumberMarker marker={projectsProps.marker} />}
            <RightSectionTitle>Projects</RightSectionTitle>
            {projects.map((proj: any, idx: any) => (
              <div key={idx} style={{ marginBottom: idx < projects.length - 1 ? '1.1em' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.12em' }}>
                  <h3 style={{ fontSize: '0.95em', fontWeight: 700, color: '#111', margin: 0 }}>{proj.name}</h3>
                  {(proj.startDate || proj.endDate) && (
                    <span style={{ fontSize: '0.82em', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      {proj.startDate} {proj.startDate && proj.endDate ? '–' : ''} {proj.endDate}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <div style={{ fontSize: '0.82em', color: '#555', fontStyle: 'italic', marginBottom: '0.3em' }}>{proj.description}</div>
                )}
                {proj.url && (
                  <div style={{ fontSize: '0.76em', color: 'var(--color-primary)', fontWeight: 500, marginBottom: '0.3em' }}>
                    {proj.url.replace(/^https?:\/\//, '')}
                  </div>
                )}
                {proj.highlights.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.87em', color: '#333' }}>{proj.highlights.map((h: any, i: any) => <li key={i} style={{ marginBottom: '0.2em' }}>{h}</li>)}</ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: '1.4em', ...eduProps.style }}>
            {eduProps.marker && <NumberMarker marker={eduProps.marker} />}
            <RightSectionTitle>Education</RightSectionTitle>
            {education.map((edu: any, idx: any) => (
              <div key={idx} style={{ marginBottom: idx < education.length - 1 ? '0.8em' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: '0.92em', fontWeight: 700, color: '#111', margin: 0 }}>
                    {edu.studyType}{edu.studyType && edu.area ? ' ' : ''}{edu.area}
                  </h3>
                  <span style={{ fontSize: '0.75em', color: '#777', fontWeight: 500, flexShrink: 0, marginLeft: '1em' }}>
                    {edu.startDate}{edu.startDate && edu.endDate ? ' – ' : ''}{edu.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '0.84em', color: '#555', marginTop: '0.1em' }}>
                  {edu.institution}{edu.score ? ` · ${edu.score}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <div style={{ marginBottom: '1.4em', ...certProps.style }}>
            {certProps.marker && <NumberMarker marker={certProps.marker} />}
            <RightSectionTitle>Certifications</RightSectionTitle>
            {certificates.map((cert: any, idx: any) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: idx < certificates.length - 1 ? '0.5em' : 0 }}>
                <div>
                  <span style={{ fontSize: '0.9em', fontWeight: 600, color: '#111' }}>{cert.name}</span>
                  {cert.issuer && <span style={{ fontSize: '0.82em', color: '#555' }}> · {cert.issuer}</span>}
                </div>
                {cert.date && <span style={{ fontSize: '0.75em', color: '#777', flexShrink: 0, marginLeft: '1em' }}>{cert.date}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
