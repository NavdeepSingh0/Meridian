'use client';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useIsMutating } from '@tanstack/react-query';
import styles from './builder.module.css';
import ClassicTemplate from '../../components/templates/ClassicTemplate';
import ModernTemplate from '../../components/templates/ModernTemplate';
import MinimalTemplate from '../../components/templates/MinimalTemplate';
import LeftSidebar from '../../components/editor/LeftSidebar';
import AnalysisPanel from '../../components/ai/AnalysisPanel';
import TopNav from '../../components/editor/TopNav';
import OnboardingTour from '../../components/editor/OnboardingTour';
import AuthModal from '../../components/auth/AuthModal';
import { useResumeStore } from '../../lib/store/resumeStore';
import { useUserStore } from '../../lib/store/userStore';
import { useGetResume } from '../../lib/hooks/useResumes';
import { useCloudAutosave } from '../../lib/hooks/useCloudAutosave';
import { getErrorStatus } from '../../lib/api/client';

interface HighlightedSection {
  section: string;
  marker: number;
}

const PAPER_WIDTH = 794; // A4 at 96dpi — keep in sync with .paperCard in builder.module.css
const PAPER_MIN_HEIGHT = 1123;
const MIN_ZOOM = 20;
const MAX_ZOOM = 200;
const clampZoom = (z: number) => Math.min(Math.max(z, MIN_ZOOM), MAX_ZOOM);
const TOUR_KEY = 'meridian_tour_completed';

/** Full-page status screen (loading a cloud resume, not found, sign-in needed). */
function BuilderStatus({ title, message, children }: { title: string; message?: string; children?: React.ReactNode }) {
  return (
    <div className={styles.builderTheme} style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.75rem', margin: '0 0 8px' }}>{title}</h1>
      {message && <p style={{ color: 'var(--color-ink-muted)', margin: '0 0 20px', maxWidth: 420 }}>{message}</p>}
      {children}
    </div>
  );
}

function BuilderPageContent() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [paperHeight, setPaperHeight] = useState(PAPER_MIN_HEIGHT); // unscaled layout height of the paper
  const [isClient, setIsClient] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const canvasRef = useRef<HTMLElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const autoFit = useRef(true); // keep the paper fitted to the canvas width until the user zooms manually

  const panelState = useResumeStore((s) => s.panelState);
  const atsResult = useResumeStore((s) => s.atsResult);
  const critiqueResult = useResumeStore((s) => s.critiqueResult);
  const selectedTemplateId = useResumeStore((s) => s.selectedTemplateId);
  const fontSize = useResumeStore((s) => s.fontSize);
  const documentMargin = useResumeStore((s) => s.documentMargin);
  const currentResumeId = useResumeStore((s) => s.currentResumeId);
  const loadCloudResume = useResumeStore((s) => s.loadCloudResume);
  const loadLocalDraft = useResumeStore((s) => s.loadLocalDraft);

  const isMutating = useIsMutating();
  const firebaseUser = useUserStore((s) => s.firebaseUser);
  const isAuthLoading = useUserStore((s) => s.isLoading);

  // `?id=` opens a cloud resume; no id means the browser-only draft.
  const idParam = useSearchParams().get('id');
  const dbId = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null;
  const invalidId = idParam !== null && dbId === null;

  const { data: dbResume, error: loadError, isError: isLoadError } = useGetResume(dbId);

  useCloudAutosave();

  // Every visit to the builder starts from a clean slate. Without this, reopening a cloud resume that
  // is still bound in the store (same id) would skip loading and show stale content — e.g. a title
  // that was renamed on the Documents page. Declared after useCloudAutosave so that its flush of
  // pending edits runs first on unmount.
  useEffect(() => {
    return () => {
      if (useResumeStore.getState().currentResumeId !== null) useResumeStore.getState().loadLocalDraft();
    };
  }, []);

  useEffect(() => {
    if (dbId === null) {
      // Plain /builder: make sure we're editing the local draft, not a cloud resume left over from earlier navigation.
      if (currentResumeId !== null) loadLocalDraft();
    } else if (dbResume && dbResume.id === dbId && currentResumeId !== dbId) {
      loadCloudResume(dbResume);
    }
  }, [dbId, dbResume, currentResumeId, loadCloudResume, loadLocalDraft]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    try {
      setShowOnboarding(!localStorage.getItem(TOUR_KEY));
    } catch {
      setShowOnboarding(false);
    }

    const handleNativeWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        autoFit.current = false;
        setZoom((prev) => clampZoom(prev + (e.deltaY > 0 ? -2 : 2)));
      }
    };
    document.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleNativeWheel);
  }, []);

  const editorMounted = isClient && !invalidId && !(dbId !== null && currentResumeId !== dbId);

  // Track the paper's real (unscaled) height — it grows as content is added.
  useEffect(() => {
    const paper = paperRef.current;
    if (!editorMounted || !paper) return;
    const observer = new ResizeObserver(() => setPaperHeight(paper.offsetHeight));
    observer.observe(paper);
    return () => observer.disconnect();
  }, [editorMounted]);

  // Fit the paper's width to the canvas (never above 100%) on load and when the window resizes.
  useEffect(() => {
    if (!editorMounted) return;
    const fitWidth = () => {
      const canvas = canvasRef.current;
      const paper = paperRef.current;
      if (!autoFit.current || !canvas || !paper) return;
      const fit = (canvas.clientWidth - 64) / paper.offsetWidth;
      setZoom(clampZoom(Math.min(100, Math.floor(fit * 100))));
    };
    const raf = requestAnimationFrame(fitWidth);
    window.addEventListener('resize', fitWidth);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fitWidth);
    };
  }, [editorMounted]);

  const handleFitPage = useCallback(() => {
    autoFit.current = true;
    const canvas = canvasRef.current;
    const paper = paperRef.current;
    if (!canvas || !paper) return setZoom(100);
    // offsetWidth/Height ignore CSS transforms, so this is the paper's natural size.
    const fit = Math.min((canvas.clientWidth - 64) / paper.offsetWidth, (canvas.clientHeight - 120) / paper.offsetHeight);
    setZoom(clampZoom(Math.floor(fit * 100)));
  }, []);

  if (!isClient) return null;

  // ── Opening a cloud resume: gate the editor until it has loaded ────────────
  if (invalidId) {
    return (
      <BuilderStatus title="That link doesn't look right" message="The resume id in the address is not valid.">
        <Link href="/documents" className="btn-primary-nav">Go to my resumes</Link>
      </BuilderStatus>
    );
  }
  if (dbId !== null && currentResumeId !== dbId) {
    if (!firebaseUser && !isAuthLoading) {
      return (
        <BuilderStatus title="Sign in to open this resume" message="This resume is saved in your Meridian account.">
          <button type="button" className="btn-primary-nav" onClick={() => setShowAuth(true)}>Sign in</button>
          <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
        </BuilderStatus>
      );
    }
    if (isLoadError) {
      const notFound = getErrorStatus(loadError) === 404 || getErrorStatus(loadError) === 403;
      return (
        <BuilderStatus
          title={notFound ? 'Resume not found' : "Couldn't load this resume"}
          message={notFound ? 'It may have been deleted, or it belongs to a different account.' : 'Check your connection and try again.'}
        >
          <Link href="/documents" className="btn-primary-nav">Go to my resumes</Link>
        </BuilderStatus>
      );
    }
    return <BuilderStatus title="Opening your resume…" />;
  }

  const isLocked = panelState !== 'editing' || isMutating > 0;

  let highlightedSections: HighlightedSection[] = [];
  if (panelState === 'scored' && atsResult?.missing_keywords) {
    highlightedSections = [
      { section: 'Skills', marker: 1 },
      { section: 'Experience', marker: 2 },
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

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      autoFit.current = false;
      setZoom(val);
    }
  };

  const restartTour = () => {
    try {
      localStorage.removeItem(TOUR_KEY);
    } catch {
      /* ignore */
    }
    setShowOnboarding(true);
  };

  return (
    <div className={styles.builderTheme}>
      <TopNav onRestartTour={restartTour} />

      <div className={`${styles.builderBody} tour-main-canvas`}>
        <LeftSidebar activeSection={activeSection} setActiveSection={setActiveSection} isLocked={isLocked} />

        <main
          ref={canvasRef}
          className={styles.saasMainCanvas}
          style={{ pointerEvents: isLocked ? 'none' : 'auto', transition: 'all 0.3s ease' }}
        >
          {/* A CSS transform doesn't change layout size, so this wrapper takes the *scaled* size.
              That keeps scroll extents correct and centres the paper when it fits. */}
          <div
            className={styles.paperScale}
            style={{ width: PAPER_WIDTH * (zoom / 100), height: paperHeight * (zoom / 100), margin: '0 auto', flexShrink: 0 }}
          >
            <div
              ref={paperRef}
              className={styles.paperCard}
              style={
                {
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.1s ease',
                  '--doc-font-size': `${fontSize}pt`,
                  '--doc-margin': `${documentMargin * 48}px`,
                } as React.CSSProperties
              }
            >
              {selectedTemplateId === 'classic' && <ClassicTemplate highlightedSections={highlightedSections} />}
              {selectedTemplateId === 'modern' && <ModernTemplate highlightedSections={highlightedSections} />}
              {selectedTemplateId === 'minimal' && <MinimalTemplate highlightedSections={highlightedSections} />}
            </div>
          </div>

          <div className={styles.floatingToolbar}>
            <button type="button" className={styles.toolbarBtn} onClick={handleFitPage}>
              <span className={`material-symbols-outlined ${styles.toolbarBtnIcon}`} aria-hidden="true">fit_screen</span>
              Fit to page
            </button>
            <div className={styles.toolbarDivider}></div>
            <div className={styles.zoomControls}>
              <button type="button" className={styles.zoomBtn} onClick={() => {
                autoFit.current = false;
                setZoom((z) => clampZoom(z - 10));
              }} aria-label="Zoom out">
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>remove</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Zoom percentage"
                  value={zoom}
                  onChange={handleZoomInputChange}
                  onBlur={() => setZoom((z) => clampZoom(z))}
                  style={{ width: 28, textAlign: 'right', background: 'transparent', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'var(--color-ink)', outline: 'none' }}
                />
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink)' }}>%</span>
              </div>
              <button type="button" className={styles.zoomBtn} onClick={() => {
                autoFit.current = false;
                setZoom((z) => clampZoom(z + 10));
              }} aria-label="Zoom in">
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>add</span>
              </button>
            </div>
          </div>
        </main>

        <AnalysisPanel />
      </div>

      <OnboardingTour
        run={showOnboarding}
        onFinish={() => {
          setShowOnboarding(false);
          try {
            localStorage.setItem(TOUR_KEY, 'true');
          } catch {
            /* ignore */
          }
        }}
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderStatus title="Loading builder…" />}>
      <BuilderPageContent />
    </Suspense>
  );
}
