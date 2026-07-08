import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject } from '../services/projectService';

export const useProjetos = () => {
  return useQuery({
    queryKey: ['projetos'],
    queryFn: getProjects,
  });
};

export const useCreateProjeto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
    },
  });
};
