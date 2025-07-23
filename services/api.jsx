// Base do serviço de API
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/backend/v1';

// Função para obter o token de autenticação
const getAuthToken = () => {
  // Obtenha o token do localStorage ou de outro local de armazenamento
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Classe de erro personalizada para erros de API
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Função para construir URL com parâmetros de consulta
const buildUrl = (endpoint, params) => {
  // Se endpoint já contém http(s) assume completo
  let path = endpoint;

  if (!/^https?:\/\//i.test(path)) {
    // garantir que começa com '/'
    if (!path.startsWith('/')) path = '/' + path;
    // juntar com base
    path = API_BASE_URL.replace(/\/$/, '') + path;
  }

  
  // Adicionar parâmetros de consulta
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      path += (path.includes('?') ? '&' : '?') + queryString;
    }
  }
  
  console.log('URL construída:', path);
  return path;
};

// Função para lidar com erros de resposta e lançar ApiError
const handleAndThrowApiError = async (response, endpoint) => {
  let errorMessage = `Erro ${response.status} ao acessar ${endpoint}.`;
  
  try {
    const text = await response.text();
    
    if (text) {
      try {
        const errorDetails = JSON.parse(text);
        if (errorDetails && errorDetails.detail) {
          errorMessage = Array.isArray(errorDetails.detail)
            ? errorDetails.detail.map(d => d.msg || JSON.stringify(d)).join(', ')
            : String(errorDetails.detail);
        } else if (errorDetails && errorDetails.message) {
          errorMessage = String(errorDetails.message);
        }
      } catch (e) {
        errorMessage = text;
      }
    }
  } catch (e) {
    console.error(`Falha ao ler corpo da resposta de erro para ${endpoint}:`, e);
  }
  
  console.error(`Erro ${response.status} ao acessar ${endpoint}: ${errorMessage}`);
  throw new ApiError(errorMessage, response.status);
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
export const apiGet = async (endpoint, params) => {
  const url = buildUrl(endpoint, params);
  console.log(`Fazendo requisição GET para: ${url}`);
  
  // Não usar AbortController para evitar AbortError
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(),
      credentials: 'include',
      mode: 'cors'
      // Removido o signal para evitar AbortError
    });
    
    if (!response.ok) {
      await handleAndThrowApiError(response, url);
    }
    
    // Verificar se o corpo está vazio
    const responseText = await response.text();
    if (!responseText) {
      return null;
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log(`Resposta bem-sucedida de ${url}:`, data);
      return data;
    } catch (e) {
      console.warn(`Resposta OK para ${url} mas não é JSON:`, responseText.substring(0, 200));
      throw new ApiError(`Resposta inesperada do servidor (formato não JSON)`, response.status);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Erro crítico na requisição GET para ${url}:`, error);
    throw new ApiError(`Falha na conexão ao tentar acessar ${url}. Verifique sua conexão.`, 0);
  }
};

// Função genérica para requisições POST
export const apiPost = async (endpoint, data) => {
  const url = buildUrl(endpoint);
  
  // DEBUG: Log do payload sendo enviado
  console.log('🚀 [apiPost] URL:', url);
  console.log('📦 [apiPost] Payload:', JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      await handleAndThrowApiError(response, url);
    }
    
    // Verificar se o corpo está vazio
    const responseText = await response.text();
    if (!responseText) {
      return null;
    }
    
    return JSON.parse(responseText);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Erro crítico na requisição POST para ${url}:`, error);
    throw new ApiError(`Falha na conexão ao tentar enviar dados para ${url}.`, 0);
  }
};

// Função genérica para requisições PUT
export const apiPut = async (endpoint, data) => {
  const url = buildUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: authHeaders(),
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      await handleAndThrowApiError(response, url);
    }
    
    // Verificar se o corpo está vazio
    const responseText = await response.text();
    if (!responseText) {
      return null;
    }
    
    return JSON.parse(responseText);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Erro crítico na requisição PUT para ${url}:`, error);
    throw new ApiError(`Falha na conexão ao tentar atualizar dados em ${url}.`, 0);
  }
};

// Função genérica para requisições DELETE
export const apiDelete = async (endpoint) => {
  const url = buildUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
      mode: 'cors',
    });
    
    if (!response.ok) {
      await handleAndThrowApiError(response, url);
    }
    
    // Verificar se o corpo está vazio
    const responseText = await response.text();
    if (!responseText) {
      return null;
    }
    
    return JSON.parse(responseText);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Erro crítico na requisição DELETE para ${url}:`, error);
    throw new ApiError(`Falha na conexão ao tentar deletar em ${url}.`, 0);
  }
};

// Função para verificar se a API está acessível
export const checkApiConnection = async () => {
  try {
    const url = buildUrl('/health');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders,
      credentials: 'same-origin',
    });
    
    return response.ok;
  } catch (error) {
    console.warn('API não está acessível:', error);
    return false;
  }
};

// Exportar a classe de erro personalizada para ser usada em outros locais
export { ApiError };
