import axios from 'axios';

// Service para buscar filtros populados em cascata
export async function getFiltrosPopulados({ secao_id = null, equipe_id = null, recurso_id = null }) {
  const params = {};
  if (secao_id) params.secao_id = secao_id;
  if (equipe_id) params.equipe_id = equipe_id;
  if (recurso_id) params.recurso_id = recurso_id;

  const response = await axios.get('/backend/filtros/filtros-populados', { params });
  return response.data;
}
