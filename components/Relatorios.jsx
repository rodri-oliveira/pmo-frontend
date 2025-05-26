import React, { useState } from 'react';
import AutocompleteRecurso from './AutocompleteRecurso';
import AutocompleteProjeto from './AutocompleteProjeto';
import AutocompleteEquipe from './AutocompleteEquipe';
import AutocompleteSecao from './AutocompleteSecao';

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

export default function Relatorios() {
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
        // Filtrar apenas valores vazios, mas manter valores booleanos (true ou false)
        // Os parâmetros de agrupamento precisam ser enviados explicitamente, mesmo quando false
        if (k.startsWith('agrupar_por_')) {
          return true; // Sempre incluir parâmetros de agrupamento
        }
        return v !== '';
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
      
      // Processar todos os campos de ID que podem ser objetos do autocomplete
      const idFields = ['recurso_id', 'projeto_id', 'equipe_id', 'secao_id'];
      
      idFields.forEach(field => {
        // Se o campo for um objeto (selecionado via autocomplete), extrair o id
        if (fixedParams[field] && typeof fixedParams[field] === 'object') {
          fixedParams[field] = fixedParams[field].id;
        }
        
        // Se o campo estiver vazio ou não for um número válido, removê-lo
        if (!fixedParams[field] || isNaN(Number(fixedParams[field]))) {
          delete fixedParams[field];
        }
      });
      const qs = buildQueryString(fixedParams);
      console.log('DEBUG params:', fixedParams);
      console.log('DEBUG qs:', qs);
      console.log('DEBUG endpoint:', `${rel.endpoint}?${qs}`);
      const res = await fetch(`${rel.endpoint}?${qs}`);
      console.log('DEBUG status:', res.status, res.statusText);
      
      if (!res.ok) throw new Error(`Erro ao buscar relatório: ${res.status} ${res.statusText}`);
      
      const data = await res.json();
      console.log('DEBUG resposta completa:', data);
      
      // Verificar se a resposta é válida e contém dados
      if (Array.isArray(data)) {
        console.log('DEBUG dados em array:', data.length, 'itens');
        setResult(data);
      } else if (data && data.items && Array.isArray(data.items)) {
        console.log('DEBUG dados em data.items:', data.items.length, 'itens');
        
        // Verificar se é uma resposta de apontamentos individuais (quando filtra por recurso_id)
        // Neste caso, os items contêm campos como id, recurso_id, projeto_id, etc.
        const isIndividualItems = data.items.length > 0 && data.items[0].id !== undefined && data.items[0].recurso_id !== undefined;
        
        if (isIndividualItems) {
          console.log('DEBUG detectado resposta de apontamentos individuais');
          setResult(data.items);
        }
        // Caso normal com agrupamentos
        else if (data.total_horas !== undefined) {
          setResult([
            ...data.items,
            // Adicionar uma linha de total se houver total_horas
            { total: true, horas: data.total_horas }
          ]);
        } else {
          setResult(data.items);
        }
      } else {
        console.log('DEBUG sem dados válidos na resposta');
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
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.log('DEBUG renderTable: sem dados para exibir');
      return (
        <div style={{marginTop:24, color:WEG_AZUL, fontWeight:500, fontSize:18}}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }

    console.log('DEBUG renderTable: dados para exibir', result);
    
    // Filtra linhas de total especiais (adicionadas manualmente)
    const dataRows = result.filter(row => !row.total);
    const totalRows = result.filter(row => row.total);
    
    // Verificar se temos dados para exibir
    if (dataRows.length === 0) {
      console.log('DEBUG renderTable: sem dados após filtrar linhas de total');
      return (
        <div style={{marginTop:24, color:WEG_AZUL, fontWeight:500, fontSize:18}}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }
    
    // Descobre as colunas dinamicamente a partir dos dados retornados
    // Ignora propriedades especiais como 'total'
    let columns = Object.keys(dataRows[0] || {}).filter(col => col !== 'total');
    console.log('DEBUG colunas detectadas:', columns);

    // Cálculo de totais automaticamente a partir dos dados
    let hasTotals = totalRows.length > 0 || columns.some(col => typeof dataRows[0][col] === 'number');
    let totals = {};
    
    // Se temos linhas de total especiais, usamos elas
    if (totalRows.length > 0) {
      totalRows.forEach(row => {
        Object.keys(row).forEach(key => {
          if (key !== 'total') {
            totals[key] = row[key];
          }
        });
      });
      console.log('DEBUG totais especiais:', totals);
    }
    // Senão, calculamos os totais automaticamente
    else if (columns.some(col => typeof dataRows[0][col] === 'number')) {
      columns.forEach(col => {
        if (typeof dataRows[0][col] === 'number') {
          totals[col] = dataRows.reduce((acc, row) => acc + (typeof row[col] === 'number' ? row[col] : 0), 0);
        }
      });
      console.log('DEBUG totais calculados:', totals);
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
          {dataRows.map((row, idx) => (
            <tr key={idx} style={{background: idx%2 ? WEG_AZUL_CLARO : WEG_BRANCO}}>
              {columns.map(col => (
                <td key={col} style={{padding:'8px 12px', textAlign: typeof row[col] === 'number' ? 'right' : 'left'}}>
                  {typeof row[col] === 'number' ? formatNumber(row[col]) : (row[col] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
          {/* Exibir mensagem quando não há dados */}
          {dataRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{padding:'16px', textAlign:'center', color:WEG_AZUL, fontWeight:500}}>
                Nenhum resultado encontrado para os filtros selecionados.
              </td>
            </tr>
          )}
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
          if (filtro.name === 'recurso_id') {
            return (
              <AutocompleteRecurso
                key={filtro.name}
                value={typeof params.recurso_id === 'object' ? params.recurso_id : params.recurso_id ? { id: params.recurso_id, nome: '' } : null}
                onChange={recurso => setParams(prev => ({ ...prev, recurso_id: recurso }))}
                placeholder={filtro.placeholder || 'Digite o nome do recurso...'}
              />
            );
          }
          if (filtro.name === 'projeto_id') {
            return (
              <AutocompleteProjeto
                key={filtro.name}
                value={typeof params.projeto_id === 'object' ? params.projeto_id : params.projeto_id ? { id: params.projeto_id, nome: '' } : null}
                onChange={projeto => setParams(prev => ({ ...prev, projeto_id: projeto }))}
                placeholder={filtro.placeholder || 'Digite o nome do projeto...'}
              />
            );
          }
          if (filtro.name === 'equipe_id') {
            return (
              <AutocompleteEquipe
                key={filtro.name}
                value={typeof params.equipe_id === 'object' ? params.equipe_id : params.equipe_id ? { id: params.equipe_id, nome: '' } : null}
                onChange={equipe => setParams(prev => ({ ...prev, equipe_id: equipe }))}
                placeholder={filtro.placeholder || 'Digite o nome da equipe...'}
              />
            );
          }
          if (filtro.name === 'secao_id') {
            return (
              <AutocompleteSecao
                key={filtro.name}
                value={typeof params.secao_id === 'object' ? params.secao_id : params.secao_id ? { id: params.secao_id, nome: '' } : null}
                onChange={secao => setParams(prev => ({ ...prev, secao_id: secao }))}
                placeholder={filtro.placeholder || 'Digite o nome da seção...'}
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
