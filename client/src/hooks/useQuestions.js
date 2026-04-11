import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { questionsApi } from '../api/questions';
import { queryKeys } from '../lib/queryKeys';
import { useApiMutation } from './useApiMutation';

const KEY = queryKeys.questions.all;

export function useQuestionsList(filters) {
  return useQuery({
    queryKey: queryKeys.questions.list(filters),
    queryFn: () => questionsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useQuestion(id) {
  return useQuery({
    queryKey: queryKeys.questions.detail(id),
    queryFn: () => questionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  return useApiMutation(questionsApi.create, {
    invalidateKey: KEY,
    success: '\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0633\u0624\u0627\u0644',
  });
}

export function useUpdateQuestion() {
  return useApiMutation(({ id, data }) => questionsApi.update(id, data), {
    invalidateKey: KEY,
    success: '\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0633\u0624\u0627\u0644',
  });
}

export function useDeleteQuestion() {
  return useApiMutation(questionsApi.remove, {
    invalidateKey: KEY,
    success: '\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644',
    error: '\u0641\u0634\u0644 \u0627\u0644\u062D\u0630\u0641',
  });
}

export function useToggleQuestion() {
  return useApiMutation(questionsApi.toggle, {
    invalidateKey: KEY,
    success: (data) => data.isActive ? '\u062A\u0645 \u0627\u0644\u062A\u0641\u0639\u064A\u0644' : '\u062A\u0645 \u0627\u0644\u062A\u0639\u0637\u064A\u0644',
  });
}

export function useDuplicateQuestion() {
  return useApiMutation(questionsApi.duplicate, {
    invalidateKey: KEY,
    success: '\u062A\u0645 \u0646\u0633\u062E \u0627\u0644\u0633\u0624\u0627\u0644',
  });
}

export function useUploadQuestionImage() {
  return useApiMutation(questionsApi.uploadImage, { error: '\u0641\u0634\u0644 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629' });
}

export function useUploadQuestionsExcel() {
  return useApiMutation(questionsApi.uploadExcel, {
    invalidateKey: KEY,
    success: (data) => `\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 ${data.created} \u0633\u0624\u0627\u0644`,
    error: '\u0641\u0634\u0644 \u0627\u0644\u0631\u0641\u0639',
  });
}

export function useGenerateAiQuestions() {
  return useApiMutation(questionsApi.generateAi, {
    invalidateKey: KEY,
    success: (data) => `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 ${data.created} \u0633\u0624\u0627\u0644`,
    error: '\u0641\u0634\u0644 \u0627\u0644\u062A\u0648\u0644\u064A\u062F',
  });
}
