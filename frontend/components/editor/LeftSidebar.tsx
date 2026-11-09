import React, { useState } from 'react';
import styles from '../../app/builder/builder.module.css';
import sidebarStyles from './LeftSidebar.module.css';
import BasicsForm from './forms/BasicsForm';
import EducationForm from './forms/EducationForm';
import CertificatesForm from './forms/CertificatesForm';
import WorkForm from './forms/WorkForm';
import ProjectsForm from './forms/ProjectsForm';
import SkillsForm from './forms/SkillsForm';
import AwardsForm from './forms/AwardsForm';
import { ConfirmDialog } from '../shared/Modal';

import { useResumeStore, initialResumeData } from '../../lib/store/resumeStore';
import { mockResumes } from '../../lib/store/mockResumes';
import { ResumeData } from '../../lib/types/resume';

const SECTIONS = [
  { id: 'Basics', label: 'Resume Header', icon: 'person', component: BasicsForm },
  { id: 'Education', label: 'Education', icon: 'school', component: EducationForm },
  { id: 'Certificates', label: 'Certifications', icon: 'workspace_premium', component: CertificatesForm },
  { id: 'Experience', label: 'Professional Experience', icon: 'work', component: WorkForm },
  { id: 'Projects', label: 'Projects & Outside Experience', icon: 'folder_open', component: ProjectsForm },
  { id: 'Skills', label: 'Skills', icon: 'psychology', component: SkillsForm },
  { id: 'Awards', label: 'Awards & Honors', icon: 'emoji_events', component: AwardsForm },
];

const TEMPLATES = ['classic', 'modern', 'minimal'];

const DEMOS: { label: string; emoji: string; data: ResumeData }[] = [
  { label: 'Software Engineer', emoji: '👨‍💻', data: mockResumes.softwareEngineer },
  { label: 'UI/UX Designer', emoji: '🎨', data: mockResumes.designer },
  { label: 'Product Manager', emoji: '📊', data: mockResumes.productManager },
];

interface LeftSidebarProps {
  activeSection: string;
  setActiveSection: (s: string) => void;
  isLocked?: boolean;
}

export default function LeftSidebar({ activeSection, setActiveSection, isLocked = false }: LeftSidebarProps) {
  const {
    selectedTemplateId, setSelectedTemplateId, fontSize, setFontSize,
    documentMargin, setDocumentMargin, resumeData, setResumeData,
  } = useResumeStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'layout'>('editor');
  const [pendingDemo, setPendingDemo] = useState<ResumeData | null>(null);

  const hasContent = JSON.stringify(resumeData) !== JSON.stringify(initialResumeData);

  const loadDemo = (data: ResumeData) => {
    if (hasContent) setPendingDemo(data);
    else setResumeData(JSON.parse(JSON.stringify(data)));
  };

  return (
    <aside
      className={`${styles.saasLeftSidebar} tour-left-sidebar`}
      style={{ opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? 'none' : 'auto', transition: 'all 0.3s ease' }}
    >
      <div className={styles.sideTabBarContainer}>
        <div className={styles.sideTabBar} role="tablist" aria-label="Sidebar">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'editor'}
            className={`${styles.sideTab} ${activeTab === 'editor' ? styles.sideTabActive : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>edit_document</span> Editor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'layout'}
            className={`${styles.sideTab} ${activeTab === 'layout' ? styles.sideTabActive : ''}`}
            onClick={() => setActiveTab('layout')}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>design_services</span> Layout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'editor' && (
          <div className={styles.sectionCardList}>
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const FormComponent = section.component;
              const panelId = `section-panel-${section.id}`;

              return (
                <div key={section.id} className={styles.sectionCard}>
                  <button
                    type="button"
                    className={`${styles.sectionCardHeader} ${sidebarStyles.headerButton}`}
                    onClick={() => setActiveSection(isActive ? '' : section.id)}
                    aria-expanded={isActive}
                    aria-controls={panelId}
                  >
                    <div className={styles.sectionIconOrb}>
                      <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18 }}>{section.icon}</span>
                    </div>
                    <span className={styles.sectionLabel}>{section.label}</span>
                    <span
                      aria-hidden="true"
                      className={`material-symbols-outlined ${styles.sectionChevron} ${isActive ? styles.sectionChevronOpen : ''}`}
                    >
                      chevron_right
                    </span>
                  </button>

                  {isActive && (
                    <div id={panelId} className={styles.sectionCardBody}>
                      <FormComponent />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'layout' && (
          <div className={`${styles.sectionCardList} ${sidebarStyles.layoutTab}`}>
            <h3 className={sidebarStyles.groupTitle}>Templates</h3>
            <div className={sidebarStyles.templateList}>
              {TEMPLATES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={selectedTemplateId === t}
                  onClick={() => setSelectedTemplateId(t)}
                  className={`${sidebarStyles.templateBtn} ${selectedTemplateId === t ? sidebarStyles.templateBtnActive : ''}`}
                >
                  {t}
                  {selectedTemplateId === t && (
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--color-primary)', fontSize: 18 }}>check_circle</span>
                  )}
                </button>
              ))}
            </div>

            <h3 className={sidebarStyles.groupTitle}>Formatting</h3>
            <div className={sidebarStyles.sliderGroup}>
              <label htmlFor="font-size" className={sidebarStyles.sliderRow}>
                <span>Font size</span>
                <span className={sidebarStyles.sliderValue}>{fontSize}pt</span>
              </label>
              <input
                id="font-size"
                className={sidebarStyles.slider}
                type="range" min="9" max="12" step="0.5"
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
              />

              <label htmlFor="doc-margin" className={sidebarStyles.sliderRow}>
                <span>Document margins</span>
                <span className={sidebarStyles.sliderValue}>{documentMargin === 1 ? 'Normal' : `${documentMargin}x`}</span>
              </label>
              <input
                id="doc-margin"
                className={sidebarStyles.slider}
                type="range" min="0.5" max="1.5" step="0.1"
                value={documentMargin}
                onChange={(e) => setDocumentMargin(parseFloat(e.target.value))}
              />
            </div>

            <h3 className={sidebarStyles.groupTitle}>Load demo data</h3>
            <div className={sidebarStyles.demoList}>
              {DEMOS.map((demo) => (
                <button key={demo.label} type="button" className={sidebarStyles.demoBtn} onClick={() => loadDemo(demo.data)}>
                  <span aria-hidden="true">{demo.emoji}</span> {demo.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingDemo !== null}
        title="Replace your resume with demo data?"
        description="This will overwrite everything currently in your resume. This can't be undone."
        confirmLabel="Replace"
        destructive
        onCancel={() => setPendingDemo(null)}
        onConfirm={() => {
          if (pendingDemo) setResumeData(JSON.parse(JSON.stringify(pendingDemo)));
          setPendingDemo(null);
        }}
      />
    </aside>
  );
}
