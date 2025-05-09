"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  Snackbar, Alert, TablePagination, Chip, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  InputAdornment, Tabs, Tab, Divider, Link, Avatar
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
import FolderIcon from '@mui/icons-material/Folder';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface StatusProjeto {
  id: number;
  nome: string;
  is_final: boolean;
}

interface Projeto {
  id: number;
  nome: string;
  codigo_empresa: string;
  descricao: string;
  jira_project_key?: string;
  status_projeto_id: number;
  status_projeto?: {
    id: number;
    nome: string;
  };
  data_inicio_prevista: string;
  data_fim_prevista: string;
  ativo: boolean;
}

interface ProjetoFormData {
  nome: string;
  codigo_empresa: string;
  descricao: string;
  jira_project_key?: string;
  status_projeto_id: number;
  data_inicio_prevista: Date | null;
  data_fim_prevista: Date | null;
  ativo?: boolean;
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [statusProjetos, setStatusProjetos] = useState<StatusProjeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<ProjetoFormData>({
    nome: '',
    codigo_empresa: '',
    descricao: '',
    jira_project_key: '',
    status_projeto_id: 0,
    data_inicio_prevista: null,
    data_fim_prevista: null
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  // Função para buscar os status de projeto
  const fetchStatusProjetos = async () => {
    try {
      // Em ambiente de produção, descomente:
      // const response = await fetch('http://localhost:8000/backend/v1/status-projetos');
      // const data = await response.json();
      // setStatusProjetos(data.items);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        const mockStatusProjetos: StatusProjeto[] = [
          { id: 1, nome: 'Não Iniciado', is_final: false },
          { id: 2, nome: 'Em Andamento', is_final: false },
          { id: 3, nome: 'Pausado', is_final: false },
          { id: 4, nome: 'Concluído', is_final: true },
          { id: 5, nome: 'Cancelado', is_final: true }
        ];
        setStatusProjetos(mockStatusProjetos);
      }, 300);
    } catch (error) {
      console.error('Erro ao buscar status de projetos:', error);
    }
  };

  // Função para buscar os projetos
  const fetchProjetos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('skip', String(page * rowsPerPage));
      params.append('limit', String(rowsPerPage));
      
      if (searchTerm) {
        params.append('nome', searchTerm);
      }
      
      if (statusFilter > 0) {
        params.append('status_id', String(statusFilter));
      }
      
      // Em ambiente de produção, descomente:
      // const response = await fetch(`http://localhost:8000/backend/v1/projetos?${params}`);
      // const data = await response.json();
      // setProjetos(data.items);
      // setTotalItems(data.total);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        const mockProjetos: Projeto[] = [
          {
            id: 1,
            nome: 'Projeto A',
            codigo_empresa: 'PRJ001',
            descricao: 'Descrição do projeto A',
            jira_project_key: 'PRJA',
            status_projeto_id: 2,
            status_projeto: {
              id: 2,
              nome: 'Em Andamento'
            },
            data_inicio_prevista: '2025-01-01',
            data_fim_prevista: '2025-06-30',
            ativo: true
          },
          {
            id: 2,
            nome: 'Projeto B',
            codigo_empresa: 'PRJ002',
            descricao: 'Descrição do projeto B',
            jira_project_key: 'PRJB',
            status_projeto_id: 1,
            status_projeto: {
              id: 1,
              nome: 'Não Iniciado'
            },
            data_inicio_prevista: '2025-07-01',
            data_fim_prevista: '2025-12-31',
            ativo: true
          },
          {
            id: 3,
            nome: 'Projeto C',
            codigo_empresa: 'PRJ003',
            descricao: 'Descrição do projeto C',
            jira_project_key: 'PRJC',
            status_projeto_id: 4,
            status_projeto: {
              id: 4,
              nome: 'Concluído'
            },
            data_inicio_prevista: '2024-10-01',
            data_fim_prevista: '2025-03-31',
            ativo: true
          },
          {
            id: 4,
            nome: 'Projeto D',
            codigo_empresa: 'PRJ004',
            descricao: 'Descrição do projeto D',
            jira_project_key: 'PRJD',
            status_projeto_id: 5,
            status_projeto: {
              id: 5,
              nome: 'Cancelado'
            },
            data_inicio_prevista: '2024-11-01',
            data_fim_prevista: '2025-04-30',
            ativo: false
          }
        ].filter(projeto => {
          let match = true;
          if (searchTerm) {
            match = match && (
              projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
              projeto.codigo_empresa.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (statusFilter > 0) {
            match = match && projeto.status_projeto_id === statusFilter;
          }
          return match;
        });
        
        setProjetos(mockProjetos);
        setTotalItems(mockProjetos.length);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos. Tente novamente.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusProjetos();
  }, []);

  useEffect(() => {
    fetchProjetos();
  }, [page, rowsPerPage, statusFilter]);

  // Efeito para buscar quando o termo de pesquisa muda (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjetos();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (projeto?: Projeto) => {
    if (projeto) {
      setFormData({
        nome: projeto.nome,
        codigo_empresa: projeto.codigo_empresa,
        descricao: projeto.descricao,
        jira_project_key: projeto.jira_project_key || '',
        status_projeto_id: projeto.status_projeto_id,
        data_inicio_prevista: parseISO(projeto.data_inicio_prevista),
        data_fim_prevista: parseISO(projeto.data_fim_prevista),
        ativo: projeto.ativo
      });
      setEditingId(projeto.id);
    } else {
      setFormData({
        nome: '',
        codigo_empresa: '',
        descricao: '',
        jira_project_key: '',
        status_projeto_id: 0,
        data_inicio_prevista: null,
        data_fim_prevista: null
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    setFormData({
      ...formData,
      status_projeto_id: e.target.value as number
    });
  };

  const handleFilterChange = (e: SelectChangeEvent<number>) => {
    setStatusFilter(e.target.value as number);
    setPage(0);
  };

  const handleStartDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      data_inicio_prevista: date
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      data_fim_prevista: date
    });
  };

  const handleSubmit = async () => {
    try {
      // Preparar os dados para envio
      const dataToSend = {
        ...formData,
        data_inicio_prevista: formData.data_inicio_prevista ? format(formData.data_inicio_prevista, 'yyyy-MM-dd') : undefined,
        data_fim_prevista: formData.data_fim_prevista ? format(formData.data_fim_prevista, 'yyyy-MM-dd') : undefined
      };
      
      if (editingId) {
        // Editar projeto existente
        // Em produção, descomente:
        // await fetch(`http://localhost:8000/backend/v1/projetos/${editingId}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(dataToSend)
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Projeto atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo projeto
        // Em produção, descomente:
        // await fetch('http://localhost:8000/backend/v1/projetos', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(dataToSend)
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Projeto criado com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchProjetos();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar projeto. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteProjeto = async (id: number) => {
    if (window.confirm('Tem certeza que deseja desativar este projeto?')) {
      try {
        // Em produção, descomente:
        // await fetch(`http://localhost:8000/backend/v1/projetos/${id}`, {
        //   method: 'DELETE'
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Projeto desativado com sucesso!',
          severity: 'success'
        });
        fetchProjetos();
      } catch (error) {
        console.error('Erro ao desativar projeto:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao desativar projeto. Tente novamente.',
          severity: 'error'
        });
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

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isFormValid = () => {
    return (
      formData.nome.trim() !== '' && 
      formData.codigo_empresa.trim() !== '' && 
      formData.status_projeto_id > 0 &&
      formData.data_inicio_prevista !== null &&
      formData.data_fim_prevista !== null
    );
  };

  // Renderiza a cor baseada no status do projeto
  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return 'info'; // Não Iniciado
      case 2: return 'primary'; // Em Andamento
      case 3: return 'warning'; // Pausado
      case 4: return 'success'; // Concluído
      case 5: return 'error'; // Cancelado
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Gerenciamento de Projetos
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={5}>
            <TextField
              fullWidth
              label="Pesquisar projetos"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome ou código do projeto"
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Filtrar por Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Filtrar por Status"
                onChange={handleFilterChange}
              >
                <MenuItem value={0}>Todos os Status</MenuItem>
                {statusProjetos.map((status) => (
                  <MenuItem key={status.id} value={status.id}>{status.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchProjetos()}
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
              Novo Projeto
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width={50}><strong>ID</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Código</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Início</strong></TableCell>
              <TableCell><strong>Término</strong></TableCell>
              <TableCell width={120} align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} sx={{ color: '#00579d' }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>Carregando projetos...</Typography>
                </TableCell>
              </TableRow>
            ) : projetos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Nenhum projeto encontrado</TableCell>
              </TableRow>
            ) : (
              projetos.map((projeto) => (
                <TableRow key={projeto.id} hover>
                  <TableCell>{projeto.id}</TableCell>
                  <TableCell>{projeto.nome}</TableCell>
                  <TableCell>{projeto.codigo_empresa}</TableCell>
                  <TableCell>
                    <Chip 
                      label={projeto.status_projeto?.nome} 
                      color={getStatusColor(projeto.status_projeto_id) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(projeto.data_inicio_prevista).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleOpenDialog(projeto)}
                      sx={{ color: '#00579d' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {projeto.ativo && !statusProjetos.find(s => s.id === projeto.status_projeto_id)?.is_final && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteProjeto(projeto.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
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
      
      {/* Dialog para criar/editar projeto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome do Projeto"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.nome}
            onChange={handleInputChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FolderIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="codigo_empresa"
                label="Código do Projeto"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.codigo_empresa}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CodeIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="jira_project_key"
                label="Chave do Projeto no Jira (opcional)"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.jira_project_key}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          
          <TextField
            margin="dense"
            name="descricao"
            label="Descrição do Projeto"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.descricao}
            onChange={handleInputChange}
            multiline
            rows={3}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="status-select-label">Status do Projeto</InputLabel>
            <Select
              labelId="status-select-label"
              name="status_projeto_id"
              value={formData.status_projeto_id}
              label="Status do Projeto"
              onChange={handleSelectChange}
              required
            >
              <MenuItem value={0} disabled>Selecione um status</MenuItem>
              {statusProjetos.map((status) => (
                <MenuItem key={status.id} value={status.id}>{status.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker 
                  label="Data de Início Prevista"
                  value={formData.data_inicio_prevista}
                  onChange={handleStartDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      required: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon />
                          </InputAdornment>
                        ),
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker 
                  label="Data de Término Prevista"
                  value={formData.data_fim_prevista}
                  onChange={handleEndDateChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      required: true,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon />
                          </InputAdornment>
                        ),
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          
          {editingId && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button 
                  variant={formData.ativo === true ? "contained" : "outlined"}
                  color="success"
                  onClick={() => setFormData({...formData, ativo: true})}
                  size="small"
                >
                  Ativo
                </Button>
                <Button 
                  variant={formData.ativo === false ? "contained" : "outlined"}
                  color="error"
                  onClick={() => setFormData({...formData, ativo: false})}
                  size="small"
                >
                  Inativo
                </Button>
              </Box>
            </Box>
          )}
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
  );
}