"use client";

import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import AutocompleteSecaoCascade from './AutocompleteSecaoCascade';
import AutocompleteEquipeCascade from './AutocompleteEquipeCascade';
import AutocompleteProjetoCascade from './AutocompleteProjetoCascade';
import AutocompleteRecursoCascade from './AutocompleteRecursoCascade';

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
    descricao: 'Relatório Horas Apontadas',
    filtros: [
      { name: 'data_inicio', placeholder: 'Data início (YYYY-MM-DD)', type: 'text', width: 140 },
      { name: 'data_fim', placeholder: 'Data fim (YYYY-MM-DD)', type: 'text', width: 140 },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
      { name: 'projeto_id', type: 'projeto' }
    ],
    agrupamentos: []
  },
  {
    label: 'Relatório Comparativo',
    value: 'comparativo-planejado-realizado',
    endpoint: '/backend/v1/relatorios/comparativo-planejado-realizado',
    descricao: 'Relatório Comparativo',
    filtros: [
      { name: 'ano', placeholder: 'Ano', type: 'text', width: 120 },
      { name: 'mes', placeholder: 'Mês', type: 'text', width: 80 },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
      { name: 'projeto_id', type: 'projeto' }
    ],
    agrupamentos: []
  },
  {
    label: 'Horas por Projeto',
    value: 'horas-por-projeto',
    endpoint: '/backend/v1/relatorios/horas-por-projeto',
    descricao: 'Get Horas Por Projeto',
    filtros: [
      { name: 'data_inicio', placeholder: 'Data início (YYYY-MM-DD)', type: 'text', width: 140 },
      { name: 'data_fim', placeholder: 'Data fim (YYYY-MM-DD)', type: 'text', width: 140 },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'projeto_id', type: 'projeto' }
    ],
    agrupamentos: [{ name: 'agrupar_por_projeto', value: true, hidden: true }]
  },
  {
    label: 'Horas por Recurso',
    value: 'horas-por-recurso',
    endpoint: '/backend/v1/relatorios/horas-por-recurso',
    descricao: 'Get Horas Por Recurso',
    filtros: [
      { name: 'data_inicio', placeholder: 'Data início (YYYY-MM-DD)', type: 'text', width: 140 },
      { name: 'data_fim', placeholder: 'Data fim (YYYY-MM-DD)', type: 'text', width: 140 },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
      { name: 'projeto_id', type: 'projeto' }
    ],
    agrupamentos: [{ name: 'agrupar_por_recurso', value: true, hidden: true }]
  },
  {
    label: 'Planejado vs Realizado',
    value: 'planejado-vs-realizado',
    endpoint: '/backend/v1/relatorios/planejado-vs-realizado',
    descricao: 'Get Planejado Vs Realizado',
    filtros: [
      { name: 'ano', placeholder: 'Ano', type: 'text', width: 120 },
      { name: 'mes', placeholder: 'Mês', type: 'text', width: 80 },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
      { name: 'projeto_id', type: 'projeto' }
    ],
    agrupamentos: []
  },
  {
    label: 'Disponibilidade Recursos',
    value: 'disponibilidade-recursos',
    endpoint: '/backend/v1/relatorios/disponibilidade-recursos',
    descricao: 'Get Disponibilidade Recursos Endpoint',
    filtros: [
      { name: 'ano', placeholder: 'Ano', type: 'text', width: 120 },
      { name: 'mes', placeholder: 'Mês', type: 'text', width: 80 },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' }
    ],
    agrupamentos: []
  },
  {
    label: 'Relatório Dinâmico de Horas',
    value: 'dinamico',
    endpoint: '/backend/v1/relatorios/dinamico',
    descricao: 'Relatório Dinâmico de Horas',
    filtros: [
      { name: 'data_inicio', placeholder: 'Data início (YYYY-MM-DD)', type: 'text', width: 140 },
      { name: 'data_fim', placeholder: 'Data fim (YYYY-MM-DD)', type: 'text', width: 140 },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' },
      { name: 'projeto_id', type: 'projeto' },
      { name: 'agrupar_por', placeholder: 'Ex: recurso,equipe,projeto,mes,ano', type: 'text', width: 200 }
    ],
    agrupamentos: []
  },
  {
    label: 'Horas Disponíveis do Recurso',
    value: 'horas-disponiveis',
    endpoint: '/backend/v1/relatorios/horas-disponiveis',
    descricao: 'Horas Disponíveis do Recurso',
    filtros: [
      { name: 'ano', placeholder: 'Ano', type: 'text', width: 120 },
      { name: 'mes', placeholder: 'Mês', type: 'text', width: 80 },
      { name: 'secao_id', type: 'secao' },
      { name: 'equipe_id', type: 'equipe' },
      { name: 'recurso_id', type: 'recurso' }
    ],
    agrupamentos: []
  }
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
    projeto_id: null,
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
      projeto_id: null  // Limpar projeto quando a seção mudar
    }));
  }

  function handleEquipeChange(equipe) {
    setParams(prev => ({
      ...prev,
      equipe_id: equipe,
      recurso_id: null, // Limpar recurso quando a equipe mudar
      projeto_id: null  // Limpar projeto quando a equipe mudar
    }));
    
    // Removida a geração automática de relatório para evitar erros
  }

  function handleProjetoChange(projeto) {
    setParams(prev => ({
      ...prev,
      projeto_id: projeto
    }));
    
    // Removida a geração automática de relatório para evitar erros
  }

  function handleRecursoChange(recurso) {
    setParams(prev => ({
      ...prev,
      recurso_id: recurso
    }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      projeto_id: null,
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
  
  function handleSubmit(e) {
    e.preventDefault();
    gerarRelatorio(params);
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
      'quantidade': 'Qtd. Apontamentos',
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
      return (
        <div style={{marginTop:24, color:WEG_AZUL, fontWeight:500, fontSize:18}}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }
    
    // Filtra linhas de total especiais (adicionadas manualmente)
    const dataRows = result.filter(row => !row.total);
    const totalRows = result.filter(row => row.total);
    
    // Verificar se temos dados para exibir
    if (dataRows.length === 0) {
      return (
        <div style={{marginTop:24, color:WEG_AZUL, fontWeight:500, fontSize:18}}>
          Nenhum resultado encontrado para os filtros selecionados.
        </div>
      );
    }
    
    // Descobre as colunas dinamicamente a partir dos dados retornados
    // Ignora propriedades especiais como 'total'
    let columns = Object.keys(dataRows[0] || {}).filter(col => col !== 'total' && col !== 'mes_nome');
    
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
    }
    // Senão, calculamos os totais automaticamente
    else if (columns.some(col => typeof dataRows[0][col] === 'number')) {
      columns.forEach(col => {
        if (typeof dataRows[0][col] === 'number') {
          totals[col] = dataRows.reduce((acc, row) => acc + (typeof row[col] === 'number' ? row[col] : 0), 0);
        }
      });
    }

    return (
      <div style={{width:'100%', overflowX:'auto', borderRadius: '12px', boxShadow:'0 3px 16px #0002', background: WEG_BRANCO, marginTop: 8}}>
        <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:700}}>
          <thead style={{position: 'sticky', top: 0, zIndex: 2}}>
            <tr style={{background:WEG_AZUL, color:WEG_BRANCO}}>
              {columns.map((col, idx) => (
                <th key={col}
                  style={{
                    padding:'14px 14px',
                    fontWeight:800,
                    fontSize:15,
                    textAlign:'center',
                    width: `${100 / columns.length}%`,
                    minWidth: 90,
                    borderTopLeftRadius: idx === 0 ? 10 : 0,
                    borderTopRightRadius: idx === columns.length-1 ? 10 : 0,
                    borderBottom: '2px solid #004170',
                    letterSpacing: 0.4
                  }}
                  title={col}
                >
                  {getColumnLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, idx) => (
              <tr key={idx} style={{background: idx%2 ? '#F4F8FB' : WEG_BRANCO}}>
                {columns.map((col, idx) => (
                  <td key={col} style={{
                    padding:'11px 14px',
                    textAlign:'center',
                    width: `${100 / columns.length}%`,
                    minWidth: 90,
                    fontSize: 15,
                    borderBottom: '1px solid #e3e7ee',
                    color: '#232b36',
                    fontWeight: 500
                  }}>
                    {(() => {
                      const val = row[col];
                      if (col === 'ano') {
                        return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: false });
                      }
                      if (col === 'mes') {
                        const name = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(0, row.mes - 1, 1));
                        return name.charAt(0).toUpperCase() + name.slice(1);
                      }
                      if (col === 'horas') {
                        return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: false });
                      }
                      if (col === 'qtd_lancamentos') {
                        return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                      }
                      if (typeof val === 'number') {
                        return formatNumber(val);
                      }
                      return val ?? '-';
                    })()}
                  </td>
                ))}
              </tr>
            ))}
            {hasTotals && (
              <tr style={{background:'#E3F1FC', fontWeight:800, borderTop: '2px solid #b6d6f6'}}>
                {columns.map((col, idx) => (
                  <td key={col} style={{
                    padding:'13px 14px',
                    textAlign:'center',
                    width: `${100 / columns.length}%`,
                    minWidth: 90,
                    color: idx === 0 ? WEG_AZUL : '#00325a',
                    fontWeight: idx === 0 ? 900 : 700,
                    fontSize: 15,
                    borderBottomLeftRadius: idx === 0 ? 10 : 0,
                    borderBottomRightRadius: idx === columns.length-1 ? 10 : 0
                  }}>
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
  
  const rel = RELATORIOS.find(r => r.value === tipoRelatorio);
  
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
      
      {/* Descrição do relatório selecionado */}
      <div style={{marginBottom: 26, color: '#555', fontSize: 15, fontStyle: 'italic'}}>
        {RELATORIOS.find(r => r.value === tipoRelatorio)?.descricao || ''}
      </div>

      {/* Bloco visual de filtros */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: 24,
          rowGap: 18,
          marginBottom: 36,
          background: CINZA_CLARO,
          borderRadius: 14,
          padding: '22px 24px 14px 24px',
          boxShadow: '0 2px 12px #0001',
          border: `2px solid ${CINZA_BORDA}`
        }}
      >
        {/* Campos de data - Obrigatórios */}
        <div className="flex flex-col md:flex-row gap-4 mb-4" style={{ width: '100%' }}>
          <TextField
            label="Data Início"
            type="date"
            name="data_inicio"
            value={params.data_inicio}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            helperText="Obrigatório: Período inicial do relatório"
            error={!params.data_inicio}
          />
          <TextField
            label="Data Fim"
            type="date"
            name="data_fim"
            value={params.data_fim}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            helperText="Obrigatório: Período final do relatório"
            error={!params.data_fim}
          />
        </div>
        {rel.filtros.map(filtro => {
          if (filtro.type === 'secao') {
            return (
              <AutocompleteSecaoCascade
                key={filtro.name}
                value={params.secao_id}
                onChange={handleSecaoChange}
                placeholder="Selecione a seção"
              />
            );
          }
          if (filtro.type === 'equipe') {
            return (
              <AutocompleteEquipeCascade
                key={filtro.name}
                value={params.equipe_id}
                onChange={handleEquipeChange}
                secaoId={params.secao_id ? params.secao_id.id : null}
                placeholder="Selecione a equipe"
              />
            );
          }
          if (filtro.type === 'projeto') {
            return (
              <AutocompleteProjetoCascade
                key={filtro.name}
                value={params.projeto_id}
                onChange={handleProjetoChange}
                equipeId={params.equipe_id ? params.equipe_id.id : null}
                secaoId={params.secao_id ? params.secao_id.id : null}
                placeholder="Selecione o projeto"
              />
            );
          }
          if (filtro.type === 'recurso') {
            return (
              <AutocompleteRecursoCascade
                key={filtro.name}
                value={params.recurso_id}
                onChange={handleRecursoChange}
                equipeId={params.equipe_id ? params.equipe_id.id : null}
                secaoId={params.secao_id ? params.secao_id.id : null}
                placeholder="Selecione o recurso"
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
                  style={{ accentColor: WEG_AZUL, width: 18, height: 18, marginRight: 4 }}
                />
                {filtro.label}
              </label>
            );
          }
          // Campo padrão
          return (
            <div key={filtro.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontWeight: 600, fontSize: 14, color: '#00579D' }}>
                {filtro.placeholder.split(' ')[0]}
              </label>
              <input
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
            </div>
          );
        })}
        <div style={{ minWidth: 180, flex: '1 1 220px', display: 'flex', alignItems: 'center', marginTop: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: WEG_AZUL,
              color: WEG_BRANCO,
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0003',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Carregando...' : 'Gerar Relatório'}
          </button>
        </div>
      </form>

      {/* Exibir mensagem de erro */}
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

      {/* Exibir resultados */}
      {result && renderTable()}
    </div>
  );
}
