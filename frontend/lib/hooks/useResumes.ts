import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeApi, ResumePayload, SavedResume } from '../api/resumeApi';
import { initialResumeData } from '../store/resumeStore';
import { useUserStore } from '../store/userStore';

export const resumeKeys = {
  list: ['resumes', 'list'] as const,
  detail: (id: number) => ['resumes', 'detail', id] as const,
};

/** All of the signed-in user's resumes, newest first. */
export const useResumes = () => {
  const firebaseUser = useUserStore((state) => state.firebaseUser);
  return useQuery({
    queryKey: resumeKeys.list,
    queryFn: resumeApi.list,
    enabled: !!firebaseUser,
  });
};

/**
 * A single resume for the builder to load. Deliberately never served from
 * cache (gcTime 0): the builder copies it into the editor store once, so a
 * stale cached copy would silently load old content.
 */
export const useGetResume = (id: number | null) => {
  const firebaseUser = useUserStore((state) => state.firebaseUser);
  return useQuery({
    queryKey: resumeKeys.detail(id ?? -1),
    queryFn: () => resumeApi.get(id!),
    enabled: id !== null && !!firebaseUser,
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: (count, err) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      return status !== 404 && status !== 403 && count < 2;
    },
  });
};

/** Create (id omitted) or update (id given) a resume. Used by "Save to cloud". */
export const useSaveResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ResumePayload & { id?: number }) =>
      id ? resumeApi.update(id, payload) : resumeApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.list });
    },
  });
};

export const emptyResumePayload = (title = 'Untitled'): ResumePayload => ({
  title,
  template_id: 'modern',
  document_data: JSON.parse(JSON.stringify(initialResumeData)),
});

export const useCreateResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: ResumePayload) => resumeApi.create(payload ?? emptyResumePayload()),
    onSuccess: (created) => {
      queryClient.setQueryData<SavedResume[]>(resumeKeys.list, (old) => (old ? [created, ...old] : [created]));
    },
  });
};

/** Rename (or change any metadata of) a resume, optimistically updating the list. */
export const useUpdateResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number } & Partial<ResumePayload>) => resumeApi.update(id, patch),
    onMutate: async ({ id, ...patch }) => {
      await queryClient.cancelQueries({ queryKey: resumeKeys.list });
      const previous = queryClient.getQueryData<SavedResume[]>(resumeKeys.list);
      queryClient.setQueryData<SavedResume[]>(resumeKeys.list, (old) =>
        old?.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(resumeKeys.list, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: resumeKeys.list }),
  });
};

/**
 * Duplicate a resume. The source is taken from the already-loaded list so no
 * extra request is needed, and a temporary card appears immediately.
 */
export const useDuplicateResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (source: SavedResume) =>
      resumeApi.create({
        title: `${source.title || 'Untitled'} (copy)`,
        template_id: source.template_id,
        document_data: source.document_data,
      }),
    onMutate: async (source) => {
      await queryClient.cancelQueries({ queryKey: resumeKeys.list });
      const previous = queryClient.getQueryData<SavedResume[]>(resumeKeys.list);
      const now = new Date().toISOString();
      const optimistic: SavedResume = {
        ...source,
        id: -Date.now(), // temporary negative id, replaced when the list refetches
        title: `${source.title || 'Untitled'} (copy)`,
        created_at: now,
        updated_at: now,
      };
      queryClient.setQueryData<SavedResume[]>(resumeKeys.list, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(resumeKeys.list, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: resumeKeys.list }),
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => resumeApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: resumeKeys.list });
      const previous = queryClient.getQueryData<SavedResume[]>(resumeKeys.list);
      queryClient.setQueryData<SavedResume[]>(resumeKeys.list, (old) => old?.filter((r) => r.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(resumeKeys.list, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: resumeKeys.list }),
  });
};
