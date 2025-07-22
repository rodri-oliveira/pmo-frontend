import { apiGet, apiPost, apiDelete } from '../lib/api';

// --- API de Alocações ---

// Busca todas as alocações, com suporte a paginação e filtros
export const getAlocacoes = (params) => apiGet('/alocacoes', params);

// Cria uma nova alocação
export const createAlocacao = (data) => apiPost('/alocacoes', data);

// Atualiza uma alocação existente
export const updateAlocacao = async (id, data) => {
  const url = `http://localhost:8000/backend/alocacoes/alocacoes/${id}`;
  console.log(' Iniciando updateAlocacao');
  console.log(' ID da alocação:', id);
  console.log(' URL completa:', url);
  console.log(' Dados originais recebidos:', JSON.stringify(data, null, 2));
  
  // Preparar dados no formato aceito pelo backend
  const cleanData = {
    recurso_id: data.recurso_id,
    projeto_id: data.projeto_id,
    equipe_id: data.equipe_id,
    data_inicio_alocacao: data.data_inicio_alocacao,
    data_fim_alocacao: data.data_fim_alocacao,
    status_alocacao_id: data.status_alocacao_id,
    observacao: data.observacao || ""
  };
  
  // Remove campos nulos/undefined
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === null || cleanData[key] === undefined) {
      delete cleanData[key];
    }
  });
  
  console.log(' Dados limpos para envio:', JSON.stringify(cleanData, null, 2));
  
  try {
    console.log(' Enviando requisição PUT...');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanData),
      mode: 'cors',
    });

    console.log(' Resposta recebida!');
    console.log(' Status:', response.status);
    console.log(' Status Text:', response.statusText);
    console.log(' URL da resposta:', response.url);

    if (!response.ok) {
      console.error(' Resposta não OK!');
      // Tentar ler o corpo da resposta de erro
      try {
        const errorBody = await response.text();
        console.error(' Corpo da resposta de erro:', errorBody);
      } catch (e) {
        console.error(' Não foi possível ler corpo do erro');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(' Dados recebidos do backend:', JSON.stringify(result, null, 2));
    console.log(' updateAlocacao concluída com sucesso!');
    return result;
  } catch (error) {
    console.error(' Erro capturado em updateAlocacao:');
    console.error(' Tipo do erro:', error.constructor.name);
    console.error(' Mensagem do erro:', error.message);
    console.error(' Stack trace:', error.stack);
    throw error;
  }
};

// Exclui uma alocação
export const deleteAlocacao = (id) => apiDelete(`/alocacoes/${id}`);

// --- Funções Específicas para a Matriz de Planejamento ---

/**
 * Salva os dados da matriz de planejamento.
 * @param {object} data - O payload para salvar, contendo as alocações.
 * @returns {Promise<object>} A resposta da API.
 */
export const salvarMatrizPlanejamento = (data) => {
  return apiPost('/matriz-planejamento/salvar', data);
};

/**
 * Busca os dados para o relatório de planejado vs realizado.
 * @param {object} filters - Os filtros para a busca.
 * @returns {Promise<object>} Os dados do relatório.
 */
export const getRelatorioPlanejadoRealizado = (filters) => {
  return apiPost('/relatorios/planejado-vs-realizado2', filters);
};

/**
 * Busca as horas disponíveis para um recurso em um determinado período.
 * @param {object} params - Parâmetros como id do recurso, data de início e fim.
 * @returns {Promise<object>} As horas disponíveis.
 */
export const getHorasDisponiveis = (params) => {
  return apiGet('/calendario/horas-disponiveis-recurso', params);
};

/**
 * Busca todos os status de projeto disponíveis.
 * @param {object} params - Parâmetros de paginação (skip, limit).
 * @returns {Promise<object>} Lista de status de projeto.
 */
export const getStatusProjeto = (params = { skip: 0, limit: 100 }) => {
  const url = new URL('http://localhost:8000/backend/status-projeto/');
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }
  return fetch(url.toString())
    .then(response => {
      if (!response.ok) {
        throw new Error('Not Found');
      }
      return response.json();
    });
};

/**
 * Deleta horas planejadas de uma alocação específica para um mês/ano.
 * @param {number} idAlocacao - ID da alocação.
 * @param {number} ano - Ano das horas planejadas.
 * @param {number} mes - Mês das horas planejadas.
 * @returns {Promise<void>} Resposta da exclusão.
 */
export const deleteHorasPlanejadas = (idAlocacao, ano, mes) => {
  const url = `http://localhost:8000/backend/horas-planejadas/horas-planejadas/${idAlocacao}/${ano}/${mes}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'accept': '*/*'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro ao deletar horas planejadas: ${response.status}`);
      }
      return response;
    });
};
