'use client';

import React, { useState } from 'react';
import styles from './builder.module.css';
import TopNav from '../../components/editor/TopNav';
import LeftSidebar from '../../components/editor/LeftSidebar';
import ClassicTemplate from '../../components/templates/ClassicTemplate';
import AnalysisPanel from '../../components/ai/AnalysisPanel';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useExportPdf } from '../../lib/hooks/useAnalysis';

export default function BuilderPage() {
  const [activeSection, setActiveSection] = useState('Basics');
  const [activeTemplate, setActiveTemplate] = useState('classic');
  const { data: resume } = useResumeStore();
  const exportPdfMutation = useExportPdf();

  const handleExport = async () => {
    try {
      const blob = await exportPdfMutation.mutateAsync({ resume, templateName: activeTemplate });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${activeTemplate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert('Failed to export PDF.');
    }
  };

  return (
    <div className={styles.builderTheme}>
      <TopNav 
        onExport={handleExport} 
        activeTemplate={activeTemplate} 
        setActiveTemplate={setActiveTemplate} 
      />

      <div className={styles.layoutWrapper}>
        <LeftSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />

        <main className={styles.canvas}>
          <ClassicTemplate />
          {/* We only have ClassicTemplate built for now, but activeTemplate determines PDF export */}
        </main>

        <AnalysisPanel />
      </div>
    </div>
  );
}
