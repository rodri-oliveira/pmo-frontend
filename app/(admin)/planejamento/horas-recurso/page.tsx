"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Grid, Snackbar, Alert, CircularProgress, FormControl, 
  InputLabel, Select, MenuItem, Chip, Divider, InputAdornment,
  Autocomplete
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import TimerIcon from '@mui/icons-material/Timer';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Tooltip from '@mui/material/Tooltip';
import { apiGet, ApiError, QueryParams } from '@/services/api';

// Interface para o tipo de dados que vamos trabalhar
interface RecursoDisponibilidade {
  recurso_id: number;
  nome_recurso: string;
  disponibilidade: Array<{
    ano: number;
    mes: number;
    horas_disponiveis: number;
    horas_planejadas: number;
    horas_apontadas: number;
    saldo: number;
  }>;
}

interface Recurso {
  id: number;
  nome: string;
  email?: string;
  matricula?: string;
}

// Dados mockados para uso em caso de falha na API
const recursosMock: Recurso[] = [
  { id: 1, nome: 'João Silva', email: 'joao.silva@exemplo.com', matricula: '12345' },
  { id: 2, nome: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com', matricula: '23456' },
  { id: 3, nome: 'Carlos Santos', email: 'carlos.santos@exemplo.com', matricula: '34567' },
];

// Dados mockados de disponibilidade
const criarDisponibilidadeMock = (recursoId: number, nomeRecurso: string): RecursoDisponibilidade => {
  const anoAtual = new Date().getFullYear();
  const disponibilidade = [];
  
  // Criar dados para os últimos 3 meses
  for (let i = 0; i < 3; i++) {
    const mesAtual = new Date().getMonth() + 1 - i;
    const ano = mesAtual <= 0 ? anoAtual - 1 : anoAtual;
    const mes = mesAtual <= 0 ? mesAtual + 12 : mesAtual;
    
    disponibilidade.push({
      ano,
      mes,
      horas_disponiveis: 160,
      horas_planejadas: Math.floor(Math.random() * 140) + 20,
      horas_apontadas: Math.floor(Math.random() * 120) + 20,
      saldo: 0, // Será calculado abaixo
    });
  }
  
  // Calcular saldo para cada mês
  disponibilidade.forEach(item => {
    item.saldo = item.horas_disponiveis - item.horas_planejadas;
  });
  
  return {
    recurso_id: recursoId,
    nome_recurso: nomeRecurso,
    disponibilidade,
  };
};

// Função para criar um objeto de disponibilidade vazio para um recurso
const createEmptyDisponibilidade = (recursoId: number, nomeRecurso: string): RecursoDisponibilidade => ({
  recurso_id: recursoId,
  nome_recurso: nomeRecurso,
  disponibilidade: []
});

// Função auxiliar para obter o nome do mês
const getNomeMes = (numeroMes: number) => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[numeroMes - 1];
};

export default function HorasRecursoPage() {
  // Estados
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [dadosDisponibilidade, setDadosDisponibilidade] = useState<RecursoDisponibilidade | null>(null);
  const [dadosComparativo, setDadosComparativo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recursoSelecionado, setRecursoSelecionado] = useState<number | ''>('');
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<number | ''>('');
  const [filtroRecurso, setFiltroRecurso] = useState('');
  const [projetos, setProjetos] = useState<{ id: number; nome: string }[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<number | ''>('');
  const [apiDisponivel, setApiDisponivel] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning'
  });

  // Handlers dos filtros
  const handleFiltroRecursoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroRecurso(e.target.value);
  };
  const handleRecursoSelecionadoChange = (e: React.SyntheticEvent, newValue: Recurso | null | string) => {
    if (typeof newValue === 'string') {
      // Usuário digitou um texto e pressionou Enter
      setFiltroRecurso(newValue);
      setRecursoSelecionado('');
    } else {
      // Usuário selecionou um item da lista
      setRecursoSelecionado(newValue?.id || '');
    }
  };
  const handleProjetoSelecionadoChange = (e: React.SyntheticEvent, newValue: {id: number, nome: string} | null | string) => {
    if (typeof newValue === 'string') {
      // Usuário digitou um texto e pressionou Enter
      setProjetoSelecionado('');
    } else {
      // Usuário selecionou um item da lista
      setProjetoSelecionado(newValue?.id || '');
    }
  };
  const handleAnoSelecionadoChange = (e: any) => {
    setAnoSelecionado(e.target.value);
  };
  const handleMesSelecionadoChange = (e: any) => {
    setMesSelecionado(e.target.value);
  };
  const handleAtualizar = () => {
    fetchDisponibilidade();
    fetchComparativo();
  };

  // Função para buscar recursos
  const fetchRecursos = async () => {
    setLoading(true);
    try {
      // Tenta buscar dados da API
      const params: QueryParams = { ativo: true };
      if (filtroRecurso) params.nome = filtroRecurso;
      
      const data = await apiGet<any>('/recursos', params);
      console.log('Recursos da API:', data);
      let recursosArray: Recurso[] = [];
      if (Array.isArray(data)) {
        recursosArray = data;
      } else if (data?.items && Array.isArray(data.items)) {
        recursosArray = data.items;
      }
      setRecursos(recursosArray.length > 0 ? recursosArray : recursosMock);
      setApiDisponivel(true);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      setRecursos(recursosMock);
      setApiDisponivel(false);
      
      setSnackbar({
        open: true,
        message: 'Erro ao carregar recursos. Usando dados de exemplo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar disponibilidade de horas
  const fetchDisponibilidade = async () => {
    if (!recursoSelecionado) {
      setDadosDisponibilidade(null);
      return;
    }
    
    setLoading(true);
    try {
      // Tenta buscar dados da API
      const params: QueryParams = { ano: anoSelecionado };
      if (mesSelecionado !== '') params.mes = mesSelecionado;
      
      const data = await apiGet<RecursoDisponibilidade>(`/recursos/${recursoSelecionado}/disponibilidade`, params);
      console.log('Disponibilidade da API:', data);
      // Garantir que a disponibilidade seja um array
      if (data && data.disponibilidade && data.disponibilidade.length > 0) {
        setDadosDisponibilidade(data);
      } else {
        // Se não vier nada, usar mock
        const recursoSelecionadoObj = (recursos || []).find(r => r.id === Number(recursoSelecionado));
        if (recursoSelecionadoObj) {
          setDadosDisponibilidade(criarDisponibilidadeMock(
            Number(recursoSelecionado),
            recursoSelecionadoObj.nome
          ));
        } else {
          setDadosDisponibilidade(null);
        }
      }
      setApiDisponivel(true);
    } catch (error) {
      // Se a API falhar, usar dados mockados
      console.error('Erro ao buscar disponibilidade:', error);
      const recursoSelecionadoObj = (recursos || []).find(r => r.id === Number(recursoSelecionado));
      if (recursoSelecionadoObj) {
        setDadosDisponibilidade(criarDisponibilidadeMock(
          Number(recursoSelecionado),
          recursoSelecionadoObj.nome
        ));
      } else {
        setDadosDisponibilidade(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar comparativo planejado vs realizado (JIRA)
  const fetchComparativo = async () => {
    if (!recursoSelecionado) {
      setDadosComparativo([]);
      return;
    }
    setLoading(true);
    try {
      const params: QueryParams = { recurso_id: recursoSelecionado, ano: anoSelecionado };
      if (mesSelecionado !== '') params.mes = mesSelecionado;
      const data = await apiGet<{ items: any[] }>('/relatorios/planejado-vs-realizado', params);
      console.log('Comparativo API:', data);
      setDadosComparativo((data?.items && data.items.length > 0) ? data.items : [
        {
          projeto_id: 1,
          projeto_nome: 'Projeto Exemplo',
          horas_planejadas: 100,
          horas_apontadas: 90,
          saldo: 10,
          horas_disponiveis: 120
        }
      ]);
      setApiDisponivel(true);
    } catch (error) {
      console.error('Erro ao buscar comparativo planejado vs realizado:', error);
      setDadosComparativo([
        {
          projeto_id: 1,
          projeto_nome: 'Projeto Exemplo',
          horas_planejadas: 100,
          horas_apontadas: 90,
          saldo: 10,
          horas_disponiveis: 120
        }
      ]);
      setApiDisponivel(false);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar comparativo planejado vs realizado. Usando dados de exemplo.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar projetos
  const fetchProjetos = async () => {
    try {
      const data = await apiGet<any>('/projetos');
      console.log('Projetos da API:', data);
      let projetosArray: { id: number; nome: string }[] = [];
      if (Array.isArray(data)) {
        projetosArray = data;
      } else if (data?.items && Array.isArray(data.items)) {
        projetosArray = data.items;
      }
      setProjetos(projetosArray.length > 0 ? projetosArray : [
        { id: 1, nome: 'Projeto Exemplo' }
      ]);
    } catch (error) {
      setProjetos([
        { id: 1, nome: 'Projeto Exemplo' }
      ]);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos.',
        severity: 'error'
      });
    }
  };

  // Efeito inicial para buscar recursos e projetos
  useEffect(() => {
    fetchRecursos();
    fetchProjetos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selecionar automaticamente o primeiro recurso e projeto disponíveis
  useEffect(() => {
    if (recursos.length > 0 && !recursoSelecionado) {
      setRecursoSelecionado(recursos[0].id);
    }
  }, [recursos]);
  useEffect(() => {
    if (projetos.length > 0 && !projetoSelecionado) {
      setProjetoSelecionado(projetos[0].id);
    }
  }, [projetos]);

  // Efeito para buscar recursos quando o filtro de recurso muda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecursos();
    }, 500);
    return () => clearTimeout(timer);
  }, [filtroRecurso]);

  // Efeito para buscar disponibilidade quando os filtros mudam
  useEffect(() => {
    fetchDisponibilidade();
  }, [recursoSelecionado, projetoSelecionado, anoSelecionado, mesSelecionado]);

  // Buscar comparativo planejado vs realizado sempre que filtros mudarem
  useEffect(() => {
    fetchComparativo();
  }, [recursoSelecionado, projetoSelecionado, anoSelecionado, mesSelecionado]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Função para calcular a porcentagem de utilização
  const calcularPorcentagem = (usado: number, disponivel: number) => {
    if (disponivel === 0) return 0;
    return Math.min(100, Math.round((usado / disponivel) * 100));
  };

  // Função para determinar a cor com base na porcentagem
  const getCorUtilizacao = (porcentagem: number) => {
    if (porcentagem < 70) return '#4caf50'; // verde
    if (porcentagem < 90) return '#ff9800'; // laranja
    return '#f44336'; // vermelho
  };

  // Componente para exibir uma barra de progresso simples
  const BarraProgresso = ({ porcentagem, cor }: { porcentagem: number, cor: string }) => (
    <Box sx={{ width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 1, mt: 1, mb: 0.5 }}>
      <Box
        sx={{
          width: `${porcentagem}%`,
          height: '100%',
          backgroundColor: cor,
          borderRadius: 1,
          transition: 'width 0.5s ease-in-out'
        }}
      />
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Typography variant="h4" gutterBottom>
          <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Planejar Horas por Recurso
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={recursos || []}
                getOptionLabel={(option) => typeof option === 'object' && option !== null ? option.nome || '' : String(option)}
                value={null}
                onChange={handleRecursoSelecionadoChange}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                freeSolo
                filterOptions={(options, state) => {
                  const filtered = options.filter(option => 
                    typeof option === 'object' && option !== null && option.nome && 
                    option.nome.toLowerCase().includes(state.inputValue.toLowerCase())
                  );
                  return filtered;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recurso"
                    variant="outlined"
                    placeholder="Digite o nome do recurso"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.nome}
                  </li>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={projetos || []}
                getOptionLabel={(option) => typeof option === 'object' && option !== null ? option.nome || '' : String(option)}
                value={null}
                onChange={handleProjetoSelecionadoChange}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                freeSolo
                filterOptions={(options, state) => {
                  const filtered = options.filter(option => 
                    typeof option === 'object' && option !== null && option.nome && 
                    option.nome.toLowerCase().includes(state.inputValue.toLowerCase())
                  );
                  return filtered;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Projeto"
                    placeholder="Digite o nome do projeto"
                    variant="outlined"
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.nome}
                  </li>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Ano</InputLabel>
                <Select
                  value={anoSelecionado}
                  label="Ano"
                  onChange={handleAnoSelecionadoChange}
                >
                  {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map(ano => (
                    <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Mês</InputLabel>
                <Select
                  value={mesSelecionado}
                  label="Mês"
                  onChange={handleMesSelecionadoChange}
                >
                  <MenuItem value="">Todos os meses</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                    <MenuItem key={mes} value={mes}>{getNomeMes(mes)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAtualizar}
              startIcon={<RefreshIcon />}
              sx={{ height: '45px', px: 3 }}
            >
              Atualizar
            </Button>
          </Box>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: '#00579d', mb: 2 }} />
            <Typography variant="body1">Carregando dados...</Typography>
          </Box>
        ) : !recursoSelecionado || !projetoSelecionado ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Nenhum recurso ou projeto selecionado</Typography>
            <Typography variant="body1" color="text.secondary">
              Selecione um recurso e um projeto para visualizar sua disponibilidade de horas.
            </Typography>
          </Paper>
        ) : !dadosDisponibilidade ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Dados não disponíveis</Typography>
            <Typography variant="body1" color="text.secondary">
              Não foram encontrados dados de disponibilidade para este recurso e projeto.
            </Typography>
          </Paper>
        ) : (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                Planejar Horas por Recurso
              </Typography>
              <Typography variant="h5">{dadosDisponibilidade.nome_recurso}</Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {dadosDisponibilidade.recurso_id} • 
                {mesSelecionado 
                  ? ` ${getNomeMes(Number(mesSelecionado))} de ${anoSelecionado}`
                  : ` Ano: ${anoSelecionado}`
                }
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {(dadosDisponibilidade?.disponibilidade || []).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <EventBusyIcon sx={{ fontSize: 50, color: '#9e9e9e', mb: 1 }} />
                  <Typography variant="h6">Sem dados de disponibilidade</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Não há dados de disponibilidade para o período selecionado.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell><strong>Período</strong></TableCell>
                        <TableCell align="right"><strong>Horas Disponíveis</strong></TableCell>
                        <TableCell align="right"><strong>Horas Planejadas</strong></TableCell>
                        <TableCell align="right"><strong>Horas Apontadas (JIRA)</strong></TableCell>
                        <TableCell align="right"><strong>Saldo</strong></TableCell>
                        <TableCell><strong>Extrapolado</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(dadosComparativo && dadosComparativo.length > 0 ? dadosComparativo : [{
  projeto_id: 1,
  projeto_nome: 'Projeto Exemplo',
  horas_planejadas: 100,
  horas_apontadas: 90,
  saldo: 10,
  horas_disponiveis: 120
}]).map(item => {
                        // item esperado: { projeto, horas_planejadas, horas_apontadas, saldo, extrapolado }
                        const corPlanejada = getCorUtilizacao(
                          (item.horas_planejadas / (item.horas_disponiveis || 1)) * 100
                        );
                        const corApontada = getCorUtilizacao(
                          (item.horas_apontadas / (item.horas_disponiveis || 1)) * 100
                        );
                        const porcentagemPlanejada = ((item.horas_planejadas / (item.horas_disponiveis || 1)) * 100).toFixed(1);
const porcentagemApontada = ((item.horas_apontadas / (item.horas_disponiveis || 1)) * 100).toFixed(1);
return (
  <TableRow key={item.projeto_id || item.id}>
    <TableCell>{item.projeto_nome || item.nome}</TableCell>
    <TableCell>{item.horas_disponiveis}</TableCell>
    <TableCell sx={{ color: corPlanejada }}>{item.horas_planejadas}</TableCell>
    <TableCell sx={{ color: corApontada }}>{item.horas_apontadas}</TableCell>
    <TableCell sx={{ fontWeight: 'bold', color: item.saldo < 0 ? 'error.main' : 'success.main', bgcolor: item.saldo < 0 ? 'rgba(244,67,54,0.12)' : 'transparent' }}>
      {item.saldo} {item.saldo < 0 && (
        <Tooltip title="Saldo negativo: extrapolação de horas">
          <WarningAmberIcon sx={{ color: 'error.main', ml: 1, fontSize: 20 }} />
        </Tooltip>
      )}
    </TableCell>
    <TableCell sx={{ color: item.saldo < 0 ? 'error.main' : 'inherit', fontWeight: item.saldo < 0 ? 'bold' : 'normal', bgcolor: item.saldo < 0 ? 'rgba(244,67,54,0.12)' : 'transparent' }}>
      {item.saldo < 0 ? (
        <Tooltip title="Saldo extrapolado: o total de horas apontadas superou o planejado">
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Extrapolado <WarningAmberIcon sx={{ color: 'error.main', fontSize: 18, ml: 0.5 }} />
          </span>
        </Tooltip>
      ) : ''}
    </TableCell>
    <TableCell align="right">
      <Chip 
        label={`${item.horas_planejadas.toFixed(1)}h`}
        size="small"
        sx={{ backgroundColor: 'rgba(0, 87, 157, 0.1)' }}
      />
    </TableCell>
    <TableCell align="right">
      <Chip 
        label={`${item.horas_apontadas.toFixed(1)}h`}
        size="small"
        sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
      />
    </TableCell>
    <TableCell align="right">
      <Chip 
        label={`${item.saldo.toFixed(1)}h`}
        size="small"
        color={item.saldo >= 0 ? "success" : "error"}
        variant="outlined"
      />
    </TableCell>
    <TableCell>
      <Box sx={{ width: '100%', maxWidth: 200 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">Planejado</Typography>
          <Typography variant="caption">{porcentagemPlanejada}%</Typography>
        </Box>
        <BarraProgresso porcentagem={Number(porcentagemPlanejada)} cor={corPlanejada} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption">Apontado</Typography>
          <Typography variant="caption">{porcentagemApontada}%</Typography>
        </Box>
        <BarraProgresso porcentagem={Number(porcentagemApontada)} cor={corApontada} />
      </Box>
    </TableCell>
  </TableRow>
);
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <EventAvailableIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                Resumo da Utilização
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {dadosDisponibilidade && (dadosDisponibilidade?.disponibilidade || []).length > 0 && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(0, 87, 157, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Horas Disponíveis
                        </Typography>
                        <Typography variant="h5">
                          {(dadosDisponibilidade?.disponibilidade || [])
                            .reduce((sum, item) => sum + item.horas_disponiveis, 0)
                            .toFixed(1)}h
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(0, 87, 157, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Horas Planejadas
                        </Typography>
                        <Typography variant="h5">
                          {(dadosDisponibilidade?.disponibilidade || [])
                            .reduce((sum, item) => sum + item.horas_planejadas, 0)
                            .toFixed(1)}h
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Horas Apontadas
                        </Typography>
                        <Typography variant="h5">
                          {(dadosDisponibilidade?.disponibilidade || [])
                            .reduce((sum, item) => sum + item.horas_apontadas, 0)
                            .toFixed(1)}h
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(244, 67, 54, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Saldo Total
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            color:
                              (dadosDisponibilidade?.disponibilidade || []).reduce((sum, item) => sum + item.saldo, 0) >= 0
                                ? 'success.main'
                                : 'error.main',
                            bgcolor:
                              (dadosDisponibilidade?.disponibilidade || []).reduce((sum, item) => sum + item.saldo, 0) < 0
                                ? 'rgba(244,67,54,0.12)'
                                : 'transparent',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            fontWeight:
                              (dadosDisponibilidade?.disponibilidade || []).reduce((sum, item) => sum + item.saldo, 0) < 0
                                ? 'bold'
                                : 'normal',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {(dadosDisponibilidade?.disponibilidade || [])
                            .reduce((sum, item) => sum + item.saldo, 0)
                            .toFixed(1)}h
                          {(dadosDisponibilidade?.disponibilidade || []).reduce((sum, item) => sum + item.saldo, 0) < 0 && (
                            <Tooltip title="Saldo negativo: extrapolação de horas">
                              <WarningAmberIcon sx={{ color: 'error.main', ml: 1, fontSize: 22 }} />
                            </Tooltip>
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}


