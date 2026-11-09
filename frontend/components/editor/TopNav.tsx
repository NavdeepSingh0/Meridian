'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useResumeStore, initialResumeData, SaveStatus } from '../../lib/store/resumeStore';
import { useExportPdf, useParsePdf } from '../../lib/hooks/useAnalysis';
import { useSaveResume } from '../../lib/hooks/useResumes';
import { useUserStore } from '../../lib/store/userStore';
import { getErrorMessage, getErrorMessageAsync } from '../../lib/api/client';
import styles from '../../app/builder/builder.module.css';
import navStyles from './TopNav.module.css';
import AuthModal from '../auth/AuthModal';
import Logo from '../shared/Logo';
import UserMenu from '../shared/UserMenu';
import { ConfirmDialog } from '../shared/Modal';
import { toast } from '../shared/Toast';

interface TopNavProps {
  onRestartTour: () => void;
}

const SAVE_LABEL: Record<SaveStatus, { icon: string; text: string; tone?: 'error' }> = {
  local: { icon: 'task_alt', text: 'Saved in this browser' },
  saved: { icon: 'cloud_done', text: 'Saved to cloud' },
  saving: { icon: 'sync', text: 'Saving…' },
  error: { icon: 'cloud_off', text: "Couldn't save — retrying", tone: 'error' },
};

export default function TopNav({ onRestartTour }: TopNavProps) {
  const router = useRouter();
  const {
    resumeData, selectedTemplateId, fontSize, documentMargin, currentResumeId,
    documentName, setDocumentName, saveStatus, setResumeData,
  } = useResumeStore();
  const firebaseUser = useUserStore((s) => s.firebaseUser);
  const profile = useUserStore((s) => s.profile);

  const exportPdf = useExportPdf();
  const parsePdf = useParsePdf();
  const saveResume = useSaveResume();

  const [authReason, setAuthReason] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<File | null>(null);

  const requireAuth = (reason: string): boolean => {
    if (firebaseUser) return true;
    setAuthReason(reason);
    return false;
  };

  // ── Import PDF ──────────────────────────────────────────────────────────────
  const hasContent = JSON.stringify(resumeData) !== JSON.stringify(initialResumeData);

  const runImport = async (file: File) => {
    try {
      const { resume_data } = await parsePdf.mutateAsync(file);
      setResumeData(resume_data);
      if (!documentName && resume_data.basics?.name) setDocumentName(`${resume_data.basics.name} — Resume`);
      toast.success('Resume imported. Review the details below.');
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't read that PDF. Please try another file."));
    }
  };

  const handleFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    if (!requireAuth('Sign in to import a PDF resume.')) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('That PDF is larger than 5 MB.');
      return;
    }
    if (hasContent) setPendingImport(file); // confirm before replacing what's here
    else void runImport(file);
  };

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!requireAuth('Sign in to export your resume as a PDF.')) return;
    exportPdf.mutate(
      { resumeData, templateName: selectedTemplateId, settings: { font_size: fontSize, document_margin: documentMargin } },
      {
        onSuccess: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${documentName.trim() || 'resume'}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        },
        onError: async (err) => toast.error(await getErrorMessageAsync(err, "Couldn't export the PDF. Please try again.")),
      },
    );
  };

  // ── Save to cloud (creates the cloud copy of a local draft) ────────────────
  const handleSaveToCloud = () => {
    if (!requireAuth('Sign in to save your resume to the cloud.')) return;
    if (currentResumeId) {
      toast.success('This resume is already saved to the cloud and autosaves as you type.');
      return;
    }
    saveResume.mutate(
      {
        title: documentName.trim() || 'Untitled',
        template_id: selectedTemplateId,
        document_data: resumeData,
      },
      {
        onSuccess: (created) => {
          toast.success('Saved to your account. Future edits autosave.');
          router.replace(`/builder?id=${created.id}`);
        },
        onError: (err) => toast.error(getErrorMessage(err, "Couldn't save to the cloud.")),
      },
    );
  };

  const save = SAVE_LABEL[saveStatus];

  return (
    <header className={styles.saasTopNav}>
      <div className={styles.builderTopNav}>
        <Link href="/" className={styles.builderBrand} aria-label="Meridian home" style={{ textDecoration: 'none' }}>
          <Logo width={120} />
        </Link>

        <div className={styles.breadcrumbSeparator} />

        <nav className={styles.builderBreadcrumb} aria-label="Breadcrumb">
          <span className={`material-symbols-outlined ${styles.breadcrumbIcon}`} aria-hidden="true">description</span>
          <Link href="/documents" className={`${styles.breadcrumbText} tour-documents-link`} style={{ textDecoration: 'none' }}>
            Documents
          </Link>
          <span className={`material-symbols-outlined ${styles.breadcrumbIcon}`} aria-hidden="true" style={{ fontSize: 16 }}>chevron_right</span>
          <div className={styles.documentNameContainer}>
            <input
              type="text"
              className={styles.documentNameInput}
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Untitled"
              aria-label="Document name"
              maxLength={100}
            />
          </div>
        </nav>
      </div>

      <div className={`${styles.builderCenter} ${navStyles.center}`}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChosen}
          id="pdf-upload"
          className={navStyles.hiddenInput}
          disabled={parsePdf.isPending}
        />
        <label htmlFor="pdf-upload" className={`${navStyles.pillBtn} tour-import-btn ${parsePdf.isPending ? navStyles.disabled : ''}`}>
          <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
          {parsePdf.isPending ? 'Importing…' : 'Import PDF'}
        </label>

        <button type="button" className={navStyles.textBtn} onClick={onRestartTour}>
          <span className="material-symbols-outlined" aria-hidden="true">help</span>
          How it works
        </button>
      </div>

      <div className={styles.builderActions}>
        <div className={`${styles.savedText} ${save.tone === 'error' ? navStyles.saveError : ''}`} role="status" aria-live="polite">
          <span
            className={`material-symbols-outlined ${saveStatus === 'saving' ? navStyles.spin : ''}`}
            aria-hidden="true"
            style={{ fontSize: 16 }}
          >
            {save.icon}
          </span>
          {save.text}
        </div>

        {firebaseUser && profile && (
          <div className={navStyles.credits} title="AI actions left on your plan">
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>bolt</span>
            {profile.is_premium || profile.is_admin ? 'Unlimited' : `${profile.ai_credits} credits`}
          </div>
        )}

        {!currentResumeId && (
          <button
            type="button"
            onClick={handleSaveToCloud}
            disabled={saveResume.isPending}
            className="btn-secondary-nav"
            style={{ padding: '6px 14px', opacity: saveResume.isPending ? 0.7 : 1 }}
          >
            <span
              className={`material-symbols-outlined ${saveResume.isPending ? navStyles.spin : ''}`}
              aria-hidden="true"
              style={{ fontSize: 16, marginRight: 6 }}
            >
              {saveResume.isPending ? 'sync' : 'cloud_upload'}
            </span>
            {saveResume.isPending ? 'Saving…' : 'Save to cloud'}
          </button>
        )}

        <button
          type="button"
          onClick={handleExport}
          disabled={exportPdf.isPending}
          className="btn-primary-nav tour-export-btn"
          style={{ padding: '6px 14px', opacity: exportPdf.isPending ? 0.7 : 1 }}
        >
          <span
            className={`material-symbols-outlined ${exportPdf.isPending ? navStyles.spin : ''}`}
            aria-hidden="true"
            style={{ fontSize: 16, marginRight: 6 }}
          >
            {exportPdf.isPending ? 'sync' : 'download'}
          </span>
          {exportPdf.isPending ? 'Exporting…' : 'Export PDF'}
        </button>

        <UserMenu size="sm" />
      </div>

      <AuthModal
        isOpen={authReason !== null}
        reason={authReason ?? undefined}
        onClose={() => setAuthReason(null)}
        onSuccess={() => {
          setAuthReason(null);
          toast.success('Signed in');
        }}
      />

      <ConfirmDialog
        isOpen={pendingImport !== null}
        title="Replace your current resume?"
        description="Importing a PDF will replace everything in this resume with the contents of the file. This can't be undone."
        confirmLabel="Replace with PDF"
        destructive
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          const file = pendingImport;
          setPendingImport(null);
          if (file) void runImport(file);
        }}
      />
    </header>
  );
}
