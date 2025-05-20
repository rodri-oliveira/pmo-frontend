"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, TextField, IconButton, Grid,
  Snackbar, Alert, CircularProgress, FormControl, InputLabel, Select,
  MenuItem, SelectChangeEvent, InputAdornment, Switch, FormControlLabel, Tooltip, Chip
} from '@mui/material';
import {
  DataGrid, GridColDef, GridActionsCellItem, GridPaginationModel, GridRowParams, GridValueGetter
} from '@mui/x-data-grid';
import {
  getRecursos, createRecurso, updateRecurso, deleteRecurso, getEquipes,
  Recurso, RecursoFormData, Equipe, RecursoListResponse, EquipeListResponse
} from '../../../../services/recursos'; // Ajuste o caminho se necessário
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // Ícone para Recursos
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const initialFormData: RecursoFormData = {
  nome: '',
  email: '',
  equipe_id: 0,
  horas_diarias: 8,
  jira_account_id: '',
  ativo: true,
};

export default function RecursosPage() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<RecursoFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [equipeFilter, setEquipeFilter] = useState<number>(0); // 0 para 'Todas'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prevSnackbar => ({ ...prevSnackbar, open: false }));
  };

  const loadEquipes = useCallback(async () => {
    try {
      const response = await getEquipes();
      if (Array.isArray(response)) {
        setEquipes(response || []);
      } else {
        setEquipes((response as EquipeListResponse).items || []);
      }
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      setEquipes([]); // Fallback para array vazio
      setSnackbar({ open: true, message: 'Erro ao carregar equipes. Verifique a conexão ou tente mais tarde.', severity: 'error' });
    }
  }, []);

  const loadRecursos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        skip: paginationModel.page * paginationModel.pageSize,
        limit: paginationModel.pageSize,
        nome: debouncedSearchTerm || undefined,
        equipe_id: equipeFilter > 0 ? equipeFilter : undefined,
      };
      const data = await getRecursos(params);
      setRecursos(data.items || []);
      setRowCount(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      setRecursos([]); // Fallback para array vazio
      setRowCount(0);
      setSnackbar({ open: true, message: 'Erro ao carregar recursos. Verifique a conexão ou tente mais tarde.', severity: 'error' });
    }
    setLoading(false);
  }, [paginationModel, debouncedSearchTerm, equipeFilter]);

  useEffect(() => {
    loadEquipes();
  }, [loadEquipes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadRecursos();
  }, [loadRecursos]); // paginationModel, debouncedSearchTerm, equipeFilter são dependências de loadRecursos

  const handleOpenDialog = (id?: number) => {
    if (id) {
      const recurso = recursos.find(r => r.id === id);
      if (recurso) {
        setFormData({
          nome: recurso.nome,
          email: recurso.email,
          equipe_id: recurso.equipe_id,
          horas_diarias: recurso.horas_diarias,
          jira_account_id: recurso.jira_account_id || '',
          ativo: recurso.ativo,
        });
        setEditingId(id);
      }
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (isSubmitting) return; // Impede fechar durante o submit
    setOpenDialog(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number | string>) => {
    const target = event.target;
    const name = (target as { name?: string }).name;
    const value = (target as { value?: unknown }).value;

    if (!name) {
      return; // Segurança: nome deve estar presente
    }

    if (target instanceof HTMLInputElement) {
      if (target.type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: target.checked }));
      } else if (name === 'horas_diarias') { // Campo de horas pode ser input number
        setFormData(prev => ({ ...prev, [name]: Number(target.value) }));
      } else {
        setFormData(prev => ({ ...prev, [name]: target.value }));
      }
    } else if (target instanceof HTMLTextAreaElement) {
      setFormData(prev => ({ ...prev, [name]: target.value }));
    } else {
      // Assume SelectChangeEvent para os demais casos na união de tipos
      // O target de SelectChangeEvent é { name: string, value: unknown }
      // O tipo de `value` aqui é `number | string` (do SelectChangeEvent<number | string>)
      if (name === 'equipe_id') { // equipe_id é um Select
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value as string | number }));
      }
    }
  };

  const isFormValid = () => {
    return formData.nome.trim() !== '' && formData.email.trim() !== '' && formData.equipe_id > 0 && formData.horas_diarias > 0;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setSnackbar({ open: true, message: 'Preencha todos os campos obrigatórios (Nome, Email, Equipe, Horas Diárias).', severity: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateRecurso(editingId, formData);
        setSnackbar({ open: true, message: 'Recurso atualizado com sucesso!', severity: 'success' });
      } else {
        await createRecurso(formData);
        setSnackbar({ open: true, message: 'Recurso criado com sucesso!', severity: 'success' });
      }
      handleCloseDialog();
      loadRecursos(); // Recarrega para refletir mudanças e nova paginação/ordenação do backend
    } catch (error: any) {
      console.error('Erro ao salvar recurso:', error);
      const errorMessage = error.response?.data?.detail || 'Erro ao salvar recurso!';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este recurso?')) {
      setIsSubmitting(true);
      try {
        await deleteRecurso(id);
        setSnackbar({ open: true, message: 'Recurso excluído com sucesso!', severity: 'success' });
        // Ajustar rowCount e recarregar. Se a última linha da página for excluída, pode ser preciso voltar uma página.
        const newRowCount = rowCount - 1;
        if (recursos.length === 1 && paginationModel.page > 0 && newRowCount > 0) {
            setPaginationModel(prev => ({ ...prev, page: prev.page -1}));
        } else {
            loadRecursos(); 
        }
        setRowCount(newRowCount); // Otimisticamente atualiza o rowCount
      } catch (error: any) {
        console.error('Erro ao excluir recurso:', error);
        const errorMessage = error.response?.data?.detail || 'Erro ao excluir recurso!';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
      setIsSubmitting(false);
    }
  };

  const columns = useMemo<GridColDef<Recurso>[]>(() => [
    { 
      field: 'nome', 
      headerName: 'Nome do Recurso', 
      flex: 1.5, 
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleAltIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{params.value}</Typography>
        </Box>
      )
    },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    {
      field: 'equipe_id',
      headerName: 'Equipe',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row?.equipe_id,
      renderCell: (params) => {
        const equipe = equipes.find(e => e.id === params.value);
        return equipe ? equipe.nome : 'N/A';
      }
    },
    { field: 'horas_diarias', headerName: 'Horas/Dia', type: 'number', width: 120, align: 'center', headerAlign: 'center' },
    {
      field: 'ativo',
      headerName: 'Ativo',
      type: 'boolean',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip 
            label={params.value ? 'Sim' : 'Não'} 
            size="small" 
            color={params.value ? 'success' : 'error'} 
            variant='outlined'
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      getActions: (params: GridRowParams<Recurso>) => [
        <GridActionsCellItem
          icon={<Tooltip title="Editar"><EditIcon /></Tooltip>}
          label="Editar"
          onClick={() => handleOpenDialog(params.row.id)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Excluir"><DeleteIcon sx={{ color: 'error.main' }} /></Tooltip>}
          label="Excluir"
          onClick={() => handleDelete(params.row.id)}
          showInMenu={false}
        />,
      ],
    },
  ], [equipes, handleOpenDialog, handleDelete]); // Adicionado handleOpenDialog e handleDelete como dependências

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        Gerenciamento de Recursos
      </Typography>

      <Paper sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Buscar Recurso por Nome"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Equipe</InputLabel>
              <Select
                name="equipeFilter"
                value={equipeFilter}
                onChange={(e) => setEquipeFilter(e.target.value as number)}
                label="Equipe"
              >
                <MenuItem value={0}><em>Todas</em></MenuItem>
                {(equipes || []).map((eq) => (
                  <MenuItem key={eq.id} value={eq.id}>{eq.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, mt: { xs: 1, md: 0 } }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearchTerm('');
                setEquipeFilter(0);
                setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); // Mantém pageSize
                // loadRecursos(); // Será chamado pelo useEffect devido à mudança de estado
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
              Novo Recurso
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 600, width: '100%', borderRadius: 2, boxShadow: 3 }}>
        <DataGrid
          rows={recursos || []} // Garantindo que seja sempre um array
          columns={columns}
          pagination
          paginationMode="server"
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'primary.main',
              color: 'common.white',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
             '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #e0e0e0',
            }
          }}
          localeText={{
            noRowsLabel: 'Nenhum recurso encontrado.',
            footerRowSelected: (count) => count !== 1 ? `${count} linhas selecionadas` : `${count} linha selecionada`,
            // Traduções para paginação
            footerPaginationRowsPerPage: 'Itens por página:',
            footerPaginationFrom: 'de',
            footerPaginationTo: 'até',
            footerPaginationTotal: 'total',
            footerPaginationOf: 'de',
            // Adicione outras traduções de localeText aqui se necessário, por exemplo:
            // filterOperatorContains: 'Contém',
            // filterOperatorEquals: 'Igual a',
            // filterOperatorStartsWith: 'Começa com',
            // filterOperatorEndsWith: 'Termina com',
            // filterOperatorIsEmpty: 'Está vazio',
            // filterOperatorIsNotEmpty: 'Não está vazio',
            // filterOperatorIsAnyOf: 'É qualquer um de',
            // columnMenuLabel: 'Menu',
            // columnMenuShowColumns: 'Mostrar colunas',
            // columnMenuFilter: 'Filtrar',
            // columnMenuHideColumn: 'Ocultar',
            // columnMenuUnsort: 'Não classificar',
            // columnMenuSortAsc: 'Classificar crescente',
            // columnMenuSortDesc: 'Classificar decrescente',
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableEscapeKeyDown={isSubmitting}>
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'common.white' }}>
          {editingId ? 'Editar Recurso' : 'Novo Recurso'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                name="nome"
                label="Nome do Recurso"
                fullWidth
                variant="outlined"
                value={formData.nome}
                onChange={handleChange}
                required
                error={!formData.nome.trim()}
                helperText={!formData.nome.trim() ? "Nome é obrigatório" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                required
                error={!formData.email.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(formData.email)}
                helperText={!formData.email.trim() ? "Email é obrigatório" : (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(formData.email) ? "Email inválido" : "")}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth variant="outlined" required error={formData.equipe_id === 0}>
                <InputLabel>Equipe</InputLabel>
                <Select
                  name="equipe_id"
                  value={formData.equipe_id || ''}
                  onChange={handleChange}
                  label="Equipe"
                >
                  <MenuItem value={0}><em>Nenhuma / Todas</em></MenuItem>
                  {(equipes || []).map((equipe) => (
                    <MenuItem key={equipe.id} value={equipe.id}>
                      {equipe.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="horas_diarias"
                label="Horas/Dia"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.horas_diarias}
                onChange={handleChange}
                required
                InputProps={{
                  inputProps: { min: 0.5, step: 0.5 }
                }}
                error={formData.horas_diarias <= 0}
                helperText={formData.horas_diarias <= 0 ? "Horas devem ser > 0" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                name="jira_account_id"
                label="Jira Account ID (Opcional)"
                fullWidth
                variant="outlined"
                value={formData.jira_account_id}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.ativo} onChange={(e) => setFormData({...formData, ativo: e.target.checked})} name="ativo" />}
                label={formData.ativo ? "Recurso Ativo" : "Recurso Inativo"}
              />
            </Grid>
          </Grid>
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