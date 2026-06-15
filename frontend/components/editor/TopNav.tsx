import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useExportPdf } from '../../lib/hooks/useAnalysis';
import { useSaveResume } from '../../lib/hooks/useResumes';
import styles from '../../app/builder/builder.module.css';

interface TopNavProps {
  activeTemplate: string;
  setActiveTemplate: (t: string) => void;
  documentName: string;
  setDocumentName: (name: string) => void;
}

export default function TopNav({ activeTemplate, setActiveTemplate, documentName, setDocumentName }: TopNavProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { resumeData } = useResumeStore();
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const exportPdfMutation = useExportPdf();
  const saveResumeMutation = useSaveResume();

  const handleExportClick = () => {
    exportPdfMutation.mutate({ resumeData, templateName: activeTemplate }, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentName || 'resume'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      onError: (err) => {
        console.error("Export failed", err);
        alert("Failed to export PDF. Please try again.");
      }
    });
  };

  const handleSaveToCloud = () => {
    saveResumeMutation.mutate({
      title: documentName || 'My Resume',
      template_id: activeTemplate,
      document_data: resumeData
    }, {
      onSuccess: () => {
        alert("Successfully saved to cloud database!");
      },
      onError: (err) => {
        console.error("Save failed", err);
        alert("Failed to save to cloud database.");
      }
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveState('saving');
    const timer = setTimeout(() => {
      setSaveState('saved');
    }, 1000);
    return () => clearTimeout(timer);
  }, [resumeData, documentName]);

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out my resume built with Meridian! ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(documentName || 'My Resume');
    const body = encodeURIComponent(`Check out my resume built with Meridian!\n\n${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <header className={styles.saasTopNav}>
      <div className={styles.builderTopNav}>
        <Link href="/" className={styles.builderBrand}>
          {/* The Meridian Navigational Monogram */}
          <div className="relative w-6 h-6 flex items-center justify-center select-none" aria-hidden="true">
            <div className="absolute inset-0 rounded-full border border-dashed" style={{ borderColor: 'var(--color-primary)', opacity: 0.6 }}></div>
            <svg className="w-3 h-3 absolute" style={{ color: 'var(--color-ink)', transform: 'rotate(45deg) translate(-1px, 1px)' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.brandWordmark}>
            Meridian <span className={styles.brandCV}>CV</span>
          </span>
        </Link>
        
        <div className={styles.breadcrumbSeparator}></div>
        
        <div className={styles.builderBreadcrumb}>
          <span className={`material-symbols-outlined ${styles.breadcrumbIcon}`}>description</span>
          <span className={styles.breadcrumbText}>Documents</span>
          <span className={`material-symbols-outlined ${styles.breadcrumbIcon}`} style={{ fontSize: '16px' }}>chevron_right</span>
          
          <div className={styles.documentNameContainer}>
            <input 
              type="text" 
              className={styles.documentNameInput} 
              value={documentName} 
              onChange={(e) => setDocumentName(e.target.value)} 
              placeholder="Untitled"
            />
          </div>
          <span className={`material-symbols-outlined ${styles.breadcrumbIcon}`} style={{ fontSize: '16px', marginLeft: '4px' }}>info</span>
        </div>
      </div>

      <div className={styles.builderCenter}>
        <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}>
          How it Works 
          <span className="material-symbols-outlined" style={{ fontSize: '14px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', padding: '1px' }}>question_mark</span>
        </a>
      </div>

      <div className={styles.builderActions}>
        <div className={styles.savedText}>
          {saveState === 'saving' ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>sync</span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>task_alt</span>
              Saved to browser
            </>
          )}
        </div>
        
        <div style={{ position: 'relative' }}>
          <button className="btn-secondary-nav" style={{ padding: '6px 14px' }} onClick={() => setShowShareMenu(!showShareMenu)}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px' }}>person_add</span>
            Share
          </button>
          
          {showShareMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
              background: 'var(--color-base)', border: '1px solid var(--color-border)', 
              borderRadius: '8px', padding: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 100,
              width: '160px'
            }}>
              <button 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}
                onClick={handleWhatsAppShare}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: '16px', height: '16px' }} />
                WhatsApp
              </button>
              <button 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}
                onClick={handleEmailShare}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#EA4335' }}>mail</span>
                Gmail
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSaveToCloud}
          disabled={saveResumeMutation.isPending}
          className="btn-secondary-nav" style={{ padding: '6px 14px', opacity: saveResumeMutation.isPending ? 0.7 : 1 }}
        >
          {saveResumeMutation.isPending ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px', animation: 'spin 1s linear infinite' }}>refresh</span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px' }}>cloud_upload</span>
              Save to Cloud
            </>
          )}
        </button>

        <button
          onClick={handleExportClick}
          disabled={exportPdfMutation.isPending}
          className="btn-primary-nav" style={{ padding: '6px 14px', opacity: exportPdfMutation.isPending ? 0.7 : 1 }}
        >
          {exportPdfMutation.isPending ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px', animation: 'spin 1s linear infinite' }}>refresh</span>
              Exporting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '6px' }}>download</span>
              Export
            </>
          )}
        </button>
      </div>
    </header>
  );
}