// Serviço utilitário para autocomplete de entidades
// Implementa funções para recursos, projetos, equipes e seções

/**
 * Busca todas as seções disponíveis
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarTodasSecoes() {
  try {
    const resp = await fetch(`http://localhost:8000/backend/v1/secoes?apenas_ativos=true`);
    if (!resp.ok) {
      throw new Error(`Erro ${resp.status}: ${resp.statusText}`);
    }
    const data = await resp.json();
    const raw = Array.isArray(data) ? data : (data.items || []);
    const secoes = raw.filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
    return secoes;
  } catch (e) {
    console.error('Erro ao buscar todas as seções:', e);
    return [];
  }
}

/**
 * Busca seções pelo nome (autocomplete)
 * @param {string} termo
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarSecoesPorNome(termo) {
  if (!termo || termo.length < 2) return [];
  try {
    const resp = await fetch(`http://localhost:8000/backend/v1/secoes?nome=${encodeURIComponent(termo)}&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar seções');
    const data = await resp.json();
    const secoes = (data.items || []).filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
    return secoes;
  } catch (e) {
    console.error(`Erro ao buscar seções com termo "${termo}":`, e);
    return [];
  }
}

/**
 * Busca todas as equipes disponíveis
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarTodasEquipes() {
  try {
    const resp = await fetch(`/backend/v1/equipes?apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar equipes');
    const data = await resp.json();
    const raw = Array.isArray(data) ? data : (data.items || []);
    return raw.filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca equipes pelo nome (autocomplete)
 * @param {string} termo
 * @param {number} secaoId - ID da seção para filtrar equipes (opcional)
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarEquipesPorNome(termo, secaoId = null) {
  if (!termo || termo.length < 2) return [];
  try {
    // Endpoint de busca de equipes com filtro opcional por seção
    let url = `/backend/v1/equipes/autocomplete?search=${encodeURIComponent(termo)}`;
    if (secaoId) {
      url += `&secao_id=${secaoId}`;
    }
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Erro ao buscar equipes');
    const data = await resp.json();
    // Aceita resposta como array raiz OU objeto com items
    return (Array.isArray(data)
      ? data.filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }))
      : (data.items || []).filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }))
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca equipes por seção
 * @param {number} secaoId - ID da seção
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarEquipesPorSecao(secaoId) {
  if (!secaoId) return [];
  try {
    const resp = await fetch(`/backend/v1/equipes?secao_id=${secaoId}&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar equipes por seção');
    const data = await resp.json();
    return (data.items || []).filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca todos os recursos disponíveis
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarTodosRecursos() {
  try {
    const resp = await fetch(`/backend/v1/recursos?apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar recursos');
    const data = await resp.json();
    const raw = Array.isArray(data) ? data : (data.items || []);
    return raw.filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca recursos pelo nome (autocomplete)
 * @param {string} termo
 * @param {number} equipeId - ID da equipe para filtrar recursos (opcional)
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarRecursosPorNome(termo, secaoId = null) {
  if (!termo || termo.length < 2) return [];
  try {
    // Endpoint de busca de recursos com filtro opcional por seção
    let url = `/backend/v1/recursos/autocomplete?search=${encodeURIComponent(termo)}&apenas_ativos=true`;
    if (secaoId) {
      url += `&secao_id=${secaoId}`;
    }
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Erro ao buscar recursos');
    const data = await resp.json();
    // Aceita resposta como array raiz OU objeto com items
    return (Array.isArray(data)
      ? data.filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }))
      : (data.items || []).filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }))
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca recursos por equipe
 * @param {number} equipeId - ID da equipe
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarRecursosPorSecao(secaoId) {
  if (!secaoId) return [];
  try {
    const resp = await fetch(`/backend/v1/recursos?secao_id=${secaoId}&apenas_ativos=true&limit=1000`);
    if (!resp.ok) throw new Error('Erro ao buscar recursos por seção');
    const data = await resp.json();
    return (data.items || []).filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

// Mantido para compatibilidade antiga
export async function buscarRecursosPorEquipe(equipeId) {
  if (!equipeId) return [];
  try {
    const resp = await fetch(`/backend/v1/recursos?equipe_id=${equipeId}&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar recursos por equipe');
    const data = await resp.json();
    return (data.items || []).filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca projetos por equipe
 * @param {number} equipeId - ID da equipe
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarProjetosPorEquipe(equipeId) {
  if (!equipeId) return [];
  try {
    const resp = await fetch(`/backend/v1/projetos?equipe_id=${equipeId}&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar projetos por equipe');
    const data = await resp.json();
    return (data.items || []).filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca todos os projetos disponíveis para autocomplete
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarTodosProjetos() {
  try {
    // Use endpoint de listagem para listar todos
    const resp = await fetch(`/backend/v1/projetos?apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar projetos');
    const data = await resp.json();
    const raw = Array.isArray(data) ? data : (data.items || []);
    return raw.filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca projetos pelo nome (autocomplete)
 * @param {string} termo
 * @param {number} recursoId - ID do recurso para filtrar projetos (opcional)
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarProjetosPorNome(termo, recursoId = null) {
  if (!termo || termo.length < 2) return [];
  try {
    // Endpoint de busca de projetos com filtro opcional por recurso
    let url = `/backend/v1/projetos/autocomplete?search=${encodeURIComponent(termo)}`;
    if (recursoId) {
      url += `&recurso_id=${recursoId}`;
    }
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Erro ao buscar projetos');
    const data = await resp.json();
    // Aceita resposta como array raiz OU objeto com items
    return (Array.isArray(data)
      ? data.filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }))
      : (data.items || []).filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }))
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca projetos por recurso para autocomplete
 * @param {number} recursoId - ID do recurso
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarProjetosPorRecurso(recursoId) {
  if (!recursoId) return [];
  try {
    // Use endpoint de listagem com filtro por recurso
    const resp = await fetch(`/backend/v1/projetos?recurso_id=${recursoId}&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar projetos por recurso');
    const data = await resp.json();
    const raw = Array.isArray(data) ? data : (data.items || []);
    return raw.filter(item => (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}
