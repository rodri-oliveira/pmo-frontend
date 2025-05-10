import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface UsuarioParams {
  skip?: number;
  limit?: number;
  ativo?: boolean;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  recurso_id: number | null;
  ativo: boolean;
  ultimo_acesso?: string;
}

export const getUsuarios = (params: UsuarioParams = {}) => {
  return apiGet<{ items: Usuario[], total: number, page: number, pages: number }>('/usuarios', params);
};

export const getUsuarioAtual = () => {
  return apiGet<Usuario>('/auth/me');
};

export const createUsuario = (data: {
  nome: string;
  email: string;
  role: string;
  recurso_id?: number;
  senha: string;
}) => {
  return apiPost<Usuario>('/usuarios', data);
};

export const updateUsuario = (id: number, data: {
  nome?: string;
  email?: string;
  role?: string;
  ativo?: boolean;
}) => {
  return apiPut<Usuario>(`/usuarios/${id}`, data);
};

export const alterarSenha = (id: number, data: {
  senha_atual: string;
  nova_senha: string;
}) => {
  return apiPut<{ message: string }>(`/usuarios/${id}/alterar-senha`, data);
};

export const desativarUsuario = (id: number) => {
  return apiDelete<{ message: string }>(`/usuarios/${id}`);
}; 