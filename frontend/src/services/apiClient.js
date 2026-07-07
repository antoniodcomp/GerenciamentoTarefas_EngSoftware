import axios from 'axios';

// Criação da instância do Axios apontando para a API do Django
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Interceptor para injetar o Token JWT automaticamente em cada requisição
apiClient.interceptors.request.use(
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

export default apiClient;