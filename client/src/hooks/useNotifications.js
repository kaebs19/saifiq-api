import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';
import { useApiMutation } from './useApiMutation';

const KEY = ['notifications'];

export function useNotificationsList(filters) {
  return useQuery({
    queryKey: [...KEY, 'list', filters],
    queryFn: () => notificationsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useSendNotification() {
  return useApiMutation(notificationsApi.send, {
    invalidateKey: KEY,
    success: '\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631',
    error: '\u0641\u0634\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644',
  });
}

export function useBroadcastNotification() {
  return useApiMutation(notificationsApi.broadcast, {
    invalidateKey: KEY,
    success: (data) => `\u062A\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u0644\u0640 ${data.count} \u0644\u0627\u0639\u0628`,
    error: '\u0641\u0634\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644',
  });
}
