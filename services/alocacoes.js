import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

// --- API de Alocações ---

// Busca todas as alocações, com suporte a paginação e filtros
export const getAlocacoes = (params) => apiGet('/alocacoes', params);

// Cria uma nova alocação
export const createAlocacao = (data) => apiPost('/alocacoes', data);

// Atualiza uma alocação existente
export const updateAlocacao = (id, data) => apiPut(`/alocacoes/${id}`, data);

// Exclui uma alocação
export const deleteAlocacao = (id) => apiDelete(`/alocacoes/${id}`);

// --- Funções Específicas para a Matriz de Planejamento ---

/**
 * Salva os dados da matriz de planejamento.
 * @param {object} data - O payload para salvar, contendo as alocações.
 * @returns {Promise<object>} A resposta da API.
 */
export const salvarMatrizPlanejamento = (data) => {
  return apiPost('/matriz-planejamento/salvar', data);
};

/**
 * Busca os dados para o relatório de planejado vs realizado.
 * @param {object} filters - Os filtros para a busca.
 * @returns {Promise<object>} Os dados do relatório.
 */
export const getRelatorioPlanejadoRealizado = (filters) => {
  return apiPost('/relatorios/planejado-vs-realizado-3', filters);
};

/**
 * Busca as horas disponíveis para um recurso em um determinado período.
 * @param {object} params - Parâmetros como id do recurso, data de início e fim.
 * @returns {Promise<object>} As horas disponíveis.
 */
export const getHorasDisponiveis = (params) => {
  return apiGet('/calendario/horas-disponiveis-recurso', params);
};
