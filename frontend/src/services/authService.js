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