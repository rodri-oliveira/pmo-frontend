"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, 
  Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch, Alert
} from '@mui/material';

const wegBlue = '#00579d';

export default function EquipeModal({ open, onClose, onSave, equipe, secoes = [], apiError }) {
  const [formData, setFormData] = useState({ nome: '', descricao: '', secao_id: '', ativo: true });

  useEffect(() => {
    if (equipe) {
      setFormData({ 
        nome: equipe.nome || '', 
        descricao: equipe.descricao || '', 
        secao_id: equipe.secao_id || '',
        ativo: equipe.ativo !== undefined ? equipe.ativo : true
      });
    } else {
      setFormData({ nome: '', descricao: '', secao_id: '', ativo: true });
    }
  }, [equipe, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Garante que secao_id seja um número
    onSave({ ...formData, secao_id: Number(formData.secao_id), ativo: formData.ativo });
  };

  const isEditing = !!equipe;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: wegBlue, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Equipe' : 'Nova Equipe'}
      </DialogTitle>
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
          onChange={handleChange} 
          required 
          sx={{ mt: 1 }}
        />
        <FormControl fullWidth margin="dense" required error={secoes.length === 0}>
          <InputLabel id="secao-select-label">Seção</InputLabel>
          <Select
            labelId="secao-select-label"
            name="secao_id"
            value={formData.secao_id}
            label="Seção"
            onChange={handleChange}
            disabled={secoes.length === 0}
          >
            {secoes.length === 0 ? (
              <MenuItem value="" disabled>
                Crie uma seção ativa primeiro
              </MenuItem>
            ) : (
              secoes.map((secao) => (
                <MenuItem key={secao.id} value={secao.id}>
                  {secao.nome}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={formData.ativo}
              onChange={(_, checked) => setFormData({ ...formData, ativo: checked })}
              color="primary"
            />
          }
          label={formData.ativo ? "Equipe Ativa" : "Equipe Inativa"}
          sx={{ mt: 1, mb: 1 }}
        />
        {apiError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {apiError}
          </Alert>
        )}
        <TextField 
          margin="dense" 
          name="descricao" 
          label="Descrição" 
          type="text" 
          fullWidth 
          multiline 
          rows={3} 
          variant="outlined" 
          value={formData.descricao} 
          onChange={handleChange} 
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: wegBlue }}>
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
