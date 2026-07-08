import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export const useUsuarios = () => {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await apiClient.get('users/list/');
      return response.data;
    },
  });
};
