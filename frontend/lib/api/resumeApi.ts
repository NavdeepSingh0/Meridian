import { ResumeData } from '../types/resume';
import { createApiClient } from './client';

const apiClient = createApiClient('/api/resumes');

export interface SavedResume {
  id: number;
  title: string;
  template_id: string;
  document_data: ResumeData;
  created_at: string;
  updated_at: string;
}

export interface ResumePayload {
  title: string;
  template_id: string;
  document_data: ResumeData;
}

export const resumeApi = {
  list: async (): Promise<SavedResume[]> => (await apiClient.get('/')).data,

  get: async (id: number): Promise<SavedResume> => (await apiClient.get(`/${id}/`)).data,

  create: async (data: ResumePayload): Promise<SavedResume> => (await apiClient.post('/', data)).data,

  update: async (id: number, data: Partial<ResumePayload>): Promise<SavedResume> =>
    (await apiClient.patch(`/${id}/`, data)).data,

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}/`);
  },
};
