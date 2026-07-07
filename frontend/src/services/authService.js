import apiClient from './apiClient';

export const login = async (credentials) => {
  const response = await apiClient.post('users/login/', credentials);
  return response.data;
};

export const register = async (credentials) => {
  const response = await apiClient.post('users/registro/', credentials);
  return response.data;
};

export const solicitarCodigoRecuperacao = async (email) => {
  const response = await apiClient.post('users/recuperar-senha/solicitar/', { email });
  return response.data;
};

export const reconfirmarSenha = async (dados) => {
  const response = await apiClient.post('users/recuperar-senha/confirmar/', dados);
  return response.data;
};