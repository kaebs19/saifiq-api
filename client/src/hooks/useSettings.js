import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/settings';
import { useApiMutation } from './useApiMutation';

const SETTINGS_KEY = ['settings'];
const ADMINS_KEY = ['settings', 'admins'];

export function useSettings() {
  return useQuery({ queryKey: SETTINGS_KEY, queryFn: settingsApi.getAll });
}

export function useUpdateSetting() {
  return useApiMutation(({ key, value }) => settingsApi.set(key, value), {
    invalidateKey: SETTINGS_KEY,
    success: '\u062A\u0645 \u0627\u0644\u062D\u0641\u0638',
  });
}

export function useAdmins() {
  return useQuery({ queryKey: ADMINS_KEY, queryFn: settingsApi.listAdmins });
}

export function useCreateAdmin() {
  return useApiMutation(settingsApi.createAdmin, {
    invalidateKey: ADMINS_KEY,
    success: '\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0623\u062F\u0645\u0646',
    error: '\u0641\u0634\u0644 \u0627\u0644\u0625\u0646\u0634\u0627\u0621',
  });
}

export function useRemoveAdmin() {
  return useApiMutation(settingsApi.removeAdmin, {
    invalidateKey: ADMINS_KEY,
    success: '\u062A\u0645 \u0627\u0644\u062D\u0630\u0641',
    error: '\u0641\u0634\u0644 \u0627\u0644\u062D\u0630\u0641',
  });
}
