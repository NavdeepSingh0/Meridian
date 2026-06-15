'use client';
import React, { useState, useEffect } from 'react';
import styles from './builder.module.css';
import ClassicTemplate from '../../components/templates/ClassicTemplate';
import ModernTemplate from '../../components/templates/ModernTemplate';
import MinimalTemplate from '../../components/templates/MinimalTemplate';
import LeftSidebar from '../../components/editor/LeftSidebar';
import AnalysisPanel from '../../components/ai/AnalysisPanel';
import TopNav from '../../components/editor/TopNav';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useIsMutating } from '@tanstack/react-query';

interface HighlightedSection {
  section: string;
  marker: number;
}

export default function BuilderPage() {
  const [activeSection, setActiveSection] = useState<string>('Basics');
  const [documentName, setDocumentName] = useState('');
  const [zoom, setZoom] = useState(100);
  const [isClient, setIsClient] = useState(false);
  const canvasRef = React.useRef<HTMLElement>(null);
  
  const { panelState, atsResult, critiqueResult, selectedTemplateId, setSelectedTemplateId, fontSize, documentMargin } = useResumeStore();
  const isMutating = useIsMutating();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    
    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        // Adjust zoom based on scroll direction. deltaY is usually small for trackpads (e.g., 1-5) and large for mice (e.g., 100).
        const zoomChange = e.deltaY > 0 ? -2 : 2;
        setZoom(prev => Math.min(Math.max(prev + zoomChange, 20), 200));
      }
    };
    
    document.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleNativeWheel);
  }, []);

  if (!isClient) return null;

  const isLocked = panelState !== 'editing' || isMutating > 0;

  let highlightedSections: HighlightedSection[] = [];
  if (panelState === 'scored' && atsResult?.missing_keywords) {
    highlightedSections = [
      { section: 'Skills', marker: 1 },
      { section: 'Experience', marker: 2 }
    ];
  } else if (panelState === 'feedback' && critiqueResult) {
    highlightedSections = critiqueResult.sections.map((s: { section: string }, index: number) => {
      let mappedSection = s.section.charAt(0).toUpperCase() + s.section.slice(1);
      if (s.section === 'work') mappedSection = 'Experience';
      if (s.section === 'education') mappedSection = 'Education';
      if (s.section === 'basics') mappedSection = 'Summary';
      
      return { section: mappedSection, marker: index + 1 };
    });
  }



  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 20));
  const handleFitPage = () => setZoom(100);

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setZoom(val);
    }
  };

  const handleZoomBlur = () => {
    setZoom(prev => Math.min(Math.max(prev, 20), 200));
  };

  return (
    <div className={styles.builderTheme}>
      <TopNav 
        activeTemplate={selectedTemplateId}
        setActiveTemplate={setSelectedTemplateId}
        documentName={documentName}
        setDocumentName={setDocumentName}
      />

      <div className={styles.saasLayoutWrapper}>
        <LeftSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isLocked={isLocked}
        />

        <main ref={canvasRef} className={styles.saasMainCanvas} style={{ pointerEvents: isLocked ? 'none' : 'auto', transition: 'all 0.3s ease' }}>
          <div 
            className={styles.paperCard} 
            style={{ 
              transform: `scale(${zoom / 100})`, 
              transformOrigin: 'top center', 
              transition: 'transform 0.1s ease',
              '--doc-font-size': `${fontSize}pt`,
              '--doc-margin': `${documentMargin * 48}px`
            } as React.CSSProperties}
          >
            {selectedTemplateId === 'classic' && <ClassicTemplate highlightedSections={highlightedSections} />}
            {selectedTemplateId === 'modern' && <ModernTemplate highlightedSections={highlightedSections} />}
            {selectedTemplateId === 'minimal' && <MinimalTemplate highlightedSections={highlightedSections} />}
          </div>

          <div className={styles.floatingToolbar}>
            <button className={styles.toolbarBtn} onClick={handleFitPage}>
              <span className={`material-symbols-outlined ${styles.toolbarBtnIcon}`}>fit_screen</span>
              Fit to Page
            </button>
            <div className={styles.toolbarDivider}></div>
            <div className={styles.zoomControls}>
              <button className={styles.zoomBtn} onClick={handleZoomOut}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span></button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input 
                  type="text" 
                  value={zoom} 
                  onChange={handleZoomInputChange}
                  onBlur={handleZoomBlur}
                  style={{ width: '28px', textAlign: 'right', background: 'transparent', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)', outline: 'none' }}
                />
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink)' }}>%</span>
              </div>
              <button className={styles.zoomBtn} onClick={handleZoomIn}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span></button>
            </div>
          </div>
        </main>

        <AnalysisPanel />
      </div>
    </div>
  );
}