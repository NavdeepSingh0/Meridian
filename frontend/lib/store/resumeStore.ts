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

interface ResumeStore {
  // State
  resumeData: ResumeData;
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
  
  // Phase 2: DB loading
  currentResumeId: number | null;
  setCurrentResumeId: (id: number) => void;
  loadResumeFromDB: (resumeData: ResumeData, id: number | null) => void;
  clearCurrentResume: () => void;

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
  setCurrentResumeId: (id) => set({ currentResumeId: id }),

  // Hydration
  hydratePersistedState: (state) => set((prev) => ({ ...prev, ...state })),

  loadResumeFromDB: (resumeData, id) => set({ resumeData, currentResumeId: id }),
  clearCurrentResume: () => set({ resumeData: initialResumeData, currentResumeId: null }),
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

// Persistence Subscription (Debounced ~500ms)
const STORAGE_KEY = 'meridian:resume:v1_test';
let timeoutId: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  // 1. Initial Load
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate or safely hydrate
      useResumeStore.getState().hydratePersistedState({
        ...(parsed.resumeData && { resumeData: parsed.resumeData }),
        ...(parsed.selectedTemplateId && { selectedTemplateId: parsed.selectedTemplateId }),
        ...(parsed.hasDownloadedFreeResume !== undefined && { hasDownloadedFreeResume: parsed.hasDownloadedFreeResume }),
        ...(typeof parsed.jobDescription === 'string' && { jobDescription: parsed.jobDescription }),
        ...(typeof parsed.fontSize === 'number' && { fontSize: parsed.fontSize }),
        ...(typeof parsed.documentMargin === 'number' && { documentMargin: parsed.documentMargin }),
      });
    }
  } catch (e) {
    console.error("Failed to parse resume from localStorage", e);
  }

  // 2. Subscribe to changes
  useResumeStore.subscribe((state, prevState) => {
    // Only trigger save if relevant fields changed
    if (
      state.resumeData !== prevState.resumeData ||
      state.selectedTemplateId !== prevState.selectedTemplateId ||
      state.jobDescription !== prevState.jobDescription ||
      state.fontSize !== prevState.fontSize ||
      state.documentMargin !== prevState.documentMargin ||
      state.hasDownloadedFreeResume !== prevState.hasDownloadedFreeResume
    ) {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const stateToSave = {
          resumeData: state.resumeData,
          selectedTemplateId: state.selectedTemplateId,
          jobDescription: state.jobDescription,
          fontSize: state.fontSize,
          documentMargin: state.documentMargin,
          hasDownloadedFreeResume: state.hasDownloadedFreeResume,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (e) {
          console.error("Failed to save resume to localStorage", e);
        }
      }, 500);
    }
  });
}
