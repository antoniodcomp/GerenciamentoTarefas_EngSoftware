import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject, updateProject, deleteProject } from '../services/projectService';

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

export const useUpdateProjeto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }) => updateProject(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      queryClient.invalidateQueries({ queryKey: ['projectDashboard'] });
    },
  });
};

export const useDeleteProjeto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      console.log("Projeto excluido com sucesso");
      queryClient.invalidateQueries({ queryKey:['projetos'] });
    }
  })
};
