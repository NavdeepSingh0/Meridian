import axios from 'axios';
import { ResumeData } from '../types/resume';
import { ATSResult, CritiqueResult } from '../types/analysis';

// We assume the Django backend is running on 8000
const API_BASE_URL = 'http://localhost:8000/api/analysis';

export const analysisApi = {
  critique: async (data: ResumeData): Promise<CritiqueResult> => {
    const response = await axios.post(`${API_BASE_URL}/critique/`, {
      resume_data: data
    });
    return response.data;
  },

  atsScore: async (data: ResumeData, jobDescription: string): Promise<ATSResult> => {
    const response = await axios.post(`${API_BASE_URL}/ats-score/`, {
      resume_data: data,
      job_description: jobDescription,
    });
    return response.data;
  },

  exportPdf: async (data: ResumeData, templateName: string = 'classic'): Promise<Blob> => {
    const response = await axios.post(`${API_BASE_URL}/export-pdf/`, {
      resume_data: data,
      template_id: templateName,
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
};
