// Serviço utilitário para autocomplete de entidades
// Implementa funções para recursos, projetos, equipes e seções

/**
 * Busca recursos pelo nome (autocomplete)
 * @param {string} termo
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarRecursosPorNome(termo) {
  if (!termo || termo.length < 2) return [];
  try {
    // Endpoint de busca de recursos
    const resp = await fetch(`/backend/v1/recursos/autocomplete?search=${encodeURIComponent(termo)}`);
    if (!resp.ok) throw new Error('Erro ao buscar recursos');
    const data = await resp.json();
    // Aceita resposta como array raiz OU objeto com items
    return (Array.isArray(data)
      ? data.map(item => ({ id: item.id, nome: item.nome }))
      : (data.items || []).map(item => ({ id: item.id, nome: item.nome }))
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca projetos pelo nome (autocomplete)
 * @param {string} termo
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarProjetosPorNome(termo) {
  if (!termo || termo.length < 2) return [];
  try {
    // Endpoint de busca de projetos
    const resp = await fetch(`/backend/v1/projetos/autocomplete?search=${encodeURIComponent(termo)}`);
    if (!resp.ok) throw new Error('Erro ao buscar projetos');
    const data = await resp.json();
    // Aceita resposta como array raiz OU objeto com items
    return (Array.isArray(data)
      ? data.map(item => ({ id: item.id, nome: item.nome }))
      : (data.items || []).map(item => ({ id: item.id, nome: item.nome }))
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

/**
 * Busca equipes pelo nome (autocomplete)
 * @param {string} termo
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarEquipesPorNome(termo) {
  if (!termo || termo.length < 2) return [];
  try {
    // Endpoint de busca de equipes
    const resp = await fetch(`/backend/v1/equipes/autocomplete?search=${encodeURIComponent(termo)}`);
    if (!resp.ok) throw new Error('Erro ao buscar equipes');
    const data = await resp.json();
    // Aceita resposta como array raiz OU objeto com items
    return (Array.isArray(data)
      ? data.map(item => ({ id: item.id, nome: item.nome }))
      : (data.items || []).map(item => ({ id: item.id, nome: item.nome }))
    );
  } catch (e) {
    console.error(e);
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
    // Endpoint de busca de seções
    const resp = await fetch(`/backend/v1/secoes/autocomplete?search=${encodeURIComponent(termo)}`);
    if (!resp.ok) throw new Error('Erro ao buscar seções');
    const data = await resp.json();
    // Aceita resposta como array raiz OU objeto com items
    return (Array.isArray(data)
      ? data.map(item => ({ id: item.id, nome: item.nome }))
      : (data.items || []).map(item => ({ id: item.id, nome: item.nome }))
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}
