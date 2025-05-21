"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FormHelperText, Drawer } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale/pt-BR";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
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
  id: number;
  ano: number;
  mes: number;
  horas_planejadas: number;
  status?: string;
  recurso_id?: number;
  recurso?: {
    id: number;
    nome: string;
    email: string;
  };
  projeto_id?: number;
  projeto?: {
    id: number;
    nome: string;
    codigo_empresa: string;
  };
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

const dadosMockPlanejamentos: PlanejamentoHoras[] = [
  { id: 1, ano: 2025, mes: 1, horas_planejadas: 120, status: 'aprovado' },
  { id: 2, ano: 2025, mes: 2, horas_planejadas: 140, status: 'pendente' },
  { id: 3, ano: 2025, mes: 3, horas_planejadas: 160, status: 'em_andamento' },
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
  const [planejamentos, setPlanejamentos] = useState<PlanejamentoHoras[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroRecurso, setFiltroRecurso] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [filtroAno, setFiltroAno] = useState<number | ''>('');
  const [filtroMes, setFiltroMes] = useState<number | ''>('');
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [planejamentoSelecionado, setPlanejamentoSelecionado] = useState<PlanejamentoHoras | null>(null);
  const [formValues, setFormValues] = useState<PlanejamentoHoras>({
    id: 0,
    ano: 0,
    mes: 0,
    horas_planejadas: 0,
    status: 'pendente',
    recurso_id: undefined,
    projeto_id: undefined,
  });
  const [formErrors, setFormErrors] = useState({
    recurso_id: '',
    projeto_id: '',
    ano: '',
    mes: '',
    horas_planejadas: '',
  });
  const [dialogExclusaoAberto, setDialogExclusaoAberto] = useState(false);
  const [planejamentoParaExcluir, setPlanejamentoParaExcluir] = useState<PlanejamentoHoras | null>(null);
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

  // Efeito para carregar planejamentos
  useEffect(() => {
    buscarPlanejamentos();
  }, [filtroRecurso, filtroProjeto, filtroAno, filtroMes]);

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

  // Função para buscar planejamentos
  const buscarPlanejamentos = async () => {
    setLoading(true);
    try {
      const params: QueryParams = {
        recurso: filtroRecurso,
        projeto: filtroProjeto,
        ano: filtroAno,
        mes: filtroMes,
      };

      const data = await apiGet<{ items: PlanejamentoHoras[] }>('/planejamentos', params);
      setPlanejamentos(data.items || []);
      setApiDisponivel(true);
    } catch (error) {
      console.error('Erro ao buscar planejamentos:', error);
      setPlanejamentos(dadosMockPlanejamentos);
      setApiDisponivel(false);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar planejamentos. Usando dados de exemplo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir o drawer
  const abrirDrawer = (planejamento?: PlanejamentoHoras) => {
    setPlanejamentoSelecionado(planejamento || null);
    setFormValues({
      id: planejamento?.id || 0,
      ano: planejamento?.ano || 0,
      mes: planejamento?.mes || 0,
      horas_planejadas: planejamento?.horas_planejadas || 0,
      status: planejamento?.status || 'pendente',
      recurso_id: planejamento?.recurso_id || undefined,
      projeto_id: planejamento?.projeto_id || undefined,
    });
    setDrawerAberto(true);
  };

  // Função para salvar o planejamento
  const salvarPlanejamento = async () => {
    setLoading(true);
    try {
      if (planejamentoSelecionado) {
        // Atualizar o planejamento existente
        await apiGet(`/planejamentos/${planejamentoSelecionado.id}`, {
          method: 'PUT',
          body: JSON.stringify(formValues),
        });
      } else {
        // Criar um novo planejamento
        await apiGet('/planejamentos', {
          method: 'POST',
          body: JSON.stringify(formValues),
        });
      }

      setSnackbar({
        open: true,
        message: 'Planejamento salvo com sucesso!',
        severity: 'success'
      });

      buscarPlanejamentos();
      setDrawerAberto(false);
    } catch (error) {
      console.error('Erro ao salvar planejamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar planejamento.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para confirmar a exclusão do planejamento
  const confirmarExclusao = (planejamento: PlanejamentoHoras) => {
    setPlanejamentoParaExcluir(planejamento);
    setDialogExclusaoAberto(true);
  };

  // Função para excluir o planejamento
  const excluirPlanejamento = async () => {
    setLoading(true);
    try {
      await apiGet(`/planejamentos/${planejamentoParaExcluir?.id}`, {
        method: 'DELETE',
      });

      setSnackbar({
        open: true,
        message: 'Planejamento excluído com sucesso!',
        severity: 'success'
      });

      buscarPlanejamentos();
      setDialogExclusaoAberto(false);
    } catch (error) {
      console.error('Erro ao excluir planejamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir planejamento.',
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
          Gerenciamento de Planejamento de Horas
        </Typography>

        {!apiDisponivel && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            API indisponível. Usando dados de exemplo para demonstração.
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom color="text.secondary">
            Busque, crie, edite ou exclua planejamentos de horas por recurso e projeto.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Buscar por recurso"
                variant="outlined"
                fullWidth
                value={filtroRecurso}
                onChange={(e) => setFiltroRecurso(e.target.value)}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Buscar por projeto"
                variant="outlined"
                fullWidth
                value={filtroProjeto}
                onChange={(e) => setFiltroProjeto(e.target.value)}
                InputProps={{
                  startAdornment: <FolderIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="ano-filtro-label">Ano</InputLabel>
                <Select
                  labelId="ano-filtro-label"
                  value={filtroAno}
                  onChange={(e) => setFiltroAno(e.target.value as number | '')}
                  label="Ano"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                    <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel id="mes-filtro-label">Mês</InputLabel>
                <Select
                  labelId="mes-filtro-label"
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value as number | '')}
                  label="Mês"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                    <MenuItem key={mes} value={mes}>{getNomeMes(mes)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={buscarPlanejamentos}
                startIcon={<SearchIcon />}
                fullWidth
                sx={{ height: '56px' }}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => abrirDrawer()}
            >
              Novo Planejamento
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Recurso</TableCell>
                  <TableCell>Projeto</TableCell>
                  <TableCell>Ano</TableCell>
                  <TableCell>Mês</TableCell>
                  <TableCell align="right">Horas Planejadas</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : planejamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        Nenhum planejamento encontrado. Utilize os filtros acima ou crie um novo planejamento.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  planejamentos.map((planejamento) => (
                    <TableRow key={planejamento.id} hover>
                      <TableCell>{planejamento.recurso?.nome || 'N/A'}</TableCell>
                      <TableCell>{planejamento.projeto?.nome || 'N/A'}</TableCell>
                      <TableCell>{planejamento.ano}</TableCell>
                      <TableCell>{getNomeMes(planejamento.mes)}</TableCell>
                      <TableCell align="right">{planejamento.horas_planejadas}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatarStatus(planejamento.status || 'pendente')}
                          color={getCorStatus(planejamento.status || 'pendente') as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => abrirDrawer(planejamento)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => confirmarExclusao(planejamento)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Drawer para cadastro/edição */}
        <Drawer
          anchor="right"
          open={drawerAberto}
          onClose={() => setDrawerAberto(false)}
        >
          <Box sx={{ width: 500, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {planejamentoSelecionado ? 'Editar Planejamento' : 'Novo Planejamento'}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={recursos || []}
                  getOptionLabel={(option) => `${option.nome} ${option.matricula ? `(${option.matricula})` : ''}`}
                  value={recursos.find(r => r.id === formValues.recurso_id) || null}
                  onChange={(_, newValue) => setFormValues({ ...formValues, recurso_id: newValue?.id || undefined })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Recurso"
                      variant="outlined"
                      fullWidth
                      required
                      error={!!formErrors.recurso_id}
                      helperText={formErrors.recurso_id}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={projetos || []}
                  getOptionLabel={(option) => `${option.nome} (${option.codigo_empresa || 'N/A'})`}
                  value={projetos.find(p => p.id === formValues.projeto_id) || null}
                  onChange={(_, newValue) => setFormValues({ ...formValues, projeto_id: newValue?.id || undefined })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Projeto"
                      variant="outlined"
                      fullWidth
                      required
                      error={!!formErrors.projeto_id}
                      helperText={formErrors.projeto_id}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.ano}>
                  <InputLabel id="ano-form-label">Ano</InputLabel>
                  <Select
                    labelId="ano-form-label"
                    value={formValues.ano || ''}
                    onChange={(e) => setFormValues({ ...formValues, ano: Number(e.target.value) })}
                    label="Ano"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((ano) => (
                      <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.ano && <FormHelperText>{formErrors.ano}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.mes}>
                  <InputLabel id="mes-form-label">Mês</InputLabel>
                  <Select
                    labelId="mes-form-label"
                    value={formValues.mes || ''}
                    onChange={(e) => setFormValues({ ...formValues, mes: Number(e.target.value) })}
                    label="Mês"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                      <MenuItem key={mes} value={mes}>{getNomeMes(mes)}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.mes && <FormHelperText>{formErrors.mes}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Horas Planejadas"
                  type="number"
                  fullWidth
                  required
                  value={formValues.horas_planejadas || ''}
                  onChange={(e) => setFormValues({ ...formValues, horas_planejadas: Number(e.target.value) })}
                  error={!!formErrors.horas_planejadas}
                  helperText={formErrors.horas_planejadas}
                  InputProps={{
                    startAdornment: <AccessTimeIcon sx={{ color: 'action.active', mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-form-label">Status</InputLabel>
                  <Select
                    labelId="status-form-label"
                    value={formValues.status || 'pendente'}
                    onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
                    label="Status"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setDrawerAberto(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={salvarPlanejamento}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Salvar'}
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Dialog de confirmação de exclusão */}
        <Dialog
          open={dialogExclusaoAberto}
          onClose={() => setDialogExclusaoAberto(false)}
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir o planejamento de horas de {planejamentoParaExcluir?.recurso?.nome || 'recurso'}
              para o projeto {planejamentoParaExcluir?.projeto?.nome || 'selecionado'} em {getNomeMes(planejamentoParaExcluir?.mes || 1)}/{planejamentoParaExcluir?.ano || ''}?
              <br />
              Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogExclusaoAberto(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={excluirPlanejamento} color="error" variant="contained">
              {loading ? <CircularProgress size={24} /> : 'Excluir'}
            </Button>
          </DialogActions>
        </Dialog>

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