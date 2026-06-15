import React, { useState } from 'react';
import { useResumeStore } from '../../../lib/store/resumeStore';
import styles from '../../../app/builder/builder.module.css';

export default function SkillsForm() {
  const { resumeData, addSkillEntry, updateSkillEntry, removeSkillEntry } = useResumeStore();
  const { skills } = resumeData;
  const [keywordInputs, setKeywordInputs] = useState<Record<number, string>>({});

  const handleKeywordKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = keywordInputs[index]?.trim();
      if (val) {
        const keywords = [...skills[index].keywords, val];
        updateSkillEntry(index, 'keywords', keywords);
        setKeywordInputs({ ...keywordInputs, [index]: '' });
      }
    }
  };

  const removeKeyword = (index: number, kIndex: number) => {
    const keywords = [...skills[index].keywords];
    keywords.splice(kIndex, 1);
    updateSkillEntry(index, 'keywords', keywords);
  };

  return (
    <div className={styles.accordionContent}>
      {skills.map((skillGroup, index) => (
        <div key={index} className={styles.repeatableEntry}>
          <button 
            className={styles.removeEntryBtn} 
            onClick={() => removeSkillEntry(index)}
            title="Remove Skill Group"
          >
            <span className={styles.icon} style={{ fontSize: '18px' }}>close</span>
          </button>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Group Name</label>
            <input 
              className={styles.inputField}
              value={skillGroup.name}
              onChange={(e) => updateSkillEntry(index, 'name', e.target.value)}
              placeholder="Design Tools"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Keywords (Press Enter to add)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {skillGroup.keywords.map((kw, kIndex) => (
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
              placeholder="Figma, Sketch..."
            />
          </div>
        </div>
      ))}
      
      <button className={styles.addEntryBtn} onClick={addSkillEntry}>
        <span className={styles.icon} style={{ fontSize: '18px' }}>add</span>
        Add Skill Group
      </button>
    </div>
  );
}
