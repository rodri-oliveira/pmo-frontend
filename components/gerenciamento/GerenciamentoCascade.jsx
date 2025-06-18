"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Snackbar,
  Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { 
  getSecoes, createSecao, updateSecao, deleteSecao, 
  getEquipes, createEquipe, updateEquipe, deleteEquipe
} from '@/lib/api';
import EquipeModal from './EquipeModal';

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
  { value: 'equipes', label: 'Equipes' },
  { value: 'recursos', label: 'Recursos', disabled: true },
];

export default function GerenciamentoCascade() {
  const [tipoGerenciamento, setTipoGerenciamento] = useState('secoes');
  const [secoes, setSecoes] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const fetchSecoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Buscando seções...');
    try {
      const data = await getSecoes(false);
      console.log('Dados recebidos da API:', data);

      let items = [];
      if (Array.isArray(data?.items)) {
        items = data.items;
      } else if (Array.isArray(data)) {
        items = data;
      }

      setSecoes(items);
    } catch (err) {
      console.error('Erro ao buscar seções:', err);
      setError(err.message);
      setSecoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

    const fetchEquipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEquipes();
      setEquipes(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setEquipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Seções são sempre necessárias para o modal de equipes
    fetchSecoes(); 
    if (tipoGerenciamento === 'equipes') {
      fetchEquipes();
    }
  }, [tipoGerenciamento, fetchSecoes, fetchEquipes]);

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setModalOpen(false);
  };

    const handleSave = async (data) => {
    setLoading(true);
    try {
      let message = '';
      if (tipoGerenciamento === 'secoes') {
        if (currentItem) {
          await updateSecao(currentItem.id, data);
          message = 'Seção atualizada com sucesso!';
        } else {
          await createSecao(data);
          message = 'Seção criada com sucesso!';
        }
        fetchSecoes();
      } else if (tipoGerenciamento === 'equipes') {
        if (currentItem) {
          await updateEquipe(currentItem.id, data);
          message = 'Equipe atualizada com sucesso!';
        } else {
          await createEquipe(data);
          message = 'Equipe criada com sucesso!';
        }
        fetchEquipes();
      }
      setNotification({ open: true, message, severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: `Erro: ${err.message}`, severity: 'error' });
    } finally {
      handleCloseModal();
      setLoading(false);
    }
  };

    const handleDelete = async (id) => {
    const typeName = tipoGerenciamento === 'secoes' ? 'seção' : 'equipe';
    if (window.confirm(`Tem certeza que deseja inativar est${typeName === 'seção' ? 'a' : 'e'} ${typeName}?`)) {
      try {
        if (tipoGerenciamento === 'secoes') {
          await deleteSecao(id);
          fetchSecoes();
        } else {
          await deleteEquipe(id);
          fetchEquipes();
        }
        setNotification({ open: true, message: `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} inativad${typeName === 'seção' ? 'a' : 'o'} com sucesso!`, severity: 'success' });
      } catch (err) {
        setNotification({ open: true, message: err.message, severity: 'error' });
      }
    }
  };

    const handleReactivate = async (id) => {
    const typeName = tipoGerenciamento === 'secoes' ? 'seção' : 'equipe';
    if (window.confirm(`Tem certeza que deseja reativar est${typeName === 'seção' ? 'a' : 'e'} ${typeName}?`)) {
      try {
        if (tipoGerenciamento === 'secoes') {
          await updateSecao(id, { ativo: true });
          fetchSecoes();
        } else {
          await updateEquipe(id, { ativo: true });
          fetchEquipes();
        }
        setNotification({ open: true, message: `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} reativad${typeName === 'seção' ? 'a' : 'o'} com sucesso!`, severity: 'success' });
      } catch (err) {
        setNotification({ open: true, message: err.message, severity: 'error' });
      }
    }
  };

  const renderSecoes = () => {
    const displayedSecoes = secoes.filter(s => showInactive || s.ativo === true);

    return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Gerenciar Seções</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
            label="Mostrar inativos"
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ backgroundColor: wegBlue }}>Nova Seção</Button>
        </Box>
      </Box>
      {loading && <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {!loading && !error && (
        displayedSecoes.length === 0 ? (
          <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            Nenhuma seção encontrada. Clique em &quot;Nova Seção&quot; para adicionar a primeira.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ backgroundColor: wegBlue }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedSecoes.map((secao) => (
                  <TableRow key={secao.id} sx={{ backgroundColor: !secao.ativo ? '#fafafa' : 'inherit' }}>
                    <TableCell>{secao.id}</TableCell>
                    <TableCell>{secao.nome}</TableCell>
                    <TableCell>{secao.descricao}</TableCell>
                    <TableCell>{secao.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(secao)}><EditIcon /></IconButton>
                      {secao.ativo ? (
                        <IconButton onClick={() => handleDelete(secao.id)}><DeleteIcon color="error"/></IconButton>
                      ) : (
                        <IconButton onClick={() => handleReactivate(secao.id)}><RestoreFromTrashIcon /></IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
      
    </Box>
  )};

  const renderEquipes = () => {
    const displayedEquipes = equipes.filter(e => showInactive || e.ativo === true);
    const secoesMap = secoes.reduce((acc, secao) => ({ ...acc, [secao.id]: secao.nome }), {});

    return (
      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Gerenciar Equipes</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
              label="Mostrar inativos"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ backgroundColor: wegBlue }}>Nova Equipe</Button>
          </Box>
        </Box>
        {loading && <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {!loading && !error && (
          displayedEquipes.length === 0 ? (
            <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
              Nenhuma equipe encontrada.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ backgroundColor: wegBlue }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Seção</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedEquipes.map((equipe) => (
                    <TableRow key={equipe.id} sx={{ backgroundColor: !equipe.ativo ? '#fafafa' : 'inherit' }}>
                      <TableCell>{equipe.nome}</TableCell>
                      <TableCell>{secoesMap[equipe.secao_id] || 'N/A'}</TableCell>
                      <TableCell>{equipe.descricao}</TableCell>
                      <TableCell>{equipe.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenModal(equipe)}><EditIcon /></IconButton>
                        {equipe.ativo ? (
                          <IconButton onClick={() => handleDelete(equipe.id)}><DeleteIcon color="error"/></IconButton>
                        ) : (
                          <IconButton onClick={() => handleReactivate(equipe.id)}><RestoreFromTrashIcon /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </Box>
    );
  };

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
            {tipoGerenciamento === 'equipes' && renderEquipes()}

      <SecaoModal open={modalOpen && tipoGerenciamento === 'secoes'} onClose={handleCloseModal} onSave={handleSave} secao={currentItem} />
      <EquipeModal open={modalOpen && tipoGerenciamento === 'equipes'} onClose={handleCloseModal} onSave={handleSave} equipe={currentItem} secoes={secoes.filter(s => s.ativo)} />


      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
