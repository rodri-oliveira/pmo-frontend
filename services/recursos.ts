import { apiGet, apiPost, apiPut, apiDelete, QueryParams } from './api';

// Interfaces para Equipes (conforme GET /equipes/)
export interface Equipe {
  id: number;
  nome: string;
  // Adicione outros campos se a API de equipes retornar mais detalhes relevantes
}

export interface EquipeListResponse {
  items: Equipe[];
  total: number;
  page: number;
  pages: number;
  // Adapte conforme a resposta real da API para equipes, pode ser um array direto
}

// Interfaces
export interface Recurso {
  id: number;
  nome: string; // Obrigatório
  email: string; // Obrigatório
  equipe_id: number; // Obrigatório (anteriormente equipe_principal_id)
  horas_diarias: number; // Obrigatório
  jira_account_id?: string; // Opcional (anteriormente jira_user_id)
  ativo: boolean; // Opcional na criação (default true), presente na listagem
  matricula?: string; // Opcional, não primário para CRUD mas pode estar no GET
  cargo?: string; // Opcional
  usuario_id?: number; // Opcional, mencionado na documentação
  custo_hora?: number; // Opcional, mencionado na documentação
  equipe?: Equipe; // Para dados aninhados na listagem, se a API retornar
  data_admissao?: string; // Opcional
  data_criacao?: string; // Opcional, geralmente gerenciado pelo backend
  data_atualizacao?: string; // Opcional, geralmente gerenciado pelo backend
}

export interface RecursoFormData {
  nome: string; 
  email: string;
  equipe_id: number;
  horas_diarias: number;
  jira_account_id?: string;
  ativo?: boolean; 
  matricula?: string; // Se for permitido enviar na criação/atualização
  cargo?: string; // Se for permitido enviar
  usuario_id?: number; // Se for permitido enviar
  custo_hora?: number; // Se for permitido enviar
  data_admissao?: string; // Se for permitido enviar
}

export interface RecursoListResponse {
  items: Recurso[];
  total: number;
  page: number;
  pages: number;
}

// Parâmetros para busca de recursos
export interface RecursoQueryParams extends QueryParams {
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

// Função para buscar equipes
export const getEquipes = (params?: QueryParams) => {
  // A API /equipes/ pode ou não suportar paginação ou ter uma estrutura ListResponse.
  // Se for um array direto: return apiGet<Equipe[]>('/equipes', params);
  // Se tiver paginação como outros endpoints:
  return apiGet<EquipeListResponse | Equipe[]>('/equipes', params); 
  // O componente precisará tratar ambos os casos ou a apiGet precisa normalizar.
  // Por simplicidade, vamos assumir que retorna Equipe[] diretamente ou que apiGet lida com isso.
};