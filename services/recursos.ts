import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Interfaces
export interface Recurso {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  jira_user_id?: string;
  equipe_principal_id: number;
  equipe?: {
    id: number;
    nome: string;
  };
  data_admissao?: string;
  data_criacao?: string;
  data_atualizacao?: string;
  ativo: boolean;
}

export interface RecursoFormData {
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  jira_user_id?: string;
  equipe_principal_id: number;
  data_admissao?: string;
  ativo?: boolean;
}

export interface RecursoListResponse {
  items: Recurso[];
  total: number;
  page: number;
  pages: number;
}

// Parâmetros para busca de recursos
export interface RecursoQueryParams {
  skip?: number;
  limit?: number;
  ativo?: boolean;
  equipe_id?: number;
  nome?: string;
  email?: string;
  matricula?: string;
}

// Funções do serviço
export const getRecursos = (params: RecursoQueryParams) => {
  return apiGet<RecursoListResponse>('/recursos', params);
};

export const getRecursoById = (id: number) => {
  return apiGet<Recurso>(`/recursos/${id}`);
};

export const createRecurso = (data: RecursoFormData) => {
  return apiPost<Recurso>('/recursos', data);
};

export const updateRecurso = (id: number, data: RecursoFormData) => {
  return apiPut<Recurso>(`/recursos/${id}`, data);
};

export const deleteRecurso = (id: number) => {
  return apiDelete<{ message: string }>(`/recursos/${id}`);
}; 