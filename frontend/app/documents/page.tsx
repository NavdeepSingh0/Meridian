'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../lib/store/userStore';
import { useResumes, useDeleteResume, useDuplicateResume } from '../../lib/hooks/useResumes';
import { useResumeStore } from '../../lib/store/resumeStore';
import AuthModal from '../../components/auth/AuthModal';
import { auth } from '../../lib/firebase/client';
import { signOut } from 'firebase/auth';
import styles from './documents.module.css';

export default function DocumentsPage() {
  const { firebaseUser, isLoading: isAuthLoading } = useUserStore();
  const { data: resumes, isLoading } = useResumes();
  const deleteMutation = useDeleteResume();
  const duplicateMutation = useDuplicateResume();
  const router = useRouter();
  const { clearCurrentResume } = useResumeStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (isAuthLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!firebaseUser) {
    return (
      <div className={styles.container}>
        <div className={styles.authPrompt}>
          <h1 className={styles.authTitle}>Your Documents</h1>
          <p className={styles.authText}>Sign in to view, manage, and autosave your resumes in the cloud.</p>
          <button 
            className={styles.newButton} 
            onClick={() => setShowAuthModal(true)}
            style={{ padding: '12px 24px', fontSize: '16px' }}
          >
            Sign In
          </button>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  const handleCreateNew = () => {
    clearCurrentResume();
    router.push('/builder');
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this resume?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    duplicateMutation.mutate({ sourceId: id });
  };

  const handleImportPdf = () => {
    router.push('/checker');
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setShowUserMenu(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Documents</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleImportPdf} className={styles.actionButton} style={{ padding: '8px 16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span>
            Import PDF
          </button>
          <button onClick={handleCreateNew} className={styles.newButton}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            New Resume
          </button>
          
          <div style={{ position: 'relative', marginLeft: '16px', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ 
                width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer'
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
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading resumes...</div>
      ) : resumes && resumes.length > 0 ? (
        <div className={styles.grid}>
          {resumes.map(resume => (
            <div key={resume.id} className={styles.card}>
              <Link href={`/builder?id=${resume.id}`} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
                <div className={styles.cardPreview}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.2 }}>description</span>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{resume.title || 'Untitled Resume'}</h3>
                  <p className={styles.cardMeta}>
                    Last updated {new Date(resume.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
              <div className={styles.cardActions}>
                <button 
                  className={styles.actionButton}
                  onClick={(e) => handleDuplicate(resume.id, e)}
                  disabled={duplicateMutation.isPending}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span>
                  Duplicate
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.danger}`}
                  onClick={(e) => handleDelete(resume.id, e)}
                  disabled={deleteMutation.isPending}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-border)', marginBottom: '16px' }}>note_stack</span>
          <h2 style={{ fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>No resumes yet</h2>
          <p style={{ color: 'var(--color-ink-muted)', marginBottom: '24px' }}>Create your first resume to get started.</p>
          <button onClick={handleCreateNew} className={styles.newButton} style={{ margin: '0 auto' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            Create Resume
          </button>
        </div>
      )}
    </div>
  );
}

