import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeApi } from '../api/resumeApi';
import { ResumeData } from '../types/resume';
import { useUserStore } from '../store/userStore';

export const useResumes = () => {
  const firebaseUser = useUserStore((state) => state.firebaseUser);
  return useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.list,
    enabled: !!firebaseUser,
  });
};

export const useSaveResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, template_id, document_data, id }: { title: string; template_id: string; document_data: ResumeData; id?: number }) => {
      if (id) {
        return resumeApi.update(id, { title, template_id, document_data });
      } else {
        return resumeApi.create({ title, template_id, document_data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
};

export const useGetResume = (id?: number | null) => {
  return useQuery({
    queryKey: ['resumes', id],
    queryFn: () => resumeApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, template_id, document_data }: { title: string; template_id: string; document_data: ResumeData }) => {
      return resumeApi.create({ title, template_id, document_data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
};

export const useDuplicateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceId }: { sourceId: number }) => {
      const sourceResume = await resumeApi.get(sourceId);
      return resumeApi.create({
        title: `${sourceResume.title} (copy)`,
        template_id: sourceResume.template_id,
        document_data: sourceResume.document_data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return resumeApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
};
