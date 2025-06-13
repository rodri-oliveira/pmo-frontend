"use client";

import React, { useState } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Grid,
  FormControlLabel,
  Checkbox
} from '@mui/material';

import AutocompleteSecaoCascade from './AutocompleteSecaoCascade';
import AutocompleteEquipeCascade from './AutocompleteEquipeCascade';
import AutocompleteRecursoCascade from './AutocompleteRecursoCascade'; // Assumindo que este componente exista
import AutocompleteProjetoCascade from './AutocompleteProjetoCascade';

// Paleta WEG (para consistência)
const WEG_AZUL = "#00579D";
const WEG_AZUL_CLARO = "#E3F1FC";
const CINZA_CLARO = "#F4F6F8";

// Função para obter o primeiro dia do mês anterior
function getPrimeirodiaMesAnterior() {
  const data = new Date();
  data.setMonth(data.getMonth() - 1);
  data.setDate(1);
  return data.toISOString().split('T')[0];
}

// Função para obter o dia atual
function getDiaAtual() {
  return new Date().toISOString().split('T')[0];
}

export default function HorasApontadasPage() {
  // Estados para os filtros
  const WEG_AZUL = '#00579D';
  const WEG_BRANCO = '#FFFFFF';

  const [filtros, setFiltros] = useState({
    data_inicio: getPrimeirodiaMesAnterior(),
    data_fim: getDiaAtual(),
    secao_id: null,
    equipe_id: null,
    recurso_id: null,
    projeto_id: null,
    fonte_apontamento: '',
  });

  // Estados para os agrupamentos
  const [agrupamentos, setAgrupamentos] = useState({
    agrupar_por_recurso: false,
    agrupar_por_projeto: false,
    agrupar_por_data: false,
    agrupar_por_mes: true, // Default conforme a documentação
  });

  // Estados para controle da UI e dados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState([]);

  // Manipulador genérico para filtros de texto
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Manipulador para checkboxes de agrupamento
  const handleAgrupamentoChange = (e) => {
    const { name, checked } = e.target;
    setAgrupamentos(prev => ({ ...prev, [name]: checked }));
  };
  
  // Manipuladores para os Autocompletes em cascata
  const handleSecaoChange = (secao) => {
    setFiltros(prev => ({
      ...prev,
      secao_id: secao,
      equipe_id: null,
      recurso_id: null,
      projeto_id: null
    }));
  };

  const handleEquipeChange = (equipe) => {
    setFiltros(prev => ({
      ...prev,
      equipe_id: equipe,
      recurso_id: null,
      projeto_id: null
    }));
  };

  const handleRecursoChange = (recurso) => {
    setFiltros(prev => ({ ...prev, recurso_id: recurso }));
  };

  const handleProjetoChange = (projeto) => {
    setFiltros(prev => ({ ...prev, projeto_id: projeto }));
  };

  // Função para gerar o relatório
  const gerarRelatorio = async () => {
    setLoading(true);
    setError('');
    setReportData([]);

    try {
        // Começa com os parâmetros de agrupamento
        const params = { ...agrupamentos };

        // Adiciona os parâmetros de filtro, extraindo IDs dos objetos de autocomplete
        Object.keys(filtros).forEach(key => {
            const value = filtros[key];
            if (value !== null && value !== undefined && value !== '') {
                // Para objetos de autocomplete, usa o 'id'. Para outros, o valor direto.
                if (typeof value === 'object' && value.id) {
                    params[key] = value.id;
                } else if (typeof value !== 'object') {
                    params[key] = value;
                }
            }
        });
        
        const queryString = new URLSearchParams(params).toString();
        const url = `/backend/v1/relatorios/horas-apontadas?${queryString}`;
        console.log("Enviando requisição para:", url);

        const response = await axios.get(url);

        // Corrigido para acessar response.data.items
        if (response.data && Array.isArray(response.data.items)) {
            setReportData(response.data.items);
        } else {
            setReportData([]);
        }

    } catch (err) {
        console.error("Erro ao gerar relatório:", err);
        setError(err.response?.data?.detail || 'Ocorreu um erro ao buscar os dados.');
    } finally {
        setLoading(false);
    }
  };

  // Função para traduzir o nome do mês
  const traduzirMes = (mes) => {
    const meses = {
      'January': 'Janeiro', 'February': 'Fevereiro', 'March': 'Março',
      'April': 'Abril', 'May': 'Maio', 'June': 'Junho',
      'July': 'Julho', 'August': 'Agosto', 'September': 'Setembro',
      'October': 'Outubro', 'November': 'Novembro', 'December': 'Dezembro'
    };
    if (typeof mes === 'number') {
      const idx = mes - 1;
      const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      return nomes[idx] || mes;
    }
    return meses[mes] || mes;
  };

  // Função para formatar os cabeçalhos da tabela
  const formatHeader = (key) => {
    const labels = {
      'secao_nome': 'Seção',
      'equipe_nome': 'Equipe',
      'recurso_nome': 'Recurso',
      'projeto_nome': 'Projeto',
      'ano': 'Ano',
      'mes_nome': 'Mês',
      'horas': 'Horas',
      'qtd_lancamentos': 'Qtd. Lançamentos',
      'data': 'Data',
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Função para renderizar a tabela de resultados
  const renderTable = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}><CircularProgress /></Box>;
    }

    // Pré-processa o dataset para garantir coluna 'mes_nome' em português
    const dataProcessada = reportData.map((row) => {
      const novo = { ...row };
      // Se vier campo 'mes' numérico, converte para mês em português
      if (novo.mes !== undefined && novo.mes_nome === undefined) {
        novo.mes_nome = traduzirMes(Number(novo.mes));
      } else if (novo.mes_nome) {
        novo.mes_nome = traduzirMes(String(novo.mes_nome).trim());
      }
      return novo;
    });

    if (!dataProcessada || dataProcessada.length === 0) {
      return <Typography>Nenhum dado encontrado para os filtros selecionados.</Typography>;
    }

    const ordemBase = ['secao_nome', 'equipe_nome', 'recurso_nome', 'projeto_nome', 'ano', 'mes_nome', 'horas', 'qtd_lancamentos'];
    const todasColunas = Object.keys(dataProcessada[0]).filter(c => !['recurso_id', 'projeto_id', 'mes'].includes(c));
    const headers = [...ordemBase.filter(c => todasColunas.includes(c)), ...todasColunas.filter(c => !ordemBase.includes(c))];

    return (
      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px #00000014', borderRadius: '12px', maxHeight: '70vh', overflowY: 'auto' }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header} sx={{ 
                  backgroundColor: WEG_AZUL, 
                  color: WEG_BRANCO, 
                  fontWeight: 'bold', 
                  textAlign: 'center' 
                }}>
                  {formatHeader(header)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataProcessada.map((row, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                {headers.map((header) => {
                  const value = row[header];
                  let formattedValue = value;

                  switch (header) {
                    case 'ano':
                    case 'qtd_lancamentos':
                      formattedValue = parseInt(value, 10);
                      break;
                    case 'horas':
                      const numHoras = Number(value);
                      formattedValue = numHoras % 1 === 0
                        ? numHoras.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
                        : numHoras.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      break;
                    case 'mes_nome':
                    formattedValue = traduzirMes(String(value).trim());
                    break;
                    default:
                      formattedValue = value;
                  }

                  return <TableCell key={header} sx={{ textAlign: 'center' }}>{formattedValue}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: CINZA_CLARO, minHeight: '100vh' }}>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h5" component="h1" sx={{ color: WEG_AZUL, marginBottom: 2 }}>
          Relatório de Horas Apontadas
        </Typography>
        
        {/* Seção de Filtros */}
        <Grid container spacing={2} alignItems="center">
          {/* Filtros de Data */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data de Início"
              type="date"
              name="data_inicio"
              value={filtros.data_inicio}
              onChange={handleFiltroChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data de Fim"
              type="date"
              name="data_fim"
              value={filtros.data_fim}
              onChange={handleFiltroChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          {/* Filtros em Cascata */}
          <Grid item xs={12} sm={6} md={3}>
            <AutocompleteSecaoCascade value={filtros.secao_id} onChange={handleSecaoChange} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AutocompleteEquipeCascade value={filtros.equipe_id} onChange={handleEquipeChange} secaoId={filtros.secao_id?.id} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {/* O componente AutocompleteRecursoCascade precisa ser criado ou verificado */}
            <AutocompleteRecursoCascade value={filtros.recurso_id} onChange={handleRecursoChange} equipeId={filtros.equipe_id?.id} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AutocompleteProjetoCascade value={filtros.projeto_id} onChange={handleProjetoChange} equipeId={filtros.equipe_id?.id} />
          </Grid>
        </Grid>

        {/* Seção de Agrupamentos */}
        <Box sx={{ marginTop: 2, marginBottom: 2 }}>
          <Typography variant="h6" sx={{ color: WEG_AZUL, marginBottom: 1 }}>Agrupar por:</Typography>
          <FormControlLabel control={<Checkbox checked={agrupamentos.agrupar_por_recurso} onChange={handleAgrupamentoChange} name="agrupar_por_recurso" />} label="Recurso" />
          <FormControlLabel control={<Checkbox checked={agrupamentos.agrupar_por_projeto} onChange={handleAgrupamentoChange} name="agrupar_por_projeto" />} label="Projeto" />
          <FormControlLabel control={<Checkbox checked={agrupamentos.agrupar_por_data} onChange={handleAgrupamentoChange} name="agrupar_por_data" />} label="Data" />
          <FormControlLabel control={<Checkbox checked={agrupamentos.agrupar_por_mes} onChange={handleAgrupamentoChange} name="agrupar_por_mes" />} label="Mês" />
        </Box>

        <Button variant="contained" onClick={gerarRelatorio} sx={{ backgroundColor: WEG_AZUL, '&:hover': { backgroundColor: '#004a80' } }} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Gerar Relatório'}
        </Button>
      </Paper>

      {/* Seção de Resultados */}
      {error && <Typography color="error">{error}</Typography>}
      <Paper sx={{ padding: 3 }}>
        {renderTable()}
      </Paper>
    </Box>
  );
}
