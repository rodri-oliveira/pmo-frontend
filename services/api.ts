// Base do serviço de API
// Use a window.location.origin to make the URL absolute
const API_BASE_URL = '/backend/v1';

// Função para obter o token de autenticação (pode ser adaptada conforme sua implementação)
const getAuthToken = () => {
  // Obtenha o token do localStorage ou de outro local de armazenamento
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Interface para parâmetros de consulta genéricos
interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Função para construir URL com parâmetros de consulta
const buildUrl = (endpoint: string, params?: QueryParams) => {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  } catch (error) {
    console.error('Error building URL:', error);
    // Fallback to simple string concatenation if URL constructor fails
    let urlString = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      urlString += `?${queryParams.toString()}`;
    }
    return urlString;
  }
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
  const response = await fetch(buildUrl(endpoint), {
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
  const response = await fetch(buildUrl(endpoint), {
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
  const response = await fetch(buildUrl(endpoint), {
    method: 'DELETE',
    headers: authHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }
  
  return response.json();
};

// O restante do arquivo permanece o mesmo