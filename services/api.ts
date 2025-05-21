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

// Função para lidar com erros de resposta e lançar ApiError
const handleAndThrowApiError = async (response: Response, endpoint: string) => {
  let errorMessage = `Erro ${response.status} ao acessar ${endpoint}.`;
  let errorDetails: any = null; // Para armazenar o corpo do erro, se houver

  try {
    // Tenta ler o corpo da resposta como texto primeiro
    const text = await response.text(); // Consumir o corpo da resposta aqui

    if (text) {
      try {
        // Tenta parsear como JSON
        errorDetails = JSON.parse(text);
        if (errorDetails && errorDetails.detail) {
          // Formata mensagens de erro do FastAPI (que podem ser um array ou string)
          errorMessage = Array.isArray(errorDetails.detail)
            ? errorDetails.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
            : String(errorDetails.detail);
        } else if (errorDetails && errorDetails.message) {
          errorMessage = String(errorDetails.message);
        } else if (typeof errorDetails === 'string') {
            errorMessage = errorDetails;
        } else if (text) {
          // Se o parse JSON falhar ou não tiver 'detail'/'message', mas houver texto, usa o texto.
          errorMessage = text;
        }
      } catch (jsonError) {
        // Se não for JSON, usa o texto diretamente como mensagem de erro
        errorMessage = text;
      }
    }
  } catch (e) {
    // Se houver erro ao ler o corpo da resposta (ex: já consumido ou problema de rede no stream)
    console.error(`Falha ao ler corpo da resposta de erro para ${endpoint}:`, e);
    // Mantém a mensagem de erro baseada no status HTTP se o corpo não puder ser lido
  }

  // Verificar se é um erro de CORS (status 0 pode indicar isso em alguns navegadores/cenários)
  if (response.status === 0) {
    console.error('Possível erro de CORS detectado:', endpoint, response);
    // Fornece uma mensagem mais específica para CORS ou problemas de rede
    throw new ApiError('Erro de conexão com o servidor. Verifique o console para detalhes (pode ser CORS ou rede).', 0);
  }

  console.error(`Erro ${response.status} ao acessar ${endpoint}: ${errorMessage}`, errorDetails || '(sem corpo de erro detalhado)');
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
export const apiGet = async <T>(endpoint: string, params?: QueryParams): Promise<T> => {
  const url = buildUrl(endpoint, params); // buildUrl já faz console.log da URL construída
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(), // authHeaders já inclui 'Content-Type': 'application/json' se necessário, mas GET não envia corpo JSON
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      // A função handleAndThrowApiError sempre lançará um erro, então não há retorno dela.
      await handleAndThrowApiError(response, url);
      // A linha abaixo nunca será alcançada devido ao throw em handleAndThrowApiError
      return Promise.reject(new ApiError(`Erro inesperado após handleAndThrowApiError para ${url}`, response.status));
    }

    if (response.status === 204) { // No Content
      return null as T; // Retorna null para tipo T, adequado para respostas 204
    }

    // Tenta obter o corpo como JSON. Se falhar ou não for JSON, tratar como erro ou texto.
    const responseText = await response.text();
    if (!responseText) { // Corpo vazio, mas status OK (ex: 200 com corpo vazio)
        return null as T;
    }

    try {
        return JSON.parse(responseText);
    } catch (e) {
        // Se a resposta for OK, mas não for JSON (ex: HTML de erro inesperado, ou texto puro)
        // Se T for string, podemos retornar o texto diretamente:
        // if (typeof '' === typeof {} as T) { return responseText as T; }
        console.warn(`Resposta OK para ${url} mas não é JSON. Content-Type: ${response.headers.get('content-type')}. Corpo:`, responseText.substring(0, 200));
        // Decide se deve lançar um erro ou retornar o texto.
        // Por segurança, se o tipo esperado T não for string, e a resposta não for JSON, é um problema.
        // Se T PODE ser string, você pode querer `return responseText as T;` aqui.
        // Para agora, vamos ser estritos: se esperávamos JSON (implícito por T não ser string), e não é, lançamos erro.
        throw new ApiError(`Resposta inesperada do servidor (formato não JSON) para ${url}. Conteúdo: ${responseText.substring(0,100)}`, response.status);
    }

  } catch (error) { // Captura erros de rede (fetch falhou) ou ApiError já lançado
    if (error instanceof ApiError) {
      throw error; // Re-lança ApiError
    }
    // Erro de rede ou outro erro não pego pelo fetch ou handleAndThrowApiError
    console.error(`Erro crítico na requisição GET para ${url}:`, error);
    throw new ApiError(`Falha na conexão ao tentar acessar ${url}. Verifique sua conexão e o console.`, 0); // Status 0 para erro de rede/cliente
  }
};

// Função genérica para requisições POST
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  const url = buildUrl(endpoint);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(), // authHeaders() já inclui 'Content-Type': 'application/json'
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await handleAndThrowApiError(response, url);
      return Promise.reject(new ApiError(`Erro inesperado após handleAndThrowApiError para ${url}`, response.status));
    }

    // Tratar casos de sucesso com corpo vazio ou sem JSON
    if (response.status === 204) { // No Content
      return null as T;
    }
    // Status 201 Created pode ou não ter corpo. Se não tiver content-length ou for 0, tratar como null.
    const contentLength = response.headers.get('content-length');
    if (response.status === 201 && (!contentLength || contentLength === '0')) {
        return null as T;
    }
    
    const responseText = await response.text();
    if (!responseText && (response.status === 200 || response.status === 201)) { // OK/Created mas corpo vazio
        return null as T;
    }

    try {
        if(responseText) return JSON.parse(responseText);
        return null as T; // Caso de responseText ser vazio mas não coberto acima
    } catch (e) {
        console.warn(`Resposta OK (POST) para ${url} mas não é JSON. Status: ${response.status}, Corpo: ${responseText.substring(0,200)}`);
        // Se T puder ser string e a resposta for texto, retorne o texto.
        // Ex: if (typeof responseText === typeof ({} as T)) return responseText as T;
        throw new ApiError(`Resposta inesperada do servidor (formato não JSON) para ${url}. Conteúdo: ${responseText.substring(0,100)}`, response.status);
    }

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Erro crítico na requisição POST para ${url}:`, error);
    throw new ApiError(`Falha na conexão ao tentar enviar dados para ${url}. Verifique sua conexão e o console.`, 0);
  }
};

// Função genérica para requisições PUT
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
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
      return Promise.reject(new ApiError(`Erro inesperado após handleAndThrowApiError para ${url}`, response.status));
    }

    if (response.status === 204) { // No Content
      return null as T;
    }
    
    const responseText = await response.text();
    if (!responseText && response.status === 200) { // OK mas corpo vazio
        return null as T;
    }

    try {
        if(responseText) return JSON.parse(responseText);
        return null as T;
    } catch (e) {
        console.warn(`Resposta OK (PUT) para ${url} mas não é JSON. Status: ${response.status}, Corpo: ${responseText.substring(0,200)}`);
        throw new ApiError(`Resposta inesperada do servidor (formato não JSON) para ${url}. Conteúdo: ${responseText.substring(0,100)}`, response.status);
    }

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Erro crítico na requisição PUT para ${url}:`, error);
    throw new ApiError(`Falha na conexão ao tentar atualizar dados em ${url}. Verifique sua conexão e o console.`, 0);
  }
};

// Função genérica para requisições DELETE
export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  const url = buildUrl(endpoint);
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: authHeaders(), // DELETE não costuma ter 'Content-Type' no request header, mas authHeaders pode incluir
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      await handleAndThrowApiError(response, url);
      return Promise.reject(new ApiError(`Erro inesperado após handleAndThrowApiError para ${url}`, response.status));
    }

    // DELETE frequentemente retorna 204 No Content, ou às vezes 200 OK com corpo (ou 202 Accepted)
    if (response.status === 204) {
      return null as T;
    }
    
    const responseText = await response.text();
    // Se status for OK (200, 202) e não houver corpo, retorna null
    if (!responseText && (response.status === 200 || response.status === 202)) {
        return null as T;
    }

    try {
        // Tenta parsear como JSON se houver texto
        if(responseText) return JSON.parse(responseText);
        // Se não havia texto e não era 204, ainda retorna null para consistência com casos de sucesso sem corpo
        return null as T;
    } catch (e) {
        console.warn(`Resposta OK (DELETE) para ${url} mas não é JSON ou corpo inesperado. Status: ${response.status}, Corpo: ${responseText.substring(0,200)}`);
        // Se T puder ser string, e a resposta for texto (mesmo que não JSON), pode retornar o texto
        // Ex: if (typeof responseText === typeof ({} as T)) return responseText as T;
        throw new ApiError(`Resposta inesperada do servidor (formato não JSON ou corpo inesperado) para ${url}. Conteúdo: ${responseText.substring(0,100)}`, response.status);
    }

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Erro crítico na requisição DELETE para ${url}:`, error);
    throw new ApiError(`Falha na conexão ao tentar deletar em ${url}. Verifique sua conexão e o console.`, 0);
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