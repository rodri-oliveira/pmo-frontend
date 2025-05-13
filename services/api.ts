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
  // Remover qualquer domínio completo (http:// ou https://)
  let path = endpoint;
  if (path.includes('://')) {
    const url = new URL(path);
    path = url.pathname + url.search;
  }
  
  // Garantir que o caminho é relativo e começa com /backend/
  if (!path.startsWith('/backend/')) {
    // Se não começa com uma barra, adicionar
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Se não começa com /backend/v1, adicionar
    if (!path.startsWith('/backend/v1')) {
      path = '/backend/v1' + path;
    }
  }
  
  // Adicionar parâmetros de consulta
  if (params) {
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    if (queryParams) {
      path += path.includes('?') ? `&${queryParams}` : `?${queryParams}`;
    }
  }
  
  console.log('URL construída:', path); // Log para debug
  
  return path;
};

// Função para lidar com erros de resposta
const handleResponseError = async (response: Response, endpoint: string) => {
  if (!response.ok) {
    // Tentar obter detalhes do erro da resposta JSON, se disponível
    let errorMessage = '';
    let errorData = null;
    
    try {
      errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Se não conseguir ler o JSON, usa a mensagem baseada no status
      switch (response.status) {
        case 404:
          errorMessage = `Recurso não encontrado: ${endpoint}`;
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Acesso negado. Você não tem permissão para acessar este recurso.';
          break;
        case 400:
          errorMessage = 'Requisição inválida. Verifique os dados enviados.';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = `Erro na requisição: ${response.status}`;
      }
    }
    
    // Verificar se é um erro de CORS
    if (response.status === 0 || response.type === 'opaque' || response.status === 520) {
      console.error('Possível erro de CORS detectado:', endpoint);
      throw new ApiError('Erro de conexão com o servidor. Possível problema de CORS.', response.status);
    }
    
    console.error(`Erro ${response.status} ao acessar ${endpoint}: ${errorMessage}`);
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
      credentials: 'include', // Alterado para 'include' para permitir cookies cross-origin quando necessário
      mode: 'cors' // Explicitamente definindo o modo como 'cors'
    });
    
    await handleResponseError(response, endpoint);
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Preserva o erro original com seu status HTTP
    }
    console.error(`Erro ao fazer requisição GET para ${endpoint}:`, error);
    // Erro genérico de rede ou outro erro não relacionado à resposta HTTP
    throw new ApiError(`Falha na conexão ao tentar acessar ${endpoint}. Verifique sua conexão de rede.`, 0);
  }
};

// Função genérica para requisições POST
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const url = buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include', // Alterado para 'include'
      mode: 'cors', // Explicitamente definindo o modo como 'cors'
      body: JSON.stringify(data),
    });
    
    await handleResponseError(response, endpoint);
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Preserva o erro original com seu status HTTP
    }
    console.error(`Erro ao fazer requisição POST para ${endpoint}:`, error);
    // Erro genérico de rede ou outro erro não relacionado à resposta HTTP
    throw new ApiError(`Falha na conexão ao tentar enviar dados para ${endpoint}. Verifique sua conexão de rede.`, 0);
  }
};

// Função genérica para requisições PUT
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const url = buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include', // Alterado para 'include'
      mode: 'cors', // Explicitamente definindo o modo como 'cors'
      body: JSON.stringify(data),
    });
    
    await handleResponseError(response, endpoint);
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Preserva o erro original com seu status HTTP
    }
    console.error(`Erro ao fazer requisição PUT para ${endpoint}:`, error);
    // Erro genérico de rede ou outro erro não relacionado à resposta HTTP
    throw new ApiError(`Falha na conexão ao tentar atualizar dados em ${endpoint}. Verifique sua conexão de rede.`, 0);
  }
};

// Função genérica para requisições DELETE
export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  try {
    const url = buildUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include', // Alterado para 'include'
      mode: 'cors', // Explicitamente definindo o modo como 'cors'
    });
    
    await handleResponseError(response, endpoint);
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Preserva o erro original com seu status HTTP
    }
    console.error(`Erro ao fazer requisição DELETE para ${endpoint}:`, error);
    // Erro genérico de rede ou outro erro não relacionado à resposta HTTP
    throw new ApiError(`Falha na conexão ao tentar excluir dados em ${endpoint}. Verifique sua conexão de rede.`, 0);
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