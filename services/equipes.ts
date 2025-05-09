import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Interfaces
export interface Equipe {
  id: number;
  nome: string;
  descricao: string;
  secao_id: number;
  secao?: {
    id: number;
    nome: string;
  };
  data_criacao?: string;
  data_atualizacao?: string;
  ativo: boolean;
}

export interface EquipeFormData {
  nome: string;
  descricao: string;
  secao_id: number;
  ativo?: boolean;
}

export interface EquipeListResponse {
  items: Equipe[];
  total: number;
  page: number;
  pages: number;
}

// Parâmetros para busca de equipes
export interface EquipeQueryParams {
  skip?: number;
  limit?: number;
  ativo?: boolean;
  secao_id?: number;
  nome?: string;
}

// Funções do serviço
export const getEquipes = (params: EquipeQueryParams) => {
  return apiGet<EquipeListResponse>('/equipes', params);
};

export const getEquipeById = (id: number) => {
  return apiGet<Equipe>(`/equipes/${id}`);
};

export const createEquipe = (data: EquipeFormData) => {
  return apiPost<Equipe>('/equipes', data);
};

export const updateEquipe = (id: number, data: EquipeFormData) => {
  return apiPut<Equipe>(`/equipes/${id}`, data);
};

export const deleteEquipe = (id: number) => {
  return apiDelete<{ message: string }>(`/equipes/${id}`);
};

export const getRecursosPorEquipe = (equipeId: number, ativo?: boolean) => {
  return apiGet<{ items: any[], total: number }>(`/equipes/${equipeId}/recursos`, { ativo });
}; 