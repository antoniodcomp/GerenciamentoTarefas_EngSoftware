import apiClient from './apiClient';

// Requisição GET para listar os projetos
export const getProjects = async () => {
  const response = await apiClient.get('projects/');
  return response.data;
};

// Requisição POST para criar um novo projeto
export const createProject = async (projectData) => {
  const response = await apiClient.post('projects/', projectData);
  return response.data;
};

// Requisição GET para obter os dados do dashboard de um projeto
export const getProjectDashboard = async (projectId) => {
  const response = await apiClient.get(`projects/${projectId}/dashboard/`);
  return response.data;
};

// Requisição PATCH para atualizar um projeto (ex: adicionar membros)
export const updateProject = async (projectId, projectData) => {
  const response = await apiClient.patch(`projects/${projectId}/`, projectData);
  return response.data;
};