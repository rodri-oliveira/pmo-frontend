"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  Snackbar, Alert, TablePagination, Chip, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { format, parseISO } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import ScheduleIcon from '@mui/icons-material/Schedule';

// Importando os serviços de API
import { getAlocacoes, createAlocacao, updateAlocacao, deleteAlocacao, getRecursos, getProjetos } from '@/services/alocacoes';

// Interfaces
interface Recurso {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  equipe_principal_id: number;
  equipe?: {
    id: number;
    nome: string;
  };
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
  data_criacao: string;
  data_atualizacao?: string;
}

interface AlocacaoFormData {
  projeto_id: number | null;
  recurso_id: number | null;
  data_inicio_alocacao: Date | null;
  data_fim_alocacao: Date | null;
}

interface PlanejamentoHoras {
  ano: number;
  mes: number;
  horas_planejadas: number;
}

export default function AlocacoesPage() {
  // Estados
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<AlocacaoFormData>({
    projeto_id: null,
    recurso_id: null,
    data_inicio_alocacao: null,
    data_fim_alocacao: null
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projetoFilter, setProjetoFilter] = useState<number | ''>('');
  const [recursoFilter, setRecursoFilter] = useState<number | ''>('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [apiDisponivel, setApiDisponivel] = useState<boolean>(true);

  // Dados mockados para desenvolvimento (quando a API não estiver disponível)
  const dadosMockAlocacoes: Alocacao[] = [
    {
      id: 1,
      projeto_id: 1,
      projeto: {
        id: 1,
        nome: 'Projeto Exemplo 1',
        codigo_empresa: 'PRJ001'
      },
      recurso_id: 1,
      recurso: {
        id: 1,
        nome: 'João Silva',
        email: 'joao.silva@exemplo.com'
      },
      data_inicio_alocacao: '2025-01-01T00:00:00',
      data_fim_alocacao: '2025-12-31T00:00:00',
      data_criacao: '2025-01-01T00:00:00'
    },
    {
      id: 2,
      projeto_id: 2,
      projeto: {
        id: 2,
        nome: 'Projeto Exemplo 2',
        codigo_empresa: 'PRJ002'
      },
      recurso_id: 2,
      recurso: {
        id: 2,
        nome: 'Maria Oliveira',
        email: 'maria.oliveira@exemplo.com'
      },
      data_inicio_alocacao: '2025-02-01T00:00:00',
      data_fim_alocacao: null,
      data_criacao: '2025-01-15T00:00:00'
    },
    {
      id: 3,
      projeto_id: 1,
      projeto: {
        id: 1,
        nome: 'Projeto Exemplo 1',
        codigo_empresa: 'PRJ001'
      },
      recurso_id: 3,
      recurso: {
        id: 3,
        nome: 'Pedro Santos',
        email: 'pedro.santos@exemplo.com'
      },
      data_inicio_alocacao: '2025-03-01T00:00:00',
      data_fim_alocacao: '2025-06-30T00:00:00',
      data_criacao: '2025-02-15T00:00:00'
    }
  ];

  // Função para buscar alocações
  const fetchAlocacoes = async () => {
    setLoading(true);
    try {
      const data = await getAlocacoes({ 
        projeto_id: projetoFilter ? Number(projetoFilter) : undefined, 
        recurso_id: recursoFilter ? Number(recursoFilter) : undefined,
        page,
        limit: rowsPerPage,
        searchTerm
      }) as { items: Alocacao[], total: number };
      
      setAlocacoes(data.items || []); // Aplicando operador || [] para garantir que sempre seja um array
      setTotalItems(data.total || 0);
      setApiDisponivel(true);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar alocações:', error);
      
      // Usando dados mockados em caso de erro
      setAlocacoes(dadosMockAlocacoes);
      setTotalItems(dadosMockAlocacoes.length);
      setApiDisponivel(false);
      
      setSnackbar({
        open: true,
        message: 'Erro ao carregar alocações. Usando dados de exemplo.',
        severity: 'warning'
      });
      setLoading(false);
    }
  };

  // Função para buscar recursos
  const fetchRecursos = async () => {
    try {
      const data = await getRecursos(searchTerm) as { items: Recurso[], total: number };
      setRecursos(data.items || []); // Aplicando operador || [] para garantir que sempre seja um array
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      
      // Dados mockados para recursos
      const recursosMock: Recurso[] = [
        { id: 1, nome: 'João Silva', email: 'joao.silva@exemplo.com', matricula: '12345', equipe_principal_id: 1 },
        { id: 2, nome: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com', matricula: '23456', equipe_principal_id: 1 },
        { id: 3, nome: 'Pedro Santos', email: 'pedro.santos@exemplo.com', matricula: '34567', equipe_principal_id: 2 }
      ];
      
      setRecursos(recursosMock);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar recursos. Usando dados de exemplo.',
        severity: 'warning'
      });
    }
  };

  // Função para buscar projetos
  const fetchProjetos = async () => {
    try {
      const data = await getProjetos(searchTerm) as { items: Projeto[], total: number };
      setProjetos(data.items || []); // Aplicando operador || [] para garantir que sempre seja um array
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      
      // Dados mockados para projetos
      const projetosMock: Projeto[] = [
        { id: 1, nome: 'Projeto Exemplo 1', codigo_empresa: 'PRJ001' },
        { id: 2, nome: 'Projeto Exemplo 2', codigo_empresa: 'PRJ002' },
        { id: 3, nome: 'Projeto Exemplo 3', codigo_empresa: 'PRJ003' }
      ];
      
      setProjetos(projetosMock);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos. Usando dados de exemplo.',
        severity: 'warning'
      });
    }
  };

  // Efeito inicial para buscar dados
  useEffect(() => {
    fetchRecursos();
    fetchProjetos();
    fetchAlocacoes();
  }, []);

  // Efeito para atualizar quando os filtros mudarem
  useEffect(() => {
    fetchAlocacoes();
  }, [projetoFilter, recursoFilter, page, rowsPerPage]);

  // Efeito para buscar quando o termo de pesquisa muda (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlocacoes();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (alocacao?: Alocacao) => {
    if (alocacao) {
      setFormData({
        projeto_id: alocacao.projeto_id,
        recurso_id: alocacao.recurso_id,
        data_inicio_alocacao: alocacao.data_inicio_alocacao ? new Date(alocacao.data_inicio_alocacao) : null,
        data_fim_alocacao: alocacao.data_fim_alocacao ? new Date(alocacao.data_fim_alocacao) : null
      });
      setEditingId(alocacao.id);
    } else {
      setFormData({
        projeto_id: null,
        recurso_id: null,
        data_inicio_alocacao: null,
        data_fim_alocacao: null
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.projeto_id || !formData.recurso_id) return;
      
      const dataToSend = {
        recurso_id: formData.recurso_id,
        data_inicio_alocacao: formData.data_inicio_alocacao ? format(formData.data_inicio_alocacao, 'yyyy-MM-dd') : null,
        data_fim_alocacao: formData.data_fim_alocacao ? format(formData.data_fim_alocacao, 'yyyy-MM-dd') : null
      };
      
      if (editingId) {
        await updateAlocacao(formData.projeto_id, editingId, dataToSend);
        setSnackbar({
          open: true,
          message: 'Alocação atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        await createAlocacao(formData.projeto_id, dataToSend);
        setSnackbar({
          open: true,
          message: 'Alocação criada com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchAlocacoes();
    } catch (error) {
      console.error('Erro ao salvar alocação:', error);
      setSnackbar({
        open: true,
        message: `Erro ao salvar alocação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteAlocacao = async (alocacao: Alocacao) => {
    if (window.confirm(`Tem certeza que deseja remover a alocação de ${alocacao.recurso?.nome} no projeto ${alocacao.projeto?.nome}?`)) {
      try {
        await deleteAlocacao(alocacao.projeto_id, alocacao.id);
        setSnackbar({
          open: true,
          message: 'Alocação removida com sucesso!',
          severity: 'success'
        });
        fetchAlocacoes();
      } catch (error) {
        console.error('Erro ao remover alocação:', error);
        setSnackbar({
          open: true,
          message: `Erro ao remover alocação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          severity: 'error'
        });
      }
    }
  };

  const handleDateChange = (fieldName: string, date: Date | null) => {
    setFormData({
      ...formData,
      [fieldName]: date
    });
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

  const isFormValid = () => {
    return (
      formData.projeto_id !== null && 
      formData.recurso_id !== null && 
      formData.data_inicio_alocacao !== null
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Typography variant="h4" gutterBottom>
          <AssignmentIndIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Alocações de Recursos
        </Typography>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Pesquisar alocações"
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
                  {recursos.map((recurso) => (
                    <MenuItem key={recurso.id} value={recurso.id}>
                      {recurso.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => fetchAlocacoes()}
                sx={{ mr: 1 }}
              >
                Atualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ backgroundColor: '#00579d' }}
              >
                Nova
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Projeto</strong></TableCell>
                <TableCell><strong>Recurso</strong></TableCell>
                <TableCell><strong>Data Início</strong></TableCell>
                <TableCell><strong>Data Fim</strong></TableCell>
                <TableCell width={120} align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} sx={{ color: '#00579d' }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>Carregando alocações...</Typography>
                  </TableCell>
                </TableRow>
              ) : alocacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Nenhuma alocação encontrada</TableCell>
                </TableRow>
              ) : (
                alocacoes.map((alocacao) => (
                  <TableRow key={alocacao.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FolderIcon sx={{ mr: 1, color: '#00579d' }} />
                        <div>
                          <Typography variant="body2">{alocacao.projeto?.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">{alocacao.projeto?.codigo_empresa}</Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: '#00579d' }} />
                        <div>
                          <Typography variant="body2">{alocacao.recurso?.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">{alocacao.recurso?.email}</Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {alocacao.data_inicio_alocacao ? format(new Date(alocacao.data_inicio_alocacao), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {alocacao.data_fim_alocacao ? format(new Date(alocacao.data_fim_alocacao), 'dd/MM/yyyy') : 
                      <Chip label="Sem data final" size="small" color="info" variant="outlined" />}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleOpenDialog(alocacao)}
                        sx={{ color: '#00579d' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteAlocacao(alocacao)}
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
            rowsPerPageOptions={[5, 10, 25]}
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
        
        {/* Dialog para criar/editar alocação */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Editar Alocação' : 'Nova Alocação'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <Autocomplete
                  disablePortal
                  options={projetos}
                  getOptionLabel={(option) => `${option.nome} (${option.codigo_empresa})`}
                  value={projetos.find(p => p.id === formData.projeto_id) || null}
                  onChange={(_, newValue) => {
                    setFormData({
                      ...formData,
                      projeto_id: newValue?.id || null
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Projeto"
                      variant="outlined"
                      fullWidth
                      required
                      margin="normal"
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
              
              <Grid item xs={12}>
                <Autocomplete
                  disablePortal
                  options={recursos}
                  getOptionLabel={(option) => `${option.nome} (${option.matricula})`}
                  value={recursos.find(r => r.id === formData.recurso_id) || null}
                  onChange={(_, newValue) => {
                    setFormData({
                      ...formData,
                      recurso_id: newValue?.id || null
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Recurso"
                      variant="outlined"
                      fullWidth
                      required
                      margin="normal"
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
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data Início"
                  value={formData.data_inicio_alocacao}
                  onChange={(date) => handleDateChange('data_inicio_alocacao', date)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      required: true,
                      margin: "normal",
                      InputProps: {
                        startAdornment: (
                          <EventIcon sx={{ color: 'action.active', mr: 1 }} />
                        ),
                      }
                    } 
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data Fim"
                  value={formData.data_fim_alocacao}
                  onChange={(date) => handleDateChange('data_fim_alocacao', date)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      margin: "normal",
                      InputProps: {
                        startAdornment: (
                          <EventIcon sx={{ color: 'action.active', mr: 1 }} />
                        ),
                      } 
                    } 
                  }}
                />
              </Grid>
            </Grid>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              * Para uma alocação sem prazo definido, deixe a Data Fim em branco.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!isFormValid()}
              sx={{ backgroundColor: '#00579d' }}
            >
              {editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar para feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
