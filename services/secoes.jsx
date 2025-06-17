import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Função para buscar lista de seções
// Busca seções; por padrão retorna apenas as ativas
export async function getSecoes(params = {}) {
  // Adiciona flag apenas_ativos=true por padrão
  const mergedParams = { apenas_ativos: true, ...params };
  const response = await apiGet('/secoes', mergedParams);
  // API padrão retorna { items: [...] }; garantimos array como saída
  return Array.isArray(response) ? response : response?.items ?? [];
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
