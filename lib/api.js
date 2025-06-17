// Arquivo para centralizar as chamadas de API

const API_BASE_URL = 'http://localhost:8000/backend/v1';

async function request(endpoint, options = {}) {
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
      throw new Error(errorData.detail || `Erro ${response.status}`);
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

export const deleteSecao = (id) => request(`/secoes/${id}/`, {
  method: 'DELETE',
});

// --- API de Relatórios ---

export const getRelatorioPlanejadoRealizadoV2 = (payload) => request('/relatorios/planejado-vs-realizado2', {
  method: 'POST',
  body: JSON.stringify(payload),
});
