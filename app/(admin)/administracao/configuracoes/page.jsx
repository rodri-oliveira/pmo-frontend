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

// Dados mockados para usar em caso de erro na API
const configuracoesMock = [
  {
    chave: 'app.nome',
    valor: 'Automação PMO',
    descricao: 'Nome da aplicação'
  },
  {
    chave: 'notificacoes.ativas',
    valor: 'true',
    descricao: 'Define se as notificações estão ativas'
  },
  {
    chave: 'sistema.versao',
    valor: '1.0.0',
    descricao: 'Versão atual do sistema'
  }
];

export default function ConfiguracoesPage() {
    const [configuracoes, setConfiguracoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
    const [configuracaoAtual, setConfiguracaoAtual] = useState(null);
  const [formData, setFormData] = useState({ valor: '', descricao: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
        severity: 'success'
  });

  const fetchConfiguracoes = async () => {
    setLoading(true);
    try {
            const data = await apiGet('/configuracoes');
      setConfiguracoes(data.items || []); // Aplicando operador || [] para garantir que sempre seja um array
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      // Usando dados mockados em caso de erro
      setConfiguracoes(configuracoesMock);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar configurações. Usando dados de exemplo.',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

    const handleOpenDialog = (configuracao) => {
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

    const handleInputChange = (e) => {
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
            await apiPut(`/configuracoes/${configuracaoAtual.chave}`, {
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

    const isBoolean = (valor) => {
    return valor === 'true' || valor === 'false';
  };

    const isNumeric = (valor) => {
    return !isNaN(Number(valor));
  };

    const formatValue = (configuracao) => {
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
          Gerencie as configurações do sistema. Estas configurações afetam o comportamento global da aplicação.
        </Typography>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Chave</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(configuracoes || []).map((configuracao) => (
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