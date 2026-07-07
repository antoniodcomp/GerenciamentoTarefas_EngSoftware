import apiClient from './apiClient';

export const login = async (credentials) => {
  const response = await apiClient.post('users/login/', credentials);
  return response.data;
};

export const register = async (credentials) => {
  const response = await apiClient.post('users/register/', credentials);
  return response.data;
};

export const solicitarCodigoRecuperacao = async (email) => {
  const response = await apiClient.post('users/password-reset/request/', { email });
  return response.data;
};

export const reconfirmarSenha = async (dados) => {
  const response = await apiClient.post('users/password-reset/confirm/', dados);
  return response.data;
};

export const getPerfil = async () => {
  const response = await apiClient.get('users/profile/');
  return response.data;
};

export const atualizarPerfil = async (profileData) => {
  const response = await apiClient.patch('users/profile/', profileData);
  return response.data;
};

export const alterarSenha = async (passwordData) => {
  const response = await apiClient.post('users/profile/change-password/', passwordData);
  return response.data;
};

export const getUsuarios = async () => {
  const response = await apiClient.get('users/list/');
  return response.data;
};

export const atualizarTipoUsuario = async (userId, role) => {
  const response = await apiClient.patch(`users/${userId}/role/`, { role });
  return response.data;
};