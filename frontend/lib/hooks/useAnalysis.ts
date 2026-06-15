import { useMutation } from '@tanstack/react-query';
import { analysisApi } from '../api/analysisApi';
import { ResumeData } from '../types/resume';

export const useCritique = () => {
  return useMutation({
    mutationFn: (data: ResumeData) => analysisApi.critique(data),
  });
};

export const useAtsScore = () => {
  return useMutation({
    mutationFn: ({ resume, jobDescription }: { resume: ResumeData; jobDescription: string }) => 
      analysisApi.atsScore(resume, jobDescription),
  });
};

export const useExportPdf = () => {
  return useMutation({
    mutationFn: ({ resume, templateName }: { resume: ResumeData; templateName: string }) => 
      analysisApi.exportPdf(resume, templateName),
  });
};
