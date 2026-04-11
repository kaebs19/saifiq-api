import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats';

export function useOverview() {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: statsApi.overview,
    staleTime: 60 * 1000,
  });
}

export function useTopPlayers(limit = 10) {
  return useQuery({
    queryKey: ['stats', 'topPlayers', limit],
    queryFn: () => statsApi.topPlayers(limit),
    staleTime: 60 * 1000,
  });
}

export function useDailyChart(days = 7) {
  return useQuery({
    queryKey: ['stats', 'dailyChart', days],
    queryFn: () => statsApi.dailyChart(days),
    staleTime: 60 * 1000,
  });
}
