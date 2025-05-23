import { apiGet, apiPost, apiPut, apiDelete } from './api.jsx';

export const getProjetos = (params = {}) => {
  return apiGet('/projetos', params);
};

export const getProjeto = (id) => {
  return apiGet(`/projetos/${id}`);
};

export const createProjeto = (data) => {
  return apiPost('/projetos', data);
};

export const updateProjeto = (id, data) => {
  return apiPut(`/projetos/${id}`, data);
};

export const deleteProjeto = (id) => {
  return apiDelete(`/projetos/${id}`);
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
