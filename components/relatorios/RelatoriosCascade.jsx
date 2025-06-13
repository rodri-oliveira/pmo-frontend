"use client";

import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import AutocompleteSecaoCascade from './AutocompleteSecaoCascade';
import AutocompleteEquipeCascade from './AutocompleteEquipeCascade';

import AutocompleteRecursoCascade from './AutocompleteRecursoCascade';
import HorasApontadasPage from './HorasApontadasPage'; // Importa a nova página

// Paleta WEG
const WEG_AZUL = "#00579D";
const WEG_AZUL_CLARO = "#E3F1FC";
const WEG_BRANCO = "#FFFFFF";
const CINZA_CLARO = "#F4F6F8";
const CINZA_BORDA = "#E0E3E7";

const RELATORIOS = [
  {
    label: 'Horas Apontadas (Nova)',
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
    label: 'Matriz Recurso x Projeto',
    value: 'cascade-matriz-recurso-projeto',
    endpoint: '/backend/v1/relatorios/matriz-recurso-projeto',
    descricao: 'Matriz de horas por recurso em cada projeto.',
    filtros: [
      { name: 'data_inicio', placeholder: 'Data Início', type: 'date' },
      { name: 'data_fim', placeholder: 'Data Fim', type: 'date' },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
    ],
    agrupamentos: [
      { name: 'agrupar_por_recurso', value: true, hidden: true },
      { name: 'agrupar_por_projeto', value: true, hidden: true },
    ],
  },
  {
    label: 'Planejado vs Realizado',
    value: 'cascade-planejado-vs-realizado',
    endpoint: '/backend/v1/relatorios/planejado-vs-realizado',
    descricao: 'Comparativo de horas planejadas e realizadas.',
    filtros: [
      { name: 'ano', placeholder: 'Ano', type: 'text' },
      { name: 'mes', placeholder: 'Mês', type: 'text' },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
    ],
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
];

export default function RelatoriosCascade() {
  const [tipoRelatorio, setTipoRelatorio] = useState(RELATORIOS[0].value);
  
  // Função para obter o primeiro dia do mês anterior
  function getPrimeirodiaMesAnterior() {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 1);
    dataInicio.setDate(1);
    return dataInicio.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  // Função para obter o dia atual
  function getDiaAtual() {
    const dataFim = new Date();
    return dataFim.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  // Estado para armazenar os parâmetros do relatório
  const [params, setParams] = useState({
    secao_id: null,
    equipe_id: null,
    recurso_id: null,
    data_inicio: getPrimeirodiaMesAnterior(),
    data_fim: getDiaAtual(),
    agrupar_por_recurso: false,
    agrupar_por_projeto: false,
    agrupar_por_data: false,
    agrupar_por_mes: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Manipuladores para os campos de autocomplete em cascata
  function handleSecaoChange(secao) {
    // Apenas atualizar os parâmetros, sem gerar relatório automaticamente
    setParams(prev => ({
      ...prev,
      secao_id: secao,
      equipe_id: null,  // Limpar equipe quando a seção mudar
      recurso_id: null, // Limpar recurso quando a seção mudar
    }));
  }

  function handleEquipeChange(equipe) {
    setParams(prev => ({
      ...prev,
      equipe_id: equipe,
      recurso_id: null, // Limpar recurso quando a equipe mudar
    }));
  }

  function handleRecursoChange(recurso) {
    setParams(prev => ({
      ...prev,
      recurso_id: recurso,
    }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  // Função para lidar com a submissão do formulário de filtros
  function handleSubmit(event) {
    event.preventDefault();
    gerarRelatorio(params);
  }

  function handleTipoRelatorioChange(e) {
    const novoTipo = e.target.value;
    setTipoRelatorio(novoTipo);
    setResult(null); // Limpar resultados ao mudar o tipo de relatório
    setError('');
    
    // Encontrar o relatório selecionado
    const relatorioSelecionado = RELATORIOS.find(r => r.value === novoTipo);
    
    // Criar novos parâmetros mantendo as datas
    const novosParams = {
      secao_id: null,
      equipe_id: null,
      recurso_id: null,
      data_inicio: params.data_inicio || getPrimeirodiaMesAnterior(),
      data_fim: params.data_fim || getDiaAtual(),
      agrupar_por_recurso: false,
      agrupar_por_projeto: false,
      agrupar_por_data: false,
      agrupar_por_mes: true,
    };
    
    // Aplicar os agrupamentos específicos deste tipo de relatório
    if (relatorioSelecionado && relatorioSelecionado.agrupamentos) {
      // Aplicar os agrupamentos definidos para este tipo de relatório
      relatorioSelecionado.agrupamentos.forEach(agrupamento => {
        novosParams[agrupamento.name] = agrupamento.value;
      });
    }
    
    // Atualizar os parâmetros
    setParams(novosParams);
  }

  function buildQueryString(params) {
    return Object.entries(params)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => {
        // Se for um objeto com id (selecionado via autocomplete), extrair o id
        if (v && typeof v === 'object' && v.id) {
          return `${encodeURIComponent(k)}=${encodeURIComponent(v.id)}`;
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      })
      .join('&');
  }
  
  // Função para gerar relatório com base nos parâmetros
  async function gerarRelatorio(parametros) {
    setLoading(true);
    setError('');
    setResult(null);
    
    // Validar se as datas foram fornecidas
    if (!parametros.data_inicio || !parametros.data_fim) {
      setError('As datas de início e fim são obrigatórias para gerar o relatório.');
      setLoading(false);
      return;
    }
    
    try {
      // Criar uma cópia dos parâmetros para não modificar o original
      const paramsAjustados = { ...parametros };
      // Adicionar parâmetros de agrupamento se não estiverem definidos
      if (paramsAjustados.agrupar_por_recurso === undefined) {
        paramsAjustados.agrupar_por_recurso = true; // Agrupar por recurso por padrão
      }
      
      if (paramsAjustados.agrupar_por_projeto === undefined) {
        paramsAjustados.agrupar_por_projeto = true; // Agrupar por projeto por padrão
      }
      
      if (paramsAjustados.agrupar_por_mes === undefined) {
        paramsAjustados.agrupar_por_mes = true; // Agrupar por mês por padrão
      }
      
      const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
      const qs = buildQueryString(paramsAjustados);
      console.log('DEBUG params ajustados:', paramsAjustados);
      console.log('DEBUG qs:', qs);
      console.log('DEBUG endpoint:', `${rel.endpoint}?${qs}`);
      
      const res = await fetch(`${rel.endpoint}?${qs}`);
      console.log('DEBUG status:', res.status, res.statusText);
      
      if (!res.ok) {
        throw new Error(`Erro ao buscar relatório: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('DEBUG resposta completa:', data);
      
      // Verificar se a resposta é válida e contém dados
      if (Array.isArray(data)) {
        console.log('DEBUG dados em array:', data.length, 'itens');
        setResult(data);
      } else if (data && data.items && Array.isArray(data.items)) {
        console.log('DEBUG dados em data.items:', data.items.length, 'itens');
        
        // Verificar se é uma resposta de apontamentos individuais
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
      console.error('Erro ao gerar relatório:', err);
      setError(err.message);
      setResult([]);
    } finally {
      setLoading(false);
    }
  }
  
  // Função para formatar valores numéricos
  function formatNumber(value) {
    if (typeof value === 'number') {
      const opts = Number.isInteger(value)
        ? { maximumFractionDigits: 0 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
      return value.toLocaleString('pt-BR', opts);
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
      'total_horas': 'Horas',
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
      return (
        <div style={{ marginTop: 24, color: WEG_AZUL, fontWeight: 500, fontSize: 18 }}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }

    const getPortugueseMonth = (monthNumber) => {
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return months[monthNumber - 1] || monthNumber;
    };

    let processedData = result.filter(row => !row.total);
    const totalRows = result.filter(row => row.total);

    if (processedData.length === 0) {
      return (
        <div style={{ marginTop: 24, color: WEG_AZUL, fontWeight: 500, fontSize: 18 }}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }

    let columns;

    if (tipoRelatorio === 'cascade-horas-por-recurso') {
      // 1. Transformar dados (mês e horas)
      processedData = processedData.map(row => ({
        ...row,
        mes: getPortugueseMonth(row.mes),
        total_horas: row.total_horas !== undefined ? row.total_horas : row.horas,
      }));

      // 2. Definir colunas a serem removidas
      const columnsToRemove = ['recurso_id', 'projeto_id', 'equipe_id', 'secao_id', 'horas', 'mes_nome'];
      if (!params.equipe_id) {
        columnsToRemove.push('equipe_nome');
      }
      columns = Object.keys(processedData[0] || {}).filter(col => !columnsToRemove.includes(col) && col !== 'total');

      // 3. Ordenar colunas
      let desiredOrder = ['secao_nome', 'equipe_nome', 'recurso_nome', 'projeto_nome', 'ano', 'mes', 'total_horas', 'quantidade'];
      desiredOrder = desiredOrder.filter(col => columns.includes(col));
      const remainingColumns = columns.filter(c => !desiredOrder.includes(c));
      columns = [...desiredOrder, ...remainingColumns];
    } else {
      columns = Object.keys(processedData[0] || {}).filter(col => col !== 'total');
    }

    // Cálculo de totais
    let hasTotals = totalRows.length > 0 || columns.some(col => typeof processedData[0][col] === 'number');
    let totals = {};
    if (totalRows.length > 0) {
      totalRows.forEach(row => {
        Object.keys(row).forEach(key => {
          if (key !== 'total') totals[key] = row[key];
        });
      });
    } else if (columns.some(col => typeof processedData[0][col] === 'number')) {
      columns.forEach(col => {
        if (typeof processedData[0][col] === 'number') {
          totals[col] = processedData.reduce((acc, row) => acc + (typeof row[col] === 'number' ? row[col] : 0), 0);
        }
      });
    }

    return (
      <div style={{width:'100%', overflowX:'auto', borderRadius: '12px', boxShadow:'0 3px 16px #0002', background: WEG_BRANCO, marginTop: 8}}>
        <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:700}}>
          <thead style={{position: 'sticky', top: 0, zIndex: 2}}>
            <tr style={{background:WEG_AZUL, color:WEG_BRANCO}}>
              {columns.map((col, idx) => (
                <th key={col} style={{ padding:'14px 14px', fontWeight:800, fontSize:15, textAlign:'center', width: `${100 / columns.length}%`, minWidth: 90, borderTopLeftRadius: idx === 0 ? 10 : 0, borderTopRightRadius: idx === columns.length-1 ? 10 : 0, borderBottom: '2px solid #004170', letterSpacing: 0.4 }} title={col}>
                  {getColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((row, idx) => (
              <tr key={idx} style={{background: idx%2 ? '#F4F8FB' : WEG_BRANCO}}>
                {columns.map((col) => (
                  <td key={col} style={{ padding:'11px 14px', textAlign:'center', width: `${100 / columns.length}%`, minWidth: 90, fontSize: 15, borderBottom: '1px solid #e3e7ee', color: '#232b36', fontWeight: 500 }}>
                    {typeof row[col] === 'number' ? formatNumber(row[col]) : (row[col] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
            {hasTotals && (
              <tr style={{background:'#E3F1FC', fontWeight:800, borderTop: '2px solid #b6d6f6'}}>
                {columns.map((col, idx) => (
                  <td key={col} style={{ padding:'13px 14px', textAlign:'center', width: `${100 / columns.length}%`, minWidth: 90, color: idx === 0 ? WEG_AZUL : '#00325a', fontWeight: idx === 0 ? 900 : 700, fontSize: 15, borderBottomLeftRadius: idx === 0 ? 10 : 0, borderBottomRightRadius: idx === columns.length-1 ? 10 : 0 }}>
                    {totals[col] !== undefined ? formatNumber(totals[col]) : (col === columns[0] ? 'Total' : '')}
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

      {/* Seleção do relatório */}
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

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', marginBottom: '20px', width: '100%' }}>
                {relatorioSelecionado.filtros.map((filtro) => {
                  let sxProps = { flexGrow: 1, minWidth: '180px' };

                  if (filtro.type === 'date') {
                    sxProps = { flexGrow: 1, minWidth: '150px', maxWidth: '180px' };
                  } else if (['secao', 'equipe', 'recurso'].includes(filtro.type)) {
                    sxProps = { flexGrow: 3, minWidth: '220px' };
                  }

                  const commonProps = { key: filtro.name, sx: sxProps };

                  if (filtro.type === 'date') {
                    return (
                      <TextField
                        {...commonProps}
                        label={filtro.placeholder}
                        name={filtro.name}
                        type="date"
                        value={params[filtro.name] || ''}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        size="small"
                      />
                    );
                  }
                  if (filtro.type === 'secao') {
                    return (
                      <AutocompleteSecaoCascade
                        {...commonProps}
                        value={params.secao_id}
                        onChange={handleSecaoChange}
                        placeholder="Selecione a seção"
                      />
                    );
                  }
                  if (filtro.type === 'equipe') {
                    return (
                      <AutocompleteEquipeCascade
                        {...commonProps}
                        value={params.equipe_id}
                        onChange={handleEquipeChange}
                        secaoId={params.secao_id ? params.secao_id.id : null}
                        placeholder="Selecione a equipe"
                      />
                    );
                  }
                  if (filtro.type === 'recurso') {
                    return (
                      <AutocompleteRecursoCascade
                        {...commonProps}
                        value={params.recurso_id}
                        onChange={handleRecursoChange}
                        equipeId={params.equipe_id ? params.equipe_id.id : null}
                        placeholder="Selecione o recurso"
                      />
                    );
                  }
                  return (
                    <TextField
                      {...commonProps}
                      label={filtro.placeholder}
                      name={filtro.name}
                      value={params[filtro.name] || ''}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                    />
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="agrupar_por_projeto"
                    checked={params.agrupar_por_projeto || false}
                    onChange={handleChange}
                    style={{ width: 18, height: 18 }}
                  />
                  Agrupar por Projeto
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="agrupar_por_mes"
                    checked={params.agrupar_por_mes || false}
                    onChange={handleChange}
                    style={{ width: 18, height: 18 }}
                  />
                  Agrupar por Mês
                </label>
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
            <div style={{ 
              padding: '12px 16px', 
              background: '#FEE2E2', 
              color: '#B91C1C', 
              borderRadius: 8, 
              marginBottom: 16,
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {result && renderTable()}
        </>
      )}
    </div>
  );
}
