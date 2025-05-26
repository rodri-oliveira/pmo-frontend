import React, { useState } from 'react';
import AutocompleteRecurso from './AutocompleteRecurso';

// Paleta WEG
const WEG_AZUL = "#00579D";
const WEG_AZUL_CLARO = "#E3F1FC";
const WEG_BRANCO = "#FFFFFF";
const CINZA_CLARO = "#F4F6F8";
const CINZA_BORDA = "#E0E3E7";

const RELATORIOS = [
  {
    label: 'Horas Apontadas',
    value: 'horas-apontadas',
    endpoint: '/backend/v1/relatorios/horas-apontadas',
    exemplos: [
      { label: 'Total de horas por recurso, agrupado por mês', params: { agrupar_por_recurso: true, agrupar_por_mes: true } },
      { label: 'Total de horas de um recurso específico (ex: recurso_id=5), em todos os projetos', params: { recurso_id: 5, agrupar_por_projeto: true } },
      { label: 'Total de horas de todos os recursos de uma equipe específica (equipe_id=9), em maio de 2025', params: { equipe_id: 9, data_inicio: '2025-05-01', data_fim: '2025-05-31', agrupar_por_recurso: true } },
      { label: 'Total de horas de uma seção específica (secao_id=2), em todos os projetos', params: { secao_id: 2, agrupar_por_projeto: true } },
      { label: 'Total de horas de um projeto específico (projeto_id=1) por recurso, em junho de 2025', params: { projeto_id: 1, data_inicio: '2025-06-01', data_fim: '2025-06-30', agrupar_por_recurso: true } },
      { label: 'Total geral de horas (sem filtros)', params: {} },
    ],
    filtros: [
      { name: 'recurso_id', placeholder: 'Recurso ID', type: 'text', width: 120 },
      { name: 'projeto_id', placeholder: 'Projeto ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
      { name: 'data_inicio', placeholder: 'Data início (YYYY-MM-DD ou DD/MM/YYYY)', type: 'text', width: 210 },
      { name: 'data_fim', placeholder: 'Data fim (YYYY-MM-DD ou DD/MM/YYYY)', type: 'text', width: 210 },
      { name: 'fonte_apontamento', placeholder: 'Fonte (JIRA/MANUAL)', type: 'text', width: 150 },
      { name: 'agrupar_por_recurso', label: 'Agrupar por Recurso', type: 'checkbox' },
      { name: 'agrupar_por_projeto', label: 'Agrupar por Projeto', type: 'checkbox' },
      { name: 'agrupar_por_data', label: 'Agrupar por Data', type: 'checkbox' },
      { name: 'agrupar_por_mes', label: 'Agrupar por Mês', type: 'checkbox' },
    ],
  },
  {
    label: 'Planejado vs Realizado',
    value: 'planejado-vs-realizado',
    endpoint: '/backend/v1/relatorios/planejado-vs-realizado',
    exemplos: [
      { label: 'Comparativo de todos os recursos em 2025', params: { ano: 2025 } },
      { label: 'Comparativo por mês (maio de 2025)', params: { ano: 2025, mes: 5 } },
      { label: 'Comparativo para um projeto específico (projeto_id=2) em 2025', params: { ano: 2025, projeto_id: 2 } },
      { label: 'Comparativo para um recurso específico (recurso_id=3) em 2025', params: { ano: 2025, recurso_id: 3 } },
      { label: 'Comparativo para equipe e seção', params: { ano: 2025, equipe_id: 1, secao_id: 1 } },
    ],
    filtros: [
      { name: 'ano', placeholder: 'Ano de referência (obrigatório)', type: 'text', width: 120 },
      { name: 'mes', placeholder: 'Mês (1-12)', type: 'text', width: 80 },
      { name: 'projeto_id', placeholder: 'Projeto ID', type: 'text', width: 120 },
      { name: 'recurso_id', placeholder: 'Recurso ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
    ],
  },
  {
    label: 'Disponibilidade de Recursos',
    value: 'disponibilidade-recursos',
    endpoint: '/backend/v1/relatorios/disponibilidade-recursos',
    exemplos: [
      { label: 'Disponibilidade de todos os recursos em 2025', params: { ano: 2025 } },
      { label: 'Disponibilidade de todos os recursos em julho de 2025', params: { ano: 2025, mes: 7 } },
      { label: 'Disponibilidade de um recurso específico (recurso_id=22) em 2025', params: { ano: 2025, recurso_id: 22 } },
    ],
    filtros: [
      { name: 'ano', placeholder: 'Ano de referência (obrigatório)', type: 'text', width: 120 },
      { name: 'mes', placeholder: 'Mês (1-12)', type: 'text', width: 80 },
      { name: 'recurso_id', placeholder: 'Recurso ID', type: 'text', width: 120 },
    ],
  },
  {
    label: 'Horas por Projeto',
    value: 'horas-por-projeto',
    endpoint: '/backend/v1/relatorios/horas-por-projeto',
    exemplos: [
      { label: 'Total de horas por projeto (todos)', params: {} },
      { label: 'Horas por projeto filtrando por seção (secao_id=1)', params: { secao_id: 1 } },
      { label: 'Horas por projeto filtrando por equipe (equipe_id=1)', params: { equipe_id: 1 } },
      { label: 'Horas por projeto em um período', params: { data_inicio: '2025-05-01', data_fim: '2025-05-31' } },
      { label: 'Horas por projeto filtrando por seção e equipe', params: { secao_id: 1, equipe_id: 1 } },
    ],
    filtros: [
      { name: 'data_inicio', placeholder: 'Data início', type: 'text', width: 140 },
      { name: 'data_fim', placeholder: 'Data fim', type: 'text', width: 140 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
    ],
  },
  {
    label: 'Horas por Recurso',
    value: 'horas-por-recurso',
    endpoint: '/backend/v1/relatorios/horas-por-recurso',
    exemplos: [
      { label: 'Total de horas por recurso (todos)', params: {} },
      { label: 'Horas por recurso filtrando por equipe (equipe_id=1)', params: { equipe_id: 1 } },
      { label: 'Horas por recurso filtrando por seção (secao_id=1)', params: { secao_id: 1 } },
      { label: 'Horas por recurso em um período', params: { data_inicio: '2025-05-01', data_fim: '2025-05-31' } },
      { label: 'Horas por recurso filtrando por projeto (projeto_id=2)', params: { projeto_id: 2 } },
      { label: 'Horas por recurso filtrando por todos os campos', params: { data_inicio: '2025-05-01', data_fim: '2025-05-31', projeto_id: 2, equipe_id: 1, secao_id: 1 } },
    ],
    filtros: [
      { name: 'data_inicio', placeholder: 'Data início', type: 'text', width: 140 },
      { name: 'data_fim', placeholder: 'Data fim', type: 'text', width: 140 },
      { name: 'projeto_id', placeholder: 'Projeto ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
    ],
  },
  {
    label: 'Horas Disponíveis do Recurso',
    value: 'horas-disponiveis',
    endpoint: '/backend/v1/relatorios/horas-disponiveis',
    exemplos: [
      { label: 'Horas disponíveis do recurso 3', params: { recurso_id: 3 } },
      { label: 'Horas disponíveis do recurso 3 em 2025', params: { recurso_id: 3, ano: 2025 } },
      { label: 'Horas disponíveis do recurso 3 em junho de 2025', params: { recurso_id: 3, ano: 2025, mes: 6 } },
    ],
    filtros: [
      { name: 'recurso_id', placeholder: 'recurso_id', type: 'text', width: 120 },
      { name: 'ano', placeholder: 'ano', type: 'text', width: 100 },
      { name: 'mes', placeholder: 'mes', type: 'text', width: 100 },
    ],
  },
  {
    label: 'Relatório Dinâmico de Horas',
    value: 'dinamico',
    endpoint: '/backend/v1/relatorios-dinamico/dinamico',
    exemplos: [
      { label: 'Por equipe', params: { equipe_id: 1 } },
      // outros exemplos...
    ],
    filtros: [
      { name: 'recurso_id', placeholder: 'Recurso ID', type: 'text', width: 120 },
      { name: 'equipe_id', placeholder: 'Equipe ID', type: 'text', width: 120 },
      { name: 'secao_id', placeholder: 'Seção ID', type: 'text', width: 120 },
      { name: 'projeto_id', placeholder: 'Projeto ID', type: 'text', width: 120 },
      { name: 'data_inicio', placeholder: 'Data inicial (YYYY-MM-DD ou DD/MM/YYYY)', type: 'text', width: 180 },
      { name: 'data_fim', placeholder: 'Data final (YYYY-MM-DD ou DD/MM/YYYY)', type: 'text', width: 180 },
      { name: 'agrupar_por', placeholder: 'Ex: recurso, equipe, secao, projeto, mes, ano', type: 'text', width: 200 },
    ],
  },
];

function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState(RELATORIOS[0].value);
  const [params, setParams] = useState({
    recurso_id: '',
    projeto_id: '',
    equipe_id: '',
    secao_id: '',
    data_inicio: '',
    data_fim: '',
    fonte_apontamento: '',
    agrupar_por_recurso: false,
    agrupar_por_projeto: false,
    agrupar_por_data: false,
    agrupar_por_mes: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleTipoRelatorioChange(e) {
    const selected = e.target.value;
    setTipoRelatorio(selected);
    const rel = RELATORIOS.find(r => r.value === selected);
    setParams({}); // Limpa filtros ao trocar tipo
    setResult(null);
    setError('');
  }

  function handleExemploClick(exemplo) {
    setParams({
      recurso_id: '', projeto_id: '', equipe_id: '', secao_id: '', data_inicio: '', data_fim: '', fonte_apontamento: '',
      agrupar_por_recurso: false, agrupar_por_projeto: false, agrupar_por_data: false, agrupar_por_mes: true,
      ...exemplo.params,
    });
    setResult(null);
    setError('');
  }

  function buildQueryString(params) {
    return Object.entries(params)
      .filter(([k, v]) => {
        if (k === 'recurso_id') {
          return typeof v === 'number' && !isNaN(v);
        }
        return v !== '' && v !== false;
      })
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
      const fixedParams = { ...params };
      if (fixedParams.recurso_id && typeof fixedParams.recurso_id === 'object') {
        fixedParams.recurso_id = fixedParams.recurso_id.id;
      }
      const qs = buildQueryString(fixedParams);
      const res = await fetch(`${rel.endpoint}?${qs}`);
      if (!res.ok) throw new Error('Erro ao buscar relatório');
      const data = await res.json();
      if (Array.isArray(data)) {
        setResult(data);
      } else if (Array.isArray(data.items)) {
        setResult(data.items);
      } else {
        setResult([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Função para formatar valores numéricos
  function formatNumber(value) {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value;
  }

  // Função para obter o nome amigável da coluna
  function getColumnLabel(col) {
    const columnLabels = {
      'quantidade': 'Qtd. Lançamentos',
      // IDs
      'recurso_id': 'ID Recurso',
      'projeto_id': 'ID Projeto',
      'equipe_id': 'ID Equipe',
      'secao_id': 'ID Seção',
      
      // Nomes
      'recurso_nome': 'Recurso',
      'projeto_nome': 'Projeto',
      'equipe_nome': 'Equipe',
      'secao_nome': 'Seção',
      'projeto_codigo': 'Código do Projeto',
      
      // Datas e períodos
      'ano': 'Ano',
      'mes': 'Mês',
      'data': 'Data',
      'data_inicio': 'Data Início',
      'data_fim': 'Data Fim',
      
      // Horas
      'total_horas': 'Total de Horas',
      'horas_planejadas': 'Horas Planejadas',
      'horas_realizadas': 'Horas Realizadas',
      'horas_disponiveis': 'Horas Disponíveis',
      'horas_disponiveis_mes': 'Horas Disponíveis no Mês',
      'horas_disponiveis_rh': 'Horas Disponíveis (RH)',
      'horas_livres': 'Horas Livres',
      
      // Métricas
      'diferenca': 'Diferença (horas)',
      'percentual_realizado': 'Realizado (%)',
      'percentual_alocacao_rh': 'Alocação (%)',
      'percentual_utilizacao_sobre_planejado': 'Utilização s/ Planejado (%)',
      'percentual_utilizacao_sobre_disponivel_rh': 'Utilização s/ Disponível (%)',
    };
    
    return columnLabels[col] || col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Renderiza tabela dinâmica
  function renderTable() {
    if (!result || !Array.isArray(result) || result.length === 0) return null;

    // Descobre as colunas dinamicamente a partir dos dados retornados
    let columns = Object.keys(result[0]);

    // Permite customização futura por tipo de relatório (mas padrão é sempre o JSON)
    // Exemplo: se algum relatório precisar esconder/renomear colunas, pode-se ajustar aqui

    // Cálculo de totais (mantém lógica existente)
    let hasTotals = false;
    let totals = {};
    if (columns.some(col => typeof result[0][col] === 'number')) {
      hasTotals = true;
      columns.forEach(col => {
        if (typeof result[0][col] === 'number') {
          totals[col] = result.reduce((acc, row) => acc + (typeof row[col] === 'number' ? row[col] : 0), 0);
        }
      });
    }

    return (
      <table style={{width:'100%', borderCollapse:'collapse', marginTop:8, background:WEG_BRANCO, borderRadius:8, boxShadow:'0 2px 8px #0002'}}>
        <thead>
          <tr style={{background:WEG_AZUL, color:WEG_BRANCO}}>
            {columns.map(col => (
              <th key={col} style={{padding:'10px 12px', border:'1px solid '+WEG_AZUL, fontWeight:700, fontSize:15, textAlign:'left'}} title={col}>
                {getColumnLabel(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.map((row, idx) => (
            <tr key={idx} style={{background: idx%2 ? WEG_AZUL_CLARO : WEG_BRANCO}}>
              {columns.map(col => (
                <td key={col} style={{padding:'8px 12px', textAlign: typeof row[col] === 'number' ? 'right' : 'left'}}>
                  {typeof row[col] === 'number' ? formatNumber(row[col]) : (row[col] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
          {hasTotals && (
            <tr style={{background:WEG_AZUL_CLARO, fontWeight:600}}>
              {columns.map(col => (
                <td key={col} style={{padding:'8px 12px', textAlign: typeof result[0][col] === 'number' ? 'right' : 'left'}}>
                  {totals[col] !== undefined ? formatNumber(totals[col]) : (col === columns[0] ? 'Total' : '')}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
  return (
    <div style={{
      width: '100%', 
      boxSizing: 'border-box',
      padding: '20px', 
      background: WEG_BRANCO,
      borderRadius: 12, 
      boxShadow: '0 2px 16px #0002'
    }}>
      <h2 style={{
        color: WEG_AZUL, marginBottom: 12, borderBottom: `3px solid ${WEG_AZUL}`,
        paddingBottom: 8, fontWeight: 700, letterSpacing: 1
      }}>
        Relatórios
      </h2>

      {/* Seleção do relatório */}
      <div style={{marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12}}>
        <label style={{fontWeight: 600, color: WEG_AZUL}}>Tipo de Relatório:</label>
        <select
          value={tipoRelatorio}
          onChange={handleTipoRelatorioChange}
          style={{
            padding: '8px 14px', borderRadius: 6, border: `1.5px solid ${WEG_AZUL}`,
            fontSize: 16, color: WEG_AZUL, background: WEG_BRANCO, fontWeight: 500
          }}
        >
          {RELATORIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Filtros */}
      <form onSubmit={handleSubmit} style={{display:'flex', flexWrap:'wrap', gap:16, marginBottom: 18}}>
        {rel.filtros.map(filtro => {
          // Substitui apenas para o filtro 'recurso_id' do relatório 'Horas Apontadas'
          if (tipoRelatorio === 'horas-apontadas' && filtro.name === 'recurso_id') {
            return (
              <AutocompleteRecurso
                key={filtro.name}
                value={params.recurso_id}
                onChange={id => setParams(prev => ({ ...prev, recurso_id: id }))}
                placeholder={filtro.placeholder || 'Digite o nome do recurso...'}
              />
            );
          }
          if (filtro.type === 'checkbox') {
            return (
              <label key={filtro.name} style={{
                display: 'flex', alignItems: 'center', gap: 4, color: WEG_AZUL, fontWeight: 500
              }}>
                <input
                  type="checkbox"
                  name={filtro.name}
                  checked={!!params[filtro.name]}
                  onChange={handleChange}
                  style={{
                    accentColor: WEG_AZUL, width: 18, height: 18, marginRight: 4
                  }}
                />
                {filtro.label}
              </label>
            );
          }
          // Campo padrão
          return (
            <input
              key={filtro.name}
              name={filtro.name}
              value={params[filtro.name] || ''}
              onChange={handleChange}
              placeholder={filtro.placeholder}
              style={{
                width: filtro.width,
                padding: '8px 12px',
                borderRadius: 6,
                border: `1.5px solid ${CINZA_BORDA}`,
                fontSize: 15,
                background: WEG_BRANCO,
                color: WEG_AZUL,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxShadow: '0 1px 4px #0001'
              }}
              onFocus={e => e.target.style.borderColor = WEG_AZUL}
              onBlur={e => e.target.style.borderColor = CINZA_BORDA}
            />
          );
        })}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 28px',
            background: WEG_AZUL,
            color: WEG_BRANCO,
            border: 'none',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 6px #0001',
            marginLeft: 12
          }}
        >
          Gerar Relatório
        </button>
      </form>

      {/* Exemplos rápidos */}
      <div style={{margin:'18px 0'}}>
        <b style={{color: WEG_AZUL}}>Exemplos rápidos:</b>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:6}}>
          {rel.exemplos.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={()=>handleExemploClick(ex)}
              style={{
                padding:'6px 14px',
                background: WEG_AZUL_CLARO,
                color: WEG_AZUL,
                border: `1px solid ${WEG_AZUL}`,
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseOver={e => {e.target.style.background = WEG_AZUL; e.target.style.color = WEG_BRANCO}}
              onMouseOut={e => {e.target.style.background = WEG_AZUL_CLARO; e.target.style.color = WEG_AZUL}}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedbacks */}
      {loading && <div style={{color: WEG_AZUL, marginTop:12, fontWeight:600}}>Carregando...</div>}
      {error && <div style={{color:'#D32F2F', marginTop:12, fontWeight:600}}>{error}</div>}

      {/* Tabela de resultados */}
      <div style={{marginTop:32}}>
        {renderTable()}
      </div>

      {/* Mensagem para nenhum resultado */}
      {(!loading && result && Array.isArray(result) && result.length === 0) && (
        <div style={{marginTop:24, color:WEG_AZUL, fontWeight:500, fontSize:18}}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      )}
    </div>
  );
}

export default Relatorios;
