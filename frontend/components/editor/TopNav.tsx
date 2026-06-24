import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useExportPdf, useParsePdf } from '../../lib/hooks/useAnalysis';
import { useSaveResume } from '../../lib/hooks/useResumes';
import styles from '../../app/builder/builder.module.css';
import AuthModal from '../auth/AuthModal';
import { useUserStore } from '../../lib/store/userStore';
import { auth } from '../../lib/firebase/client';
import { signOut } from 'firebase/auth';
import Logo from '../shared/Logo';

interface TopNavProps {
  activeTemplate: string;
  documentName: string;
  setDocumentName: (name: string) => void;
}

export default function TopNav({ activeTemplate, documentName, setDocumentName }: TopNavProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { resumeData, fontSize, documentMargin, currentResumeId, setCurrentResumeId } = useResumeStore();
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { firebaseUser, profile } = useUserStore();
  const exportPdfMutation = useExportPdf();
  const parsePdfMutation = useParsePdf();
  const saveResumeMutation = useSaveResume();
  const [toastMsg, setToastMsg] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setShowUserMenu(false);
    showToast("Signed out successfully");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await parsePdfMutation.mutateAsync(file);
      useResumeStore.getState().loadResumeFromDB(data.resume_data, null);
      showToast("PDF parsed successfully!");
    } catch (err) {
      console.error("Failed to parse PDF", err);
      showToast("Failed to parse PDF", "error");
    }
  };

  const handleExportClick = async () => {
    const session = firebaseUser;

    // Enforce auth for PDF export
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    exportPdfMutation.mutate({ 
      resumeData, 
      templateName: activeTemplate,
      settings: { font_size: fontSize, document_margin: documentMargin }
    }, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentName || 'resume'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Auth is now strictly required for export, so no need for free resume tracking
      },
      onError: (err) => {
        console.error("Export failed", err);
        showToast("Failed to export PDF. Please try again.", "error");
      }
    });
  };

  const handleSaveToCloud = async () => {
    const session = firebaseUser;
    
    // Cloud save strictly requires login
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    saveResumeMutation.mutate({
      id: currentResumeId || undefined,
      title: documentName || 'My Resume',
      template_id: activeTemplate,
      document_data: resumeData
    }, {
      onSuccess: (data: any) => {
        if (data && data.id) {
          setCurrentResumeId(data.id);
        }
        showToast("Successfully saved to cloud database!");
      },
      onError: (err) => {
        console.error("Save failed", err);
        showToast("Failed to save to cloud database.", "error");
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
        <Link href="/" className={styles.builderBrand} style={{ textDecoration: 'none' }}>
          <Logo width={120} />
        </Link>
        
        <div className={styles.breadcrumbSeparator}></div>
        
        <div className={styles.builderBreadcrumb}>
          <span className={`material-symbols-outlined ${styles.breadcrumbIcon}`}>description</span>
          <Link href="/documents" className={`${styles.breadcrumbText} tour-documents-link`} style={{ textDecoration: 'none' }}>Documents</Link>
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

      <div className={styles.builderCenter} style={{ display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="file" 
            accept="application/pdf"
            onChange={handleFileUpload}
            id="pdf-upload"
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="pdf-upload"
            className="tour-import-btn"
            style={{ 
              background: 'transparent', border: '1px solid var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)', padding: '4px 12px', borderRadius: '4px' 
            }}
          >
            {parsePdfMutation.isPending ? 'Parsing...' : 'Import PDF'}
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span>
          </label>
        </div>

        <button 
          onClick={() => {
            localStorage.removeItem('meridian_tour_completed');
            window.location.reload();
          }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-primary)' }}
        >
          How it Works 
          <span className="material-symbols-outlined" style={{ fontSize: '14px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', padding: '1px' }}>question_mark</span>
        </button>
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
              {currentResumeId ? 'Saved to cloud' : 'Saved to browser'}
            </>
          )}
        </div>
        {firebaseUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(0, 106, 98, 0.05)', border: '1px solid rgba(0, 106, 98, 0.2)', borderRadius: '20px', color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>
            {profile?.ai_credits ?? 0} Credits
          </div>
        )}
        
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
          className="btn-primary-nav tour-export-btn" style={{ padding: '6px 14px', opacity: exportPdfMutation.isPending ? 0.7 : 1 }}
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

        {firebaseUser ? (
          <div style={{ position: 'relative', marginLeft: '8px' }}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ 
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer'
              }}
            >
              {firebaseUser.email?.charAt(0).toUpperCase() || 'U'}
            </button>
            
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                background: 'var(--color-base)', border: '1px solid var(--color-border)', 
                borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 100,
                width: '180px'
              }}>
                <div style={{ padding: '8px', fontSize: '13px', color: 'var(--color-ink-muted)', wordBreak: 'break-all' }}>
                  {firebaseUser.email}
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }}></div>
                <button 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: '#EA4335' }}
                  onClick={handleSignOut}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-secondary-nav" style={{ padding: '6px 14px', marginLeft: '8px' }}
          >
            Sign in
          </button>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={() => {
          setShowAuthModal(false);
          showToast("Successfully authenticated!");
        }}
      />
      
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: toastMsg.type === 'success' ? '#2e7d32' : '#d32f2f',
          color: 'white', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '14px', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fade-in-up 0.3s ease-out'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {toastMsg.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toastMsg.message}
        </div>
      )}
    </header>
  );
}