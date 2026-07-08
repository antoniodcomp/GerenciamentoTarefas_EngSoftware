import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectDashboard } from '../services/projectService';
import { 
  getTaskDetails, 
  createProjectTarefa, 
  updateTaskStatus,
  createSubtask,
  uploadTaskAttachment,
  createTaskComment,
  updateSubtaskStatus
} from '../services/taskService';

// ==========================================
// QUERIES
// ==========================================

export function useProjectDashboard(projectId) {
  return useQuery({
    queryKey: ['projectDashboard', projectId],
    queryFn: () => getProjectDashboard(projectId),
    staleTime: 1000 * 60 * 5,
    enabled: !!projectId,
  });
}

export function useTaskDetails(taskId) {
  return useQuery({
    queryKey: ['taskDetails', taskId],
    queryFn: () => getTaskDetails(taskId),
    staleTime: 1000 * 60 * 5,
    enabled: !!taskId,
  });
}

// Mantendo o useTarefas original caso esteja sendo usado por outros componentes.
export function useTarefas(projetoId) {
  return useQuery({
    queryKey: ['projectDashboard', projetoId],
    queryFn: () => getProjectDashboard(projetoId),
    select: (data) => data.all_tasks || [],
    staleTime: 1000 * 60 * 5,
    enabled: !!projetoId,
  });
}

// ==========================================
// MUTATIONS
// ==========================================

export function useCreateTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createProjectTarefa(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectDashboard', variables.project] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, newStatus }) => updateTaskStatus(taskId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['taskDetails'] });
    },
  });
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createSubtask(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskDetails', variables.task] });
    },
  });
}

export function useUploadTaskAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => uploadTaskAttachment(formData),
    onSuccess: (_, formData) => {
      const taskId = formData.get('task');
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ['taskDetails', taskId] });
      }
    },
  });
}

export function useCreateTaskComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createTaskComment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taskDetails', variables.task] });
    },
  });
}

export function useUpdateSubtaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subtaskId, newStatus }) => updateSubtaskStatus(subtaskId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskDetails'] });
    },
  });
}
