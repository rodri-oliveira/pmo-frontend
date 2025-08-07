import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

// --- API de Alocações ---

// Busca todas as alocações, com suporte a paginação e filtros
export const getAlocacoes = (params) => apiGet('/alocacoes', params);

// Cria uma nova alocação
// ATENÇÃO:
// - Em DEV, o api.js usa API_BASE_URL = "http://localhost:8000/backend/v1".
// - Em QAS/PROD, API_BASE_URL vem de /api/config e já aponta para "https://<domínio>/backend" (SEM /v1).
//   Portanto, NUNCA inclua "/v1" aqui ou use hacks como "../".
//   O endpoint correto e único que o backend deve prover é:
//   POST   /backend/alocacoes/   (criar alocação)
//   GET    /backend/alocacoes/   (listar alocações)
//   PUT    /backend/alocacoes/{id}
//   DELETE /backend/alocacoes/{id}
// Se algum ambiente precisar de versão, o backend deve redirecionar ou manter ambos.
export const createAlocacao = (data) => apiPost('/alocacoes/', data);

// Atualiza uma alocação existente
export const updateAlocacao = (id, data) => {
  const cleanData = {
    recurso_id: data.recurso_id,
    projeto_id: data.projeto_id,
    equipe_id: data.equipe_id,
    data_inicio_alocacao: data.data_inicio_alocacao,
    data_fim_alocacao: data.data_fim_alocacao,
    status_alocacao_id: data.status_alocacao_id,
    observacao: data.observacao || ""
  };

  // Remove campos nulos/undefined para garantir que apenas dados válidos sejam enviados
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === null || cleanData[key] === undefined) {
      delete cleanData[key];
    }
  });

  // Endpoint alinhado com createAlocacao: "/alocacoes/{id}".  O backend deve aceitar /backend/alocacoes/{id}
return apiPut(`/alocacoes/${id}`, cleanData);
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
 * @returns {Promise<void>}
 */
// Deleta horas planejadas específicas
export const deleteHorasPlanejadas = async (idAlocacao, ano, mes) => {
  const url = `http://localhost:8000/backend/horas-planejadas/horas-planejadas/${idAlocacao}/${ano}/${mes}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao deletar horas planejadas:', error);
    throw error;
  }
};

// Salva ou atualiza horas planejadas para uma alocação
export const saveHorasPlanejadas = async (idAlocacao, horasPlanejadasList) => {
  console.log(' Salvando horas planejadas:', { idAlocacao, horasPlanejadasList });
  
  try {
    const results = [];
    
    // Salva cada hora planejada individualmente usando PUT
    for (const hora of horasPlanejadasList) {
      const alocacaoId = parseInt(idAlocacao);
      const ano = parseInt(hora.ano);
      const mes = parseInt(hora.mes);
      const horas = parseFloat(hora.horas) || 0;
      
      // Validação dos dados
      if (!alocacaoId || !ano || !mes || horas < 0) {
        console.error('❌ Dados inválidos:', { alocacaoId, ano, mes, horas });
        throw new Error(`Dados inválidos: alocacao=${alocacaoId}, ano=${ano}, mes=${mes}, horas=${horas}`);
      }
      
      // URL com parâmetros (como no Swagger)
      const url = `http://localhost:8000/backend/horas-planejadas/horas-planejadas/${alocacaoId}/${ano}/${mes}`;
      
      // Payload simples (só as horas)
      const payload = {
        horas_planejadas: horas
      };
      
      console.log('📤 Enviando hora planejada:', { url, payload });
      
      const response = await fetch(url, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.text();
        } catch (e) {
          errorDetails = 'Não foi possível ler o corpo da resposta';
        }
        
        console.error('❌ Erro detalhado do backend:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorDetails,
          payload: payload
        });
        
        throw new Error(`Erro HTTP: ${response.status} - ${errorDetails}`);
      }
      
      const result = await response.json();
      results.push(result);
    }
    
    console.log(' Todas as horas planejadas salvas com sucesso:', results);
    return results;
  } catch (error) {
    console.error(' Erro ao salvar horas planejadas:', error);
    throw error;
  }
};
