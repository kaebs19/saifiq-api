import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { playersApi } from '../api/players';
import { useApiMutation } from './useApiMutation';

const KEY = ['players'];

export function usePlayersList(filters) {
  return useQuery({
    queryKey: [...KEY, 'list', filters],
    queryFn: () => playersApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePlayer(id) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => playersApi.get(id),
    enabled: !!id,
  });
}

export function usePlayerMatches(id, filters) {
  return useQuery({
    queryKey: [...KEY, 'matches', id, filters],
    queryFn: () => playersApi.getMatches(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

export function usePlayerTransactions(id, filters) {
  return useQuery({
    queryKey: [...KEY, 'transactions', id, filters],
    queryFn: () => playersApi.getTransactions(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateGems() {
  return useApiMutation(
    ({ id, data }) => playersApi.updateGems(id, data),
    { invalidateKey: KEY, success: '\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062C\u0648\u0627\u0647\u0631' }
  );
}

export function useToggleBan() {
  return useApiMutation(
    ({ id, isBanned }) => playersApi.setBan(id, isBanned),
    {
      invalidateKey: KEY,
      success: (_, vars) => vars.isBanned ? '\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u0644\u0627\u0639\u0628' : '\u062A\u0645 \u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631',
    }
  );
}
