import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Busca lista de usuários
export const getUsuarios = (params = {}) => {
  return apiGet('/usuarios', params);
};

// Busca o usuário atualmente autenticado
export const getUsuarioAtual = () => {
  return apiGet('/auth/me');
};

// Cria um novo usuário
export const createUsuario = (data) => {
  return apiPost('/usuarios', data);
};

// Atualiza um usuário existente
export const updateUsuario = (id, data) => {
  return apiPut(`/usuarios/${id}`, data);
};

// Altera a senha do usuário
export const alterarSenha = (id, data) => {
  return apiPut(`/usuarios/${id}/alterar-senha`, data);
};

// Desativa (deleta) um usuário
export const desativarUsuario = (id) => {
  return apiDelete(`/usuarios/${id}`);
};
