import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { storeApi } from '../api/store';
import { useApiMutation } from './useApiMutation';

const ITEMS_KEY = ['store', 'items'];

export function useItems() {
  return useQuery({ queryKey: ITEMS_KEY, queryFn: storeApi.listItems });
}

export function useUpdateItem() {
  return useApiMutation(({ id, data }) => storeApi.updateItem(id, data), {
    invalidateKey: ITEMS_KEY,
    success: '\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B',
  });
}

export function useToggleItem() {
  return useApiMutation(storeApi.toggleItem, { invalidateKey: ITEMS_KEY });
}

export function useTransactions(filters) {
  return useQuery({
    queryKey: ['store', 'transactions', filters],
    queryFn: () => storeApi.listTransactions(filters),
    placeholderData: keepPreviousData,
  });
}
