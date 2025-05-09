import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Interfaces
export interface Secao {
  id: number;
  nome: string;
  descricao: string;
  data_criacao: string;
  data_atualizacao?: string;
  ativo: boolean;
}

export interface SecaoFormData {
  nome: string;
  descricao: string;
  ativo?: boolean;
}

export interface SecaoListResponse {
  items: Secao[];
  total: number;
  page: number;
  pages: number;
}

// Parâmetros para busca de seções
export interface SecaoQueryParams {
  skip?: number;
  limit?: number;
  ativo?: boolean;
  nome?: string;
}

// Funções do serviço
export const getSecoes = (params: SecaoQueryParams) => {
  return apiGet<SecaoListResponse>('/secoes', params);
};

export const getSecaoById = (id: number) => {
  return apiGet<Secao>(`/secoes/${id}`);
};

export const createSecao = (data: SecaoFormData) => {
  return apiPost<Secao>('/secoes', data);
};

export const updateSecao = (id: number, data: SecaoFormData) => {
  return apiPut<Secao>(`/secoes/${id}`, data);
};

export const deleteSecao = (id: number) => {
  return apiDelete<{ message: string }>(`/secoes/${id}`);
};

export const getEquipesPorSecao = (secaoId: number, ativo?: boolean) => {
  return apiGet<{ items: any[], total: number }>(`/secoes/${secaoId}/equipes`, { ativo });
};