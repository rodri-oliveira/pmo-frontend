"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Grid, Snackbar, Alert, CircularProgress, FormControl, 
  InputLabel, Select, MenuItem, Chip, Divider
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
  const [loading, setLoading] = useState(false);
  const [recursoSelecionado, setRecursoSelecionado] = useState<number | ''>('');
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning'
  });

  // Função para buscar recursos
  const fetchRecursos = async () => {
    setLoading(true);
    try {
      // Tenta buscar dados da API
      const params: QueryParams = { ativo: true };
      if (searchTerm) params.nome = searchTerm;
      
      const data = await apiGet<{ items: Recurso[], total: number }>('/recursos', params);
      setRecursos(data?.items || []);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      setRecursos([]);
      
      setSnackbar({
        open: true,
        message: 'Erro ao carregar recursos. Tente novamente.',
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
      
      // Garantir que a disponibilidade seja um array
      if (data && !data.disponibilidade) {
        data.disponibilidade = [];
      }
      
      setDadosDisponibilidade(data);
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
      
      // Criar um objeto de disponibilidade vazio para o recurso selecionado
      const recursoSelecionadoObj = recursos.find(r => r.id === Number(recursoSelecionado));
      if (recursoSelecionadoObj) {
        setDadosDisponibilidade(createEmptyDisponibilidade(
          Number(recursoSelecionado),
          recursoSelecionadoObj.nome
        ));
      } else {
        setDadosDisponibilidade(null);
      }
      
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados de disponibilidade. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Efeito inicial para buscar recursos
  useEffect(() => {
    fetchRecursos();
  }, []);

  // Efeito para buscar recursos quando o termo de pesquisa muda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecursos();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efeito para buscar disponibilidade quando os filtros mudam
  useEffect(() => {
    fetchDisponibilidade();
  }, [recursoSelecionado, anoSelecionado, mesSelecionado]);

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
          Disponibilidade de Horas por Recurso
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Pesquisar recurso"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Recurso</InputLabel>
                <Select
                  value={recursoSelecionado}
                  label="Recurso"
                  onChange={(e) => setRecursoSelecionado(e.target.value as number | '')}
                >
                  <MenuItem value="">Selecione um recurso</MenuItem>
                  {recursos.map((recurso) => (
                    <MenuItem key={recurso.id} value={recurso.id}>
                      {recurso.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Ano</InputLabel>
                <Select
                  value={anoSelecionado}
                  label="Ano"
                  onChange={(e) => setAnoSelecionado(e.target.value as number)}
                >
                  {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map((ano) => (
                    <MenuItem key={ano} value={ano}>
                      {ano}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Mês</InputLabel>
                <Select
                  value={mesSelecionado}
                  label="Mês"
                  onChange={(e) => setMesSelecionado(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos os meses</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                    <MenuItem key={mes} value={mes}>
                      {getNomeMes(mes)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => fetchDisponibilidade()}
                disabled={!recursoSelecionado}
              >
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: '#00579d', mb: 2 }} />
            <Typography variant="body1">Carregando dados...</Typography>
          </Box>
        ) : !recursoSelecionado ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Nenhum recurso selecionado</Typography>
            <Typography variant="body1" color="text.secondary">
              Selecione um recurso para visualizar sua disponibilidade de horas.
            </Typography>
          </Paper>
        ) : !dadosDisponibilidade ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Dados não disponíveis</Typography>
            <Typography variant="body1" color="text.secondary">
              Não foram encontrados dados de disponibilidade para este recurso.
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ fontSize: 42, color: '#00579d', mr: 2 }} />
                <Box>
                  <Typography variant="h5">{dadosDisponibilidade.nome_recurso}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {dadosDisponibilidade.recurso_id} • 
                    {mesSelecionado 
                      ? ` ${getNomeMes(Number(mesSelecionado))} de ${anoSelecionado}`
                      : ` Ano: ${anoSelecionado}`
                    }
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {dadosDisponibilidade.disponibilidade.length === 0 ? (
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
                        <TableCell align="right"><strong>Horas Apontadas</strong></TableCell>
                        <TableCell align="right"><strong>Saldo</strong></TableCell>
                        <TableCell><strong>Utilização</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dadosDisponibilidade.disponibilidade.map((item) => {
                        const porcentagemPlanejada = calcularPorcentagem(item.horas_planejadas, item.horas_disponiveis);
                        const porcentagemApontada = calcularPorcentagem(item.horas_apontadas, item.horas_disponiveis);
                        const corPlanejada = getCorUtilizacao(porcentagemPlanejada);
                        const corApontada = getCorUtilizacao(porcentagemApontada);
                        
                        return (
                          <TableRow key={`${item.ano}-${item.mes}`} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarMonthIcon sx={{ mr: 1, color: '#00579d' }} />
                                <span>{getNomeMes(item.mes)}/{item.ano}</span>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={`${item.horas_disponiveis.toFixed(1)}h`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
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
                                <BarraProgresso porcentagem={porcentagemPlanejada} cor={corPlanejada} />
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                  <Typography variant="caption">Apontado</Typography>
                                  <Typography variant="caption">{porcentagemApontada}%</Typography>
                                </Box>
                                <BarraProgresso porcentagem={porcentagemApontada} cor={corApontada} />
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
              {dadosDisponibilidade && (dadosDisponibilidade.disponibilidade || []).length > 0 ? (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(0, 87, 157, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Horas Disponíveis
                        </Typography>
                        <Typography variant="h5">
                          {dadosDisponibilidade.disponibilidade
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
                          {dadosDisponibilidade.disponibilidade
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
                          {dadosDisponibilidade.disponibilidade
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
                        <Typography variant="h5" color={
                          dadosDisponibilidade.disponibilidade.reduce((sum, item) => sum + item.saldo, 0) >= 0
                            ? 'success.main'
                            : 'error.main'
                        }>
                          {dadosDisponibilidade.disponibilidade
                            .reduce((sum, item) => sum + item.saldo, 0)
                            .toFixed(1)}h
                        </Typography>
                      </Paper>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </>
        )}
        
        {/* Snackbar para feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
