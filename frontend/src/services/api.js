import axios from 'axios';

// Criação da instância do Axios apontando para a API do Django
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Interceptor para injetar o Token JWT automaticamente em cada requisição
api.interceptors.request.use(
  (config) => {
    // Busca o token salvo no localStorage do navegador
    const token = localStorage.getItem('token');
    
    if (token) {
      // Configura o cabeçalho Authorization exigido pela API
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Requisição GET para listar os projetos
export const getProjects = async () => {
  const response = await api.get('projects/');
  return response.data;
};

// Requisição POST para criar um novo projeto
export const createProject = async (projectData) => {
  const response = await api.post('projects/', projectData);
  return response.data;
};

export default api;
