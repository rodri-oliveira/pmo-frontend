import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Busca todas as alocações, com suporte a paginação e filtros
export const getAlocacoes = (params = {}) => {
  const mergedParams = { apenas_ativos: true, ...params };
  return apiGet('/alocacoes', mergedParams);
};

// Cria uma nova alocação
export const createAlocacao = (data) => apiPost('/alocacoes', data);

// Atualiza uma alocação existente
export const updateAlocacao = (id, data) => apiPut(`/alocacoes/${id}`, data);

// Exclui uma alocação (hard delete, pois não há campo 'ativo')
export const deleteAlocacao = (id) => apiDelete(`/alocacoes/${id}`);
