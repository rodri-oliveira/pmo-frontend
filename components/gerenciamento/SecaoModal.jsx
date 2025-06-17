"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box
} from '@mui/material';

const wegBlue = '#00579d';

export default function SecaoModal({ open, onClose, onSave, secao }) {
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    if (secao) {
      setFormData({ nome: secao.nome || '', descricao: secao.descricao || '' });
    } else {
      setFormData({ nome: '', descricao: '' });
    }
  }, [secao, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Adicionar validação aqui se necessário
    onSave(formData);
  };

  const isEditing = secao !== null && secao !== undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: wegBlue, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Seção' : 'Nova Seção'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome da Seção"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.nome}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="descricao"
            label="Descrição"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.descricao}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancelar</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{ backgroundColor: wegBlue, '&:hover': { backgroundColor: '#004a8c' } }}
        >
          {isEditing ? 'Salvar Alterações' : 'Criar Seção'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
