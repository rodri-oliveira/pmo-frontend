"use client";

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, TextField, MenuItem, Snackbar, Alert } from '@mui/material';
import { createApontamento, getRecursos, getProjetos } from '@/services/apontamentos.jsx';

const ApontamentosPage = () => {
  const [formData, setFormData] = useState({
    recurso_id: '',
    projeto_id: '',
    data_apontamento: '',
    horas_apontadas: ''
  });
  const [recursos, setRecursos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    getRecursos().then(data => setRecursos(data.items || []));
    getProjetos().then(data => setProjetos(data.items || []));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.recurso_id || !formData.projeto_id || !formData.data_apontamento || !formData.horas_apontadas) {
      setSnackbar({ open: true, message: 'Preencha todos os campos obrigatórios.', severity: 'warning' });
      setLoading(false);
      return;
    }
    try {
      await createApontamento({
        recurso_id: Number(formData.recurso_id),
        projeto_id: Number(formData.projeto_id),
        data_apontamento: formData.data_apontamento,
        horas_apontadas: Number(formData.horas_apontadas)
      });
      setSnackbar({ open: true, message: 'Apontamento criado com sucesso!', severity: 'success' });
      setFormData({ recurso_id: '', projeto_id: '', data_apontamento: '', horas_apontadas: '' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao criar apontamento.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Criar Apontamento Manual</Typography>
      <Paper sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Recurso"
                name="recurso_id"
                value={formData.recurso_id}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="">Selecione</MenuItem>
                {(recursos || []).map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.nome || `Recurso #${r.id}`}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Projeto"
                name="projeto_id"
                value={formData.projeto_id}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="">Selecione</MenuItem>
                {(projetos || []).map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.nome || `Projeto #${p.id}`}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data do Apontamento"
                name="data_apontamento"
                type="date"
                value={formData.data_apontamento}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Horas Apontadas"
                name="horas_apontadas"
                type="number"
                value={formData.horas_apontadas}
                onChange={handleChange}
                inputProps={{ min: 0.01, max: 24, step: 0.01 }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApontamentosPage;
