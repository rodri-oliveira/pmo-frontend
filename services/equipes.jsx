import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Criar nova equipe
export async function createEquipe(data) {
  // Para equipes, usar endpoint específico sem /v1
  const response = await fetch('http://localhost:8000/backend/equipes/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

// Buscar lista de equipes
export async function getEquipes(params) {
  // Para equipes, usar endpoint específico sem /v1
  const queryParams = new URLSearchParams();
  
  // Converter parâmetros para o formato correto
  if (params) {
    if (params.apenas_ativos !== undefined) {
      queryParams.append('apenas_ativos', params.apenas_ativos);
    }
    if (params.skip !== undefined) {
      queryParams.append('skip', params.skip);
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit);
    }
    // Outros parâmetros
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          !['apenas_ativos', 'skip', 'limit'].includes(key)) {
        queryParams.append(key, value);
      }
    });
  }
  
  const queryString = queryParams.toString();
  const url = `http://localhost:8000/backend/equipes/${queryString ? '?' + queryString : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

// Buscar equipe por ID
export function getEquipeById(id) {
  return apiGet(`/equipes/${id}`);
}

// Atualizar equipe existente
export async function updateEquipe(id, data) {
  // Para equipes, usar endpoint específico sem /v1
  const response = await fetch(`http://localhost:8000/backend/equipes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}

// Deletar equipe
export async function deleteEquipe(id) {
  // Para equipes, usar endpoint específico sem /v1
  const response = await fetch(`http://localhost:8000/backend/equipes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }
  
  // DELETE pode retornar vazio ou dados
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
