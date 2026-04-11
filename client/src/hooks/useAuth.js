import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return { user, isLoading, error, logout };
}
