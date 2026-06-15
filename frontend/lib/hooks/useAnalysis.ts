import { useMutation } from '@tanstack/react-query';
import { analysisApi } from '../api/analysisApi';
import { ResumeData } from '../types/resume';

export const useCritique = () => {
  return useMutation({
    mutationFn: (resumeData: ResumeData) => analysisApi.critique(resumeData),
  });
};

export const useAtsScore = () => {
  return useMutation({
    mutationFn: ({ resumeData, jobDescription }: { resumeData: ResumeData; jobDescription: string }) => 
      analysisApi.atsScore(resumeData, jobDescription),
  });
};

export const useExportPdf = () => {
  return useMutation({
    mutationFn: ({ resumeData, templateName }: { resumeData: ResumeData; templateName: string }) => 
      analysisApi.exportPdf(resumeData, templateName),
  });
};

export const useApplySuggestion = () => {
  return useMutation({
    mutationFn: ({ sectionName, sectionData, suggestion }: { sectionName: string; sectionData: any; suggestion: string }) => 
      analysisApi.applySuggestion(sectionName, sectionData, suggestion),
  });
};
