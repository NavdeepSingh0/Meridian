'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/shared/AppHeader';
import AuthModal from '../../components/auth/AuthModal';
import { ConfirmDialog } from '../../components/shared/Modal';
import { toast } from '../../components/shared/Toast';
import ResumeCard from '../../components/documents/ResumeCard';
import { useUserStore } from '../../lib/store/userStore';
import { useResumeStore } from '../../lib/store/resumeStore';
import {
  useResumes,
  useCreateResume,
  useUpdateResume,
  useDuplicateResume,
  useDeleteResume,
} from '../../lib/hooks/useResumes';
import { SavedResume } from '../../lib/api/resumeApi';
import { getErrorMessage } from '../../lib/api/client';
import styles from './documents.module.css';

export default function DocumentsPage() {
  const router = useRouter();
  const firebaseUser = useUserStore((s) => s.firebaseUser);
  const isAuthLoading = useUserStore((s) => s.isLoading);
  const { data: resumes, isLoading, isError, error, refetch } = useResumes();

  const createResume = useCreateResume();
  const updateResume = useUpdateResume();
  const duplicateResume = useDuplicateResume();
  const deleteResume = useDeleteResume();

  const [showAuth, setShowAuth] = useState(false);
  const [toDelete, setToDelete] = useState<SavedResume | null>(null);

  const handleCreate = () => {
    createResume.mutate(undefined, {
      onSuccess: (created) => router.push(`/builder?id=${created.id}`),
      onError: (err) => toast.error(getErrorMessage(err, "Couldn't create a new resume.")),
    });
  };

  const handleRename = (id: number, title: string) => {
    updateResume.mutate({ id, title }, { onError: (err) => toast.error(getErrorMessage(err, "Couldn't rename that resume.")) });
  };

  const handleDuplicate = (resume: SavedResume) => {
    duplicateResume.mutate(resume, {
      onSuccess: () => toast.success('Resume duplicated'),
      onError: (err) => toast.error(getErrorMessage(err, "Couldn't duplicate that resume.")),
    });
  };

  const confirmDelete = () => {
    const target = toDelete;
    setToDelete(null);
    if (!target) return;
    deleteResume.mutate(target.id, {
      onSuccess: () => {
        toast.success(`Deleted “${target.title || 'Untitled'}”`);
        // If it's the one open in the editor store, drop it so it can't be autosaved back to a deleted id.
        if (useResumeStore.getState().currentResumeId === target.id) useResumeStore.getState().loadLocalDraft();
      },
      onError: (err) => toast.error(getErrorMessage(err, "Couldn't delete that resume.")),
    });
  };

  // ── Signed-out / auth loading ───────────────────────────────────────────────
  if (!isAuthLoading && !firebaseUser) {
    return (
      <>
        <AppHeader />
        <main className={styles.page}>
          <div className={styles.centered}>
            <span className={`material-symbols-outlined ${styles.bigIcon}`} aria-hidden="true">lock</span>
            <h1 className={styles.heading}>My resumes</h1>
            <p className={styles.lead}>Sign in to see the resumes saved to your account, and have your edits autosave.</p>
            <button type="button" className="btn-primary-nav" style={{ padding: '10px 22px' }} onClick={() => setShowAuth(true)}>
              Sign in
            </button>
            <Link href="/builder" className={styles.subtle}>or continue without an account</Link>
          </div>
        </main>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      </>
    );
  }

  const loading = isAuthLoading || isLoading;

  return (
    <>
      <AppHeader />
      <main className={styles.page}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.heading}>My resumes</h1>
            {resumes && resumes.length > 0 && (
              <p className={styles.count}>{resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}</p>
            )}
          </div>
          <div className={styles.titleActions}>
            <Link href="/checker" className="btn-secondary-nav" style={{ padding: '9px 18px' }}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18, marginRight: 6 }}>upload_file</span>
              Import PDF
            </Link>
            <button
              type="button"
              className="btn-primary-nav"
              style={{ padding: '9px 18px', opacity: createResume.isPending ? 0.7 : 1 }}
              onClick={handleCreate}
              disabled={createResume.isPending}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18, marginRight: 6 }}>add</span>
              {createResume.isPending ? 'Creating…' : 'New resume'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.grid} aria-busy="true" aria-label="Loading your resumes">
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : isError ? (
          <div className={styles.centered} role="alert">
            <span className={`material-symbols-outlined ${styles.bigIcon}`} aria-hidden="true">cloud_off</span>
            <h2 className={styles.subheading}>Couldn&apos;t load your resumes</h2>
            <p className={styles.lead}>{getErrorMessage(error, 'Please check your connection and try again.')}</p>
            <button type="button" className="btn-secondary-nav" style={{ padding: '9px 18px' }} onClick={() => refetch()}>
              Try again
            </button>
          </div>
        ) : resumes && resumes.length > 0 ? (
          <div className={styles.grid}>
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onRename={handleRename}
                onDuplicate={handleDuplicate}
                onDelete={setToDelete}
              />
            ))}
          </div>
        ) : (
          <div className={styles.centered}>
            <span className={`material-symbols-outlined ${styles.bigIcon}`} aria-hidden="true">description</span>
            <h2 className={styles.subheading}>You haven&apos;t saved any resumes yet</h2>
            <p className={styles.lead}>Start from scratch, or import a PDF you already have.</p>
            <button type="button" className="btn-primary-nav" style={{ padding: '10px 22px' }} onClick={handleCreate} disabled={createResume.isPending}>
              {createResume.isPending ? 'Creating…' : 'New resume'}
            </button>
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={toDelete !== null}
        title="Delete this resume?"
        description={`“${toDelete?.title || 'Untitled'}” will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
