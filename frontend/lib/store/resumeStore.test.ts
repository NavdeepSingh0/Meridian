import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initialResumeData, useResumeStore } from './resumeStore';
import { ResumeData } from '../types/resume';

const DRAFT_KEY = 'meridian:draft:v1';
const LEGACY_KEY = 'meridian:resume:v1_test';

const named = (name: string): ResumeData => ({
  ...initialResumeData,
  basics: { ...initialResumeData.basics, name },
});

const flush = () => vi.advanceTimersByTimeAsync(600); // the store debounces draft writes by 500ms

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  useResumeStore.setState({
    resumeData: initialResumeData,
    documentName: '',
    currentResumeId: null,
    saveStatus: 'local',
    selectedTemplateId: 'modern',
  });
});

describe('local draft persistence', () => {
  it('writes the draft (with the document name) under the new key', async () => {
    useResumeStore.getState().setResumeData(named('Ada'));
    useResumeStore.getState().setDocumentName('My CV');
    await flush();

    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY)!);
    expect(saved.resumeData.basics.name).toBe('Ada');
    expect(saved.documentName).toBe('My CV');
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it('does NOT overwrite the local draft while a cloud resume is open', async () => {
    useResumeStore.getState().setResumeData(named('Local'));
    await flush();

    useResumeStore.getState().loadCloudResume({
      id: 7, title: 'Cloud', template_id: 'classic', document_data: named('Cloud person'),
    });
    useResumeStore.getState().setResumeData(named('Cloud edited'));
    await flush();

    expect(JSON.parse(localStorage.getItem(DRAFT_KEY)!).resumeData.basics.name).toBe('Local');
  });

  it('loadLocalDraft restores the draft and detaches from the cloud resume', async () => {
    useResumeStore.getState().setResumeData(named('Local'));
    useResumeStore.getState().setDocumentName('Draft');
    await flush();

    useResumeStore.getState().loadCloudResume({
      id: 7, title: 'Cloud', template_id: 'classic', document_data: named('Cloud person'),
    });
    useResumeStore.getState().loadLocalDraft();

    const s = useResumeStore.getState();
    expect(s.currentResumeId).toBeNull();
    expect(s.saveStatus).toBe('local');
    expect(s.resumeData.basics.name).toBe('Local');
    expect(s.documentName).toBe('Draft');
  });

  it('migrates the old test storage key once', () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify({ resumeData: named('Legacy'), selectedTemplateId: 'classic' }));
    useResumeStore.getState().loadLocalDraft();

    expect(useResumeStore.getState().resumeData.basics.name).toBe('Legacy');
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
  });

  it('falls back to an empty resume when stored data is corrupt', () => {
    localStorage.setItem(DRAFT_KEY, '{not json');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    useResumeStore.getState().loadLocalDraft();
    expect(useResumeStore.getState().resumeData).toEqual(initialResumeData);
    errorSpy.mockRestore();
  });
});

describe('loadCloudResume', () => {
  it('sets data, id, title, template and saved status together and resets AI state', () => {
    useResumeStore.setState({ panelState: 'scored', undoStack: [initialResumeData] });
    useResumeStore.getState().loadCloudResume({
      id: 3, title: 'Mine', template_id: 'minimal', document_data: named('Grace'),
    });

    const s = useResumeStore.getState();
    expect(s).toMatchObject({
      currentResumeId: 3, documentName: 'Mine', selectedTemplateId: 'minimal',
      saveStatus: 'saved', panelState: 'editing', atsResult: null, critiqueResult: null,
    });
    expect(s.resumeData.basics.name).toBe('Grace');
    expect(s.undoStack).toEqual([]);
  });
});
