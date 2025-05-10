import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface ApontamentoParams {
  skip?: number;
  limit?: number;
  data_inicio?: string;
  data_fim?: string;
  recurso_id?: number;
  projeto_id?: number;
  fonte_apontamento?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Apontamento {
  id: number;
  recurso_id: number;
  recurso?: {
    id: number;
    nome: string;
  };
  projeto_id: number;
  projeto?: {
    id: number;
    nome: string;
  };
  data_apontamento: string;
  horas_apontadas: number;
  descricao: string;
  jira_issue_key?: string;
  fonte_apontamento: string;
  id_usuario_admin_criador?: number;
  data_hora_inicio_trabalho?: string;
  data_criacao: string;
  data_atualizacao?: string;
}

export const getApontamentos = (params: ApontamentoParams = {}) => {
  return apiGet<{ items: Apontamento[], total: number, page: number, pages: number }>('/apontamentos', params);
};

export const getApontamento = (id: number) => {
  return apiGet<Apontamento>(`/apontamentos/${id}`);
};

export const createApontamento = (data: {
  recurso_id: number;
  projeto_id: number;
  data_apontamento: string;
  horas_apontadas: number;
  descricao: string;
  jira_issue_key?: string;
  data_hora_inicio_trabalho?: string;
}) => {
  return apiPost<Apontamento>('/apontamentos', data);
};

export const updateApontamento = (id: number, data: Partial<Apontamento>) => {
  return apiPut<Apontamento>(`/apontamentos/${id}`, data);
};

export const deleteApontamento = (id: number) => {
  return apiDelete<{ message: string }>(`/apontamentos/${id}`);
};

export const createApontamentosLote = (data: {
  recurso_id: number;
  projeto_id: number;
  apontamentos: Array<{
    data_apontamento: string;
    horas_apontadas: number;
    descricao: string;
    jira_issue_key?: string;
  }>;
}) => {
  return apiPost<{ message: string, apontamentos: Array<{ id: number, data_apontamento: string, horas_apontadas: number }> }>('/apontamentos/lote', data);
}; 