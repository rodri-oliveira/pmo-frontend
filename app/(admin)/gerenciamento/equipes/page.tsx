"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, Grid,
  Snackbar, Alert, TablePagination, Chip, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

interface Secao {
  id: number;
  nome: string;
}

interface Equipe {
  id: number;
  nome: string;
  descricao: string;
  secao_id: number;
  secao?: Secao;
  data_criacao?: string;
  ativo: boolean;
}

interface EquipeFormData {
  nome: string;
  descricao: string;
  secao_id: number;
  ativo?: boolean;
}

export default function EquipesPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<EquipeFormData>({
    nome: '',
    descricao: '',
    secao_id: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [secaoFilter, setSecaoFilter] = useState<number>(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Dados mockados para desenvolvimento (quando a API não estiver disponível)
  const dadosMockSecoes: Secao[] = [
    { id: 1, nome: 'Desenvolvimento' },
    { id: 2, nome: 'Infraestrutura' },
    { id: 3, nome: 'Produto' }
  ];

  const dadosMockEquipes: Equipe[] = [
    {
      id: 1,
      nome: 'Equipe Frontend',
      descricao: 'Equipe responsável pelo frontend',
      secao_id: 1,
      secao: { id: 1, nome: 'Desenvolvimento' },
      data_criacao: '2025-01-15T10:00:00',
      ativo: true
    },
    {
      id: 2,
      nome: 'Equipe Backend',
      descricao: 'Equipe responsável pelo backend',
      secao_id: 1,
      secao: { id: 1, nome: 'Desenvolvimento' },
      data_criacao: '2025-01-15T10:00:00',
      ativo: true
    },
    {
      id: 3,
      nome: 'DevOps',
      descricao: 'Equipe responsável pela infraestrutura e CI/CD',
      secao_id: 2,
      secao: { id: 2, nome: 'Infraestrutura' },
      data_criacao: '2025-01-15T10:00:00',
      ativo: true
    },
    {
      id: 4,
      nome: 'Produto Digital',
      descricao: 'Equipe de gestão de produto',
      secao_id: 3,
      secao: { id: 3, nome: 'Produto' },
      data_criacao: '2025-01-15T10:00:00',
      ativo: false
    }
  ];

  // Função para buscar os dados de seções
  const fetchSecoes = async () => {
    try {
      // Em ambiente de produção, descomente:
      // const response = await fetch('http://localhost:8000/backend/v1/secoes?ativo=true');
      // const data = await response.json();
      // setSecoes(data.items || []);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        setSecoes(dadosMockSecoes);
      }, 300);
    } catch (error) {
      console.error('Erro ao buscar seções:', error);
      // Garantir que secoes seja um array vazio em caso de erro
      setSecoes([]);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar seções. Usando dados de exemplo.',
        severity: 'error'
      });
    }
  };

  // Função para buscar os dados das equipes
  const fetchEquipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('skip', String(page * rowsPerPage));
      params.append('limit', String(rowsPerPage));
      
      if (searchTerm) {
        params.append('nome', searchTerm);
      }
      
      if (secaoFilter > 0) {
        params.append('secao_id', String(secaoFilter));
      }
      
      // Em ambiente de produção, descomente:
      // const response = await fetch(`http://localhost:8000/backend/v1/equipes?${params}`);
      // const data = await response.json();
      // setEquipes(data.items || []);
      // setTotalItems(data.total || 0);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        const filteredEquipes = dadosMockEquipes.filter(equipe => {
          let match = true;
          if (searchTerm) {
            match = match && equipe.nome.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (secaoFilter > 0) {
            match = match && equipe.secao_id === secaoFilter;
          }
          return match;
        });
        
        setEquipes(filteredEquipes);
        setTotalItems(filteredEquipes.length);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      // Garantir que equipes seja um array vazio em caso de erro
      const filteredEquipes = dadosMockEquipes.filter(equipe => {
        let match = true;
        if (searchTerm) {
          match = match && equipe.nome.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (secaoFilter > 0) {
          match = match && equipe.secao_id === secaoFilter;
        }
        return match;
      });
      
      setEquipes(filteredEquipes);
      setTotalItems(filteredEquipes.length);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar equipes. Usando dados de exemplo.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecoes();
  }, []);

  useEffect(() => {
    fetchEquipes();
  }, [page, rowsPerPage, secaoFilter]);

  // Efeito para buscar quando o termo de pesquisa muda (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipes();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (equipe?: Equipe) => {
    if (equipe) {
      setFormData({
        nome: equipe.nome,
        descricao: equipe.descricao,
        secao_id: equipe.secao_id,
        ativo: equipe.ativo
      });
      setEditingId(equipe.id);
    } else {
      setFormData({
        nome: '',
        descricao: '',
        secao_id: 0
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
      secao_id: e.target.value as number
    });
  };

  const handleFilterChange = (e: SelectChangeEvent<number>) => {
    setSecaoFilter(e.target.value as number);
    setPage(0);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        // Editar equipe existente
        // await fetch(`http://localhost:8000/backend/v1/equipes/${editingId}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Equipe atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar nova equipe
        // await fetch('http://localhost:8000/backend/v1/equipes', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Equipe criada com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchEquipes();
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar equipe. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteEquipe = async (id: number) => {
    if (window.confirm('Tem certeza que deseja desativar esta equipe?')) {
      try {
        // await fetch(`http://localhost:8000/backend/v1/equipes/${id}`, {
        //   method: 'DELETE'
        // });
        
        // Simulação de sucesso
        setSnackbar({
          open: true,
          message: 'Equipe desativada com sucesso!',
          severity: 'success'
        });
        fetchEquipes();
      } catch (error) {
        console.error('Erro ao desativar equipe:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao desativar equipe. Tente novamente.',
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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width={50}><strong>ID</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell><strong>Seção</strong></TableCell>
              <TableCell width={120}><strong>Status</strong></TableCell>
              <TableCell width={120} align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} sx={{ color: '#00579d' }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>Carregando equipes...</Typography>
                </TableCell>
              </TableRow>
            ) : (equipes || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Nenhuma equipe encontrada</TableCell>
              </TableRow>
            ) : (
              (equipes || []).map((equipe) => (
                <TableRow key={equipe.id} hover>
                  <TableCell>{equipe.id}</TableCell>
                  <TableCell>{equipe.nome}</TableCell>
                  <TableCell>{equipe.descricao}</TableCell>
                  <TableCell>{equipe.secao?.nome || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={equipe.ativo ? "Ativo" : "Inativo"} 
                      color={equipe.ativo ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleOpenDialog(equipe)}
                      sx={{ color: '#00579d' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {equipe.ativo && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteEquipe(equipe.id)}
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
      
      {/* Dialog para criar/editar equipe */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Equipe' : 'Nova Equipe'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome da Equipe"
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
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="secao-select-label">Seção</InputLabel>
            <Select
              labelId="secao-select-label"
              name="secao_id"
              value={formData.secao_id}
              label="Seção"
              onChange={handleSelectChange}
              required
            >
              <MenuItem value={0} disabled>Selecione uma seção</MenuItem>
              {(secoes || []).map((secao) => (
                <MenuItem key={secao.id} value={secao.id}>{secao.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
