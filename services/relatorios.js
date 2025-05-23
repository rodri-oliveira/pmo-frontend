import { apiGet } from './api';

// Função para relatório de horas por projeto
export const getRelatorioHorasProjeto = (params) => {
  return apiGet('/relatorios/horas-por-projeto', params);
};

// Função para relatório de alocação de recursos
export const getRelatorioAlocacaoRecursos = (params) => {
  return apiGet('/relatorios/alocacao-recursos', params);
};

// Função para relatório do dashboard
export const getRelatorioDashboard = (params) => {
  return apiGet('/relatorios/dashboard', params);
};
