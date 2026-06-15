import React, { useState } from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import { useAiGenerate } from '../../../lib/hooks/useAiGenerate';
import styles from '../../../app/builder/builder.module.css';

export default function WorkForm() {
  const { resumeData, addWorkEntry, updateWorkEntry, removeWorkEntry, jobDescription } = useResumeStore();
  const { work } = resumeData;
  const { generate, isGenerating } = useAiGenerate();
  const [generatingIndex, setGeneratingIndex] = useState<{job: number, highlight: number} | null>(null);

  const handleHighlightGenerate = async (jobIndex: number, highlightIndex: number) => {
    setGeneratingIndex({ job: jobIndex, highlight: highlightIndex });
    const result = await generate('bullet', resumeData, jobDescription);
    const highlights = [...work[jobIndex].highlights];
    highlights[highlightIndex] = result;
    updateWorkEntry(jobIndex, 'highlights', highlights);
    setGeneratingIndex(null);
  };

  const handleHighlightChange = (index: number, highlightIndex: number, value: string) => {
    const highlights = [...work[index].highlights];
    highlights[highlightIndex] = value;
    updateWorkEntry(index, 'highlights', highlights);
  };

  const addHighlight = (index: number) => {
    const highlights = [...work[index].highlights, ''];
    updateWorkEntry(index, 'highlights', highlights);
  };

  const removeHighlight = (index: number, highlightIndex: number) => {
    const highlights = [...work[index].highlights];
    highlights.splice(highlightIndex, 1);
    updateWorkEntry(index, 'highlights', highlights);
  };

  return (
    <div className={styles.accordionContent}>
      {work.map((job, index) => (
        <div key={index} className={styles.repeatableEntry}>
          <button 
            className={styles.removeEntryBtn} 
            onClick={() => removeWorkEntry(index)}
            title="Remove Experience"
          >
            <span className={styles.icon} style={{ fontSize: '18px' }}>close</span>
          </button>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Company</label>
            <input 
              className={styles.inputField}
              value={job.name}
              onChange={(e) => updateWorkEntry(index, 'name', e.target.value)}
              placeholder="Acme Corp"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Position</label>
            <input 
              className={styles.inputField}
              value={job.position}
              onChange={(e) => updateWorkEntry(index, 'position', e.target.value)}
              placeholder="Senior Designer"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>Start Date</label>
              <input 
                className={styles.inputField}
                value={job.startDate}
                onChange={(e) => updateWorkEntry(index, 'startDate', e.target.value)}
                placeholder="Jan 2021"
              />
            </div>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>End Date</label>
              <input 
                className={styles.inputField}
                value={job.endDate}
                onChange={(e) => updateWorkEntry(index, 'endDate', e.target.value)}
                placeholder="Present"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Highlights</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {job.highlights.map((highlight, hIndex) => {
                const isThisGenerating = generatingIndex?.job === index && generatingIndex?.highlight === hIndex;
                return (
                  <div key={hIndex} style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                    <textarea
                      className={styles.textareaField}
                      style={{ minHeight: '60px', flex: 1, opacity: isThisGenerating ? 0.7 : 1 }}
                      value={isThisGenerating ? "Generating..." : highlight}
                      onChange={(e) => handleHighlightChange(index, hIndex, e.target.value)}
                      placeholder="Led the redesign of the core platform..."
                      disabled={isThisGenerating}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button 
                        onClick={() => removeHighlight(index, hIndex)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-ink-muted)', cursor: 'pointer', padding: '4px' }}
                        title="Remove highlight"
                      >
                        <span className={styles.icon} style={{ fontSize: '16px' }}>close</span>
                      </button>
                      <button 
                        onClick={() => handleHighlightGenerate(index, hIndex)}
                        disabled={isGenerating}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px', opacity: isGenerating ? 0.5 : 1 }}
                        title="AI Rewrite"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {isThisGenerating ? 'refresh' : 'auto_awesome'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
              <button 
                onClick={() => addHighlight(index)}
                style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 0' }}
              >
                <span className={styles.icon} style={{ fontSize: '14px' }}>add</span> Add highlight
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <button className={styles.addEntryBtn} onClick={addWorkEntry}>
        <span className={styles.icon} style={{ fontSize: '18px' }}>add</span>
        Add Experience
      </button>
    </div>
  );
}
