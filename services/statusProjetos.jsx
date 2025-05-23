import { apiGet, apiPost, apiPut, apiDelete } from './api.jsx';

// Buscar lista de status de projetos
export function getStatusProjetos(params = {}) {
  return apiGet('/status-projetos', params);
}

// Buscar status de projeto por ID
export function getStatusProjeto(id) {
  return apiGet(`/status-projetos/${id}`);
}

// Criar novo status de projeto
export function createStatusProjeto(data) {
  return apiPost('/status-projetos', data);
}

// Atualizar status de projeto
export function updateStatusProjeto(id, data) {
  return apiPut(`/status-projetos/${id}`, data);
}

// Deletar status de projeto
export function deleteStatusProjeto(id) {
  return apiDelete(`/status-projetos/${id}`);
}
