import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Criar nova equipe
export function createEquipe(data) {
  return apiPost('/equipes/', data);
}

// Buscar lista de equipes
export function getEquipes(params) {
  return apiGet('/equipes/', params);
}

// Buscar equipe por ID
export function getEquipeById(id) {
  return apiGet(`/equipes/${id}`);
}

// Atualizar equipe existente
export function updateEquipe(id, data) {
  return apiPut(`/equipes/${id}`, data);
}

// Deletar equipe
export function deleteEquipe(id) {
  return apiDelete(`/equipes/${id}`);
}
