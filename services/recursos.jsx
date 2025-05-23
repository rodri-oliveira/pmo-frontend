import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Buscar recursos com filtros e paginação
export function getRecursos(params) {
  return apiGet('/recursos', params);
}

// Buscar recurso por ID
export function getRecursoById(id) {
  return apiGet(`/recursos/${id}`);
}

// Criar recurso
export function createRecurso(data) {
  return apiPost('/recursos', data);
}

// Atualizar recurso
export function updateRecurso(id, data) {
  return apiPut(`/recursos/${id}`, data);
}

// Deletar recurso
export function deleteRecurso(id) {
  return apiDelete(`/recursos/${id}`);
}

// Buscar equipes para dropdown de recurso
export function getEquipes(params) {
  return apiGet('/equipes', params);
}
