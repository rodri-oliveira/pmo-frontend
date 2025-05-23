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
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { getEquipes, createEquipe, updateEquipe, deleteEquipe } from '../../../../services/equipes';
import { getSecoes } from '../../../../services/secoes';

export default function EquipesPage() {
  const [equipes, setEquipes] = useState([]);
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    secao_id: 0,
    ativo: true
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [secaoFilter, setSecaoFilter] = useState(0);
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
    try {
      const data = await getSecoes({ apenas_ativos: true });
      setSecoes(data.items || data || []);
    } catch (error) {
      setSecoes([]);
      setSnackbar({ open: true, message: 'Erro ao carregar seções.', severity: 'error' });
    }
  };

  // Buscar equipes reais da API
  const fetchEquipes = async () => {
    setLoading(true);
    try {
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        nome: searchTerm || undefined,
        secao_id: secaoFilter > 0 ? secaoFilter : undefined
      };
      const data = await getEquipes(params);
      setEquipes(data.items || data || []);
      setTotalItems(data.total || (data.items ? data.items.length : 0));
    } catch (error) {
      setEquipes([]);
      setTotalItems(0);
      setSnackbar({ open: true, message: 'Erro ao carregar equipes.', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSecoes();
  }, []);

  useEffect(() => {
    fetchEquipes();
  }, [page, rowsPerPage, secaoFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipes();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (equipe) => {
    if (equipe) {
      setFormData({
        nome: equipe.nome,
        descricao: equipe.descricao,
        secao_id: equipe.secao_id,
        ativo: equipe.ativo
      });
      setEditingId(equipe.id);
    } else {
      setFormData({ nome: '', descricao: '', secao_id: 0, ativo: true });
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

  const handleSelectChange = (e) => {
    setFormData({ ...formData, secao_id: Number(e.target.value) });
  };

  const handleFilterChange = (e) => {
    setSecaoFilter(Number(e.target.value));
    setPage(0);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateEquipe(editingId, formData);
        setSnackbar({ open: true, message: 'Equipe atualizada com sucesso!', severity: 'success' });
      } else {
        await createEquipe(formData);
        setSnackbar({ open: true, message: 'Equipe criada com sucesso!', severity: 'success' });
      }
      handleCloseDialog();
      fetchEquipes();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar equipe. Tente novamente.', severity: 'error' });
    }
  };

  const handleDeleteEquipe = async (id) => {
    if (window.confirm('Tem certeza que deseja desativar esta equipe?')) {
      try {
        await deleteEquipe(id);
        setSnackbar({ open: true, message: 'Equipe desativada com sucesso!', severity: 'success' });
        fetchEquipes();
      } catch (error) {
        setSnackbar({ open: true, message: 'Erro ao desativar equipe. Tente novamente.', severity: 'error' });
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

  const isFormValid = () => {
    return formData.nome.trim() !== '' && formData.secao_id > 0;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <PeopleAltIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Gerenciamento de Equipes
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={5}>
            <TextField
              fullWidth
              label="Pesquisar equipes"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="secao-filter-label">Filtrar por Seção</InputLabel>
              <Select
                labelId="secao-filter-label"
                value={secaoFilter}
                label="Filtrar por Seção"
                onChange={handleFilterChange}
              >
                <MenuItem value={0}>Todas as Seções</MenuItem>
                {(secoes || []).map((secao) => (
                  <MenuItem key={secao.id} value={secao.id}>{secao.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchEquipes()}
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
              Nova Equipe
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* ...restante do componente, tabelas, dialogs etc... */}
    </Box>
  );
}
