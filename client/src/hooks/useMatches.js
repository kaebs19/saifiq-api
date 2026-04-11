import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';

export function useMatchesList(filters) {
  return useQuery({
    queryKey: ['matches', 'list', filters],
    queryFn: () => matchesApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useMatch(id) {
  return useQuery({
    queryKey: ['matches', 'detail', id],
    queryFn: () => matchesApi.get(id),
    enabled: !!id,
  });
}
