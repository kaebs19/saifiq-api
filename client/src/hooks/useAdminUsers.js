import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { adminUsersApi } from '../api/adminUsers';
import { useApiMutation } from './useApiMutation';

const KEY = ['adminUsers'];

export function useUserSearch(q) {
  return useQuery({
    queryKey: [...KEY, 'search', q],
    queryFn: () => adminUsersApi.search(q),
    enabled: !!q && q.length >= 2,
    placeholderData: keepPreviousData,
  });
}

export function useAuditLog(filters) {
  return useQuery({
    queryKey: [...KEY, 'audit', filters],
    queryFn: () => adminUsersApi.getAuditLog(filters),
    placeholderData: keepPreviousData,
  });
}

export function useGrantCurrency() {
  return useApiMutation(
    ({ userId, data }) => adminUsersApi.grant(userId, data),
    {
      invalidateKey: KEY,
      success: (data) => {
        const label = data.currency === 'gold' ? 'ذهب' : 'جوهرة';
        const action = data.amount > 0 ? 'إضافة' : 'خصم';
        return `تمت ${action} ${Math.abs(data.amount)} ${label}`;
      },
    }
  );
}
