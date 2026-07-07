import { useQuery } from '@tanstack/react-query';
import { getProjectDashboard } from '../services/api';
import { Tarefa } from '../types';

/**
 * Hook customizado para buscar a lista de tarefas de um projeto específico.
 * Utiliza o React Query (TanStack) para cache, refetching e estados de loading.
 * 
 * @param projetoId ID do projeto
 * @returns { data: Tarefa[], isLoading, isError, error }
 */
export function useTarefas(projetoId: number) {
  return useQuery<Tarefa[], Error>({
    queryKey: ['tarefas', 'projeto', projetoId],
    queryFn: async () => {
      // Como o backend atual retorna as tarefas dentro do objeto de dashboard,
      // nós extraímos a propriedade "all_tasks" para retornar apenas a lista de tarefas tipada.
      const response = await getProjectDashboard(projetoId);
      return response.all_tasks as Tarefa[];
    },
    // Define o tempo que os dados são considerados "frescos" no cache (5 minutos)
    staleTime: 1000 * 60 * 5,
    // A query só será disparada se o projetoId for válido
    enabled: !!projetoId,
  });
}
