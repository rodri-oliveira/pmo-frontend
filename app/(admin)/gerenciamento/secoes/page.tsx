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
import { 
  getSecoes, createSecao, updateSecao, deleteSecao,
  Secao, SecaoFormData, SecaoQueryParams 
} from '@/services/secoes';

export default function SecoesPage() {
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<SecaoFormData>({
    nome: '',
    descricao: ''
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

  // Função para buscar os dados das seções do backend
  const fetchSecoes = async () => {
    setLoading(true);
    try {
      const params: SecaoQueryParams = {
        skip: page * rowsPerPage,
        limit: rowsPerPage
      };
      
      if (searchTerm) {
        params.nome = searchTerm;
      }
      
      // Em ambiente de produção, descomente estas linhas
      /*
      const response = await getSecoes(params);
      setSecoes(response.items);
      setTotalItems(response.total);
      */
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        const mockSecoes: Secao[] = [
          {
            id: 1,
            nome: 'Desenvolvimento',
            descricao: 'Equipe de desenvolvimento de software',
            data_criacao: '2025-01-15T10:00:00',
            ativo: true
          },
          {
            id: 2,
            nome: 'Infraestrutura',
            descricao: 'Equipe de infraestrutura e DevOps',
            data_criacao: '2025-01-15T10:00:00',
            ativo: true
          },
          {
            id: 3,
            nome: 'Produto',
            descricao: 'Equipe de gestão de produtos',
            data_criacao: '2025-01-15T10:00:00',
            ativo: false
          }
        ].filter(secao => 
          !searchTerm || secao.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setSecoes(mockSecoes);
        setTotalItems(mockSecoes.length);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao buscar seções:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar seções. Tente novamente.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecoes();
  }, [page, rowsPerPage]);

  // Efeito para buscar quando o termo de pesquisa muda (com debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSecoes();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDialog = (secao?: Secao) => {
    if (secao) {
      setFormData({
        nome: secao.nome,
        descricao: secao.descricao,
        ativo: secao.ativo
      });
      setEditingId(secao.id);
    } else {
      setFormData({
        nome: '',
        descricao: ''
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

  const handleSubmit = async () => {
    try {
      if (editingId) {
        // Em produção, use a linha abaixo
        // await updateSecao(editingId, formData);
        
        // Simulação
        console.log('Atualizando seção:', editingId, formData);
        
        setSnackbar({
          open: true,
          message: 'Seção atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        // Em produção, use a linha abaixo
        // await createSecao(formData);
        
        // Simulação
        console.log('Criando seção:', formData);
        
        setSnackbar({
          open: true,
          message: 'Seção criada com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchSecoes();
    } catch (error) {
      console.error('Erro ao salvar seção:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar seção. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDeleteSecao = async (id: number) => {
    if (window.confirm('Tem certeza que deseja desativar esta seção?')) {
      try {
        // Em produção, use a linha abaixo
        // await deleteSecao(id);
        
        // Simulação
        console.log('Desativando seção:', id);
        
        setSnackbar({
          open: true,
          message: 'Seção desativada com sucesso!',
          severity: 'success'
        });
        fetchSecoes();
      } catch (error) {
        console.error('Erro ao desativar seção:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao desativar seção. Tente novamente.',
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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width={50}><strong>ID</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell width={120}><strong>Status</strong></TableCell>
              <TableCell width={120}><strong>Data Criação</strong></TableCell>
              <TableCell width={120} align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} sx={{ color: '#00579d' }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>Carregando seções...</Typography>
                </TableCell>
              </TableRow>
            ) : secoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Nenhuma seção encontrada</TableCell>
              </TableRow>
            ) : (
              secoes.map((secao) => (
                <TableRow key={secao.id} hover>
                  <TableCell>{secao.id}</TableCell>
                  <TableCell>{secao.nome}</TableCell>
                  <TableCell>{secao.descricao}</TableCell>
                  <TableCell>
                    <Chip 
                      label={secao.ativo ? "Ativo" : "Inativo"} 
                      color={secao.ativo ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(secao.data_criacao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleOpenDialog(secao)}
                      sx={{ color: '#00579d' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {secao.ativo && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteSecao(secao.id)}
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
      
      {/* Dialog para criar/editar seção */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Seção' : 'Nova Seção'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome da Seção"
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
          />
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
