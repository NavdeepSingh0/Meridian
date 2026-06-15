import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeApi } from '../api/resumeApi';
import { ResumeData } from '../types/resume';

export const useResumes = () => {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.list,
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
