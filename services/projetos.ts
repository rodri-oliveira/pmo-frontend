import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface ProjetoParams {
  skip?: number;
  limit?: number;
  ativo?: boolean;
  status_id?: number;
  nome?: string;
  codigo_empresa?: string;
  data_inicio?: string;
  data_fim?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Projeto {
  id: number;
  nome: string;
  codigo_empresa: string;
  descricao: string;
  jira_project_key?: string;
  status_projeto_id: number;
  status_projeto?: {
    id: number;
    nome: string;
  };
  data_inicio?: string;
  data_fim?: string;
  ativo: boolean;
  data_criacao?: string;
  data_atualizacao?: string;
}

export const getProjetos = (params: ProjetoParams = {}) => {
  return apiGet<{ items: Projeto[], total: number }>('/projetos', params);
};

export const getProjeto = (id: number) => {
  return apiGet<Projeto>(`/projetos/${id}`);
};

export const createProjeto = (data: Partial<Projeto>) => {
  return apiPost<Projeto>('/projetos', data);
};

export const updateProjeto = (id: number, data: Partial<Projeto>) => {
  return apiPut<Projeto>(`/projetos/${id}`, data);
};

export const deleteProjeto = (id: number) => {
  return apiDelete<{ message: string }>(`/projetos/${id}`);
};

// Alocações de recursos no projeto
export interface AlocacaoRecurso {
  id: number;
  projeto_id: number;
  recurso_id: number;
  recurso?: {
    id: number;
    nome: string;
    email: string;
  };
  data_inicio_alocacao: string;
  data_fim_alocacao: string | null;
  data_criacao: string;
  data_atualizacao?: string;
}

export const getRecursosAlocados = (projetoId: number, params: { ativo?: boolean, data?: string } = {}) => {
  return apiGet<{ items: AlocacaoRecurso[], total: number }>(`/projetos/${projetoId}/recursos`, params);
};

export const createAlocacao = (projetoId: number, data: {
  recurso_id: number;
  data_inicio_alocacao: string;
  data_fim_alocacao?: string | null;
  horas_planejadas?: Array<{
    ano: number;
    mes: number;
    horas_planejadas: number;
  }>;
}) => {
  return apiPost<AlocacaoRecurso>(`/projetos/${projetoId}/alocacoes`, data);
};

export const updateAlocacao = (projetoId: number, alocacaoId: number, data: {
  data_inicio_alocacao?: string;
  data_fim_alocacao?: string | null;
}) => {
  return apiPut<AlocacaoRecurso>(`/projetos/${projetoId}/alocacoes/${alocacaoId}`, data);
};

export const deleteAlocacao = (projetoId: number, alocacaoId: number) => {
  return apiDelete<{ message: string }>(`/projetos/${projetoId}/alocacoes/${alocacaoId}`);
};

export const planejamentoHoras = (projetoId: number, alocacaoId: number, planejamentos: Array<{
  ano: number;
  mes: number;
  horas_planejadas: number;
}>) => {
  return apiPost<{ message: string, planejamentos: Array<any> }>(
    `/projetos/${projetoId}/alocacoes/${alocacaoId}/planejamento`,
    { planejamentos }
  );
}; 