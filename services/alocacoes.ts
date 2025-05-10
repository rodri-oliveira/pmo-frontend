import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface AlocacaoParams {
  projeto_id?: number;
  recurso_id?: number;
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export const getAlocacoes = (params: AlocacaoParams = {}) => {
  const queryParams = new URLSearchParams();
  if (params.projeto_id) queryParams.append('projeto_id', params.projeto_id.toString());
  if (params.recurso_id) queryParams.append('recurso_id', params.recurso_id.toString());
  if (params.page) queryParams.append('skip', ((params.page) * (params.limit || 10)).toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.searchTerm) queryParams.append('nome', params.searchTerm);
  
  return apiGet(`/alocacoes?${queryParams.toString()}`);
};

export const createAlocacao = (projetoId: number, data: any) => 
  apiPost(`/projetos/${projetoId}/alocacoes`, data);

export const updateAlocacao = (projetoId: number, alocacaoId: number, data: any) => 
  apiPut(`/projetos/${projetoId}/alocacoes/${alocacaoId}`, data);

export const deleteAlocacao = (projetoId: number, alocacaoId: number) => 
  apiDelete(`/projetos/${projetoId}/alocacoes/${alocacaoId}`);

export const getRecursos = (searchTerm = '') => {
  const queryParams = new URLSearchParams();
  queryParams.append('ativo', 'true');
  if (searchTerm) queryParams.append('nome', searchTerm);
  
  return apiGet(`/recursos?${queryParams.toString()}`);
};

export const getProjetos = (searchTerm = '') => {
  const queryParams = new URLSearchParams();
  queryParams.append('ativo', 'true');
  if (searchTerm) queryParams.append('nome', searchTerm);
  
  return apiGet(`/projetos?${queryParams.toString()}`);
}; 