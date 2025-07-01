import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, FormControlLabel, Switch,
} from '@mui/material';

const wegBlue = '#00579d';

export default function StatusProjetoModal({ open, onClose, onSave, statusProjeto }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    is_final: false,
    ativo: true,
  });

  const isEditing = !!statusProjeto;

  useEffect(() => {
    if (open) {
      setFormData({
        nome: statusProjeto?.nome || '',
        descricao: statusProjeto?.descricao || '',
        is_final: statusProjeto?.is_final || false,
        ativo: statusProjeto?.ativo !== undefined ? statusProjeto.ativo : true,
      });
    }
  }, [statusProjeto, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: wegBlue, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Status de Projeto' : 'Novo Status de Projeto'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="nome"
          label="Nome do Status"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.nome}
          onChange={handleChange}
          required
          sx={{ mt: 1 }}
        />
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
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_final}
              onChange={handleChange}
              name="is_final"
              color="primary"
            />
          }
          label="É um status final? (Ex: Concluído, Cancelado)"
          sx={{ mt: 1, display: 'block' }}
        />
        {isEditing && (
          <FormControlLabel
            control={
              <Switch
                checked={formData.ativo}
                onChange={handleChange}
                name="ativo"
                color="primary"
              />
            }
            label="Ativo"
            sx={{ mt: 1, display: 'block' }}
          />
        )}
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
