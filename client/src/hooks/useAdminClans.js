import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminClansApi } from '../api/adminClans';
import { useApiMutation } from './useApiMutation';

const KEY = ['adminClans'];

export function useClansSearch(filters) {
  return useQuery({
    queryKey: [...KEY, 'search', filters],
    queryFn: () => adminClansApi.search(filters),
    placeholderData: keepPreviousData,
  });
}

export function useClansLeaderboard(limit = 50) {
  return useQuery({
    queryKey: [...KEY, 'leaderboard', limit],
    queryFn: () => adminClansApi.getLeaderboard(limit),
  });
}

export function useClan(id) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => adminClansApi.get(id),
    enabled: !!id,
  });
}

export function useClanMembers(id, filters) {
  return useQuery({
    queryKey: [...KEY, 'members', id, filters],
    queryFn: () => adminClansApi.getMembers(id, filters),
    enabled: !!id,
  });
}

export function useClanMessages(id) {
  return useQuery({
    queryKey: [...KEY, 'messages', id],
    queryFn: () => adminClansApi.getMessages(id, { limit: 50 }),
    enabled: !!id,
  });
}

export function useDeleteClan() {
  return useApiMutation(
    (id) => adminClansApi.delete(id),
    { invalidateKey: KEY, success: 'تم حذف العشيرة' }
  );
}
