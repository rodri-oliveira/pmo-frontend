import { apiGet, apiPost, apiPut, apiDelete } from './api';

export const getApontamentos = (params = {}) => {
  return apiGet('/apontamentos', params);
};

export const getApontamento = (id) => {
  return apiGet(`/apontamentos/${id}`);
};

export const createApontamento = (data) => {
  return apiPost('/apontamentos', data);
};

export const updateApontamento = (id, data) => {
  return apiPut(`/apontamentos/${id}`, data);
};

export const deleteApontamento = (id) => {
  return apiDelete(`/apontamentos/${id}`);
};

export const createApontamentosLote = (data) => {
  return apiPost('/apontamentos/lote', data);
};