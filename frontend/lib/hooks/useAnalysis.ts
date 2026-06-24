import { useMutation } from '@tanstack/react-query';
import { analysisApi } from '../api/analysisApi';
import { ResumeData } from '../types/resume';
import { useUserStore } from '../store/userStore';

export const useCritique = () => {
  return useMutation({
    mutationFn: (resumeData: ResumeData) => analysisApi.critique(resumeData),
    onSuccess: () => {
      useUserStore.getState().decrementCredit();
    }
  });
};

export const useAtsScore = () => {
  return useMutation({
    mutationFn: ({ resumeData, jobDescription }: { resumeData: ResumeData; jobDescription: string }) => 
      analysisApi.atsScore(resumeData, jobDescription),
    onSuccess: () => {
      useUserStore.getState().decrementCredit();
    }
  });
};

export const useExportPdf = () => {
  return useMutation({
    mutationFn: ({ resumeData, templateName, settings }: { resumeData: ResumeData; templateName: string; settings?: any }) => 
      analysisApi.exportPdf(resumeData, templateName, settings),
  });
};

export const useApplySuggestion = () => {
  return useMutation({
    mutationFn: ({ sectionName, sectionData, suggestion }: { sectionName: string; sectionData: any; suggestion: string }) => 
      analysisApi.applySuggestion(sectionName, sectionData, suggestion),
    onSuccess: () => {
      useUserStore.getState().decrementCredit();
    }
  });
};
export const useParsePdf = () => {
  return useMutation({
    mutationFn: (file: File) => analysisApi.parsePdf(file),
    onSuccess: () => {
      useUserStore.getState().decrementCredit();
    }
  });
};
