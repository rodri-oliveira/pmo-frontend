// Full file content for RelatoriosCascade.jsx

"use client";

import React, { useState, useEffect } from 'react';
import { TextField, Checkbox, FormControlLabel } from '@mui/material';
import AutocompleteSecaoCascade from './AutocompleteSecaoCascade';
import AutocompleteEquipeCascade from './AutocompleteEquipeCascade';
import AutocompleteRecursoCascade from './AutocompleteRecursoCascade';
import AutocompleteProjetoCascade from './AutocompleteProjetoCascade';
import HorasApontadasPage from './HorasApontadasPage';

// Função auxiliar movida para o escopo do módulo para garantir estabilidade.
const getPortugueseMonth = (month) => {
  const monthNumber = parseInt(month, 10);
  if (!isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[monthNumber - 1];
  }
  return month; // Retorna o valor original se não for um número de mês válido
};

// Paleta WEG
const WEG_AZUL = "#00579D";
const WEG_BRANCO = "#FFFFFF";
const CINZA_BORDA = "#E0E3E7";

const RELATORIOS = [
  {
    label: 'Horas Apontadas',
    value: 'horas-apontadas-nova',
    descricao: 'Nova página de relatório de horas apontadas.',
    filtros: [],
    agrupamentos: [],
  },
  {
    label: 'Horas por Recurso',
    value: 'cascade-horas-por-recurso',
    endpoint: '/backend/v1/relatorios/horas-por-recurso',
    descricao: 'Total de horas apontadas por recurso, com opção de agrupar por projeto e mês.',
    filtros: [
      { name: 'data_inicio', placeholder: 'Data Início', type: 'date' },
      { name: 'data_fim', placeholder: 'Data Fim', type: 'date' },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
    ],
    agrupamentos: [
      { name: 'agrupar_por_recurso', value: true, hidden: true },
    ],
  },

  {
    label: 'Disponibilidade de Recursos',
    value: 'cascade-disponibilidade-recursos',
    endpoint: '/backend/v1/relatorios/disponibilidade-recursos',
    descricao: 'Relatório de disponibilidade dos recursos (RH, planejado, realizado, livres e percentuais).',
    filtros: [
      { name: 'ano', placeholder: 'Ano', type: 'text' },
      { name: 'mes', placeholder: 'Mês', type: 'text' },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
    ],
    agrupamentos: [
      { name: 'agrupar_por_mes', value: true, hidden: false },
    ],
  },
  {
    label: 'Planejado vs Realizado',
    value: 'cascade-planejado-vs-realizado',
    endpoint: '/backend/v1/relatorios/planejado-vs-realizado2',
    descricao: 'Comparativo de horas planejadas e realizadas.',
    filtros: [
      { name: 'ano', placeholder: 'Ano', type: 'text' },
      { name: 'mes', placeholder: 'Mês', type: 'text' },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
      { name: 'projeto_id', placeholder: 'Projeto', type: 'projeto' },
      { name: 'agrupar_por_projeto', label: 'Agrupar por Projeto', type: 'checkbox' }
    ],
    agrupamentos: [],
  },
  {
    label: 'Apontamentos Detalhados',
    value: 'cascade-apontamentos-detalhados',
    endpoint: '/backend/v1/relatorios/apontamentos-detalhados',
    descricao: 'Lista detalhada de todos os apontamentos no período.',
    filtros: [
      { name: 'data_inicio', placeholder: 'Data Início', type: 'date' },
      { name: 'data_fim', placeholder: 'Data Fim', type: 'date' },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
    ],
  },
  {
    label: 'Horas por Projeto',
    value: 'cascade-horas-por-projeto',
    endpoint: '/backend/v1/relatorios/horas-por-projeto',
    descricao: 'Total de horas apontadas por projeto, com opção opcional de agrupamento por mês.',
    filtros: [
      { name: 'data_inicio', placeholder: 'Data Início', type: 'date' },
      { name: 'data_fim', placeholder: 'Data Fim', type: 'date' },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
    ],
    agrupamentos: [
      { name: 'agrupar_por_mes', value: true, hidden: false },
    ],
  },
];

export default function RelatoriosCascade() {
  const [tipoRelatorio, setTipoRelatorio] = useState(RELATORIOS[0].value);
  
  function getPrimeirodiaMesAnterior() {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 1);
    dataInicio.setDate(1);
    return dataInicio.toISOString().split('T')[0];
  }
  
  function getDiaAtual() {
    const dataFim = new Date();
    return dataFim.toISOString().split('T')[0];
  }
  
  const [params, setParams] = useState({
    secao_id: null,
    equipe_id: null,
    recurso_id: null,
    data_inicio: getPrimeirodiaMesAnterior(),
    data_fim: getDiaAtual(),
    agrupar_por_recurso: false,
    agrupar_por_projeto: true, // Default: detalhado por projeto
    agrupar_por_data: false,
    agrupar_por_mes: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function handleSecaoChange(secao) {
    setParams(prev => ({ ...prev, secao_id: secao, equipe_id: null, recurso_id: null }));
  }

  function handleEquipeChange(equipe) {
    setParams(prev => ({ ...prev, equipe_id: equipe, recurso_id: null }));
  }

  function handleRecursoChange(recurso) {
    setParams(prev => ({ ...prev, recurso_id: recurso }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setParams((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const relatorioAtivo = RELATORIOS.find(r => r.value === tipoRelatorio);
    if (!relatorioAtivo) return;

    const hasDateFilter = relatorioAtivo.filtros.some(f => f.type === 'date');
    if (hasDateFilter && (!params.data_inicio || !params.data_fim)) {
        setError('As datas de início e fim são obrigatórias para este relatório.');
        return;
    }

    const apiParams = { ...params };

    // Lógica para o relatório 'Planejado vs. Realizado'
    if (relatorioAtivo.value === 'cascade-planejado-vs-realizado') {
      // O estado do checkbox 'agrupar_por_projeto' agora corresponde diretamente ao parâmetro da API.
      apiParams.agrupar_por_projeto = !!params.agrupar_por_projeto;

      // Se NÃO estamos agrupando por projeto (ou seja, visão consolidada),
      // removemos o filtro de projeto para obter o total.
      if (!apiParams.agrupar_por_projeto) {
          delete apiParams.projeto_id;
      }
    }

    gerarRelatorio(apiParams);
  }

  function handleTipoRelatorioChange(e) {
    const novoTipo = e.target.value;
    setTipoRelatorio(novoTipo);
    setResult(null);
    setError('');
    
    const relatorioSelecionado = RELATORIOS.find(r => r.value === novoTipo);
    
    const novosParams = {
      secao_id: null,
      equipe_id: null,
      recurso_id: null,
      projeto_id: null,
      data_inicio: params.data_inicio || getPrimeirodiaMesAnterior(),
      data_fim: params.data_fim || getDiaAtual(),
      ano: new Date().getFullYear().toString(),
      mes: (new Date().getMonth() + 1).toString(),
    };
    
    if (relatorioSelecionado && relatorioSelecionado.agrupamentos) {
      relatorioSelecionado.agrupamentos.forEach(agrupamento => {
        novosParams[agrupamento.name] = agrupamento.value;
      });
    }
    
    setParams(novosParams);
  }

  function buildQueryString(params) {
    return Object.entries(params)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => {
        if (v && typeof v === 'object' && v.id) {
          return `${encodeURIComponent(k)}=${encodeURIComponent(v.id)}`;
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      })
      .join('&');
  }
  
  async function gerarRelatorio(parametros) {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const paramsAjustados = { ...parametros };
      const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
      const qs = buildQueryString(paramsAjustados);
      
      const res = await fetch(`${rel.endpoint}?${qs}`);
      
      if (!res.ok) {
        throw new Error(`Erro ao buscar relatório: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setResult(data);
      } else if (data && data.items && Array.isArray(data.items)) {
        const resultData = data.items;
        if (data.total_horas !== undefined) {
            resultData.push({ total: true, horas: data.total_horas });
        }
        setResult(resultData);
      } else {
        setResult([]);
      }
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      setError(err.message);
      setResult([]);
    } finally {
      setLoading(false);
    }
  }
  
  function formatNumber(value) {
    if (typeof value === 'number') {
      const opts = Number.isInteger(value)
        ? { maximumFractionDigits: 0 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
      return value.toLocaleString('pt-BR', opts);
    }
    return value;
  }
  
  function getColumnLabel(col) {
    const labels = {
      'recurso': 'Recurso',
      'projeto': 'Projeto',
      'secao': 'Seção',
      'equipe': 'Equipe',
      'horas': 'Horas',
      'mes': 'Mês',
      'ano': 'Ano',
      'qtd_lancamentos': 'Qtd. Lançamentos',
      'recurso_nome': 'Recurso',
      'projeto_nome': 'Projeto',
      'secao_nome': 'Seção',
      'equipe_nome': 'Equipe',
      'horas_planejadas': 'Horas Planejadas',
      'horas_realizadas': 'Horas Realizadas',
      'diferenca_horas': 'Diferença (Horas)',
      'realizado_percentual': 'Realizado (%)',
    };
    return labels[col] || col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const getFiltroStyle = (filtro) => {
    if (tipoRelatorio === 'cascade-planejado-vs-realizado') {
      switch (filtro.name) {
        case 'ano':
        case 'mes':
          return { flex: '1 1 100px', minWidth: '100px' };
        case 'secao_id':
        case 'equipe_id':
        case 'recurso_id':
        case 'projeto_id':
          return { flex: '1 1 200px', minWidth: '200px' };
        default:
          return { flex: '1 1 150px' };
      }
    }
    // Default styles for other reports
    if (filtro.type === 'date') {
        return { flex: '1 1 150px', maxWidth: '180px' };
    }
    return { flex: '1 1 200px' };
  };

  function renderTable() {
    if (!result || result.length === 0) {
      return (
        <div style={{ marginTop: 24, color: WEG_AZUL, fontWeight: 500, fontSize: 18 }}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }

    

    if (tipoRelatorio === 'cascade-planejado-vs-realizado') {
      const dataProcessada = result.map(row => {
        const horas_planejadas = row.horas_planejadas || 0;
        const horas_realizadas = row.horas_realizadas || 0;
        const diferenca_horas = horas_realizadas - horas_planejadas;
        const realizado_percentual = horas_planejadas > 0 ? (horas_realizadas / horas_planejadas) * 100 : 0;

        return {
          secao: row.secao_nome ?? row.secao ?? '-',
          equipe: row.equipe_nome ?? row.equipe ?? '-',
          recurso: row.recurso_nome ?? row.recurso ?? '-',
          projeto: row.projeto_nome ?? row.projeto ?? '-',
          ano: row.ano,
          mes: getPortugueseMonth(row.mes),
          horas_planejadas: horas_planejadas,
          horas_realizadas: horas_realizadas,
          diferenca_horas: diferenca_horas,
          realizado_percentual: realizado_percentual,
        };
      });

            // Define as colunas base, já sem a coluna 'secao' para otimizar o espaço, conforme solicitado.
      let colunasOrdenadas = ['equipe', 'recurso', 'ano', 'mes', 'horas_planejadas', 'horas_realizadas', 'diferenca_horas', 'realizado_percentual'];
      
      // Adiciona a coluna 'projeto' dinamicamente, apenas se a visualização for agrupada por projeto.
      if (params.agrupar_por_projeto) {
        // Insere 'projeto' na terceira posição (após 'recurso').
        colunasOrdenadas.splice(2, 0, 'projeto');
      }
      
      return (
        <div style={{ overflowX: 'auto', marginTop: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: WEG_AZUL, color: WEG_BRANCO }}>
                {colunasOrdenadas.map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }}>
                    {getColumnLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataProcessada.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 ? '#F4F8FB' : WEG_BRANCO }}>
                  {colunasOrdenadas.map(col => {
                    let value = row[col] ?? '-';
                    const cellStyle = {
                      padding: '11px 16px',
                      textAlign: 'left',
                      fontSize: 15,
                      borderBottom: '1px solid #e3e7ee',
                      color: '#232b36',
                      fontWeight: 500,
                    };

                    if (col === 'diferenca_horas' && typeof value === 'number' && value < 0) {
                      cellStyle.color = 'red';
                    }
                    
                    

                    let formattedValue = value;

                    if (col === 'realizado_percentual') {
                      formattedValue = `${formatNumber(value)}%`;
                    
                    } else if (typeof value === 'number' && col !== 'ano') {
                      formattedValue = formatNumber(value);
                    } else if (col === 'ano') {
                      formattedValue = String(value).replace('.', '');
                    }

                    return <td key={col} style={{ ...cellStyle, textAlign: 'center' }}>{formattedValue}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Renderização específica para Horas por Recurso
  if (tipoRelatorio === 'cascade-horas-por-recurso') {
    const colunasOrdenadas = ['recurso', 'projeto', 'ano', 'mes', 'horas', 'qtd_lancamentos'];
    const dataOrdenada = result.map(r => ({
      recurso: r.recurso ?? r.recurso_nome ?? '-',
      projeto: r.projeto ?? r.projeto_nome ?? '-',
      ano: String(r.ano).replace('.', ''),
      mes: getPortugueseMonth(r.mes),
      horas: r.horas,
      qtd_lancamentos: (r.qtd_lancamentos ?? r.qtd) || 0,
    }));

    return (
      <div style={{ overflowX: 'auto', marginTop: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: WEG_AZUL, color: WEG_BRANCO }}>
              {colunasOrdenadas.map(col => (
                <th key={col} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>
                  {getColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataOrdenada.map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 ? '#F4F8FB' : WEG_BRANCO }}>
                {colunasOrdenadas.map(col => {
                  let value = row[col] ?? '-';
                  if (col === 'horas' || col === 'qtd_lancamentos') {
                    value = formatNumber(value);
                  }
                  return (
                    <td key={col} style={{ padding: '11px 14px', textAlign: 'center', fontSize: 15, borderBottom: '1px solid #e3e7ee', color: '#232b36', fontWeight: 500 }}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Renderização específica para Horas por Projeto
  if (tipoRelatorio === 'cascade-horas-por-projeto') {
    const colunasOrdenadas = ['projeto', 'ano', 'mes', 'horas', 'qtd_lancamentos'];
    const dataOrdenada = result.map(r => ({
      projeto: r.projeto ?? r.projeto_nome ?? '-',
      ano: String(r.ano).replace('.', ''),
      mes: getPortugueseMonth(r.mes),
      horas: r.horas,
      qtd_lancamentos: (r.qtd_lancamentos ?? r.qtd) || 0,
    }));

    return (
      <div style={{ overflowX: 'auto', marginTop: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: WEG_AZUL, color: WEG_BRANCO }}>
              {colunasOrdenadas.map(col => (
                <th key={col} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>
                  {getColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataOrdenada.map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 ? '#F4F8FB' : WEG_BRANCO }}>
                {colunasOrdenadas.map(col => {
                  let value = row[col] ?? '-';
                  if (col === 'horas' || col === 'qtd_lancamentos') {
                    value = formatNumber(value);
                  }
                  return (
                    <td key={col} style={{ padding: '11px 14px', textAlign: 'center', fontSize: 15, borderBottom: '1px solid #e3e7ee', color: '#232b36', fontWeight: 500 }}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Renderização específica para Disponibilidade de Recursos
  if (tipoRelatorio === 'cascade-disponibilidade-recursos') {
    const colunasOrdenadas = ['recurso', 'ano', 'mes', 'horas_disponiveis_rh', 'horas_planejadas', 'horas_realizadas', 'horas_livres', 'percentual_alocacao_rh', 'percentual_utilizacao_planejado', 'percentual_utilizacao_disponivel'];
    const dataOrdenada = result.map(r => ({
      recurso: r.recurso_nome ?? r.recurso ?? '-',
      ano: String(r.ano).replace('.', ''),
      mes: getPortugueseMonth(r.mes),
      horas_disponiveis_rh: r.horas_disponiveis_rh,
      horas_planejadas: r.horas_planejadas,
      horas_realizadas: r.horas_realizadas,
      horas_livres: r.horas_livres,
      percentual_alocacao_rh: r.percentual_alocacao_rh,
      percentual_utilizacao_planejado: r.percentual_utilizacao_sobre_planejado,
      percentual_utilizacao_disponivel: r.percentual_utilizacao_sobre_disponivel_rh,
    }));

    return (
      <div style={{ overflowX: 'auto', marginTop: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: WEG_AZUL, color: WEG_BRANCO }}>
              {colunasOrdenadas.map(col => (
                <th key={col} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>
                  {getColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataOrdenada.map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 ? '#F4F8FB' : WEG_BRANCO }}>
                {colunasOrdenadas.map(col => {
                  let value = row[col] ?? '-';
                  if (col.startsWith('horas')) {
                    value = formatNumber(value);
                  } else if (col.startsWith('percentual')) {
                    value = `${formatNumber(value)}%`;
                  }
                  return (
                    <td key={col} style={{ padding: '11px 14px', textAlign: 'center', fontSize: 15, borderBottom: '1px solid #e3e7ee', color: '#232b36', fontWeight: 500 }}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Default table rendering for other reports
    const columns = Object.keys(result[0] || {}).filter(key => key !== 'total' && key !== 'recurso_id' && key !== 'projeto_id' && key !== 'mes_nome');
    const dataToRender = result.filter(r => !r.total);
    const totalsRow = result.find(r => r.total);

    return (
      <div style={{ overflowX: 'auto', marginTop: 24, border: `1px solid ${CINZA_BORDA}`, borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: WEG_AZUL, color: WEG_BRANCO }}>
              {columns.map(col => (
                <th key={col} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold', fontSize: 15, borderRight: '1px solid #004a8a' }}>
                  {getColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataToRender.map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 ? '#F4F8FB' : WEG_BRANCO }}>
                {columns.map(col => (
                  <td key={col} style={{ padding: '11px 14px', textAlign: 'center', fontSize: 15, borderBottom: '1px solid #e3e7ee', color: '#232b36', fontWeight: 500 }}>
                    {(col === 'mes') ? getPortugueseMonth(row[col]) : (typeof row[col] === 'number' ? formatNumber(row[col]) : (row[col] ?? '-'))}
                  </td>
                ))}
              </tr>
            ))}
            {totalsRow && (
              <tr style={{ background: '#E3F1FC', fontWeight: 'bold' }}>
                {columns.map(col => (
                  <td key={col} style={{ padding: '12px 14px', textAlign: 'center', fontSize: 15, borderTop: `2px solid ${WEG_AZUL}` }}>
                    {totalsRow[col] !== undefined ? (col === 'horas' ? formatNumber(totalsRow[col]) : totalsRow[col]) : ''}
                  </td>
                ))}
              </tr>
            )}

          </tbody>
        </table>
      </div>
    );
  }
  
  const relatorioSelecionado = RELATORIOS.find(r => r.value === tipoRelatorio);

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      padding: '32px 32px 24px 32px',
      background: '#f8fafc',
      borderRadius: 18,
      boxShadow: '0 4px 24px #0003'
    }}>
      <h2 style={{
        color: WEG_AZUL, marginBottom: 22, borderBottom: `3px solid ${WEG_AZUL}`,
        paddingBottom: 10, fontWeight: 800, letterSpacing: 1.2, fontSize: 26
      }}>
        Relatórios
      </h2>

      <div style={{marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16}}>
        <label style={{fontWeight: 700, color: WEG_AZUL, fontSize: 17, marginRight: 8}}>Tipo de Relatório:</label>
        <select
          value={tipoRelatorio}
          onChange={handleTipoRelatorioChange}
          style={{
            padding: '10px 18px', borderRadius: 8, border: `2px solid ${WEG_AZUL}`,
            fontSize: 17, color: WEG_AZUL, background: WEG_BRANCO, fontWeight: 600, minWidth: 300
          }}
        >
          {RELATORIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {tipoRelatorio === 'horas-apontadas-nova' ? (
        <HorasApontadasPage />
      ) : (
        <>
          {relatorioSelecionado && (
            <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
              <h2 style={{ color: WEG_AZUL, fontWeight: 900, fontSize: 28, marginBottom: 8 }}>
                {relatorioSelecionado.label}
              </h2>
              <p style={{ color: '#555', marginTop: 0, marginBottom: 24 }}>
                {relatorioSelecionado.descricao}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignItems: 'flex-end',
                  width: '100%',
                  marginBottom: '10px'
                }}
              >
                {relatorioSelecionado.filtros
                  .filter((f) => f.type !== 'checkbox')
                  .map((filtro) => {
                    const style = getFiltroStyle(filtro);
                    const commonProps = { fullWidth: true, size: 'small', variant: 'outlined' };
                    let component;
                    switch (filtro.type) {
                      case 'date':
                        component = (
                          <TextField
                            {...commonProps}
                            name={filtro.name}
                            type="date"
                            label={filtro.placeholder}
                            value={params[filtro.name] || ''}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                          />
                        );
                        break;
                      case 'secao':
                        component = (
                          <AutocompleteSecaoCascade
                            {...commonProps}
                            value={params.secao_id}
                            onChange={handleSecaoChange}
                            placeholder="Selecione a seção"
                          />
                        );
                        break;
                      case 'equipe':
                        component = (
                          <AutocompleteEquipeCascade
                            {...commonProps}
                            value={params.equipe_id}
                            onChange={handleEquipeChange}
                            secaoId={params.secao_id?.id}
                            placeholder="Selecione a equipe"
                          />
                        );
                        break;
                      case 'recurso':
                        component = (
                          <AutocompleteRecursoCascade
                            {...commonProps}
                            value={params.recurso_id}
                            onChange={handleRecursoChange}
                            equipeId={params.equipe_id?.id}
                            placeholder="Selecione o recurso"
                          />
                        );
                        break;
                      case 'projeto':
                        component = (
                          <AutocompleteProjetoCascade
                            {...commonProps}
                            value={params.projeto_id}
                            onChange={(p) => setParams(prev => ({ ...prev, projeto_id: p }))}
                            placeholder="Selecione o projeto"
                          />
                        );
                        break;
                      default:
                        component = (
                          <TextField
                            {...commonProps}
                            name={filtro.name}
                            label={filtro.placeholder}
                            value={params[filtro.name] || ''}
                            onChange={handleChange}
                          />
                        );
                        break;
                    }
                    return (
                      <div key={filtro.name} style={style}>
                        {component}
                      </div>
                    );
                  })}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '20px',
                  width: '100%',
                }}
              >
                {relatorioSelecionado.filtros
                  .filter((f) => f.type === 'checkbox')
                  .map((filtro) => {
                    const style = getFiltroStyle(filtro);
                    return (
                      <div key={filtro.name} style={style}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!params[filtro.name]}
                              onChange={handleChange}
                              name={filtro.name}
                              sx={{ color: WEG_AZUL, '&.Mui-checked': { color: WEG_AZUL } }}
                            />
                          }
                          label={filtro.label}
                        />
                      </div>
                    );
                  })}
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: WEG_AZUL,
                  color: WEG_BRANCO,
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 16,
                  opacity: loading ? 0.6 : 1,
                  transition: 'background-color 0.3s ease',
                  height: '40px',
                }}
              >
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </button>
            </form>
          )}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: '#FEE2E2',
                color: '#B91C1C',
                borderRadius: 8,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}
          {result && renderTable()}
        </>
      )}
    </div>
  );
}