import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '../api/questions';
import { queryKeys } from '../lib/queryKeys';

export function useCategoryConfig() {
  return useQuery({
    queryKey: queryKeys.questions.categoryConfig,
    queryFn: questionsApi.getCategoryConfig,
    staleTime: Infinity,
  });
}
