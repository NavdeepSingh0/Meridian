export interface SectionCritique {
  section: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

export interface CritiqueResult {
  overall_score: number;
  overall_feedback: string;
  sections: SectionCritique[];
}

export interface KeywordGap {
  keyword: string;
  importance: string;
}

export interface ATSResult {
  overall_score: number;
  summary: string;
  strengths: string[];
  issues: string[];
  has_job_description: boolean;
  matched_keywords?: string[];
  missing_keywords?: KeywordGap[];
}
