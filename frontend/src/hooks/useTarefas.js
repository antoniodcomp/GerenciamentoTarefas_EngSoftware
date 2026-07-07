import { useQuery } from '@tanstack/react-query';
import { getProjectDashboard } from '../services/api';

/**
 * Hook customizado para buscar a lista de tarefas de um projeto específico.
 * Utiliza o React Query (TanStack) para cache, refetching e estados de loading.
 */
export function useTarefas(projetoId) {
  return useQuery({
    queryKey: ['tarefas', 'projeto', projetoId],
    queryFn: async () => {
      const response = await getProjectDashboard(projetoId);
      return response.all_tasks;
    },
    // Define o tempo que os dados são considerados "frescos" no cache (5 minutos)
    staleTime: 1000 * 60 * 5,
    // A query só será disparada se o projetoId for válido
    enabled: !!projetoId,
  });
}
