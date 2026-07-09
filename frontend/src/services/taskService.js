import apiClient from './apiClient';

// Requisição POST para criar uma nova tarefa (UC15)
export const createProjectTarefa = async (taskData) => {
  const response = await apiClient.post('tasks/', taskData);
  return response.data;
};

// Requisição GET para obter detalhes de uma única tarefa
export const getTaskDetails = async (taskId) => {
  const response = await apiClient.get(`tasks/${taskId}/`);
  return response.data;
};

// Requisição PATCH para atualizar o status de uma tarefa
export const updateTaskStatus = async (taskId, status) => {
  const response = await apiClient.patch(`tasks/${taskId}/`, { status });
  return response.data;
};

// Requisição POST para criar uma nova subtarefa (UC28)
export const createSubtask = async (subtaskData) => {
  const response = await apiClient.post('subtasks/', subtaskData);
  return response.data;
};

// Requisição PATCH para atualizar o status de uma subtarefa
export const updateSubtaskStatus = async (subtaskId, status) => {
  const response = await apiClient.patch(`subtasks/${subtaskId}/`, { status });
  return response.data;
};

// Requisição POST para criar um comentário na tarefa (UC24)
export const createTaskComment = async (commentData) => {
  const response = await apiClient.post('comments/', commentData);
  return response.data;
};

export const uploadTaskAttachment = async (formData) => {
  const response = await apiClient.post('attachments/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateTaskAssignees = async (taskId, userIds) => {
  const response = await apiClient.patch(`tasks/${taskId}/`, { participantes: userIds });
  return response.data;
};