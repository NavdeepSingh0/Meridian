import { create } from 'zustand';
import { ResumeData } from '../types/resume';
import { ATSResult, CritiqueResult } from '../types/analysis';

export const initialResumeData: ResumeData = {
  basics: {
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    summary: "",
    location: {
      city: "",
      region: "",
      countryCode: "",
    },
    profiles: [],
  },
  work: [],
  education: [],
  projects: [],
  skills: [],
  certificates: [],
  volunteer: [],
  awards: [],
  publications: [],
  languages: [],
  interests: [],
  references: [],
};

export type PanelState = 'editing' | 'scored' | 'feedback';

/**
 * Where the current document is persisted and how that is going.
 * - local: browser-only draft (no cloud resume open)
 * - saved / saving / error: state of the cloud autosave for the open cloud resume
 */
export type SaveStatus = 'local' | 'saved' | 'saving' | 'error';

interface CloudResumeInput {
  id: number;
  title: string;
  template_id: string;
  document_data: ResumeData;
}

interface ResumeStore {
  // State
  resumeData: ResumeData;
  documentName: string;
  saveStatus: SaveStatus;
  selectedTemplateId: string;
  panelState: PanelState;
  atsResult: ATSResult | null;
  critiqueResult: CritiqueResult | null;
  jobDescription: string;
  fontSize: number;
  documentMargin: number;
  undoStack: ResumeData[];
  hasDownloadedFreeResume: boolean;
  user: unknown;

  // Actions
  // Basics
  updateBasics: (field: string, value: string | string[]) => void;
  updateLocation: (field: string, value: string) => void;
  
  // Work
  addWorkEntry: () => void;
  updateWorkEntry: (index: number, field: string, value: string | string[]) => void;
  removeWorkEntry: (index: number) => void;
  
  // Education
  addEducationEntry: () => void;
  updateEducationEntry: (index: number, field: string, value: string) => void;
  removeEducationEntry: (index: number) => void;
  
  // Projects
  addProjectEntry: () => void;
  updateProjectEntry: (index: number, field: string, value: string | string[]) => void;
  removeProjectEntry: (index: number) => void;
  
  // Skills
  addSkillEntry: () => void;
  updateSkillEntry: (index: number, field: string, value: string | string[]) => void;
  removeSkillEntry: (index: number) => void;

  // Certificates
  addCertificateEntry: () => void;
  updateCertificateEntry: (index: number, field: string, value: string) => void;
  removeCertificateEntry: (index: number) => void;

  // Awards
  addAwardEntry: () => void;
  updateAwardEntry: (index: number, field: string, value: string) => void;
  removeAwardEntry: (index: number) => void;

  // Panel & Results
  setJobDescription: (text: string) => void;
  setPanelState: (state: PanelState) => void;
  setAtsResult: (result: ATSResult) => void;
  setCritiqueResult: (result: CritiqueResult) => void;
  setHasDownloadedFreeResume: (value: boolean) => void;
  setUser: (user: unknown) => void;
  resetToEditing: () => void;
  
  // Cloud documents
  currentResumeId: number | null;
  setCurrentResumeId: (id: number) => void;
  setDocumentName: (name: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  /** Replace the editor contents with a cloud resume (atomic: data, id, title, template). */
  loadCloudResume: (resume: CloudResumeInput) => void;
  /** Leave any cloud resume and restore the browser-only draft from localStorage. */
  loadLocalDraft: () => void;

  // Hydration
  hydratePersistedState: (persistedState: Partial<ResumeStore>) => void;

  setSelectedTemplateId: (id: string) => void;
  setFontSize: (size: number) => void;
  setDocumentMargin: (margin: number) => void;
  injectImprovement: (section: string, rewrittenSectionData: unknown) => void;
  undoLastAIEdit: () => void;
  setResumeData: (data: ResumeData) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  // Initial State
  resumeData: initialResumeData,
  documentName: '',
  saveStatus: 'local',
  selectedTemplateId: 'modern',
  panelState: 'editing',
  atsResult: null,
  critiqueResult: null,
  jobDescription: '',
  fontSize: 10,
  documentMargin: 1,
  undoStack: [],
  hasDownloadedFreeResume: false,
  user: null,
  currentResumeId: null,
  setCurrentResumeId: (id) => set({ currentResumeId: id, saveStatus: 'saved' }),
  setDocumentName: (name) => set({ documentName: name }),
  setSaveStatus: (status) => set({ saveStatus: status }),

  // Hydration
  hydratePersistedState: (state) => set((prev) => ({ ...prev, ...state })),

  loadCloudResume: (resume) => set({
    resumeData: resume.document_data,
    currentResumeId: resume.id,
    documentName: resume.title,
    selectedTemplateId: resume.template_id,
    saveStatus: 'saved',
    undoStack: [],
    panelState: 'editing',
    atsResult: null,
    critiqueResult: null,
  }),
  loadLocalDraft: () => set({
    ...readLocalDraft(),
    currentResumeId: null,
    saveStatus: 'local',
    undoStack: [],
    panelState: 'editing',
    atsResult: null,
    critiqueResult: null,
  }),
  setResumeData: (data) => set({ resumeData: data }),

  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
  setFontSize: (size) => set({ fontSize: size }),
  setDocumentMargin: (margin) => set({ documentMargin: margin }),

  injectImprovement: (section, rewrittenSectionData) => set((state) => {
    const newUndoStack = [...state.undoStack, JSON.parse(JSON.stringify(state.resumeData))];
    const newData = JSON.parse(JSON.stringify(state.resumeData));
    
    // Check if section is valid in our state. If it's "summary", we map it to "basics" since summary is inside basics.
    if (section === 'summary') {
        newData.basics = rewrittenSectionData;
    } else if (newData[section] !== undefined) {
        newData[section] = rewrittenSectionData;
    } else {
        console.warn(`Unknown section '${section}' passed to injectImprovement.`);
    }
    
    return { resumeData: newData, undoStack: newUndoStack };
  }),

  undoLastAIEdit: () => set((state) => {
    if (state.undoStack.length === 0) return state;
    const newUndoStack = [...state.undoStack];
    const previousResumeData = newUndoStack.pop()!;
    return { resumeData: previousResumeData, undoStack: newUndoStack };
  }),

  // Basics Actions
  updateBasics: (field, value) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      basics: { ...state.resumeData.basics, [field]: value }
    }
  })),
  updateLocation: (field, value) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      basics: {
        ...state.resumeData.basics,
        location: { ...state.resumeData.basics.location, [field]: value }
      }
    }
  })),

  // Work Actions
  addWorkEntry: () => set((state) => ({
    resumeData: {
      ...state.resumeData,
      work: [
        ...state.resumeData.work,
        { name: '', position: '', location: '', startDate: '', endDate: '', summary: '', highlights: [] }
      ]
    }
  })),
  updateWorkEntry: (index, field, value) => set((state) => {
    const newWork = [...state.resumeData.work];
    newWork[index] = { ...newWork[index], [field]: value };
    return { resumeData: { ...state.resumeData, work: newWork } };
  }),
  removeWorkEntry: (index) => set((state) => {
    const newWork = [...state.resumeData.work];
    newWork.splice(index, 1);
    return { resumeData: { ...state.resumeData, work: newWork } };
  }),

  // Education Actions
  addEducationEntry: () => set((state) => ({
    resumeData: {
      ...state.resumeData,
      education: [
        ...state.resumeData.education,
        { institution: '', studyType: '', area: '', startDate: '', endDate: '', score: '' }
      ]
    }
  })),
  updateEducationEntry: (index, field, value) => set((state) => {
    const newEdu = [...state.resumeData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    return { resumeData: { ...state.resumeData, education: newEdu } };
  }),
  removeEducationEntry: (index) => set((state) => {
    const newEdu = [...state.resumeData.education];
    newEdu.splice(index, 1);
    return { resumeData: { ...state.resumeData, education: newEdu } };
  }),

  // Projects Actions
  addProjectEntry: () => set((state) => ({
    resumeData: {
      ...state.resumeData,
      projects: [
        ...state.resumeData.projects,
        { name: '', description: '', url: '', startDate: '', endDate: '', highlights: [], keywords: [] }
      ]
    }
  })),
  updateProjectEntry: (index, field, value) => set((state) => {
    const newProj = [...state.resumeData.projects];
    newProj[index] = { ...newProj[index], [field]: value };
    return { resumeData: { ...state.resumeData, projects: newProj } };
  }),
  removeProjectEntry: (index) => set((state) => {
    const newProj = [...state.resumeData.projects];
    newProj.splice(index, 1);
    return { resumeData: { ...state.resumeData, projects: newProj } };
  }),

  // Skills Actions
  addSkillEntry: () => set((state) => ({
    resumeData: {
      ...state.resumeData,
      skills: [
        ...state.resumeData.skills,
        { name: '', keywords: [] }
      ]
    }
  })),
  updateSkillEntry: (index, field, value) => set((state) => {
    const newSkills = [...state.resumeData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    return { resumeData: { ...state.resumeData, skills: newSkills } };
  }),
  removeSkillEntry: (index) => set((state) => {
    const newSkills = [...state.resumeData.skills];
    newSkills.splice(index, 1);
    return { resumeData: { ...state.resumeData, skills: newSkills } };
  }),

  // Certificates Actions
  addCertificateEntry: () => set((state) => ({
    resumeData: {
      ...state.resumeData,
      certificates: [
        ...state.resumeData.certificates,
        { name: '', date: '', issuer: '', url: '' }
      ]
    }
  })),
  updateCertificateEntry: (index, field, value) => set((state) => {
    const newCerts = [...state.resumeData.certificates];
    newCerts[index] = { ...newCerts[index], [field]: value };
    return { resumeData: { ...state.resumeData, certificates: newCerts } };
  }),
  removeCertificateEntry: (index) => set((state) => {
    const newCerts = [...state.resumeData.certificates];
    newCerts.splice(index, 1);
    return { resumeData: { ...state.resumeData, certificates: newCerts } };
  }),

  // Awards Actions
  addAwardEntry: () => set((state) => ({
    resumeData: {
      ...state.resumeData,
      awards: [
        ...state.resumeData.awards,
        { title: '', date: '', awarder: '', summary: '' }
      ]
    }
  })),
  updateAwardEntry: (index, field, value) => set((state) => {
    const newAwards = [...state.resumeData.awards];
    newAwards[index] = { ...newAwards[index], [field]: value };
    return { resumeData: { ...state.resumeData, awards: newAwards } };
  }),
  removeAwardEntry: (index) => set((state) => {
    const newAwards = [...state.resumeData.awards];
    newAwards.splice(index, 1);
    return { resumeData: { ...state.resumeData, awards: newAwards } };
  }),

  // Panel & Results
  setJobDescription: (text) => set({ jobDescription: text }),
  setPanelState: (state) => set({ panelState: state }),
  setAtsResult: (result) => set({ atsResult: result }),
  setCritiqueResult: (result) => set({ critiqueResult: result }),
  
  setHasDownloadedFreeResume: (value) => set({ hasDownloadedFreeResume: value }),
  setUser: (user) => set({ user }),
  resetToEditing: () => set({ panelState: 'editing', atsResult: null, critiqueResult: null }),
}));

// ── Local draft persistence ──────────────────────────────────────────────────
// The browser-only draft (used when no cloud resume is open) lives in
// localStorage. It is only written while NO cloud resume is open, so editing a
// cloud document never overwrites the local draft.
const STORAGE_KEY = 'meridian:draft:v1';
const LEGACY_STORAGE_KEY = 'meridian:resume:v1_test';

type DraftState = Pick<
  ResumeStore,
  'resumeData' | 'documentName' | 'selectedTemplateId' | 'jobDescription' | 'fontSize' | 'documentMargin' | 'hasDownloadedFreeResume'
>;

function readLocalDraft(): Partial<DraftState> {
  if (typeof window === 'undefined') return {};
  try {
    // One-time migration from the old test key.
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, legacy);
    }
    if (legacy) localStorage.removeItem(LEGACY_STORAGE_KEY);

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...emptyDraft };
    const parsed = JSON.parse(stored);
    return {
      resumeData: parsed.resumeData ?? initialResumeData,
      documentName: typeof parsed.documentName === 'string' ? parsed.documentName : '',
      selectedTemplateId: parsed.selectedTemplateId ?? 'modern',
      jobDescription: typeof parsed.jobDescription === 'string' ? parsed.jobDescription : '',
      fontSize: typeof parsed.fontSize === 'number' ? parsed.fontSize : 10,
      documentMargin: typeof parsed.documentMargin === 'number' ? parsed.documentMargin : 1,
      hasDownloadedFreeResume: !!parsed.hasDownloadedFreeResume,
    };
  } catch (e) {
    console.error('Failed to read resume draft from localStorage', e);
    return { ...emptyDraft };
  }
}

const emptyDraft: Partial<DraftState> = {
  resumeData: initialResumeData,
  documentName: '',
  selectedTemplateId: 'modern',
  jobDescription: '',
  fontSize: 10,
  documentMargin: 1,
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  // Initial load: hydrate from the local draft.
  useResumeStore.getState().hydratePersistedState(readLocalDraft());

  useResumeStore.subscribe((state, prev) => {
    if (state.currentResumeId !== null) return; // cloud documents are saved by the cloud autosave

    const changed =
      state.resumeData !== prev.resumeData ||
      state.documentName !== prev.documentName ||
      state.selectedTemplateId !== prev.selectedTemplateId ||
      state.jobDescription !== prev.jobDescription ||
      state.fontSize !== prev.fontSize ||
      state.documentMargin !== prev.documentMargin ||
      state.hasDownloadedFreeResume !== prev.hasDownloadedFreeResume;
    if (!changed) return;

    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      // Re-check at fire time: a cloud resume may have been opened in the meantime.
      const current = useResumeStore.getState();
      if (current.currentResumeId !== null) return;
      const draft: Partial<DraftState> = {
        resumeData: current.resumeData,
        documentName: current.documentName,
        selectedTemplateId: current.selectedTemplateId,
        jobDescription: current.jobDescription,
        fontSize: current.fontSize,
        documentMargin: current.documentMargin,
        hasDownloadedFreeResume: current.hasDownloadedFreeResume,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        console.error('Failed to save resume draft to localStorage', e);
      }
    }, 500);
  });
}
