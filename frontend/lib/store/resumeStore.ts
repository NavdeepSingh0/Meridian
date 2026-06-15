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

  // Panel & Results
  setJobDescription: (text: string) => void;
  setPanelState: (state: PanelState) => void;
  setAtsResult: (result: ATSResult) => void;
  setCritiqueResult: (result: CritiqueResult) => void;
  resetToEditing: () => void;

  // Hydration
  hydratePersistedState: (persistedState: Partial<ResumeStore>) => void;

  setSelectedTemplateId: (id: string) => void;
  injectImprovement: (section: string, suggestion: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  // Initial State
  resumeData: initialResumeData,
  selectedTemplateId: 'classic',
  panelState: 'editing',
  atsResult: null,
  critiqueResult: null,
  jobDescription: '',

  // Hydration
  hydratePersistedState: (state) => set((prev) => ({ ...prev, ...state })),

  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),

  injectImprovement: (section, suggestion) => set((state) => {
    const newData = JSON.parse(JSON.stringify(state.resumeData));
    
    if (section === 'work' && newData.work.length > 0) {
      newData.work[0].highlights.push(`[AI Suggestion] ${suggestion}`);
    } else if (section === 'basics' || section === 'summary') {
      newData.basics.summary = newData.basics.summary + `\n\n[AI Suggestion] ${suggestion}`;
    } else if (section === 'skills' && newData.skills.length > 0) {
      newData.skills[0].keywords.push(`[AI Suggestion] ${suggestion}`);
    } else if (section === 'projects' && newData.projects.length > 0) {
      newData.projects[0].highlights.push(`[AI Suggestion] ${suggestion}`);
    } else {
      newData.basics.summary = newData.basics.summary + `\n\n[AI Suggestion for ${section}] ${suggestion}`;
    }
    
    return { resumeData: newData };
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
        { name: '', position: '', startDate: '', endDate: '', summary: '', highlights: [] }
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
        { name: '', description: '', url: '', highlights: [], keywords: [] }
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

  // Panel & Results
  setJobDescription: (text) => set({ jobDescription: text }),
  setPanelState: (state) => set({ panelState: state }),
  setAtsResult: (result) => set({ atsResult: result }),
  setCritiqueResult: (result) => set({ critiqueResult: result }),
  resetToEditing: () => set({ panelState: 'editing', atsResult: null, critiqueResult: null }),
}));

// Persistence Subscription (Debounced ~500ms)
const STORAGE_KEY = 'meridian:resume:v1';
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
        ...(typeof parsed.jobDescription === 'string' && { jobDescription: parsed.jobDescription }),
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
      state.jobDescription !== prevState.jobDescription
    ) {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const stateToSave = {
          resumeData: state.resumeData,
          selectedTemplateId: state.selectedTemplateId,
          jobDescription: state.jobDescription,
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
