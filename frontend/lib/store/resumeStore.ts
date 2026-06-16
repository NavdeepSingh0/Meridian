import { create } from 'zustand';
import { ResumeData } from '../types/resume';
import { ATSResult, CritiqueResult } from '../types/analysis';

export const initialResumeData: ResumeData = {
  basics: {
    name: "Navdeep Singh Dhunna",
    label: "CS Undergraduate",
    email: "navdeep.s.dhunna@gmail.com",
    phone: "+91 78019 83501",
    url: "github.com/NavdeepSingh0",
    summary: "2nd-year CS undergraduate with 4 production-deployed systems across fintech, civic tech, and B2B SaaS. Full stack across React/React Native frontends, FastAPI and Node.js backends, PostgreSQL and MongoDB. Top 10 at Zomathon Hackathon (500+ teams). Seeking paid remote software development internship.",
    location: {
      city: "Surat",
      region: "Gujarat",
      countryCode: "India",
    },
    profiles: [
      { network: "LinkedIn", url: "linkedin.com/in/navdeepsingh-dhunna" },
      { network: "GitHub", url: "github.com/NavdeepSingh0" }
    ],
  },
  work: [],
  education: [
    {
      institution: "Chandigarh University, Mohali",
      area: "Computer Science and Engineering",
      studyType: "B.E.",
      startDate: "2024",
      endDate: "2028",
      score: "7.79 / 10"
    },
    {
      institution: "GSEB Board, Gujarat",
      area: "Higher Secondary (12th)",
      studyType: "",
      startDate: "2021",
      endDate: "2024",
      score: "73.56%"
    }
  ],
  projects: [
    {
      name: "Carto — Cart Recommendation Engine",
      description: "Python · FastAPI · React.js · LightGBM · Item2Vec · Vite",
      url: "carto-demo.netlify.app",
      startDate: "",
      endDate: "Mar 2026",
      keywords: [],
      highlights: [
        "Sole technical contributor on 3-person team; advanced to Top 10 out of 500+ teams at Zomathon, a national hackathon by Zomato.",
        "Built two-stage recommendation engine — Hexagon Candidate Engine + LightGBM ranker with Item2Vec embeddings — achieving NDCG@5 of 0.89, AUC of 0.77, and 30% lift over baseline at sub-100ms P90 latency.",
        "Synthesized 14,000-interaction dataset from scratch; published dataset and full codebase on Kaggle."
      ]
    },
    {
      name: "Vakalat — Legal Intelligence Platform",
      description: "Node.js · Express · Gemini API · Firebase · React 19 · Puppeteer · Vite",
      url: "github.com/NavdeepSingh0/vakalat",
      startDate: "",
      endDate: "Mar 2026",
      keywords: [],
      highlights: [
        "Consolidated 230M+ eCourts cases into a single CNR lookup, replacing a fragmented multi-page government workflow.",
        "Designed 18-endpoint RESTful API with 3-step CAPTCHA session relay (10-min TTL) and Gemini AI integration for AI generated hearing prep questions.",
        "Implemented adjournment cost algorithm (v3.2) tracking ₹550–50,000/day across 6 multiplier stages, benchmarked against India's 61% unproductive hearing rate (DAKSH Study)."
      ]
    },
    {
      name: "Credwork — Gig Worker Income Verification App",
      description: "React Native · FastAPI · PostgreSQL · Supabase · scikit-learn · Next.js · ReportLab",
      url: "credwork.vercel.app",
      startDate: "",
      endDate: "Mar 2026",
      keywords: [],
      highlights: [
        "Production-deployed fintech mobile app targeting income verification for India's 400M+ informal workers; separate Next.js marketing site both live on Vercel.",
        "Built 4-layer fraud detection pipeline: PDF metadata analysis, font consistency checks, Benford's Law, and Isolation Forest anomaly detection on UPI transaction data.",
        "Developed GigScore algorithm (0–1000) evaluating income consistency over 6-month rolling window; auto-generates QR verified PDF certificates via ReportLab."
      ]
    },
    {
      name: "Slatework — B2B SaaS Knowledge Management",
      description: "React 19 · TypeScript · Node.js · Supabase · PostgreSQL · shadcn/ui · Tailwind CSS",
      url: "slate-work.vercel.app",
      startDate: "",
      endDate: "Feb 2026",
      keywords: [],
      highlights: [
        "Shipped production B2B SaaS platform with RBAC across 4 permission levels and Row-Level Security policies on Supabase PostgreSQL.",
        "Implemented full-text search achieving sub-50ms query performance with Supabase Realtime updates and versioned article approval workflows."
      ]
    }
  ],
  skills: [
    {
      name: "Languages",
      level: "",
      keywords: ["Python", "JavaScript (ES6+)", "TypeScript", "C/C++", "SQL"]
    },
    {
      name: "Frontend",
      level: "",
      keywords: ["React.js", "React Native", "Next.js", "Vite", "Tailwind CSS", "shadcn/ui"]
    },
    {
      name: "Backend",
      level: "",
      keywords: ["FastAPI", "Node.js", "Express.js", "Django", "Flask", "REST APIs"]
    },
    {
      name: "Databases",
      level: "",
      keywords: ["PostgreSQL", "MongoDB", "Supabase", "Firebase", "MySQL", "Redis"]
    },
    {
      name: "ML & AI",
      level: "",
      keywords: ["LightGBM", "scikit-learn", "Isolation Forest", "Item2Vec", "Gemini API", "Ollama"]
    },
    {
      name: "DevOps & Tools",
      level: "",
      keywords: ["Docker", "Git", "GitHub", "Vercel", "Netlify", "Postman", "CI/CD"]
    }
  ],
  certificates: [],
  volunteer: [],
  awards: [
    {
      title: "Top 10 / 500+ teams, Zomathon Hackathon (Zomato) — published 14,000-row Carto dataset on Kaggle.",
      date: "",
      awarder: "",
      summary: ""
    },
    {
      title: "Finalist, Hackshastra 2.0 (Chandigarh University) — Top teams out of 500+ participants with Credwork.",
      date: "",
      awarder: "",
      summary: ""
    },
    {
      title: "Co-authored IEEE-format paper on explainable deep learning for PCOS detection using CNNs with Grad-CAM and EigenCAM XAI evaluation.",
      date: "",
      awarder: "",
      summary: ""
    }
  ],
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
  setFontSize: (size: number) => void;
  setDocumentMargin: (margin: number) => void;
  injectImprovement: (section: string, suggestion: string) => void;
  undoLastAIEdit: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  // Initial State
  resumeData: initialResumeData,
  selectedTemplateId: 'classic',
  panelState: 'editing',
  atsResult: null,
  critiqueResult: null,
  jobDescription: '',
  fontSize: 10,
  documentMargin: 1,
  undoStack: [],

  // Hydration
  hydratePersistedState: (state) => set((prev) => ({ ...prev, ...state })),

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
      state.documentMargin !== prevState.documentMargin
    ) {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const stateToSave = {
          resumeData: state.resumeData,
          selectedTemplateId: state.selectedTemplateId,
          jobDescription: state.jobDescription,
          fontSize: state.fontSize,
          documentMargin: state.documentMargin,
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
