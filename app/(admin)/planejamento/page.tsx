"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Autocomplete,
  SelectChangeEvent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale/pt-BR";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { apiGet, ApiError, QueryParams } from "@/services/api";
import { getRecursos, getProjetos } from "@/services/alocacoes";
import { planejamentoHoras } from "@/services/projetos";

// Interfaces
interface Recurso {
  id: number;
  nome: string;
  email?: string;
  matricula?: string;
}

interface Projeto {
  id: number;
  nome: string;
  codigo_empresa: string;
}

interface Alocacao {
  id: number;
  projeto_id: number;
  projeto?: {
    id: number;
    nome: string;
    codigo_empresa: string;
  };
  recurso_id: number;
  recurso?: {
    id: number;
    nome: string;
    email: string;
  };
  data_inicio_alocacao: string;
  data_fim_alocacao: string | null;
}

interface PlanejamentoHoras {
  ano: number;
  mes: number;
  horas_planejadas: number;
  status?: string;
}

// Dados mockados para desenvolvimento (quando a API não estiver disponível)
const dadosMockRecursos: Recurso[] = [
  { id: 1, nome: 'Ana Silva', email: 'ana.silva@example.com', matricula: '12345' },
  { id: 2, nome: 'Bruno Costa', email: 'bruno.costa@example.com', matricula: '23456' },
  { id: 3, nome: 'Carla Oliveira', email: 'carla.oliveira@example.com', matricula: '34567' },
  { id: 4, nome: 'Daniel Santos', email: 'daniel.santos@example.com', matricula: '45678' },
  { id: 5, nome: 'Elena Martins', email: 'elena.martins@example.com', matricula: '56789' },
];

const dadosMockProjetos: Projeto[] = [
  { id: 1, nome: 'Projeto Alpha', codigo_empresa: 'PRJ001' },
  { id: 2, nome: 'Projeto Beta', codigo_empresa: 'PRJ002' },
  { id: 3, nome: 'Projeto Gamma', codigo_empresa: 'PRJ003' },
  { id: 4, nome: 'Projeto Delta', codigo_empresa: 'PRJ004' },
  { id: 5, nome: 'Projeto Epsilon', codigo_empresa: 'PRJ005' },
];

const dadosMockAlocacoes: Alocacao[] = [
  {
    id: 1,
    projeto_id: 1,
    projeto: {
      id: 1,
      nome: 'Projeto Alpha',
      codigo_empresa: 'PRJ001'
    },
    recurso_id: 1,
    recurso: {
      id: 1,
      nome: 'Ana Silva',
      email: 'ana.silva@example.com'
    },
    data_inicio_alocacao: '2025-01-01T00:00:00',
    data_fim_alocacao: '2025-12-31T00:00:00',
  },
  {
    id: 2,
    projeto_id: 2,
    projeto: {
      id: 2,
      nome: 'Projeto Beta',
      codigo_empresa: 'PRJ002'
    },
    recurso_id: 2,
    recurso: {
      id: 2,
      nome: 'Bruno Costa',
      email: 'bruno.costa@example.com'
    },
    data_inicio_alocacao: '2025-01-01T00:00:00',
    data_fim_alocacao: null,
  },
];

const dadosMockPlanejamentos: PlanejamentoHoras[] = [
  { ano: 2025, mes: 1, horas_planejadas: 120, status: 'aprovado' },
  { ano: 2025, mes: 2, horas_planejadas: 140, status: 'pendente' },
  { ano: 2025, mes: 3, horas_planejadas: 160, status: 'em_andamento' },
];

// Função auxiliar para obter o nome do mês
const getNomeMes = (numeroMes: number) => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[numeroMes - 1];
};

// Status disponíveis para planejamento
const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

export default function PlanejamentoHorasPage() {
  // Estados
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [recursoSelecionado, setRecursoSelecionado] = useState<number | null>(null);
  const [projetoSelecionado, setProjetoSelecionado] = useState<number | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [horasPlanejadas, setHorasPlanejadas] = useState<number>(0);
  const [statusSelecionado, setStatusSelecionado] = useState<string>('pendente');
  const [alocacaoSelecionada, setAlocacaoSelecionada] = useState<number | null>(null);
  const [planejamentosExistentes, setPlanejamentosExistentes] = useState<PlanejamentoHoras[]>([]);
  const [apiDisponivel, setApiDisponivel] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning'
  });

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchRecursos();
    fetchProjetos();
  }, []);

  // Efeito para carregar alocações quando recurso ou projeto mudar
  useEffect(() => {
    if (recursoSelecionado && projetoSelecionado) {
      fetchAlocacoes();
    } else {
      setAlocacoes([]);
      setAlocacaoSelecionada(null);
    }
  }, [recursoSelecionado, projetoSelecionado]);

  // Função para buscar recursos
  const fetchRecursos = async () => {
    setLoading(true);
    try {
      const response = await getRecursos();
      // Tratamento defensivo: garantir que response.items seja um array
      setRecursos(response?.items || []);
      setApiDisponivel(true);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      setRecursos(dadosMockRecursos);
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

  // Função para buscar projetos
  const fetchProjetos = async () => {
    setLoading(true);
    try {
      const response = await getProjetos();
      // Tratamento defensivo: garantir que response.items seja um array
      setProjetos(response?.items || []);
      setApiDisponivel(true);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setProjetos(dadosMockProjetos);
      setApiDisponivel(false);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos. Usando dados de exemplo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar alocações
  const fetchAlocacoes = async () => {
    if (!recursoSelecionado || !projetoSelecionado) return;
    
    setLoading(true);
    try {
      // Buscar alocações por recurso e projeto
      const params: QueryParams = { 
        recurso_id: recursoSelecionado,
        projeto_id: projetoSelecionado
      };
      
      const data = await apiGet<{ items: Alocacao[] }>('/alocacoes', params);
      setAlocacoes(data.items || []);
      
      if (data.items && data.items.length > 0) {
        setAlocacaoSelecionada(data.items[0].id);
        // Buscar planejamentos existentes para esta alocação
        fetchPlanejamentosExistentes(data.items[0].id);
      }
      
      setApiDisponivel(true);
    } catch (error) {
      console.error('Erro ao buscar alocações:', error);
      // Filtramos os dados mockados para simular a busca
      const alocacoesFiltradas = dadosMockAlocacoes.filter(
        a => a.recurso_id === recursoSelecionado && a.projeto_id === projetoSelecionado
      );
      setAlocacoes(alocacoesFiltradas);
      
      if (alocacoesFiltradas.length > 0) {
        setAlocacaoSelecionada(alocacoesFiltradas[0].id);
      }
      
      setApiDisponivel(false);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar alocações. Usando dados de exemplo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar planejamentos existentes
  const fetchPlanejamentosExistentes = async (alocacaoId: number) => {
    if (!projetoSelecionado) return;
    
    setLoading(true);
    try {
      // Buscar planejamentos existentes
      const data = await apiGet<{ items: PlanejamentoHoras[] }>(
        `/projetos/${projetoSelecionado}/alocacoes/${alocacaoId}/planejamento`
      );
      setPlanejamentosExistentes(data.items || []);
      setApiDisponivel(true);
    } catch (error) {
      console.error('Erro ao buscar planejamentos existentes:', error);
      setPlanejamentosExistentes(dadosMockPlanejamentos);
      setApiDisponivel(false);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar planejamentos existentes. Usando dados de exemplo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar o planejamento de horas
  const salvarPlanejamento = async () => {
    if (!projetoSelecionado || !alocacaoSelecionada || !horasPlanejadas) {
      setSnackbar({
        open: true,
        message: 'Preencha todos os campos obrigatórios.',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      const novoPlanejamento: PlanejamentoHoras = {
        ano: anoSelecionado,
        mes: mesSelecionado,
        horas_planejadas: horasPlanejadas,
        status: statusSelecionado
      };
      
      // Verificar se já existe um planejamento para o mesmo mês e ano
      const planejamentoExistente = planejamentosExistentes.find(
        p => p.ano === anoSelecionado && p.mes === mesSelecionado
      );
      
      if (planejamentoExistente) {
        setSnackbar({
          open: true,
          message: 'Já existe um planejamento para este mês. Atualizando...',
          severity: 'info'
        });
      }
      
      // Enviar para a API
      await planejamentoHoras(projetoSelecionado, alocacaoSelecionada, [novoPlanejamento]);
      
      // Atualizar a lista de planejamentos existentes
      fetchPlanejamentosExistentes(alocacaoSelecionada);
      
      setSnackbar({
        open: true,
        message: 'Planejamento de horas salvo com sucesso!',
        severity: 'success'
      });
      
      // Limpar campos
      setHorasPlanejadas(0);
      
    } catch (error) {
      console.error('Erro ao salvar planejamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar planejamento de horas.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com o fechamento do snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Função para formatar o status
  const formatarStatus = (status: string) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  // Função para obter a cor do chip de status
  const getCorStatus = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'default';
      case 'aprovado':
        return 'success';
      case 'em_andamento':
        return 'primary';
      case 'concluido':
        return 'info';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ mr: 1 }} />
          Planejar Horas por Recurso
        </Typography>
        
        {!apiDisponivel && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            API indisponível. Usando dados de exemplo para demonstração.
          </Alert>
        )}
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <SearchIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
            Selecionar Recurso e Projeto
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={recursos || []}
                getOptionLabel={(option) => `${option.nome} ${option.matricula ? `(${option.matricula})` : ''}`}
                onChange={(_, newValue) => {
                  setRecursoSelecionado(newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recurso"
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={projetos || []}
                getOptionLabel={(option) => `${option.nome} (${option.codigo_empresa})`}
                onChange={(_, newValue) => {
                  setProjetoSelecionado(newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Projeto"
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <FolderIcon sx={{ color: 'action.active', mr: 1 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
        
        {recursoSelecionado && projetoSelecionado && (
          <>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                Planejamento de Horas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="ano-label">Ano</InputLabel>
                    <Select
                      labelId="ano-label"
                      value={anoSelecionado}
                      onChange={(e: SelectChangeEvent<number>) => setAnoSelecionado(e.target.value as number)}
                      label="Ano"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                        <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="mes-label">Mês</InputLabel>
                    <Select
                      labelId="mes-label"
                      value={mesSelecionado}
                      onChange={(e: SelectChangeEvent<number>) => setMesSelecionado(e.target.value as number)}
                      label="Mês"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                        <MenuItem key={mes} value={mes}>{getNomeMes(mes)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Horas Planejadas"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={horasPlanejadas}
                    onChange={(e) => setHorasPlanejadas(Number(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <AccessTimeIcon sx={{ color: 'action.active', mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={statusSelecionado}
                      onChange={(e: SelectChangeEvent<string>) => setStatusSelecionado(e.target.value)}
                      label="Status"
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={salvarPlanejamento}
                    disabled={loading || !horasPlanejadas}
                    sx={{ mt: 2, backgroundColor: '#00579d' }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Salvar Planejamento'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <EventAvailableIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                Planejamentos Existentes
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ano</TableCell>
                        <TableCell>Mês</TableCell>
                        <TableCell>Horas Planejadas</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(planejamentosExistentes || []).length > 0 ? (
                        (planejamentosExistentes || []).map((planejamento) => (
                          <TableRow key={`${planejamento.ano}-${planejamento.mes}`}>
                            <TableCell>{planejamento.ano}</TableCell>
                            <TableCell>{getNomeMes(planejamento.mes)}</TableCell>
                            <TableCell>{planejamento.horas_planejadas}</TableCell>
                            <TableCell>
                              <Chip 
                                label={formatarStatus(planejamento.status || 'pendente')} 
                                color={getCorStatus(planejamento.status || 'pendente') as any}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Nenhum planejamento encontrado para este recurso e projeto.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
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