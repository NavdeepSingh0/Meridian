import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { resumeApi } from '../api/resumeApi';
import { useResumeStore } from '../store/resumeStore';
import { resumeKeys } from './useResumes';

const DEBOUNCE_MS = 1500;
const RETRY_MS = 5000;

function snapshotOf(state: ReturnType<typeof useResumeStore.getState>) {
  return JSON.stringify({
    title: state.documentName,
    template: state.selectedTemplateId,
    data: state.resumeData,
  });
}

/**
 * Autosaves the open cloud resume (if any) to the API.
 *
 * - Nothing is sent just because a resume was loaded: the first snapshot for a
 *   given resume id is treated as the already-saved baseline.
 * - Saves are debounced and serialised, so responses can't arrive out of order.
 * - On failure the status becomes "error" and the save is retried.
 * - Unsaved changes are flushed when the builder unmounts.
 *
 * Writes its progress to `saveStatus` in the resume store, which the top nav
 * shows — so the indicator reflects what really happened.
 */
export function useCloudAutosave() {
  const queryClient = useQueryClient();
  const currentResumeId = useResumeStore((s) => s.currentResumeId);
  const resumeData = useResumeStore((s) => s.resumeData);
  const documentName = useResumeStore((s) => s.documentName);
  const selectedTemplateId = useResumeStore((s) => s.selectedTemplateId);
  const setSaveStatus = useResumeStore((s) => s.setSaveStatus);

  const baseline = useRef<{ id: number; snapshot: string } | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [retryTick, setRetryTick] = useState(0);

  const save = useCallback(
    (id: number) => {
      // Capture the state NOW (synchronously). When called while leaving the builder the store is
      // reset right afterwards, so the queued request must not read it later.
      const state = useResumeStore.getState();
      if (state.currentResumeId !== id) return queue.current;
      const snapshot = snapshotOf(state);
      // No baseline yet means the document was never confirmed loaded — never write then
      // (e.g. StrictMode's mount/unmount/mount in dev), or we could clobber the saved copy.
      if (baseline.current?.id !== id) return queue.current;
      if (baseline.current.snapshot === snapshot) return queue.current;

      queue.current = queue.current.then(async () => {
        try {
          await resumeApi.update(id, {
            title: state.documentName.trim() || 'Untitled',
            template_id: state.selectedTemplateId,
            document_data: state.resumeData,
          });
          baseline.current = { id, snapshot };
          queryClient.invalidateQueries({ queryKey: resumeKeys.list });
          const now = useResumeStore.getState();
          if (now.currentResumeId === id) {
            // If the user kept typing while we saved, the effect below is already scheduling the next save.
            setSaveStatus(snapshotOf(now) === snapshot ? 'saved' : 'saving');
          }
        } catch (err) {
          console.error('Cloud autosave failed', err);
          if (useResumeStore.getState().currentResumeId === id) {
            setSaveStatus('error');
            setTimeout(() => setRetryTick((n) => n + 1), RETRY_MS);
          }
        }
      });
      return queue.current;
    },
    [queryClient, setSaveStatus],
  );

  useEffect(() => {
    if (currentResumeId === null) {
      baseline.current = null;
      return;
    }

    const snapshot = JSON.stringify({ title: documentName, template: selectedTemplateId, data: resumeData });

    // First time we see this document: what we have *is* what's saved.
    if (baseline.current?.id !== currentResumeId) {
      baseline.current = { id: currentResumeId, snapshot };
      return;
    }
    if (baseline.current.snapshot === snapshot) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => void save(currentResumeId), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [currentResumeId, resumeData, documentName, selectedTemplateId, retryTick, save, setSaveStatus]);

  // Flush pending changes when leaving the builder.
  useEffect(() => {
    return () => {
      const { currentResumeId: id } = useResumeStore.getState();
      if (id !== null) void save(id);
    };
  }, [save]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const { saveStatus, currentResumeId: id } = useResumeStore.getState();
      if (id !== null && (saveStatus === 'saving' || saveStatus === 'error')) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
}
