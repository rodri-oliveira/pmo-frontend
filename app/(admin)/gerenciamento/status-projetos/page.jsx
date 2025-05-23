"use client";

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  Snackbar, Alert, TablePagination, Chip, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FlagIcon from '@mui/icons-material/Flag';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { getStatusProjetos, createStatusProjeto, updateStatusProjeto, deleteStatusProjeto } from '../../../../services/statusProjetos.jsx';

export default function StatusProjetosPage() {
  const [statusProjetos, setStatusProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    is_final: false,
    ordem_exibicao: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Buscar status de projetos da API
  // Buscar status de projetos da API
  const fetchStatusProjetos = async () => {
    setLoading(true);
    try {
      const params = { skip: page * rowsPerPage, limit: rowsPerPage };
      const data = await getStatusProjetos(params);
      // API retorna array direto
      const filtered = (data || []).filter(status => {
        if (searchTerm) {
          return status.nome && status.nome.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
      });
      setStatusProjetos(filtered || []);
      setTotalItems(filtered.length);
    } catch (error) {
      setStatusProjetos([]);
      setTotalItems(0);
      setSnackbar({ open: true, message: 'Erro ao carregar status de projeto.', severity: 'error' });
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchStatusProjetos();
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStatusProjetos();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [searchTerm]);

  // Ao abrir o diálogo para editar, buscar o dado mais recente do backend
  const handleOpenDialog = async (status) => {
    if (status) {
      try {
        const fresh = await getStatusProjeto(status.id);
        setFormData({
          nome: fresh.nome || '',
          descricao: fresh.descricao || '',
          is_final: !!fresh.is_final,
          ordem_exibicao: fresh.ordem_exibicao || 0
        });
        setEditingId(fresh.id);
      } catch (error) {
        setSnackbar({ open: true, message: 'Erro ao buscar status para edição', severity: 'error' });
        return;
      }
    } else {
      const maxOrdem = (statusProjetos || []).reduce((max, s) => s.ordem_exibicao > max ? s.ordem_exibicao : max, 0);
      setFormData({ nome: '', descricao: '', is_final: false, ordem_exibicao: maxOrdem + 1 });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (e) => {
    setFormData({ ...formData, is_final: e.target.checked });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        // Sempre envie todos os campos necessários, preenchendo valores padrão se vierem null
        await updateStatusProjeto(editingId, {
          nome: formData.nome || '',
          descricao: formData.descricao || '',
          is_final: !!formData.is_final,
          ordem_exibicao: formData.ordem_exibicao || 0
        });
        setSnackbar({ open: true, message: 'Status atualizado com sucesso!', severity: 'success' });
      } else {
        await createStatusProjeto({
          nome: formData.nome || '',
          descricao: formData.descricao || '',
          is_final: !!formData.is_final,
          ordem_exibicao: formData.ordem_exibicao || 0
        });
        setSnackbar({ open: true, message: 'Status criado com sucesso!', severity: 'success' });
      }
      setOpenDialog(false);
      fetchStatusProjetos();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar status.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este status?')) {
      try {
        await deleteStatusProjeto(id);
        setSnackbar({ open: true, message: 'Status excluído com sucesso!', severity: 'success' });
        fetchStatusProjetos();
      } catch (error) {
        setSnackbar({ open: true, message: 'Erro ao excluir status.', severity: 'error' });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Gerenciamento de Status de Projetos
      </Typography>

      <Paper sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Buscar Status"
              variant="outlined"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon />
                )
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, mt: { xs: 1, md: 0 } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearchTerm('');
                setPage(0);
              }}
              sx={{ height: '40px' }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ height: '40px' }}
            >
              Novo Status
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ordem</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Final?</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(statusProjetos || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((status) => (
                <TableRow key={status.id}>
                  <TableCell>{status.ordem_exibicao}</TableCell>
                  <TableCell>{status.nome}</TableCell>
                  <TableCell>{status.descricao}</TableCell>
                  <TableCell>
                    <Chip label={status.is_final ? 'Sim' : 'Não'} color={status.is_final ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenDialog(status)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(status.id)}><DeleteIcon color="error" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && statusProjetos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum status encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'common.white' }}>
          {editingId ? 'Editar Status' : 'Novo Status'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                name="nome"
                label="Nome do Status"
                fullWidth
                variant="outlined"
                value={formData.nome}
                onChange={handleInputChange}
                required
                error={!formData.nome.trim()}
                helperText={!formData.nome.trim() ? "Nome é obrigatório" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="descricao"
                label="Descrição"
                fullWidth
                variant="outlined"
                value={formData.descricao}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch checked={formData.is_final} onChange={handleSwitchChange} name="is_final" />}
                label={formData.is_final ? "Finalizador" : "Não final"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="ordem_exibicao"
                label="Ordem de Exibição"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.ordem_exibicao}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.nome.trim()}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
