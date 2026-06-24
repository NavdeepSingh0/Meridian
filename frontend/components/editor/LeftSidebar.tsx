import React, { useState } from 'react';
import styles from '../../app/builder/builder.module.css';
import BasicsForm from './forms/BasicsForm';
import EducationForm from './forms/EducationForm';
import CertificatesForm from './forms/CertificatesForm';
import WorkForm from './forms/WorkForm';
import ProjectsForm from './forms/ProjectsForm';
import SkillsForm from './forms/SkillsForm';
import AwardsForm from './forms/AwardsForm';

import { useResumeStore } from '../../lib/store/resumeStore';
import { mockResumes } from '../../lib/store/mockResumes';

// Icon map for optional custom sections
const CUSTOM_SECTION_ICONS: Record<string, string> = {
  Volunteer: 'volunteer_activism',
  Awards: 'military_tech',
  Publications: 'auto_stories',
  Languages: 'translate',
  Interests: 'interests',
  References: 'group',
};

// Factory: creates a stable no-prop placeholder form for each custom section.
// Defined at module level so the created component is not recreated on each render.
function makeGenericSectionForm(sectionLabel: string) {
  function GenericForm() {
    return (
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '12px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-primary)', flexShrink: 0, marginTop: '1px' }}>info</span>
          The <strong style={{ color: 'var(--color-ink)', marginLeft: '2px', marginRight: '2px' }}>{sectionLabel}</strong> section is active and will be included in your exported resume.
        </p>
      </div>
    );
  }
  GenericForm.displayName = `GenericForm_${sectionLabel}`;
  return GenericForm;
}

interface LeftSidebarProps {
  activeSection: string;
  setActiveSection: (s: string) => void;
  isLocked?: boolean;
}

export default function LeftSidebar({ activeSection, setActiveSection, isLocked = false }: LeftSidebarProps) {
  const { selectedTemplateId, setSelectedTemplateId, fontSize, setFontSize, documentMargin, setDocumentMargin } = useResumeStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'layout' | 'ai'>('editor');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [sections, setSections] = useState([
    { id: 'Basics', label: 'Resume Header', icon: 'person', component: BasicsForm },
    { id: 'Education', label: 'Education', icon: 'school', component: EducationForm },
    { id: 'Certificates', label: 'Certifications', icon: 'workspace_premium', component: CertificatesForm },
    { id: 'Experience', label: 'Professional Experience', icon: 'work', component: WorkForm },
    { id: 'Projects', label: 'Projects & Outside Experience', icon: 'folder_open', component: ProjectsForm },
    { id: 'Skills', label: 'Skills', icon: 'psychology', component: SkillsForm },
    { id: 'Awards', label: 'Awards & Honors', icon: 'emoji_events', component: AwardsForm },
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggableSectionId, setDraggableSectionId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Optional: Set drag image or opacity
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedItem);
    
    setSections(newSections);
  };

  return (
    <aside
      className={`${styles.saasLeftSidebar} tour-left-sidebar`}
      style={{ opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? 'none' : 'auto', transition: 'all 0.3s ease' }}
    >
      <div className={styles.sideTabBarContainer}>
        <div className={styles.sideTabBar}>
          <button 
            className={`${styles.sideTab} ${activeTab === 'editor' ? styles.sideTabActive : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit_document</span> Editor
          </button>
          <button 
            className={`${styles.sideTab} ${activeTab === 'layout' ? styles.sideTabActive : ''}`}
            onClick={() => setActiveTab('layout')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>design_services</span> Layout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'editor' && (
          <div className={styles.sectionCardList}>
            {sections.map((section, index) => {
              const isActive = activeSection === section.id;
              const FormComponent = section.component;

              return (
                <div 
                  key={section.id} 
                  className={styles.sectionCard}
                  draggable={draggableSectionId === section.id}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{ transition: 'opacity 0.2s', opacity: draggedIndex === index ? 0.5 : 1 }}
                >
                  <div
                    className={styles.sectionCardHeader}
                    onClick={() => setActiveSection(isActive ? '' : section.id)}
                  >
                    <div 
                      className={styles.dragDots} 
                      style={{ cursor: 'grab' }}
                      onMouseEnter={() => setDraggableSectionId(section.id)}
                      onMouseLeave={() => setDraggableSectionId(null)}
                    >
                      <div className={styles.dragDot}></div><div className={styles.dragDot}></div>
                      <div className={styles.dragDot}></div><div className={styles.dragDot}></div>
                      <div className={styles.dragDot}></div><div className={styles.dragDot}></div>
                    </div>
                    <div className={styles.sectionIconOrb}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{section.icon}</span>
                    </div>
                    <span className={styles.sectionLabel}>{section.label}</span>
                    <span className={`material-symbols-outlined ${styles.sectionChevron} ${isActive ? styles.sectionChevronOpen : ''}`}>
                      chevron_right
                    </span>
                  </div>

                  {isActive && FormComponent && (
                    <div className={styles.sectionCardBody}>
                      <FormComponent />
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ position: 'relative', marginTop: '12px' }}>
              <button 
                className={styles.addCustomSectionBtn} 
                onClick={() => setShowAddMenu(!showAddMenu)}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Add Custom Section
              </button>

              {showAddMenu && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: '8px', 
                  background: 'var(--color-base)', border: '1px solid var(--color-border)', 
                  borderRadius: '8px', padding: '4px', boxShadow: 'var(--shadow-dropdown)',
                  display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 100
                }}>
                  {['Volunteer', 'Awards', 'Publications', 'Languages', 'Interests', 'References'].map((sectionName) => (
                    <button 
                      key={sectionName}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}
                      onClick={() => {
                      setSections(prev => {
                        if (prev.find(s => s.id === sectionName)) return prev;
                        return [...prev, {
                          id: sectionName,
                          label: sectionName,
                          icon: CUSTOM_SECTION_ICONS[sectionName] || 'add_circle',
                          component: makeGenericSectionForm(sectionName),
                        }];
                      });
                      setShowAddMenu(false);
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-ink-muted)' }}>add_circle</span>
                      {sectionName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className={styles.sectionCardList} style={{ padding: '16px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '16px' }}>Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['classic', 'modern', 'minimal'].map(t => (
                <button 
                  key={t}
                  onClick={() => setSelectedTemplateId(t)}
                  style={{ 
                    padding: '16px', borderRadius: '12px', border: `1.5px solid ${selectedTemplateId === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selectedTemplateId === t ? 'var(--color-surface)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: 'var(--color-ink)',
                    textTransform: 'capitalize', transition: 'all 0.2s', fontFamily: 'var(--font-sans)', fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  {t}
                  {selectedTemplateId === t && <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>check_circle</span>}
                </button>
              ))}
            </div>

            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '24px', marginBottom: '16px' }}>Formatting</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink-muted)' }}>Font Size</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>{fontSize}pt</span>
              </div>
              <input 
                type="range" min="9" max="12" step="0.5" 
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }} 
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink-muted)' }}>Document Margins</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>{documentMargin === 1 ? 'Normal' : documentMargin + 'x'}</span>
              </div>
              <input 
                type="range" min="0.5" max="1.5" step="0.1" 
                value={documentMargin}
                onChange={(e) => setDocumentMargin(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }} 
              />
            </div>

            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '32px', marginBottom: '16px' }}>Load Demo Data</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => useResumeStore.setState({ resumeData: mockResumes.softwareEngineer })}
                style={{ padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', textAlign: 'left', color: 'var(--color-ink)', fontWeight: 600 }}
              >
                👨‍💻 Software Engineer
              </button>
              <button 
                onClick={() => useResumeStore.setState({ resumeData: mockResumes.designer })}
                style={{ padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', textAlign: 'left', color: 'var(--color-ink)', fontWeight: 600 }}
              >
                🎨 UI/UX Designer
              </button>
              <button 
                onClick={() => useResumeStore.setState({ resumeData: mockResumes.productManager })}
                style={{ padding: '10px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '13px', textAlign: 'left', color: 'var(--color-ink)', fontWeight: 600 }}
              >
                📊 Product Manager
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}