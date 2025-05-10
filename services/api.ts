// Base do serviço de API
const API_BASE_URL = 'http://localhost:8000/backend/v1';

// Função para obter o token de autenticação (pode ser adaptada conforme sua implementação)
const getAuthToken = () => {
  // Obtenha o token do localStorage ou de outro local de armazenamento
  return localStorage.getItem('authToken');
};

// Interface para parâmetros de consulta genéricos
interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Função para construir URL com parâmetros de consulta
const buildUrl = (endpoint: string, params?: QueryParams) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
};

// Configuração padrão para requisições
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Configuração com autenticação
const authHeaders = () => ({
  ...defaultHeaders,
  'Authorization': `Bearer ${getAuthToken()}`,
});

// Função genérica para requisições GET
export const apiGet = async <T>(endpoint: string, params?: QueryParams): Promise<T> => {
  const response = await fetch(buildUrl(endpoint, params), {
    method: 'GET',
    headers: authHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  
  return response.json();
};

// Função genérica para requisições POST
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  
  return response.json();
};

// Função genérica para requisições PUT
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  
  return response.json();
};

// Função genérica para requisições DELETE
export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  
  return response.json();
};

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Restante da função permanece o mesmo
  // ...
} 