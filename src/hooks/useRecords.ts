import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function recordsQueryKey(projectId: string, schemaVersion = 0) {
  return ['records', projectId, schemaVersion] as const;
}

export function useRecords(
  projectId: string,
  enabled = true,
  schemaVersion = 0,
  options?: { limit?: number },
) {
  const limit = options?.limit;
  return useQuery({
    queryKey: [...recordsQueryKey(projectId, schemaVersion), limit ?? null],
    queryFn: () => api.listRecords(projectId, limit ? { limit } : undefined),
    enabled,
  });
}

export function useInvalidateRecords() {
  const queryClient = useQueryClient();
  return (projectId: string, schemaVersion = 0) =>
    queryClient.invalidateQueries({ queryKey: recordsQueryKey(projectId, schemaVersion) });
}
