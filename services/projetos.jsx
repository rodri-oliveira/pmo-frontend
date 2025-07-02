import { apiGet, apiPost, apiPut, apiDelete } from './api';

const ENDPOINT = '/projetos';

// Criar projeto junto com alocações
export const createProjetoComAlocacoes = (data) => apiPost(`${ENDPOINT}/com-alocacoes`, data);

// Buscar lista de projetos
export const getProjetos = (params = {}) => {
  return apiGet(ENDPOINT, params);
};

// Buscar lista de projetos com alocações e horas
export const getProjetosDetalhados = (params = {}) => {
  const finalParams = {
    page: params.page || 1,
    per_page: params.per_page || 10,
  };

  if (params.search) {
    finalParams.search = params.search;
  }
  // Garante que `ativo=false` seja enviado, mas `ativo=null/undefined` não.
  if (params.ativo !== null && params.ativo !== undefined) {
    finalParams.ativo = params.ativo;
  }
  // Envia `com_alocacoes=true` apenas se for explicitamente true.
  if (params.com_alocacoes === true) {
    finalParams.com_alocacoes = true;
  }

  // Adiciona os filtros de seção e recurso se eles existirem
  if (params.secao_id) {
    finalParams.secao_id = params.secao_id;
  }
  if (params.recurso) {
    finalParams.recurso = params.recurso;
  }

  return apiGet(`${ENDPOINT}/detalhados`, finalParams);
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


