import React, { useState } from 'react';

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
      .filter(([_, v]) => v !== '' && v !== false)
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
      const qs = buildQueryString(params);
      const res = await fetch(`${rel.endpoint}?${qs}`);
      if (!res.ok) throw new Error('Erro ao buscar relatório');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Renderiza tabela dinâmica
  function renderTable() {
    if (!result || !Array.isArray(result) || result.length === 0) return null;
    // Colunas customizadas para cada relatório
    const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
    let columns = Object.keys(result[0]);
    if (tipoRelatorio === 'planejado-vs-realizado') {
      columns = ['recurso_id', 'recurso_nome', 'projeto_id', 'projeto_nome', 'equipe_nome', 'secao_nome', 'ano', 'mes', 'horas_planejadas', 'horas_realizadas', 'diferenca', 'percentual_realizado'];
    }
    if (tipoRelatorio === 'disponibilidade-recursos') {
      columns = ['recurso_id', 'recurso_nome', 'ano', 'mes', 'horas_disponiveis_rh', 'horas_planejadas', 'horas_realizadas', 'horas_livres', 'percentual_alocacao_rh', 'percentual_utilizacao_sobre_planejado', 'percentual_utilizacao_sobre_disponivel_rh'];
    }
    if (tipoRelatorio === 'horas-por-projeto') {
      columns = ['projeto_id', 'projeto_nome', 'projeto_codigo', 'total_horas'];
    }
    if (tipoRelatorio === 'horas-por-recurso') {
      columns = ['projeto_id', 'projeto_nome', 'recurso_id', 'recurso_nome', 'equipe_nome', 'secao_nome', 'total_horas'];
    }
    return (
      <table style={{marginTop:16, borderCollapse:'collapse', width:'100%'}} border={1}>
        <thead>
          <tr>
            {columns.map(col => <th key={col} style={{padding:'4px 8px', background:'#f4f4f4'}}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {result.map((row, i) => (
            <tr key={i}>
              {columns.map(col => <td key={col} style={{padding:'4px 8px'}}>{row[col]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
  return (
    <div style={{maxWidth: 900, margin: '0 auto', padding: 24}}>
      <h2>Relatórios</h2>
      <div style={{marginBottom: 18}}>
        <label><b>Tipo de Relatório: </b></label>
        <select value={tipoRelatorio} onChange={handleTipoRelatorioChange} style={{marginLeft: 8, padding: '4px 8px'}}>
          {RELATORIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <form onSubmit={handleSubmit} style={{display:'flex', flexWrap:'wrap', gap:12}}>
        {rel.filtros.map(filtro =>
          filtro.type === 'checkbox' ? (
            <label key={filtro.name} style={{marginRight: 10}}>
              <input type="checkbox" name={filtro.name} checked={!!params[filtro.name]} onChange={handleChange} /> {filtro.label}
            </label>
          ) : (
            <input key={filtro.name} name={filtro.name} value={params[filtro.name] || ''} onChange={handleChange} placeholder={filtro.placeholder} style={{width:filtro.width}} />
          )
        )}
        <button type="submit" disabled={loading} style={{padding:'6px 18px'}}>Gerar Relatório</button>
      </form>

      <div style={{margin:'18px 0'}}>
        <b>Exemplos rápidos:</b>
        <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:6}}>
          {rel.exemplos.map((ex, idx) => (
            <button key={idx} type="button" onClick={()=>handleExemploClick(ex)} style={{padding:'4px 10px'}}>{ex.label}</button>
          ))}
        </div>
      </div>

      {loading && <div>Carregando...</div>}
      {error && <div style={{color:'red', marginTop:12}}>{error}</div>}
      {renderTable()}

      {result &&
        <pre style={{marginTop:20, background:'#f3f3f3', padding:10, fontSize:13}}>
          {JSON.stringify(result, null, 2)}
        </pre>
      }
    </div>
  );
}

export default Relatorios;
