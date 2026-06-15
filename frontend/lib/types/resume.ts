export interface Location {
  city: string;
  region: string;
  countryCode: string;
}

export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface Basics {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: Location;
  profiles: Profile[];
}

export interface Work {
  name: string;
  position: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  studyType: string;
  area: string;
  startDate: string;
  endDate: string;
  score: string;
}

export interface Project {
  name: string;
  description: string;
  highlights: string[];
  keywords: string[];
  url: string;
}

export interface Skill {
  name: string;
  keywords: string[];
}

export interface Certificate {
  name: string;
  date: string;
  issuer: string;
  url: string;
}

export interface ResumeData {
  basics: Basics;
  work: Work[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  certificates: Certificate[];
  volunteer: unknown[];
  awards: unknown[];
  publications: unknown[];
  languages: unknown[];
  interests: unknown[];
  references: unknown[];
}
