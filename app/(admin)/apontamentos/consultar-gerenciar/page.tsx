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
import { apiGet, apiPost, apiPut } from '@/services/api';

interface Apontamento {
  id: number;
  recurso_id: number;
  recurso?: {
    id: number;
    nome: string;
  };
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
  email?: string;
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
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [testando, setTestando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [config, setConfig] = useState<JiraConfig>({
    url: '',
    username: '',
    api_token: '',
    ativo: false,
    status: 'desconectado'
  });
  const [logSincronizacao, setLogSincronizacao] = useState<string[]>([]);

  // Dados mockados para desenvolvimento (quando a API não estiver disponível)
  const dadosMockRecursos: Recurso[] = [
    { id: 1, nome: 'Ana Silva', email: 'ana.silva@example.com', matricula: '12345' },
    { id: 2, nome: 'Bruno Costa', email: 'bruno.costa@example.com', matricula: '23456' },
    { id: 3, nome: 'Carla Oliveira', email: 'carla.oliveira@example.com', matricula: '34567' }
  ];

  const dadosMockProjetos: Projeto[] = [
    { id: 1, nome: 'Projeto A', codigo_empresa: 'PROJ-001' },
    { id: 2, nome: 'Projeto B', codigo_empresa: 'PROJ-002' },
    { id: 3, nome: 'Projeto C', codigo_empresa: 'PROJ-003' }
  ];

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
      
      const data = await getApontamentos(params);
      setApontamentos(data.items || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar apontamentos:', error);
      // Usar dados vazios em caso de erro
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
      // Usar dados mockados em caso de erro
      setProjetos(dadosMockProjetos);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos. Usando dados de exemplo.',
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
      // Usar dados mockados em caso de erro
      setRecursos(dadosMockRecursos);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar recursos. Usando dados de exemplo.',
        severity: 'error'
      });
    }
  };

  // Buscar configurações do Jira
  const fetchJiraConfig = async () => {
    setLoading(true);
    try {
      const data = await apiGet<JiraConfig>('/admin/jira/config');
      setConfig(data);
    } catch (error) {
      console.error('Erro ao buscar configurações do Jira:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar configurações de integração com o Jira',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Efeito inicial para buscar dados
  useEffect(() => {
    fetchProjetos();
    fetchRecursos();
    fetchApontamentos();
    fetchJiraConfig();
  }, []);

  // Efeito para atualizar quando os filtros ou a paginação mudam
  useEffect(() => {
    fetchApontamentos();
  }, [page, rowsPerPage, projetoFilter, recursoFilter, fonteFilter]);

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

  // Função para atualizar campo no form
  const handleChangeJiraConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Função para salvar configurações
  const handleSaveJiraConfig = async () => {
    setLoading(true);
    try {
      await apiPut<JiraConfig>('/admin/jira/config', config);
      setSnackbar({
        open: true,
        message: 'Configurações do Jira salvas com sucesso!',
        severity: 'success'
      });
      fetchJiraConfig(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar configurações do Jira:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar configurações. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para testar conexão
  const handleTestConnection = async () => {
    setTestando(true);
    try {
      const result = await apiPost<{success: boolean, message: string}>('/admin/jira/test-connection', config);
      setSnackbar({
        open: true,
        message: result.success ? 'Conexão com Jira estabelecida com sucesso!' : `Falha na conexão: ${result.message}`,
        severity: result.success ? 'success' : 'error'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Erro ao testar conexão: ${error.message || 'Erro desconhecido'}`,
        severity: 'error'
      });
    } finally {
      setTestando(false);
    }
  };

  // Função para iniciar sincronização
  const handleSync = async () => {
    setSincronizando(true);
    setDialogOpen(true);
    setLogSincronizacao(['Iniciando sincronização com o Jira...']);
    
    try {
      // Simulação de log em tempo real (em produção seria WebSocket ou Server-Sent Events)
      const result = await apiPost<{success: boolean, log: string[]}>('/admin/jira/sincronizar', {});
      
      setLogSincronizacao(prev => [...prev, ...result.log]);
      
      if (result.success) {
        setLogSincronizacao(prev => [...prev, 'Sincronização concluída com sucesso!']);
        setConfig(prev => ({...prev, ultima_sincronizacao: new Date().toISOString()}));
      } else {
        setLogSincronizacao(prev => [...prev, 'Erro na sincronização. Verifique os logs para mais detalhes.']);
      }
    } catch (error: any) {
      setLogSincronizacao(prev => [...prev, `Erro na sincronização: ${error.message || 'Erro desconhecido'}`]);
    } finally {
      setSincronizando(false);
    }
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
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Data de Início"
                value={dataInicio}
                onChange={setDataInicio}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    size: "small",
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
            
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Data de Fim"
                value={dataFim}
                onChange={setDataFim}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    size: "small" 
                  } 
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Projeto</InputLabel>
                <Select
                  value={projetoFilter}
                  label="Projeto"
                  onChange={(e) => setProjetoFilter(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {projetos.map((projeto) => (
                    <MenuItem key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Recurso</InputLabel>
                <Select
                  value={recursoFilter}
                  label="Recurso"
                  onChange={(e) => setRecursoFilter(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {(recursos || []).map((recurso) => (
                    <MenuItem key={recurso.id} value={recurso.id}>
                      {recurso.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Fonte do Apontamento</InputLabel>
                <Select
                  value={fonteFilter}
                  label="Fonte do Apontamento"
                  onChange={(e) => setFonteFilter(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="MANUAL">Manual</MenuItem>
                  <MenuItem value="JIRA">JIRA</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={handleFilter}
                sx={{ mr: 1 }}
              >
                Filtrar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchApontamentos}
              >
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Recurso</strong></TableCell>
                <TableCell><strong>Projeto</strong></TableCell>
                <TableCell><strong>Descrição</strong></TableCell>
                <TableCell align="right"><strong>Horas</strong></TableCell>
                <TableCell align="center"><strong>Fonte</strong></TableCell>
                <TableCell width={110} align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} sx={{ color: '#00579d' }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>Carregando apontamentos...</Typography>
                  </TableCell>
                </TableRow>
              ) : apontamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Nenhum apontamento encontrado</TableCell>
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
                          <Typography sx={{ 
                            maxWidth: 250, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis'
                          }}>
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
                      {apontamento.fonte_apontamento === 'JIRA' ? (
                        <Tooltip title={apontamento.jira_issue_key || 'JIRA'}>
                          <Chip 
                            icon={<JiraIcon />}
                            label="JIRA"
                            size="small"
                            color="info"
                          />
                        </Tooltip>
                      ) : (
                        <Chip 
                          label="Manual"
                          size="small"
                          color="default"
                        />
                      )}
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
          </Table>
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
        </TableContainer>
        
        {/* Dialog para editar apontamento */}
        {apontamentoAtual && (
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Editar Apontamento</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Recurso</Typography>
                    <Typography variant="body1">
                      {apontamentoAtual.recurso?.nome || `Recurso #${apontamentoAtual.recurso_id}`}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Projeto</Typography>
                    <Typography variant="body1">
                      {apontamentoAtual.projeto?.nome || `Projeto #${apontamentoAtual.projeto_id}`}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Data</Typography>
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
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="jira_issue_key"
                    label="Chave do Issue no JIRA"
                    value={formData.jira_issue_key}
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
        
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Integração com JIRA
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure a integração com sua instância do JIRA para sincronizar tarefas e registros de tempo.
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" noValidate autoComplete="off">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="url"
                    label="URL do JIRA"
                    fullWidth
                    value={config.url}
                    onChange={handleChangeJiraConfig}
                    placeholder="https://sua-empresa.atlassian.net"
                    helperText="URL completa da sua instância do JIRA"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    name="username"
                    label="Nome de usuário / Email"
                    fullWidth
                    value={config.username}
                    onChange={handleChangeJiraConfig}
                    helperText="Email associado à sua conta JIRA"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    name="api_token"
                    label="Token de API"
                    fullWidth
                    type={showToken ? 'text' : 'password'}
                    value={config.api_token}
                    onChange={handleChangeJiraConfig}
                    helperText="Token de API do JIRA (gerenciado em Atlassian account settings)"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle token visibility"
                            onClick={() => setShowToken(!showToken)}
                            edge="end"
                          >
                            {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ativo}
                        name="ativo"
                        onChange={handleChangeJiraConfig}
                        color="primary"
                      />
                    }
                    label="Ativar integração com JIRA"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveJiraConfig}
                      disabled={loading}
                    >
                      Salvar Configurações
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={handleTestConnection}
                      disabled={loading || testando || !config.url || !config.username || !config.api_token}
                      startIcon={<CodeIcon />}
                    >
                      {testando ? <CircularProgress size={24} /> : 'Testar Conexão'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
        
        <Paper sx={{ p: 3, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Sincronização de Dados</Typography>
            <Box>
              {config.ultima_sincronizacao && (
                <Typography variant="body2" color="text.secondary">
                  Última sincronização: {new Date(config.ultima_sincronizacao).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity={
                config.status === 'conectado' ? 'success' : 
                config.status === 'erro' ? 'error' : 'info'
              }
              icon={
                config.status === 'conectado' ? <CheckCircleIcon /> : 
                config.status === 'erro' ? <ErrorIcon /> : <SyncIcon />
              }
            >
              {config.status === 'conectado' ? 'Conexão com JIRA estabelecida. Pronto para sincronização.' : 
               config.status === 'erro' ? `Erro na conexão: ${config.erro_mensagem || 'Verifique suas credenciais.'}` : 
               'JIRA não configurado ou desconectado.'}
            </Alert>
          </Box>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SyncIcon />}
            onClick={handleSync}
            disabled={loading || sincronizando || config.status !== 'conectado'}
            sx={{ mb: 3 }}
          >
            {sincronizando ? <CircularProgress size={24} color="inherit" /> : 'Sincronizar com JIRA'}
          </Button>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            A sincronização irá atualizar os registros de tempo, tarefas e projetos entre o JIRA e este sistema.
          </Typography>
        </Paper>
        
        {/* Dialog para exibir log de sincronização */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="sync-dialog-title"
          maxWidth="md"
          fullWidth
        >
          <DialogTitle id="sync-dialog-title">
            Log de Sincronização com JIRA
          </DialogTitle>
          <DialogContent>
            <DialogContentText component="div">
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', maxHeight: '400px', overflow: 'auto' }}>
                {logSincronizacao.map((line, index) => (
                  <Box key={index} sx={{ py: 0.5 }}>
                    {line}
                  </Box>
                ))}
                {sincronizando && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="body2">Processando...</Typography>
                  </Box>
                )}
              </Box>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Fechar</Button>
          </DialogActions>
        </Dialog>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}