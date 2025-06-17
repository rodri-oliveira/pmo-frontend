"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSecoes, createSecao, updateSecao, deleteSecao } from '@/lib/api';

const wegBlue = '#00579d';

// Modal Component
function SecaoModal({ open, onClose, onSave, secao }) {
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    setFormData({ nome: secao?.nome || '', descricao: secao?.descricao || '' });
  }, [secao, open]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSave = () => onSave(formData);
  const isEditing = !!secao;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: wegBlue, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Seção' : 'Nova Seção'}
      </DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" name="nome" label="Nome da Seção" type="text" fullWidth variant="outlined" value={formData.nome} onChange={handleChange} required sx={{ mt: 1 }}/>
        <TextField margin="dense" name="descricao" label="Descrição" type="text" fullWidth multiline rows={4} variant="outlined" value={formData.descricao} onChange={handleChange} />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: wegBlue }}>{isEditing ? 'Salvar' : 'Criar'}</Button>
      </DialogActions>
    </Dialog>
  );
}

const managementTypes = [
  { value: 'secoes', label: 'Seções' },
  { value: 'equipes', label: 'Equipes', disabled: true },
  { value: 'recursos', label: 'Recursos', disabled: true },
];

export default function GerenciamentoCascade() {
  const [tipoGerenciamento, setTipoGerenciamento] = useState('secoes');
  const [secoes, setSecoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const fetchSecoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Buscando seções...');
    try {
      const data = await getSecoes();
      console.log('Dados recebidos da API:', data);
      setSecoes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar seções:', err);
      setError(err.message);
      setSecoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tipoGerenciamento === 'secoes') {
      fetchSecoes();
    }
  }, [tipoGerenciamento, fetchSecoes]);

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setModalOpen(false);
  };

  const handleSave = async (data) => {
    try {
      let message = '';
      if (currentItem) {
        await updateSecao(currentItem.id, data);
        message = 'Seção atualizada com sucesso!';
      } else {
        await createSecao(data);
        message = 'Seção criada com sucesso!';
      }
      setNotification({ open: true, message, severity: 'success' });
      fetchSecoes();
    } catch (err) {
      setNotification({ open: true, message: err.message, severity: 'error' });
    } finally {
      handleCloseModal();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta seção?')) {
      try {
        await deleteSecao(id);
        setNotification({ open: true, message: 'Seção excluída com sucesso!', severity: 'success' });
        fetchSecoes();
      } catch (err) {
        setNotification({ open: true, message: err.message, severity: 'error' });
      }
    }
  };

  const renderSecoes = () => (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Gerenciar Seções</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ backgroundColor: wegBlue }}>Nova Seção</Button>
      </Box>
      {loading && <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {!loading && !error && (
        secoes.length === 0 ? (
          <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            Nenhuma seção encontrada. Clique em &quot;Nova Seção&quot; para adicionar a primeira.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {secoes.map((secao) => (
                  <TableRow key={secao.id}>
                    <TableCell>{secao.id}</TableCell>
                    <TableCell>{secao.nome}</TableCell>
                    <TableCell>{secao.descricao}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(secao)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(secao.id)}><DeleteIcon color="error"/></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
      <SecaoModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} secao={currentItem} />
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 4, background: 'white', borderRadius: '8px' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, color: wegBlue, fontWeight: 'bold' }}>
        Gerenciamento
      </Typography>
      <FormControl sx={{ mt: 2, minWidth: 250 }} size="small">
        <InputLabel>Tipo de Gerenciamento</InputLabel>
        <Select value={tipoGerenciamento} label="Tipo de Gerenciamento" onChange={(e) => setTipoGerenciamento(e.target.value)}>
          {managementTypes.map(type => (
            <MenuItem key={type.value} value={type.value} disabled={type.disabled}>{type.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {tipoGerenciamento === 'secoes' && renderSecoes()}

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
