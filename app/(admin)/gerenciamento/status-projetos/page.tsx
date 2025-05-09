"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  Snackbar, Alert, TablePagination, Chip, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FlagIcon from '@mui/icons-material/Flag';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { format, parseISO, addHours } from 'date-fns';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';

interface StatusProjeto {
  id: number;
  nome: string;
  descricao: string;
  is_final: boolean;
  ordem_exibicao: number;
  data_criacao?: string;
  data_atualizacao?: string;
}

interface StatusProjetoFormData {
  nome: string;
  descricao: string;
  is_final: boolean;
  ordem_exibicao: number;
}

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

interface ApontamentoFormData {
  recurso_id: number;
  projeto_id: number;
  data_apontamento: Date | null;
  horas_apontadas: number;
  descricao: string;
  jira_issue_key?: string;
  data_hora_inicio_trabalho?: Date | null;
}

export default function StatusProjetosPage() {
  const [statusProjetos, setStatusProjetos] = useState<StatusProjeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<StatusProjetoFormData>({
    nome: '',
    descricao: '',
    is_final: false,
    ordem_exibicao: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [loadingProjetos, setLoadingProjetos] = useState(false);
  const [searchRecurso, setSearchRecurso] = useState('');
  const [searchProjeto, setSearchProjeto] = useState('');

  // Função para buscar os status de projeto
  const fetchStatusProjetos = async () => {
    setLoading(true);
    try {
      // Em ambiente de produção, descomente:
      // const response = await fetch('http://localhost:8000/backend/v1/status-projetos');
      // const data = await response.json();
      // setStatusProjetos(data.items);
      // setTotalItems(data.total);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        const mockStatusProjetos: StatusProjeto[] = [
          { 
            id: 1, 
            nome: 'Não Iniciado', 
            descricao: 'Projeto ainda não iniciado', 
            is_final: false, 
            ordem_exibicao: 1, 
            data_criacao: '2025-01-15T10:00:00'
          },
          { 
            id: 2, 
            nome: 'Em Andamento', 
            descricao: 'Projeto em execução', 
            is_final: false, 
            ordem_exibicao: 2, 
            data_criacao: '2025-01-15T10:00:00'
          },
          { 
            id: 3, 
            nome: 'Pausado', 
            descricao: 'Projeto temporariamente pausado', 
            is_final: false, 
            ordem_exibicao: 3, 
            data_criacao: '2025-01-15T10:00:00'
          },
          { 
            id: 4, 
            nome: 'Concluído', 
            descricao: 'Projeto finalizado com sucesso', 
            is_final: true, 
            ordem_exibicao: 4, 
            data_criacao: '2025-01-15T10:00:00'
          },
          { 
            id: 5, 
            nome: 'Cancelado', 
            descricao: 'Projeto cancelado', 
            is_final: true, 
            ordem_exibicao: 5, 
            data_criacao: '2025-01-15T10:00:00'
          }
        ].filter(status => {
          if (searchTerm) {
            return status.nome.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return true;
        });
        
        setStatusProjetos(mockStatusProjetos);
        setTotalItems(mockStatusProjetos.length);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao buscar status de projeto:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar status de projeto. Tente novamente.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusProjetos();
  }, [page, rowsPerPage]);

  // Efeito para buscar quando o termo de pesquisa muda (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStatusProjetos();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (status?: StatusProjeto) => {
    if (status) {
      setFormData({
        nome: status.nome,
        descricao: status.descricao,
        is_final: status.is_final,
        ordem_exibicao: status.ordem_exibicao
      });
      setEditingId(status.id);
    } else {
      // Para um novo status, definir o valor padrão da ordem_exibicao como o próximo número
      const maxOrdem = statusProjetos.reduce((max, status) => 
        status.ordem_exibicao > max ? status.ordem_exibicao : max, 0);
      
      setFormData({
        nome: '',
        descricao: '',
        is_final: false,
        ordem_exibicao: maxOrdem + 1
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

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      is_final: e.target.checked
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        // Editar status existente
        // Em produção, descomente:
        // await fetch(`http://localhost:8000/backend/v1/status-projetos/${editingId}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Status atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo status
        // Em produção, descomente:
        // await fetch('http://localhost:8000/backend/v1/status-projetos', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Status criado com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchStatusProjetos();
    } catch (error) {
      console.error('Erro ao salvar status:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar status. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteStatus = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este status?')) {
      try {
        // Em produção, descomente:
        // await fetch(`http://localhost:8000/backend/v1/status-projetos/${id}`, {
        //   method: 'DELETE'
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Status excluído com sucesso!',
          severity: 'success'
        });
        fetchStatusProjetos();
      } catch (error) {
        console.error('Erro ao excluir status:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir status. Tente novamente.',
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

  const isFormValid = () => {
    return (
      formData.nome.trim() !== '' && 
      formData.descricao.trim() !== '' && 
      formData.ordem_exibicao > 0
    );
  };

  // Função para buscar recursos
  const fetchRecursos = async () => {
    setLoadingRecursos(true);
    try {
      // Em ambiente de produção, descomente:
      // const response = await fetch(`http://localhost:8000/backend/v1/recursos?ativo=true&nome=${searchRecurso}`);
      // const data = await response.json();
      // setRecursos(data.items);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        const mockRecursos: Recurso[] = [
          {
            id: 1,
            nome: 'João Silva',
            email: 'joao.silva@exemplo.com',
            matricula: '123456',
            equipe_principal_id: 1,
            equipe: { id: 1, nome: 'Equipe Frontend' }
          },
          {
            id: 2,
            nome: 'Maria Oliveira',
            email: 'maria.oliveira@exemplo.com',
            matricula: '234567',
            equipe_principal_id: 1,
            equipe: { id: 1, nome: 'Equipe Frontend' }
          },
          {
            id: 3,
            nome: 'Pedro Santos',
            email: 'pedro.santos@exemplo.com',
            matricula: '345678',
            equipe_principal_id: 2,
            equipe: { id: 2, nome: 'Equipe Backend' }
          }
        ].filter(recurso => 
          !searchRecurso || 
          recurso.nome.toLowerCase().includes(searchRecurso.toLowerCase()) ||
          recurso.matricula.includes(searchRecurso)
        );
        
        setRecursos(mockRecursos);
        setLoadingRecursos(false);
      }, 300);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      setLoadingRecursos(false);
    }
  };

  // Função para buscar projetos
  const fetchProjetos = async () => {
    setLoadingProjetos(true);
    try {
      // Em ambiente de produção, descomente:
      // const response = await fetch(`http://localhost:8000/backend/v1/projetos?ativo=true&nome=${searchProjeto}`);
      // const data = await response.json();
      // setProjetos(data.items);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        const mockProjetos: Projeto[] = [
          {
            id: 1,
            nome: 'Projeto A',
            codigo_empresa: 'PRJ001'
          },
          {
            id: 2,
            nome: 'Projeto B',
            codigo_empresa: 'PRJ002'
          },
          {
            id: 3,
            nome: 'Projeto C',
            codigo_empresa: 'PRJ003'
          }
        ].filter(projeto => 
          !searchProjeto || 
          projeto.nome.toLowerCase().includes(searchProjeto.toLowerCase()) ||
          projeto.codigo_empresa.toLowerCase().includes(searchProjeto.toLowerCase())
        );
        
        setProjetos(mockProjetos);
        setLoadingProjetos(false);
      }, 300);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setLoadingProjetos(false);
    }
  };

  // Efeito inicial para buscar recursos e projetos
  useEffect(() => {
    fetchRecursos();
    fetchProjetos();
  }, []);

  // Efeito para buscar recursos quando o termo de pesquisa muda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecursos();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchRecurso]);

  // Efeito para buscar projetos quando o termo de pesquisa muda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjetos();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchProjeto]);

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value as number
    });
  };

  const handleAutoCompleteChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      [name]: value ? value.id : 0
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <FormatListBulletedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Status de Projetos
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              label="Pesquisar status"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchStatusProjetos()}
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
              Novo Status
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width={50}><strong>ID</strong></TableCell>
              <TableCell width={50} align="center"><strong>Ordem</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell width={120}><strong>Status Final</strong></TableCell>
              <TableCell width={120} align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} sx={{ color: '#00579d' }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>Carregando status...</Typography>
                </TableCell>
              </TableRow>
            ) : statusProjetos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Nenhum status encontrado</TableCell>
              </TableRow>
            ) : (
              statusProjetos.map((status) => (
                <TableRow key={status.id} hover>
                  <TableCell>{status.id}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      icon={<DragIndicatorIcon />}
                      label={status.ordem_exibicao}
                      size="small"
                      sx={{ backgroundColor: '#f0f0f0' }}
                    />
                  </TableCell>
                  <TableCell>{status.nome}</TableCell>
                  <TableCell>{status.descricao}</TableCell>
                  <TableCell>
                    <Chip 
                      label={status.is_final ? "Sim" : "Não"} 
                      color={status.is_final ? "primary" : "default"}
                      size="small"
                      icon={status.is_final ? <FlagIcon /> : undefined}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleOpenDialog(status)}
                      sx={{ color: '#00579d' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteStatus(status.id)}
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
      
      {/* Dialog para criar/editar status */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Status' : 'Novo Status'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome do Status"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.nome}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            margin="dense"
            name="descricao"
            label="Descrição"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.descricao}
            onChange={handleInputChange}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="ordem_exibicao"
            label="Ordem de Exibição"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.ordem_exibicao}
            onChange={handleInputChange}
            required
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_final}
                onChange={handleSwitchChange}
                name="is_final"
                color="primary"
              />
            }
            label="Status Final (projeto encerrado)"
            sx={{ mb: 1 }}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Um status final indica que o projeto não está mais ativo (concluído, cancelado, etc.)
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
  );
}
