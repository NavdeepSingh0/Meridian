import { ResumeData } from '../types/resume';
import { ATSResult, CritiqueResult } from '../types/analysis';
import { createApiClient } from './client';

const apiClient = createApiClient('/api/analysis');

export interface ExportSettings {
  font_size: number;
  document_margin: number;
}

export type GenerateKind = 'summary' | 'bullet';

export const analysisApi = {
  critique: async (data: ResumeData): Promise<CritiqueResult> =>
    (await apiClient.post('/critique/', { resume_data: data })).data,

  atsScore: async (data: ResumeData, jobDescription: string): Promise<ATSResult> =>
    (await apiClient.post('/ats-score/', { resume_data: data, job_description: jobDescription })).data,

  exportPdf: async (
    data: ResumeData,
    templateName: string = 'classic',
    settings: ExportSettings = { font_size: 10, document_margin: 1 },
  ): Promise<Blob> =>
    (
      await apiClient.post(
        '/export-pdf/',
        { resume_data: data, template_id: templateName, settings },
        { responseType: 'blob' },
      )
    ).data,

  applySuggestion: async (sectionName: string, sectionData: unknown, suggestion: string): Promise<unknown> => {
    const response = await apiClient.post('/apply-suggestion/', {
      section_name: sectionName,
      section_data: sectionData,
      suggestion,
    });
    return JSON.parse(response.data.rewritten_section_json);
  },

  parsePdf: async (file: File): Promise<{ resume_data: ResumeData; warning?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    // Let the browser set the multipart boundary; do not set Content-Type manually.
    return (await apiClient.post('/parse-pdf/', formData)).data;
  },

  generateText: async (kind: GenerateKind, resume: ResumeData, jobDescription: string, context?: unknown): Promise<string> =>
    (await apiClient.post('/generate/', { kind, resume_data: resume, job_description: jobDescription, context })).data.text,
};
