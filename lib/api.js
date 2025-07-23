// Arquivo para centralizar as chamadas de API

const API_BASE_URL = 'http://localhost:8000/backend';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      const detail = errorData.detail || 'Erro desconhecido';

      if (Array.isArray(detail)) {
        const errorSummary = detail.reduce((acc, error) => {
          const field = error.loc[error.loc.length - 1];
          if (!acc[field]) {
            acc[field] = { count: 0, messages: new Set() };
          }
          acc[field].count++;
          acc[field].messages.add(error.msg);
          return acc;
        }, {});

        const summaryLines = Object.entries(errorSummary).map(([field, data]) => 
          `- Campo '${field}': ${data.count} erro(s). (${Array.from(data.messages).join(', ')})`
        );

        throw new Error(`Erro de Validação:\n${summaryLines.join('\n')}`);
      } else {
        const errorMessage = typeof detail === 'object' ? JSON.stringify(detail) : detail;
        throw new Error(errorMessage || `Erro ${response.status}`);
      }
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
    }
    return {}; // Retorna objeto vazio para respostas sem corpo

  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const apiGet = (endpoint, params) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }
  return request(url.pathname + url.search, { method: 'GET' });
};

export const apiPost = (endpoint, body) => request(endpoint, { 
  method: 'POST', 
  body: JSON.stringify(body) 
});

export const apiPut = (endpoint, body) => request(endpoint, { 
  method: 'PUT', 
  body: JSON.stringify(body) 
});

export const apiDelete = (endpoint) => request(endpoint, { 
  method: 'DELETE' 
});

// --- API de Seções ---

export const getSecoes = (apenasAtivos = true) => request(`/secoes?apenas_ativos=${apenasAtivos}`);

export const createSecao = (data) => request('/secoes', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateSecao = (id, data) => request(`/secoes/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteSecao = (id) => request(`/secoes/${id}`, { method: 'DELETE' });

// --- Equipes Endpoints ---
export const getEquipes = () => request('/equipes/');
export const createEquipe = (data) => request('/equipes/', { method: 'POST', body: JSON.stringify(data) });
export const updateEquipe = (id, data) => request(`/equipes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEquipe = (id) => request(`/equipes/${id}/`, { method: 'DELETE' });

// --- Recursos Endpoints ---
export const getRecursos = (apenasAtivos = false) => request(`/recursos/?apenas_ativos=${apenasAtivos}`);
export const createRecurso = (data) => request('/recursos/', { method: 'POST', body: JSON.stringify(data) });
export const updateRecurso = (id, data) => request(`/recursos/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRecurso = (id) => request(`/recursos/${id}/`, { method: 'DELETE' });

// --- Status de Projeto Endpoints ---
export const getStatusProjetos = (includeInactive = false) => {
  const url = `/status-projetos/?skip=0&limit=100${includeInactive ? '&include_inactive=true' : ''}`;
  return request(url);
};
export const createStatusProjeto = (data) => request('/status-projetos/', { method: 'POST', body: JSON.stringify(data) });
export const updateStatusProjeto = (id, data) => request(`/status-projetos/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteStatusProjeto = (id) => request(`/status-projetos/${id}/`, { method: 'DELETE' });

// --- API de Relatórios ---

export const getRelatorioPlanejadoRealizadoV2 = (payload) => request('/v1/relatorios/planejado-vs-realizado2', {
  method: 'POST',
  body: JSON.stringify(payload),
});

// --- API de Filtros (sem o /v1) ---
const FILTROS_BASE_URL = 'http://localhost:8000/backend';

export const getFiltrosPopulados = async (params) => {
  const url = new URL(`${FILTROS_BASE_URL}/filtros/filtros-populados`);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  try {
    const response = await fetch(url.toString(), { method: 'GET' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      const errorMessage = typeof errorData.detail === 'object' 
        ? JSON.stringify(errorData.detail, null, 2) 
        : errorData.detail;
      throw new Error(errorMessage || `Erro ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`API Error on ${url.toString()}:`, error);
    throw error;
  }
};
