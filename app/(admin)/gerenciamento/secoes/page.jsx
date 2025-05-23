"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  Snackbar, Alert, TablePagination, Chip, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getSecoes, createSecao, updateSecao, deleteSecao } from '@/services/secoes';

export default function SecoesPage() {
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ nome: '', descricao: '', ativo: true });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Buscar seções reais da API
  const fetchSecoes = async () => {
    setLoading(true);
    try {
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        nome: searchTerm || undefined
      };
      const response = await getSecoes(params);
      setSecoes(response.items || response || []);
      setTotalItems(response.total || (response.items ? response.items.length : 0));
    } catch (error) {
      setSecoes([]);
      setSnackbar({ open: true, message: 'Erro ao carregar seções.', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSecoes();
  }, [page, rowsPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSecoes();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (secao) => {
    if (secao) {
      setFormData({
        nome: secao.nome,
        descricao: secao.descricao,
        ativo: secao.ativo
      });
      setEditingId(secao.id);
    } else {
      setFormData({ nome: '', descricao: '', ativo: true });
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

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateSecao(editingId, formData);
        setSnackbar({ open: true, message: 'Seção atualizada com sucesso!', severity: 'success' });
      } else {
        await createSecao(formData);
        setSnackbar({ open: true, message: 'Seção criada com sucesso!', severity: 'success' });
      }
      handleCloseDialog();
      fetchSecoes();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar seção. Tente novamente.', severity: 'error' });
    }
  };

  const handleDeleteSecao = async (id) => {
    if (window.confirm('Tem certeza que deseja desativar esta seção?')) {
      try {
        await deleteSecao(id);
        setSnackbar({ open: true, message: 'Seção desativada com sucesso!', severity: 'success' });
        fetchSecoes();
      } catch (error) {
        setSnackbar({ open: true, message: 'Erro ao desativar seção. Tente novamente.', severity: 'error' });
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Seções
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              label="Pesquisar seções"
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
              onClick={() => fetchSecoes()}
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
              Nova Seção
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Aqui deve continuar o restante do componente: tabela, dialogs, paginação etc., ajustados para JS puro */}
    </Box>
  );
}
