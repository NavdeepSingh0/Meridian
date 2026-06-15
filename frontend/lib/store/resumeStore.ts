import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeData, Basics, Work, Education, Project, Skill, Certificate } from '../types/resume';

const initialResumeData: ResumeData = {
  basics: {
    name: "Elena Rostova",
    label: "Senior Product Designer",
    email: "elena.rostova@example.com",
    phone: "+1 (555) 123-4567",
    url: "",
    summary: "",
    location: {
      city: "San Francisco",
      region: "CA",
      countryCode: "US",
    },
    profiles: [],
  },
  work: [
    {
      name: "Acme Corp",
      position: "Senior Product Designer",
      startDate: "Jan 2021",
      endDate: "Present",
      summary: "",
      highlights: [
        "Led the redesign of the core enterprise platform, resulting in a 25% increase in user retention and a 15% decrease in onboarding time.",
        "Established and maintained the global design system used across 5 distinct product lines by over 40 engineers."
      ],
    },
    {
      name: "TechNova Solutions",
      position: "UX/UI Designer",
      startDate: "Jun 2018",
      endDate: "Dec 2020",
      summary: "",
      highlights: [
        "Collaborated with product managers to conduct generative user research and translate findings into high-fidelity prototypes.",
        "Improved checkout conversion by 12% through targeted usability testing and iterative interface refinements."
      ],
    }
  ],
  education: [
    {
      institution: "Rhode Island School of Design (RISD)",
      studyType: "B.S. Interaction Design",
      area: "Interaction Design",
      startDate: "2014",
      endDate: "2018",
      score: "",
    }
  ],
  projects: [],
  skills: [
    {
      name: "Design",
      keywords: ["UI/UX", "Wireframing", "Prototyping", "Design Systems", "Typography", "Interaction Design"]
    },
    {
      name: "Tools",
      keywords: ["Figma", "Sketch", "Adobe Creative Suite", "Principle", "Webflow"]
    },
    {
      name: "Code",
      keywords: ["HTML", "CSS", "basic JavaScript", "React familiarity"]
    }
  ],
  certificates: [],
  volunteer: [],
  awards: [],
  publications: [],
  languages: [],
  interests: [],
  references: [],
};

interface ResumeStore {
  data: ResumeData;
  setBasics: (basics: Basics) => void;
  setWork: (work: Work[]) => void;
  setEducation: (education: Education[]) => void;
  setProjects: (projects: Project[]) => void;
  setSkills: (skills: Skill[]) => void;
  setCertificates: (certificates: Certificate[]) => void;
  updateResumeData: (data: Partial<ResumeData>) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: initialResumeData,
      setBasics: (basics) => set((state) => ({ data: { ...state.data, basics } })),
      setWork: (work) => set((state) => ({ data: { ...state.data, work } })),
      setEducation: (education) => set((state) => ({ data: { ...state.data, education } })),
      setProjects: (projects) => set((state) => ({ data: { ...state.data, projects } })),
      setSkills: (skills) => set((state) => ({ data: { ...state.data, skills } })),
      setCertificates: (certificates) => set((state) => ({ data: { ...state.data, certificates } })),
      updateResumeData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
    }),
    {
      name: 'resume-storage', // name of the item in the storage
    }
  )
);
