import axios from 'axios';
import { ResumeData } from '../types/resume';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/resumes`
  : 'http://localhost:8000/api/resumes';

// Axios instance with credentials to send session cookies
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface SavedResume {
  id: number;
  title: string;
  template_id: string;
  document_data: ResumeData;
  created_at: string;
  updated_at: string;
}

export const resumeApi = {
  // List all resumes for the current session
  list: async (): Promise<SavedResume[]> => {
    const response = await apiClient.get('/');
    return response.data;
  },

  // Get a specific resume
  get: async (id: number): Promise<SavedResume> => {
    const response = await apiClient.get(`/${id}/`);
    return response.data;
  },

  // Create a new resume
  create: async (data: { title: string; template_id: string; document_data: ResumeData }): Promise<SavedResume> => {
    const response = await apiClient.post('/', data);
    return response.data;
  },

  // Update an existing resume
  update: async (id: number, data: { title?: string; template_id?: string; document_data?: ResumeData }): Promise<SavedResume> => {
    const response = await apiClient.patch(`/${id}/`, data);
    return response.data;
  },

  // Delete a resume
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}/`);
  }
};
