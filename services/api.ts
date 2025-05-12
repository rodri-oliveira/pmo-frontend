// Base do serviço de API
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
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Classe de erro personalizada para erros de API
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Função para construir URL com parâmetros de consulta
const buildUrl = (endpoint: string, params?: QueryParams) => {
  // Garantimos que sempre retornamos um caminho relativo
  let path = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;
  
  if (params) {
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    if (queryParams) {
      path += path.includes('?') ? `&${queryParams}` : `?${queryParams}`;
    }
  }
  
  return path;
};

// Função para lidar com erros de resposta
const handleResponseError = async (response: Response, endpoint: string) => {
  if (!response.ok) {
    // Tentar obter detalhes do erro da resposta JSON, se disponível
    let errorMessage = `Erro na requisição: ${response.status}`;
    let errorData = null;
    
    try {
      errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Se não conseguir ler o JSON, usa a mensagem padrão
    }
    
    // Verificar se é um erro de CORS
    if (response.status === 0 || response.type === 'opaque' || response.status === 520) {
      console.error('Possível erro de CORS detectado:', endpoint);
      throw new ApiError('Erro de conexão com o servidor. Possível problema de CORS.', response.status);
    }
    
    throw new ApiError(errorMessage, response.status);
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
  try {
    const url = buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(),
      credentials: 'same-origin' // Usar same-origin para garantir que os cookies sejam enviados apenas para o mesmo domínio
    });
    
    await handleResponseError(response, endpoint);
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Erro ao fazer requisição GET para ${endpoint}:`, error);
    throw new ApiError(`Falha ao obter dados de ${endpoint}`, 500);
  }
};

// Função genérica para requisições POST
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const url = buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });
    
    await handleResponseError(response, endpoint);
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Erro ao fazer requisição POST para ${endpoint}:`, error);
    throw new ApiError(`Falha ao enviar dados para ${endpoint}`, 500);
  }
};

// Função genérica para requisições PUT
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const url = buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });
    
    await handleResponseError(response, endpoint);
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Erro ao fazer requisição PUT para ${endpoint}:`, error);
    throw new ApiError(`Falha ao atualizar dados em ${endpoint}`, 500);
  }
};

// Função genérica para requisições DELETE
export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  try {
    const url = buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'same-origin',
    });
    
    await handleResponseError(response, endpoint);
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Erro ao fazer requisição DELETE para ${endpoint}:`, error);
    throw new ApiError(`Falha ao excluir dados em ${endpoint}`, 500);
  }
};

// Função para verificar se a API está acessível
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    // Tenta fazer uma requisição simples para verificar a conexão
    const url = buildUrl('/health-check');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders,
      credentials: 'same-origin',
      // Define um timeout curto para não bloquear a UI
      signal: AbortSignal.timeout(5000)
    });
    
    return response.ok;
  } catch (error) {
    console.warn('API não está acessível:', error);
    return false;
  }
};