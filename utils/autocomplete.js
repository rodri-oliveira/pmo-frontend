// Serviço utilitário para autocomplete de recursos
// Futuramente pode ser expandido para projetos, equipes, seções etc.

/**
 * Busca recursos pelo nome (autocomplete)
 * @param {string} termo
 * @returns {Promise<Array<{ id: number, nome: string }>>}
 */
export async function buscarRecursosPorNome(termo) {
  if (!termo || termo.length < 2) return [];
  try {
    // Endpoint de busca de recursos (ajuste conforme necessário)
    const resp = await fetch(`/backend/v1/recursos/autocomplete?search=${encodeURIComponent(termo)}`);
    if (!resp.ok) throw new Error('Erro ao buscar recursos');
    const data = await resp.json();
    // Aceita resposta como array raiz OU objeto com items
    return (Array.isArray(data) ? data.map(item => ({ nome: item.nome })) : (data.items || []).map(item => ({ nome: item.nome })));
  } catch (e) {
    console.error(e);
    return [];
  }
}
