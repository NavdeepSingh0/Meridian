import axios from 'axios';
import { auth } from '../firebase/client';
import { ResumeData } from '../types/resume';
import { ATSResult, CritiqueResult } from '../types/analysis';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/analysis`
  : 'http://localhost:8000/api/analysis';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analysisApi = {
  critique: async (data: ResumeData): Promise<CritiqueResult> => {
    const response = await apiClient.post(`/critique/`, {
      resume_data: data
    });
    return response.data;
  },

  atsScore: async (data: ResumeData, jobDescription: string): Promise<ATSResult> => {
    const response = await apiClient.post(`/ats-score/`, {
      resume_data: data,
      job_description: jobDescription,
    });
    return response.data;
  },

  exportPdf: async (data: ResumeData, templateName: string = 'classic', settings?: Record<string, unknown> | null): Promise<Blob> => {
    const response = await apiClient.post(`/export-pdf/`, {
      resume_data: data,
      template_id: templateName,
      settings: settings || { font_size: 10, document_margin: 1 }
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  applySuggestion: async (sectionName: string, sectionData: unknown, suggestion: string): Promise<unknown> => {
    const response = await apiClient.post(`/apply-suggestion/`, {
      section_name: sectionName,
      section_data: sectionData,
      suggestion: suggestion,
    });
    return JSON.parse(response.data.rewritten_section_json);
  },

  parsePdf: async (file: File): Promise<{ resume_data: ResumeData; warning?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/parse-pdf/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};


