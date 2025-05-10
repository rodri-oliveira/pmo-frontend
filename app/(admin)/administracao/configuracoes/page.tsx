"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, CircularProgress,
  Grid, Snackbar, Alert, Dialog, DialogActions,
  DialogContent, DialogTitle, Switch, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import { apiGet, apiPut } from '@/services/api';

interface Configuracao {
  chave: string;
  valor: string;
  descricao: string;
  data_atualizacao?: string;
}

export default function ConfiguracoesPage() {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [configuracaoAtual, setConfiguracaoAtual] = useState<Configuracao | null>(null);
  const [formData, setFormData] = useState({ valor: '', descricao: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  const fetchConfiguracoes = async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ items: Configuracao[] }>('/configuracoes');
      setConfiguracoes(data.items);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar configurações. Tente novamente.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const handleOpenDialog = (configuracao: Configuracao) => {
    setConfiguracaoAtual(configuracao);
    setFormData({
      valor: configuracao.valor,
      descricao: configuracao.descricao
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setConfiguracaoAtual(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    });
  };

  const handleSubmit = async () => {
    if (!configuracaoAtual) return;
    
    setLoading(true);
    try {
      await apiPut<Configuracao>(`/configuracoes/${configuracaoAtual.chave}`, {
        valor: formData.valor,
        descricao: formData.descricao
      });
      
      setSnackbar({
        open: true,
        message: 'Configuração atualizada com sucesso!',
        severity: 'success'
      });
      
      handleCloseDialog();
      fetchConfiguracoes();
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar configuração. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isBoolean = (valor: string) => {
    return valor === 'true' || valor === 'false';
  };

  const isNumeric = (valor: string) => {
    return !isNaN(Number(valor));
  };

  const formatValue = (configuracao: Configuracao) => {
    if (isBoolean(configuracao.valor)) {
      return configuracao.valor === 'true' ? 'Sim' : 'Não';
    }
    return configuracao.valor;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Configurações do Sistema
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Aqui você pode configurar os parâmetros do sistema. Modifique as configurações com cuidado, pois elas afetam o funcionamento global da aplicação.
        </Typography>
      </Paper>
      
      {loading && configuracoes.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Chave</strong></TableCell>
                <TableCell><strong>Valor</strong></TableCell>
                <TableCell><strong>Descrição</strong></TableCell>
                <TableCell width={100}><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configuracoes.map((configuracao) => (
                <TableRow key={configuracao.chave} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {configuracao.chave}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {isBoolean(configuracao.valor) ? (
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: configuracao.valor === 'true' ? 'success.main' : 'text.secondary'
                        }}
                      >
                        {formatValue(configuracao)}
                      </Typography>
                    ) : (
                      <Typography variant="body2">{configuracao.valor}</Typography>
                    )}
                  </TableCell>
                  <TableCell>{configuracao.descricao}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(configuracao)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Dialog para editar configuração */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Configuração</DialogTitle>
        <DialogContent>
          {configuracaoAtual && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {configuracaoAtual.chave}
              </Typography>
              
              {isBoolean(configuracaoAtual.valor) ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.valor === 'true'}
                      onChange={handleInputChange}
                      name="valor"
                      color="primary"
                    />
                  }
                  label={formData.valor === 'true' ? 'Habilitado' : 'Desabilitado'}
                  sx={{ my: 2 }}
                />
              ) : (
                <TextField
                  fullWidth
                  margin="normal"
                  name="valor"
                  label="Valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  variant="outlined"
                  type={isNumeric(configuracaoAtual.valor) ? 'number' : 'text'}
                />
              )}
              
              <TextField
                fullWidth
                margin="normal"
                name="descricao"
                label="Descrição"
                value={formData.descricao}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={2}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
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