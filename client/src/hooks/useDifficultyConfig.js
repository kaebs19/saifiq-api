import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '../api/questions';
import { queryKeys } from '../lib/queryKeys';

export function useDifficultyConfig() {
  return useQuery({
    queryKey: queryKeys.questions.difficultyConfig,
    queryFn: questionsApi.getDifficultyConfig,
    staleTime: Infinity,
  });
}
