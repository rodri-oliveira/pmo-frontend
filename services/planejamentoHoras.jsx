import { apiPost, apiGet } from './api.jsx';

// Cadastrar planejamento de horas
export const createPlanejamentoHoras = (data) =>
  apiPost('/planejamento-horas/planejamento-horas/', data);

// Buscar planejamentos de uma alocação específica
export const getPlanejamentosByAlocacao = (alocacaoId) =>
  apiGet(`/planejamento-horas/planejamento-horas/alocacao/${alocacaoId}`);

// Buscar alocações para dropdown
export const getAlocacoes = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('skip', ((params.page) * (params.limit || 10)).toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  return apiGet(`/alocacoes?${queryParams.toString()}`);
};
