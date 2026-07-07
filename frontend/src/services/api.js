import axios from 'axios';

// Criação da instância do Axios apontando para a API do Django
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Interceptor para injetar o Token JWT automaticamente em cada requisição
api.interceptors.request.use(
  (config) => {
    // Lista de endpoints públicos que não devem enviar o Token de Authorization
    const publicUrls = [
      'users/login/',
      'users/registro/',
      'users/recuperar-senha/solicitar/',
      'users/recuperar-senha/confirmar/'
    ];
    const isPublic = publicUrls.some(url => config.url && config.url.endsWith(url));

    if (!isPublic) {
      // Busca o token salvo no localStorage do navegador
      const token = localStorage.getItem('token');
      
      if (token) {
        // Configura o cabeçalho Authorization exigido pela API
        config.headers.Authorization = `Bearer ${token}`;
      }
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

// Requisição GET para obter os dados do dashboard de um projeto
export const getProjectDashboard = async (projectId) => {
  const response = await api.get(`projects/${projectId}/dashboard/`);
  return response.data;
};

// Requisição POST para criar uma nova tarefa (UC15)
export const createProjectTarefa = async (taskData) => {
  const response = await api.post('tasks/', taskData);
  return response.data;
};

// Requisição GET para obter detalhes de uma única tarefa
export const getTaskDetails = async (taskId) => {
  const response = await api.get(`tasks/${taskId}/`);
  return response.data;
};

// Requisição PATCH para atualizar o status de uma tarefa
export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`tasks/${taskId}/`, { status });
  return response.data;
};

// Requisição POST para criar uma nova subtarefa (UC28)
export const createSubtask = async (subtaskData) => {
  const response = await api.post('subtasks/', subtaskData);
  return response.data;
};

// Requisição PATCH para atualizar o status de uma subtarefa
export const updateSubtaskStatus = async (subtaskId, status) => {
  const response = await api.patch(`subtasks/${subtaskId}/`, { status });
  return response.data;
};

// Requisição POST para criar um comentário na tarefa (UC24)
export const createTaskComment = async (commentData) => {
  const response = await api.post('comments/', commentData);
  return response.data;
};

export const uploadTaskAttachment = async (formData) => {
  const response = await api.post('attachments/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('users/login/', credentials);
  return response.data;
};

export const register = async (credentials) => {
  const response = await api.post('users/registro/', credentials);
  return response.data;
};

export const solicitarCodigoRecuperacao = async (email) => {
  const response = await api.post('users/recuperar-senha/solicitar/', { email });                                                                                 
  return response.data;                                                                                                                                           
};                                                                                                                                                                
                                                                                                                                                                      
export const reconfirmarSenha = async (dados) => {
  const response = await api.post('users/recuperar-senha/confirmar/', dados);                                                                                     
  return response.data;                                                                                                                                           
};  

export const getPerfil = async () => {
  const response = await api.get('users/perfil/');
  return response.data;
};

export const alterarSenha = async (dados) => {
  const response = await api.post('users/perfil/alterar-senha/', dados);
  return response.data;
};

export const getUsuarios = async () => {
  const response = await api.get('users/lista/');
  return response.data;
};

export const atualizarTipoUsuario = async (userId, tipo) => {
  const response = await api.patch(`users/${userId}/tipo/`, { tipo });
  return response.data;
};

export const atualizarPerfil = async (dados) => {
  const response = await api.patch('users/perfil/', dados);
  return response.data;
};

export default api;
