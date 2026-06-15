import axios from 'axios';
import { ResumeData } from '../types/resume';

// We assume the Django backend is running on 8000
const API_BASE_URL = 'http://localhost:8000/api/analysis';

export interface CritiqueResponse {
  feedback: {
    strengths: string[];
    issues: Array<{
      section: string;
      issue: string;
      suggestion: string;
    }>;
  };
}

export interface AtsScoreResponse {
  score: number;
  keyword_matches: string[];
  missing_keywords: string[];
  feedback: string;
}

export const analysisApi = {
  critique: async (data: ResumeData): Promise<CritiqueResponse> => {
    const response = await axios.post(`${API_BASE_URL}/critique/`, data);
    return response.data;
  },

  atsScore: async (data: ResumeData, jobDescription: string): Promise<AtsScoreResponse> => {
    const response = await axios.post(`${API_BASE_URL}/ats-score/`, {
      resume: data,
      job_description: jobDescription,
    });
    return response.data;
  },

  exportPdf: async (data: ResumeData, templateName: string = 'classic'): Promise<Blob> => {
    const response = await axios.post(`${API_BASE_URL}/export-pdf/`, {
      resume: data,
      template_name: templateName,
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
};
