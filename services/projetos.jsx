import { apiGet, apiPost, apiPut, apiDelete } from './api';

const ENDPOINT = '/projetos';

// Buscar lista de projetos
export const getProjetos = (params = {}) => {
  return apiGet(ENDPOINT, params);
};

// Buscar projeto por ID
export const getProjetoById = (id) => {
  return apiGet(`${ENDPOINT}/${id}/`);
};

// Criar novo projeto
export const createProjeto = (data) => {
  return apiPost(`${ENDPOINT}/`, data);
};

// Atualizar projeto existente
export const updateProjeto = (id, data) => {
  return apiPut(`${ENDPOINT}/${id}/`, data);
};

// Deletar (inativar) projeto
export const deleteProjeto = (id) => {
  return apiDelete(`${ENDPOINT}/${id}/`);
};


export const getRecursosAlocados = (projetoId, params = {}) => {
  return apiGet(`/projetos/${projetoId}/alocacoes`, params);
};

export const createAlocacao = (projetoId, data) => {
  return apiPost(`/projetos/${projetoId}/alocacoes`, data);
};

export const updateAlocacao = (projetoId, alocacaoId, data) => {
  return apiPut(`/projetos/${projetoId}/alocacoes/${alocacaoId}`, data);
};

export const deleteAlocacao = (projetoId, alocacaoId) => {
  return apiDelete(`/projetos/${projetoId}/alocacoes/${alocacaoId}`);
};

export const planejamentoHoras = (projetoId, alocacaoId, planejamentos) => {
  return apiPost(`/projetos/${projetoId}/alocacoes/${alocacaoId}/planejamento-horas`, {
    planejamentos
  });
};
