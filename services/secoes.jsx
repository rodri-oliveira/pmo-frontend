import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Função para buscar lista de seções
export function getSecoes(params) {
  return apiGet('/secoes', params);
}

// Buscar seção por ID
export function getSecaoById(id) {
  return apiGet(`/secoes/${id}`);
}

// Criar nova seção
export function createSecao(data) {
  return apiPost('/secoes', data);
}

// Atualizar seção existente
export function updateSecao(id, data) {
  return apiPut(`/secoes/${id}`, data);
}

// Deletar seção
export function deleteSecao(id) {
  return apiDelete(`/secoes/${id}`);
}

// Buscar equipes de uma seção
export function getEquipesPorSecao(secaoId, ativo) {
  return apiGet(`/secoes/${secaoId}/equipes`, { ativo });
}
