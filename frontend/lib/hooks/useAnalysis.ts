import { useMutation } from '@tanstack/react-query';
import { analysisApi, ExportSettings, GenerateKind } from '../api/analysisApi';
import { ResumeData } from '../types/resume';
import { useUserStore } from '../store/userStore';

/** AI calls cost a credit: reflect it instantly, then sync the real balance from the server. */
const syncCredits = () => {
  const { decrementCredit, fetchProfile } = useUserStore.getState();
  decrementCredit();
  void fetchProfile();
};

/** On failure the server refunds the credit; re-sync so the displayed balance is correct either way. */
const resyncCredits = () => void useUserStore.getState().fetchProfile();

export const useCritique = () =>
  useMutation({
    mutationFn: (resumeData: ResumeData) => analysisApi.critique(resumeData),
    onSuccess: syncCredits,
    onError: resyncCredits,
  });

export const useAtsScore = () =>
  useMutation({
    mutationFn: ({ resumeData, jobDescription }: { resumeData: ResumeData; jobDescription: string }) =>
      analysisApi.atsScore(resumeData, jobDescription),
    onSuccess: syncCredits,
    onError: resyncCredits,
  });

export const useExportPdf = () =>
  useMutation({
    mutationFn: ({
      resumeData,
      templateName,
      settings,
    }: {
      resumeData: ResumeData;
      templateName: string;
      settings?: ExportSettings;
    }) => analysisApi.exportPdf(resumeData, templateName, settings),
  });

export const useApplySuggestion = () =>
  useMutation({
    mutationFn: ({ sectionName, sectionData, suggestion }: { sectionName: string; sectionData: unknown; suggestion: string }) =>
      analysisApi.applySuggestion(sectionName, sectionData, suggestion),
    onSuccess: syncCredits,
    onError: resyncCredits,
  });

export const useParsePdf = () =>
  useMutation({
    mutationFn: (file: File) => analysisApi.parsePdf(file),
    onSuccess: syncCredits,
    onError: resyncCredits,
  });

export const useGenerateText = () =>
  useMutation({
    mutationFn: ({
      kind,
      resume,
      jobDescription,
      context,
    }: {
      kind: GenerateKind;
      resume: ResumeData;
      jobDescription: string;
      context?: unknown;
    }) => analysisApi.generateText(kind, resume, jobDescription, context),
    onSuccess: syncCredits,
    onError: resyncCredits,
  });
