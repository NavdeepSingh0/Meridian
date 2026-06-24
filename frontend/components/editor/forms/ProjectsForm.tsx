import React, { useState } from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import styles from '../../../app/builder/builder.module.css';

export default function ProjectsForm() {
  const { resumeData, addProjectEntry, updateProjectEntry, removeProjectEntry } = useResumeStore();
  const { projects } = resumeData;
  const [keywordInputs, setKeywordInputs] = useState<Record<number, string>>({});

  const handleHighlightChange = (index: number, highlightIndex: number, value: string) => {
    const highlights = [...projects[index].highlights];
    highlights[highlightIndex] = value;
    updateProjectEntry(index, 'highlights', highlights);
  };

  const addHighlight = (index: number) => {
    const highlights = [...projects[index].highlights, ''];
    updateProjectEntry(index, 'highlights', highlights);
  };

  const removeHighlight = (index: number, highlightIndex: number) => {
    const highlights = [...projects[index].highlights];
    highlights.splice(highlightIndex, 1);
    updateProjectEntry(index, 'highlights', highlights);
  };

  const handleKeywordKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = keywordInputs[index]?.trim();
      if (val) {
        const keywords = [...projects[index].keywords, val];
        updateProjectEntry(index, 'keywords', keywords);
        setKeywordInputs({ ...keywordInputs, [index]: '' });
      }
    }
  };

  const removeKeyword = (index: number, kIndex: number) => {
    const keywords = [...projects[index].keywords];
    keywords.splice(kIndex, 1);
    updateProjectEntry(index, 'keywords', keywords);
  };

  return (
    <div className={styles.accordionContent}>
      {projects.map((project, index) => (
        <div key={index} className={styles.repeatableEntry}>
          <button 
            className={styles.removeEntryBtn} 
            onClick={() => removeProjectEntry(index)}
            title="Remove Project"
          >
            <span className={styles.icon} style={{ fontSize: '18px' }}>close</span>
          </button>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Project Name</label>
            <input 
              className={styles.inputField}
              value={project.name}
              onChange={(e) => updateProjectEntry(index, 'name', e.target.value)}
              placeholder="Meridian AI"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>URL / Link</label>
            <input 
              className={styles.inputField}
              type="url"
              value={project.url}
              onChange={(e) => updateProjectEntry(index, 'url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>Start Date</label>
              <input 
                className={styles.inputField}
                value={project.startDate || ''}
                onChange={(e) => updateProjectEntry(index, 'startDate', e.target.value)}
                placeholder="Jan 2021"
              />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>End Date</label>
              <input 
                className={styles.inputField}
                value={project.endDate || ''}
                onChange={(e) => updateProjectEntry(index, 'endDate', e.target.value)}
                placeholder="Present"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Description</label>
            <textarea 
              className={styles.textareaField}
              value={project.description}
              onChange={(e) => updateProjectEntry(index, 'description', e.target.value)}
              placeholder="A brief overview..."
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Highlights</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {project.highlights.map((highlight, hIndex) => (
                <div key={hIndex} style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                  <textarea
                    className={styles.textareaField}
                    style={{ minHeight: '60px', flex: 1 }}
                    value={highlight}
                    onChange={(e) => handleHighlightChange(index, hIndex, e.target.value)}
                    placeholder="Built the core engine..."
                  />
                  <button 
                    onClick={() => removeHighlight(index, hIndex)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: '4px' }}
                  >
                    <span className={styles.icon} style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => addHighlight(index)}
                style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 0' }}
              >
                <span className={styles.icon} style={{ fontSize: '14px' }}>add</span> Add highlight
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Keywords</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {project.keywords.map((kw, kIndex) => (
                <span 
                  key={kIndex} 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--color-surface)', color: 'var(--color-ink-muted)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}
                >
                  {kw}
                  <button 
                    onClick={() => removeKeyword(index, kIndex)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                  >
                    <span className={styles.icon} style={{ fontSize: '14px' }}>close</span>
                  </button>
                </span>
              ))}
            </div>
            <input 
              className={styles.inputField}
              value={keywordInputs[index] || ''}
              onChange={(e) => setKeywordInputs({ ...keywordInputs, [index]: e.target.value })}
              onKeyDown={(e) => handleKeywordKeyDown(index, e)}
              placeholder="Press enter to add..."
            />
          </div>
        </div>
      ))}
      
      <button className={styles.addEntryBtn} onClick={addProjectEntry}>
        <span className={styles.icon} style={{ fontSize: '18px' }}>add</span>
        Add Project
      </button>
    </div>
  );
}
