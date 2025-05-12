"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  Snackbar, Alert, TablePagination, Chip, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';

// Interface para o tipo Projeto
interface Projeto {
  id: number;
  nome: string;
  codigo_empresa: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  ativo: boolean;
  data_criacao?: string;
  data_atualizacao?: string;
}

// Interface para o formulário de projeto
interface ProjetoFormData {
  nome: string;
  codigo_empresa: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  ativo?: boolean;
}

// Dados mockados para desenvolvimento (quando a API não estiver disponível)
const dadosMockProjetos: Projeto[] = [
  { 
    id: 1, 
    nome: 'Projeto A', 
    codigo_empresa: 'PROJ-001', 
    descricao: 'Descrição do Projeto A',
    data_inicio: '2023-01-01',
    data_fim: '2023-12-31',
    status: 'Em andamento',
    ativo: true
  },
  { 
    id: 2, 
    nome: 'Projeto B', 
    codigo_empresa: 'PROJ-002', 
    descricao: 'Descrição do Projeto B',
    data_inicio: '2023-02-01',
    data_fim: '2023-11-30',
    status: 'Em andamento',
    ativo: true
  },
  { 
    id: 3, 
    nome: 'Projeto C', 
    codigo_empresa: 'PROJ-003', 
    descricao: 'Descrição do Projeto C',
    data_inicio: '2023-03-01',
    data_fim: '2023-10-31',
    status: 'Concluído',
    ativo: false
  }
];

export default function GerenciamentoProjetos() {
  // Estados
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<ProjetoFormData>({
    nome: '',
    codigo_empresa: '',
    descricao: '',
    status: 'Em andamento',
    ativo: true
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

  // Função para buscar projetos
  const fetchProjetos = async () => {
    setLoading(true);
    try {
      const params: any = {
        skip: page * rowsPerPage,
        limit: rowsPerPage
      };
      
      if (searchTerm) {
        params.nome = searchTerm;
      }
      
      const response = await apiGet<{ items: Projeto[], total: number }>('/projetos', params);
      setProjetos(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      // Usar dados mockados em caso de erro
      setProjetos(dadosMockProjetos);
      setTotalItems(dadosMockProjetos.length);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos. Usando dados de exemplo.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para criar um novo projeto
  const handleCreate = async () => {
    try {
      await apiPost('/projetos', formData);
      setSnackbar({
        open: true,
        message: 'Projeto criado com sucesso!',
        severity: 'success'
      });
      setOpenDialog(false);
      fetchProjetos();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao criar projeto. Tente novamente.',
        severity: 'error'
      });
    }
  };

  // Função para atualizar um projeto existente
  const handleUpdate = async () => {
    if (editingId === null) return;
    
    try {
      await apiPut(`/projetos/${editingId}`, formData);
      setSnackbar({
        open: true,
        message: 'Projeto atualizado com sucesso!',
        severity: 'success'
      });
      setOpenDialog(false);
      fetchProjetos();
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar projeto. Tente novamente.',
        severity: 'error'
      });
    }
  };

  // Função para excluir um projeto
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    
    try {
      await apiDelete(`/projetos/${id}`);
      setSnackbar({
        open: true,
        message: 'Projeto excluído com sucesso!',
        severity: 'success'
      });
      fetchProjetos();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir projeto. Tente novamente.',
        severity: 'error'
      });
    }
  };

  // Função para abrir o diálogo de edição
  const handleEdit = (projeto: Projeto) => {
    setEditingId(projeto.id);
    setFormData({
      nome: projeto.nome,
      codigo_empresa: projeto.codigo_empresa,
      descricao: projeto.descricao || '',
      data_inicio: projeto.data_inicio,
      data_fim: projeto.data_fim,
      status: projeto.status || 'Em andamento',
      ativo: projeto.ativo
    });
    setOpenDialog(true);
  };

  // Função para abrir o diálogo de criação
  const handleOpenCreateDialog = () => {
    setEditingId(null);
    setFormData({
      nome: '',
      codigo_empresa: '',
      descricao: '',
      status: 'Em andamento',
      ativo: true
    });
    setOpenDialog(true);
  };

  // Função para fechar o diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Função para lidar com a mudança de página
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Função para lidar com a mudança de linhas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Efeito para buscar projetos ao carregar a página ou quando os filtros mudarem
  useEffect(() => {
    fetchProjetos();
  }, [page, rowsPerPage, searchTerm]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h1">
              Gerenciamento de Projetos
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{ mr: 1 }}
            >
              Novo Projeto
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchProjetos()}
            >
              Atualizar
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar por nome"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => fetchProjetos()}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ativo</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projetos.map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell>{projeto.id}</TableCell>
                      <TableCell>{projeto.nome}</TableCell>
                      <TableCell>{projeto.codigo_empresa}</TableCell>
                      <TableCell>{projeto.status || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={projeto.ativo ? 'Sim' : 'Não'} 
                          color={projeto.ativo ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(projeto)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(projeto.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Diálogo para criar/editar projeto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código da Empresa"
                value={formData.codigo_empresa}
                onChange={(e) => setFormData({ ...formData, codigo_empresa: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Início"
                type="date"
                value={formData.data_inicio || ''}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Fim"
                type="date"
                value={formData.data_fim || ''}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || ''}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Em andamento">Em andamento</MenuItem>
                  <MenuItem value="Concluído">Concluído</MenuItem>
                  <MenuItem value="Cancelado">Cancelado</MenuItem>
                  <MenuItem value="Pausado">Pausado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ativo</InputLabel>
                <Select
                  value={formData.ativo === undefined ? true : formData.ativo}
                  label="Ativo"
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'true' })}
                >
                  <MenuItem value="true">Sim</MenuItem>
                  <MenuItem value="false">Não</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={editingId ? handleUpdate : handleCreate} 
            variant="contained"
          >
            {editingId ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}