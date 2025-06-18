import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';

const wegBlue = '#00579d';

export default function RecursoModal({ open, onClose, onSave, recurso, equipes }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
    cargo: '',
    jira_user_id: '',
    data_admissao: '',
    equipe_principal_id: '',
  });

  const isEditing = !!recurso;

  useEffect(() => {
    if (open) {
      setFormData({
        nome: recurso?.nome || '',
        email: recurso?.email || '',
        matricula: recurso?.matricula || '',
        cargo: recurso?.cargo || '',

        data_admissao: recurso?.data_admissao ? new Date(recurso.data_admissao).toISOString().split('T')[0] : '',
        equipe_principal_id: recurso?.equipe_principal_id || '',
      });
    }
  }, [recurso, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const dataToSave = { ...formData };

    if (!dataToSave.data_admissao) {
        delete dataToSave.data_admissao;
    }
    onSave(dataToSave);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: wegBlue, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Recurso' : 'Novo Recurso'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="nome"
          label="Nome do Recurso"
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
          name="email"
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <FormControl fullWidth margin="dense" required>
          <InputLabel>Equipe Principal</InputLabel>
          <Select
            name="equipe_principal_id"
            value={formData.equipe_principal_id}
            label="Equipe Principal"
            onChange={handleChange}
          >
            {equipes.map((equipe) => (
              <MenuItem key={equipe.id} value={equipe.id}>
                {equipe.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="matricula"
          label="Matrícula"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.matricula}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="cargo"
          label="Cargo"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.cargo}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="data_admissao"
          label="Data de Admissão"
          type="date"
          fullWidth
          variant="outlined"
          value={formData.data_admissao}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
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
