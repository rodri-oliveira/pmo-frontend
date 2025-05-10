import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface StatusProjeto {
  id: number;
  nome: string;
  descricao: string;
  is_final: boolean;
  ordem_exibicao: number;
  data_criacao?: string;
  data_atualizacao?: string;
}

export const getStatusProjetos = (params: { is_final?: boolean } = {}) => {
  return apiGet<{ items: StatusProjeto[] }>('/status-projetos', params);
};

export const getStatusProjeto = (id: number) => {
  return apiGet<StatusProjeto>(`/status-projetos/${id}`);
};

export const createStatusProjeto = (data: Partial<StatusProjeto>) => {
  return apiPost<StatusProjeto>('/status-projetos', data);
};

export const updateStatusProjeto = (id: number, data: Partial<StatusProjeto>) => {
  return apiPut<StatusProjeto>(`/status-projetos/${id}`, data);
};

export const deleteStatusProjeto = (id: number) => {
  return apiDelete<{ message: string }>(`/status-projetos/${id}`);
}; 