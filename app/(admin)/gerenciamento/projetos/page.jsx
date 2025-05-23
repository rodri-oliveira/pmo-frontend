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



export default function GerenciamentoProjetos() {
  // Estados
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    codigo_empresa: '',
    descricao: '',
    status: 'Em andamento',
    ativo: true
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apenasAtivos, setApenasAtivos] = useState(false); // filtro visual
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Função para buscar projetos
  const fetchProjetos = async () => {
    setLoading(true);
    try {
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        apenas_ativos: apenasAtivos
      };
      if (searchTerm) {
        params.nome = searchTerm;
      }
      // Preferencialmente usar o serviço getProjetos
      // const response = await getProjetos(params);
      const response = await apiGet('/projetos', params);
      setProjetos(response.items || []);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setProjetos([]);
      setTotalItems(0);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para criar um novo projeto
  const handleCreate = async () => {
    try {
      await apiPost('/projetos', formData); // Alinhar com createProjeto do serviço se necessário
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

    // Monta o payload apenas com os campos obrigatórios e opcionais preenchidos
    const payload = {
      nome: formData.nome,
      status_projeto_id: formData.status_projeto_id || formData.status || 1, // fallback para 1 se necessário
      ativo: formData.ativo
    };
    // Adiciona opcionais se preenchidos
    if (formData.codigo_empresa) payload.codigo_empresa = formData.codigo_empresa;
    if (formData.descricao) payload.descricao = formData.descricao;
    if (formData.jira_project_key) payload.jira_project_key = formData.jira_project_key;
    if (formData.data_inicio) payload.data_inicio_prevista = formData.data_inicio;
    if (formData.data_fim) payload.data_fim_prevista = formData.data_fim;

    try {
      await apiPut(`/projetos/${editingId}`, payload);
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
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      await apiDelete(`/projetos/${id}`);
      setSnackbar({
        open: true,
        message: 'Projeto excluído com sucesso!',
        severity: 'success'
      });
      // Atualiza a lista de projetos para refletir deleção lógica
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
  const handleEdit = async (projeto) => {
    setEditingId(projeto.id);
    try {
      // Busca o projeto mais recente do backend
      const projetoAtualizado = await apiGet(`/projetos/${projeto.id}`);
      setFormData({
        nome: projetoAtualizado.nome || '',
        codigo_empresa: projetoAtualizado.codigo_empresa || '',
        descricao: projetoAtualizado.descricao || '',
        status: projetoAtualizado.status || projetoAtualizado.status_projeto_id || '',
        ativo: projetoAtualizado.ativo,
        data_inicio: projetoAtualizado.data_inicio_prevista || '',
        data_fim: projetoAtualizado.data_fim_prevista || ''
      });
    } catch (error) {
      setFormData({
        nome: projeto.nome || '',
        codigo_empresa: projeto.codigo_empresa || '',
        descricao: projeto.descricao || '',
        status: projeto.status || projeto.status_projeto_id || '',
        ativo: projeto.ativo,
        data_inicio: projeto.data_inicio_prevista || projeto.data_inicio || '',
        data_fim: projeto.data_fim_prevista || projeto.data_fim || ''
      });
    }
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
  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  // Função para lidar com a mudança de linhas por página
  const handleChangeRowsPerPage = (event) => {
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="apenas-ativos-label">Apenas Ativos?</InputLabel>
              <Select
                labelId="apenas-ativos-label"
                value={apenasAtivos}
                label="Apenas Ativos?"
                onChange={(e) => setApenasAtivos(e.target.value === 'true')}
              >
                <MenuItem value={false}>Todos</MenuItem>
                <MenuItem value={true}>Sim</MenuItem>
              </Select>
            </FormControl>
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
                    <TableCell>Nome</TableCell>
                    <TableCell>Código Empresa</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Status Projeto ID</TableCell>
                    <TableCell>Jira Project Key</TableCell>
                    <TableCell>Data Início Prevista</TableCell>
                    <TableCell>Data Fim Prevista</TableCell>
                    <TableCell>Ativo</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(projetos || []).map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell>{projeto.nome || '-'}</TableCell>
                      <TableCell>{projeto.codigo_empresa || '-'}</TableCell>
                      <TableCell>{projeto.descricao || '-'}</TableCell>
                      <TableCell>{projeto.status_projeto_id || '-'}</TableCell>
                      <TableCell>{projeto.jira_project_key || '-'}</TableCell>
                      <TableCell>{projeto.data_inicio_prevista ? projeto.data_inicio_prevista.split('T')[0] : '-'}</TableCell>
                      <TableCell>{projeto.data_fim_prevista ? projeto.data_fim_prevista.split('T')[0] : '-'}</TableCell>
                      <TableCell>
                        {projeto.ativo ? (
                          <Chip label="Ativo" color="success" size="small" />
                        ) : (
                          <Chip label="Inativo" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(projeto)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(projeto.id)} size="small" color="error">
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