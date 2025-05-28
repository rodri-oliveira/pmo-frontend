"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,
  Grid, Snackbar, Alert, TablePagination, Chip, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, Autocomplete,
  Tooltip, Divider, FormControlLabel, InputAdornment,
  List, ListItem, ListItemText, ListItemIcon, Switch
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import JiraIcon from '@mui/icons-material/IntegrationInstructions';
import LinkIcon from '@mui/icons-material/Link';
import SyncIcon from '@mui/icons-material/Sync';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LockIcon from '@mui/icons-material/Lock';
import { getApontamentos, getApontamento, updateApontamento, deleteApontamento } from '@/services/apontamentos';
import { getProjetos } from '@/services/projetos';
import { getRecursos } from '@/services/recursos';
import { getEquipes } from '@/services/equipes';
import { getSecoes } from '@/services/secoes';
import { apiGet, apiPost, apiPut } from '@/services/api';

interface Apontamento {
  id: number;
  recurso_id: number;
  recurso?: Recurso;
  projeto_id: number;
  projeto?: {
    id: number;
    nome: string;
  };
  data_apontamento: string;
  horas_apontadas: number;
  descricao: string;
  jira_issue_key?: string;
  fonte_apontamento: string;
  data_criacao: string;
  data_atualizacao?: string;
}

interface Projeto {
  id: number;
  nome: string;
  codigo_empresa: string;
}

interface Recurso {
  id: number;
  nome: string;
  email?: string | null;
  matricula?: string;
}

interface ApontamentoForm {
  horas_apontadas: number;
  descricao: string;
  jira_issue_key?: string;
}

// Interface para configuração do Jira
interface JiraConfig {
  url: string;
  username: string;
  api_token: string;
  ativo: boolean;
  ultima_sincronizacao?: string;
  status: 'conectado' | 'desconectado' | 'erro';
  erro_mensagem?: string;
}

export default function ConsultarApontamentosPage() {
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [secoes, setSecoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [apontamentoAtual, setApontamentoAtual] = useState<Apontamento | null>(null);
  const [formData, setFormData] = useState<ApontamentoForm>({
    horas_apontadas: 0,
    descricao: '',
    jira_issue_key: ''
  });
  
  const [dataInicio, setDataInicio] = useState<Date | null>(startOfMonth(new Date()));
  const [dataFim, setDataFim] = useState<Date | null>(endOfMonth(new Date()));
  const [projetoFilter, setProjetoFilter] = useState<number | ''>('');
  const [recursoFilter, setRecursoFilter] = useState<number | ''>('');
  const [fonteFilter, setFonteFilter] = useState<string>('');
  const [equipeFilter, setEquipeFilter] = useState<number | ''>('');
  const [secaoFilter, setSecaoFilter] = useState<number | ''>('');
  const [jiraIssueKeyFilter, setJiraIssueKeyFilter] = useState<string>('');
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);


  // Função para buscar apontamentos
  const fetchApontamentos = async () => {
    setLoading(true);
    try {
      const params: any = {
        skip: page * rowsPerPage,
        limit: rowsPerPage
      };
      
      if (dataInicio) {
        params.data_inicio = format(dataInicio, 'yyyy-MM-dd');
      }
      
      if (dataFim) {
        params.data_fim = format(dataFim, 'yyyy-MM-dd');
      }
      
      if (projetoFilter) {
        params.projeto_id = projetoFilter;
      }
      
      if (recursoFilter) {
        params.recurso_id = recursoFilter;
      }
      
      if (fonteFilter) {
        params.fonte_apontamento = fonteFilter;
      }
      
      if (equipeFilter) {
        params.equipe_id = equipeFilter;
      }
      
      if (secaoFilter) {
        params.secao_id = secaoFilter;
      }
      
      if (jiraIssueKeyFilter) {
        params.jira_issue_key = jiraIssueKeyFilter;
      }
      
      const data = await getApontamentos(params);
      setApontamentos(data.items || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar apontamentos:', error);
      setApontamentos([]);
      setTotalItems(0);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar apontamentos. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar projetos
  const fetchProjetos = async () => {
    try {
      const data = await getProjetos({ ativo: true });
      setProjetos(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setProjetos([]);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos.',
        severity: 'error'
      });
    }
  };

  // Função para buscar recursos
  const fetchRecursos = async () => {
    try {
      const data = await getRecursos({ ativo: true });
      setRecursos(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      setRecursos([]);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar recursos.',
        severity: 'error'
      });
    }
  };

  // Buscar equipes
  const fetchEquipes = async () => {
    try {
      const data = await getEquipes({ ativo: true });
      setEquipes(data.items || []);
    } catch (error) {
      setEquipes([]);
      setSnackbar({ open: true, message: 'Erro ao carregar equipes.', severity: 'error' });
    }
  };

  // Buscar seções
  const fetchSecoes = async () => {
    try {
      const data = await getSecoes({ ativo: true });
      setSecoes(data.items || []);
    } catch (error) {
      setSecoes([]);
      setSnackbar({ open: true, message: 'Erro ao carregar seções.', severity: 'error' });
    }
  };

  // Efeito inicial para buscar dados
  useEffect(() => {
    fetchProjetos();
    fetchRecursos();
    fetchEquipes();
    fetchSecoes();
    fetchApontamentos();
  }, []);

  // Efeito para atualizar quando os filtros ou a paginação mudam
  useEffect(() => {
    fetchApontamentos();
  }, [page, rowsPerPage, projetoFilter, recursoFilter, fonteFilter, equipeFilter, secaoFilter, jiraIssueKeyFilter]);

  const handleOpenEditDialog = async (apontamento: Apontamento) => {
    try {
      const detalhes = await getApontamento(apontamento.id);
      setApontamentoAtual(detalhes);
      setFormData({
        horas_apontadas: detalhes.horas_apontadas,
        descricao: detalhes.descricao,
        jira_issue_key: detalhes.jira_issue_key
      });
      setOpenDialog(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do apontamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao buscar detalhes do apontamento. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setApontamentoAtual(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'horas_apontadas' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async () => {
    if (!apontamentoAtual) return;
    
    setLoading(true);
    try {
      await updateApontamento(apontamentoAtual.id, formData);
      
      setSnackbar({
        open: true,
        message: 'Apontamento atualizado com sucesso!',
        severity: 'success'
      });
      
      handleCloseDialog();
      fetchApontamentos();
    } catch (error) {
      console.error('Erro ao atualizar apontamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar apontamento. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApontamento = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este apontamento?')) {
      setLoading(true);
      try {
        await deleteApontamento(id);
        
        setSnackbar({
          open: true,
          message: 'Apontamento excluído com sucesso!',
          severity: 'success'
        });
        
        fetchApontamentos();
      } catch (error) {
        console.error('Erro ao excluir apontamento:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir apontamento. Tente novamente.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilter = () => {
    setPage(0);
    fetchApontamentos();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Typography variant="h4" gutterBottom>
          <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Consulta e Gerenciamento de Apontamentos
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Data de Início"
                value={dataInicio}
                onChange={(newValue) => setDataInicio(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    InputProps: {
                      startAdornment: (
                        <Box component="span" sx={{ mr: 1, color: 'action.active' }}>
                        <FilterListIcon fontSize="small" />
                      </Box>
                      ),
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Data de Fim"
                value={dataFim}
                onChange={(newValue) => setDataFim(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="projeto-label">Projeto</InputLabel>
                <Select
                  labelId="projeto-label"
                  value={projetoFilter}
                  label="Projeto"
                  onChange={e => setProjetoFilter(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {projetos.map(proj => (
                    <MenuItem key={proj.id} value={proj.id}>{proj.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="recurso-label">Recurso</InputLabel>
                <Select
                  labelId="recurso-label"
                  value={recursoFilter}
                  label="Recurso"
                  onChange={e => setRecursoFilter(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {(recursos || []).map(rec => (
                    <MenuItem key={rec.id} value={rec.id}>{rec.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="equipe-label">Equipe</InputLabel>
                <Select
                  labelId="equipe-label"
                  value={equipeFilter}
                  label="Equipe"
                  onChange={e => setEquipeFilter(e.target.value as number | '')}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {(equipes || []).map(eq => (
                    <MenuItem key={eq.id} value={eq.id}>{eq.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="secao-label">Seção</InputLabel>
                <Select
                  labelId="secao-label"
                  value={secaoFilter}
                  label="Seção"
                  onChange={e => setSecaoFilter(e.target.value as number | '')}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {(secoes || []).map(sec => (
                    <MenuItem key={sec.id} value={sec.id}>{sec.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="fonte-label">Fonte do Apontamento</InputLabel>
                <Select
                  labelId="fonte-label"
                  value={fonteFilter}
                  label="Fonte do Apontamento"
                  onChange={e => setFonteFilter(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="MANUAL">Manual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button variant="outlined" startIcon={<SearchIcon />} onClick={handleFilter} sx={{ mr: 1 }}>
                Filtrar
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchApontamentos}>
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {apontamentos.length === 0 && !loading ? (
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Nenhum apontamento encontrado
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <strong>Data</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Recurso</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Projeto</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Descrição</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Horas</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Fonte</strong>
                  </TableCell>
                  <TableCell width={110} align="center">
                    <strong>Ações</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={30} sx={{ color: '#00579d' }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Carregando apontamentos...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  apontamentos.map((apontamento) => (
                    <TableRow key={apontamento.id} hover>
                      <TableCell>
                        {format(new Date(apontamento.data_apontamento), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: '#00579d', fontSize: 20 }} />
                          {apontamento.recurso?.nome || `Recurso #${apontamento.recurso_id}`}
                          {apontamento.recurso?.email ? (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{apontamento.recurso.email}</Typography>
                          ) : null}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FolderIcon sx={{ mr: 1, color: '#00579d', fontSize: 20 }} />
                          {apontamento.projeto?.nome || `Projeto #${apontamento.projeto_id}`}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={apontamento.descricao} arrow>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DescriptionIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                            <Typography
                              sx={{
                                maxWidth: 250,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {apontamento.descricao}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${apontamento.horas_apontadas}h`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label="Manual"
                          size="small"
                          color="default"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(apontamento)}
                          sx={{ color: '#00579d' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteApontamento(apontamento.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
            </Table>
          </TableContainer>
        )}

        {apontamentoAtual && (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Editar Apontamento</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {format(new Date(apontamentoAtual.data_apontamento), 'dd/MM/yyyy')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="horas_apontadas"
                    label="Horas Apontadas"
                    type="number"
                    value={formData.horas_apontadas}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="descricao"
                    label="Descrição"
                    value={formData.descricao}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button onClick={handleSubmit}>Salvar</Button>
            </DialogActions>
          </Dialog>
        )}
        
        
          
        
        {/* Dialog para exibir log de sincronização */}
        
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        >
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}