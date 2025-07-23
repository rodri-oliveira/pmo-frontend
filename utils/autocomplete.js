// Serviço utilitário para autocomplete de entidades
// Implementa funções para recursos, projetos, equipes e seções

/**
 * Busca todas as seções disponíveis
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarTodasSecoes() {
  try {
    const resp = await fetch(`http://localhost:8000/backend/secoes/?skip=0&limit=100&apenas_ativos=true`);
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
    const resp = await fetch(`http://localhost:8000/backend/secoes/?skip=0&limit=100&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar seções');
    const data = await resp.json();
    const items = data.items || [];
    
    // Filtra por nome (case insensitive) e status ativo
    return items
      .filter(item => {
        const matchesName = item.nome.toLowerCase().includes(termo.toLowerCase());
        const isActive = (item.ativo !== false) && (item.inativo !== true);
        return matchesName && isActive;
      })
      .map(item => ({ id: item.id, nome: item.nome }));
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
    const resp = await fetch(`/backend/equipes/?skip=0&limit=100&apenas_ativos=true`);
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
    // Busca todas as equipes e filtra localmente por nome e seção
    const resp = await fetch(`/backend/equipes/?skip=0&limit=100&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar equipes');
    const data = await resp.json();
    const items = data.items || [];
    
    // Filtra por nome (case insensitive) e opcionalmente por seção
    return items
      .filter(item => {
        const matchesName = item.nome.toLowerCase().includes(termo.toLowerCase());
        const matchesSecao = !secaoId || item.secao_id === secaoId;
        const isActive = (item.ativo !== false) && (item.inativo !== true);
        return matchesName && matchesSecao && isActive;
      })
      .map(item => ({ id: item.id, nome: item.nome }));
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
    const resp = await fetch(`/backend/equipes/?skip=0&limit=100&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar equipes por seção');
    const data = await resp.json();
    return (data.items || []).filter(item => item.secao_id === secaoId && (item.ativo !== false) && (item.inativo !== true))
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
    const resp = await fetch(`/backend/recursos/?skip=0&limit=100&apenas_ativos=true`);
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
    // Busca todos os recursos e filtra localmente
    const resp = await fetch(`/backend/recursos/?skip=0&limit=100&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar recursos');
    const data = await resp.json();
    const items = data.items || [];
    
    // Filtra por nome (case insensitive) e opcionalmente por seção
    return items
      .filter(item => {
        const matchesName = item.nome.toLowerCase().includes(termo.toLowerCase());
        const matchesSecao = !secaoId || item.secao_id === secaoId;
        const isActive = (item.ativo !== false) && (item.inativo !== true);
        return matchesName && matchesSecao && isActive;
      })
      .map(item => ({ id: item.id, nome: item.nome }));
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
    const resp = await fetch(`/backend/recursos/?skip=0&limit=1000&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar recursos por seção');
    const data = await resp.json();
    return (data.items || []).filter(item => item.secao_id === secaoId && (item.ativo !== false) && (item.inativo !== true))
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
    const resp = await fetch(`/backend/recursos/?skip=0&limit=100&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar recursos por equipe');
    const data = await resp.json();
    return (data.items || []).filter(item => item.equipe_id === equipeId && (item.ativo !== false) && (item.inativo !== true))
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
    const resp = await fetch(`/backend/projetos/?skip=0&limit=100&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar projetos por equipe');
    const data = await resp.json();
    return (data.items || []).filter(item => item.equipe_id === equipeId && (item.ativo !== false) && (item.inativo !== true))
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
    const resp = await fetch(`/backend/projetos/?skip=0&limit=100&apenas_ativos=true`);
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
    // Busca todos os projetos e filtra localmente
    const resp = await fetch(`/backend/projetos/?skip=0&limit=100&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar projetos');
    const data = await resp.json();
    const items = data.items || [];
    
    // Filtra por nome (case insensitive) e opcionalmente por recurso
    return items
      .filter(item => {
        const matchesName = item.nome.toLowerCase().includes(termo.toLowerCase());
        const matchesRecurso = !recursoId || item.recurso_id === recursoId;
        const isActive = (item.ativo !== false) && (item.inativo !== true);
        return matchesName && matchesRecurso && isActive;
      })
      .map(item => ({ id: item.id, nome: item.nome }));
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
    const resp = await fetch(`/backend/projetos/?skip=0&limit=100&apenas_ativos=true`);
    if (!resp.ok) throw new Error('Erro ao buscar projetos por recurso');
    const data = await resp.json();
    const items = data.items || [];
    return items.filter(item => item.recurso_id === recursoId && (item.ativo !== false) && (item.inativo !== true))
      .map(item => ({ id: item.id, nome: item.nome }));
  } catch (e) {
    console.error(e);
    return [];
  }
}
