import { apiPost, apiGet } from './api.jsx';

// Criar apontamento manual
export const createApontamento = (data) =>
  apiPost('/apontamentos/apontamentos/', data);

// Buscar recursos para dropdown
export const getRecursos = () => apiGet('/recursos?ativo=true');

// Buscar projetos para dropdown
export const getProjetos = () => apiGet('/projetos?ativo=true');
