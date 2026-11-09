'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '../../components/shared/AppHeader';
import AuthModal from '../../components/auth/AuthModal';
import PdfUploadZone from '../../components/shared/PdfUploadZone';
import AtsScoreView from '../../components/ai/AtsScoreView';
import CritiqueFeedbackView from '../../components/ai/CritiqueFeedbackView';
import { toast } from '../../components/shared/Toast';
import { useResumeStore, initialResumeData } from '../../lib/store/resumeStore';
import { useUserStore } from '../../lib/store/userStore';
import { useAtsScore, useCritique, useParsePdf } from '../../lib/hooks/useAnalysis';
import { useCreateResume, useResumes } from '../../lib/hooks/useResumes';
import { getErrorMessage } from '../../lib/api/client';
import { ResumeData } from '../../lib/types/resume';
import { ATSResult, CritiqueResult } from '../../lib/types/analysis';
import styles from './checker.module.css';

type Mode = 'saved' | 'upload';
interface SourceOption {
  key: string;
  label: string;
  data: ResumeData;
}
interface UploadedResume {
  fileName: string;
  data: ResumeData;
}

const MAX_JD_CHARS = 8000;

export default function CheckerPage() {
  const router = useRouter();
  const firebaseUser = useUserStore((s) => s.firebaseUser);
  const profile = useUserStore((s) => s.profile);
  const editorData = useResumeStore((s) => s.resumeData);
  const editorName = useResumeStore((s) => s.documentName);
  const { data: cloudResumes } = useResumes();

  const parsePdf = useParsePdf();
  const atsScore = useAtsScore();
  const critique = useCritique();
  const createResume = useCreateResume();

  const [authReason, setAuthReason] = useState<string | null>(null);
  const [modeOverride, setModeOverride] = useState<Mode | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [uploaded, setUploaded] = useState<UploadedResume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [critiqueResult, setCritiqueResult] = useState<CritiqueResult | null>(null);

  // Resumes the user can analyse without uploading anything.
  const sources = useMemo<SourceOption[]>(() => {
    const options: SourceOption[] = [];
    if (JSON.stringify(editorData) !== JSON.stringify(initialResumeData)) {
      options.push({ key: 'editor', label: editorName.trim() || 'Resume in the builder', data: editorData });
    }
    for (const r of cloudResumes ?? []) {
      options.push({ key: `cloud-${r.id}`, label: r.title || 'Untitled', data: r.document_data });
    }
    return options;
  }, [editorData, editorName, cloudResumes]);

  // With nothing to pick from, the only sensible mode is uploading.
  const mode: Mode = sources.length === 0 ? 'upload' : (modeOverride ?? 'saved');
  const activeSource = sources.find((s) => s.key === selectedKey) ?? sources[0];
  const resumeToCheck: ResumeData | null = mode === 'upload' ? (uploaded?.data ?? null) : (activeSource?.data ?? null);

  const requireAuth = (reason: string) => {
    if (firebaseUser) return true;
    setAuthReason(reason);
    return false;
  };

  const resetResults = () => {
    setAtsResult(null);
    setCritiqueResult(null);
    atsScore.reset();
    critique.reset();
  };

  const handleFile = (file: File) => {
    if (!requireAuth('Sign in to upload a PDF resume.')) return;
    resetResults();
    parsePdf.mutate(file, {
      onSuccess: ({ resume_data }) => {
        setUploaded({ fileName: file.name, data: resume_data });
        toast.success('Resume read successfully.');
      },
      onError: (err) => toast.error(getErrorMessage(err, "We couldn't read that PDF.")),
    });
  };

  const handleAnalyze = () => {
    if (!resumeToCheck) return;
    if (!requireAuth('Sign in to run an ATS check.')) return;
    setCritiqueResult(null);
    atsScore.mutate(
      { resumeData: resumeToCheck, jobDescription },
      {
        onSuccess: (result) => setAtsResult(result),
        onError: (err) => toast.error(getErrorMessage(err, "We couldn't analyze that resume.")),
      },
    );
  };

  const handleCritique = () => {
    if (!resumeToCheck) return;
    critique.mutate(resumeToCheck, {
      onSuccess: (result) => setCritiqueResult(result),
      onError: (err) => toast.error(getErrorMessage(err, "We couldn't generate the critique.")),
    });
  };

  const handleOpenInBuilder = () => {
    if (!uploaded) return;
    const name = uploaded.data.basics?.name?.trim();
    createResume.mutate(
      {
        title: name ? `${name} — Resume` : uploaded.fileName.replace(/\.pdf$/i, ''),
        template_id: 'modern',
        document_data: uploaded.data,
      },
      {
        onSuccess: (created) => router.push(`/builder?id=${created.id}`),
        onError: (err) => toast.error(getErrorMessage(err, "Couldn't save it to your account.")),
      },
    );
  };

  const analyzing = atsScore.isPending;
  const outOfCredits = !!profile && !profile.is_premium && !profile.is_admin && profile.ai_credits <= 0;
  const creditCost = mode === 'upload' && !uploaded ? 0 : 1;
  const jdTooLong = jobDescription.length > MAX_JD_CHARS;

  return (
    <>
      <AppHeader />
      <main className={styles.page}>
        <div className={styles.intro}>
          <h1 className={styles.heading}>ATS checker</h1>
          <p className={styles.lead}>
            See how an applicant tracking system reads your resume, and how well it matches a specific job.
          </p>
        </div>

        <div className={styles.layout}>
          {/* ── Inputs ─────────────────────────────────────────────────────── */}
          <section className={styles.panel} aria-labelledby="source-heading">
            <h2 id="source-heading" className={styles.panelTitle}>1. Choose your resume</h2>

            {sources.length > 0 && (
              <div className={styles.segmented} role="tablist" aria-label="Resume source">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'saved'}
                  className={`${styles.segment} ${mode === 'saved' ? styles.segmentActive : ''}`}
                  onClick={() => setModeOverride('saved')}
                >
                  Use a Meridian resume
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'upload'}
                  className={`${styles.segment} ${mode === 'upload' ? styles.segmentActive : ''}`}
                  onClick={() => setModeOverride('upload')}
                >
                  Upload a PDF
                </button>
              </div>
            )}

            {mode === 'saved' && activeSource ? (
              <div className={styles.field}>
                <label htmlFor="source-select" className={styles.label}>Resume</label>
                <select
                  id="source-select"
                  className={styles.select}
                  value={activeSource.key}
                  onChange={(e) => {
                    setSelectedKey(e.target.value);
                    resetResults();
                  }}
                >
                  {sources.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <PdfUploadZone
                  onFileSelect={handleFile}
                  onReject={(m) => toast.error(m)}
                  isLoading={parsePdf.isPending}
                  fileName={uploaded?.fileName}
                />
                {uploaded && (
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={handleOpenInBuilder}
                    disabled={createResume.isPending}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>edit_document</span>
                    {createResume.isPending ? 'Opening…' : 'Open in builder to edit'}
                  </button>
                )}
              </>
            )}

            <h2 className={styles.panelTitle} style={{ marginTop: 28 }}>2. Add a job description <span className={styles.optional}>(optional)</span></h2>
            <div className={styles.field}>
              <label htmlFor="jd" className={styles.srOnly}>Job description</label>
              <textarea
                id="jd"
                className={styles.textarea}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting to see which keywords you match and which you're missing. Leave blank for a general ATS check."
                rows={9}
              />
              <p className={`${styles.counter} ${jdTooLong ? styles.counterOver : ''}`}>
                {jobDescription.length.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              className={styles.analyze}
              onClick={handleAnalyze}
              disabled={!resumeToCheck || analyzing || parsePdf.isPending || jdTooLong || outOfCredits}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 18 }}>troubleshoot</span>
              {analyzing ? 'Analyzing…' : 'Analyze match'}
            </button>
            <p className={styles.note}>
              {outOfCredits
                ? "You're out of AI credits."
                : mode === 'upload' && !uploaded
                  ? 'Upload a resume to get started.'
                  : profile?.is_premium || profile?.is_admin
                    ? 'Unlimited AI credits on your plan.'
                    : `Uses ${creditCost} AI credit${profile ? ` · ${profile.ai_credits} left` : ''}.`}
            </p>
          </section>

          {/* ── Results ────────────────────────────────────────────────────── */}
          <section className={styles.results} aria-live="polite" aria-label="Results">
            {analyzing ? (
              <div className={styles.placeholder}>
                <span className={`material-symbols-outlined ${styles.spin}`} aria-hidden="true" style={{ fontSize: 40, color: 'var(--color-primary)' }}>progress_activity</span>
                <h2 className={styles.placeholderTitle}>Analyzing your resume…</h2>
                <p className={styles.placeholderText}>Checking structure, keywords and impact. This usually takes a few seconds.</p>
              </div>
            ) : atsResult ? (
              critiqueResult ? (
                <CritiqueFeedbackView critiqueResult={critiqueResult} onBack={() => setCritiqueResult(null)} />
              ) : (
                <>
                  <AtsScoreView
                    atsResult={atsResult}
                    onGetFeedback={handleCritique}
                    onReset={resetResults}
                    isCheckerPage
                  />
                  {critique.isPending && <p className={styles.note}>Generating detailed critique…</p>}
                </>
              )
            ) : (
              <div className={styles.placeholder}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 44, color: 'var(--color-primary)', fontVariationSettings: "'wght' 200" }}>fact_check</span>
                <h2 className={styles.placeholderTitle}>Your results will show up here</h2>
                <ul className={styles.benefits}>
                  <li><strong>ATS score</strong> — how well a parser can read and rank your resume</li>
                  <li><strong>Keyword gaps</strong> — terms from the job posting you&apos;re missing</li>
                  <li><strong>Detailed critique</strong> — section-by-section fixes you can act on</li>
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>

      <AuthModal
        isOpen={authReason !== null}
        reason={authReason ?? undefined}
        onClose={() => setAuthReason(null)}
        onSuccess={() => setAuthReason(null)}
      />
    </>
  );
}
