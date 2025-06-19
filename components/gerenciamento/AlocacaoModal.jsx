"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, Autocomplete
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const initialFormState = {
  recurso_id: null,
  projeto_id: null,
  data_inicio_alocacao: null,
  data_fim_alocacao: null,
  status_alocacao_id: null,
  observacao: '',
};

export default function AlocacaoModal({ open, onClose, onSave, item, projetos, recursos, statusOptions }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
        if (item) {
            setFormData({
                recurso_id: item.recurso_id || null,
                projeto_id: item.projeto_id || null,
                data_inicio_alocacao: item.data_inicio_alocacao ? new Date(item.data_inicio_alocacao + 'T00:00:00') : null,
                data_fim_alocacao: item.data_fim_alocacao ? new Date(item.data_fim_alocacao + 'T00:00:00') : null,
                status_alocacao_id: item.status_alocacao_id || null,
                observacao: item.observacao || '',
            });
        } else {
            setFormData(initialFormState);
        }
        setErrors({});
    }
  }, [item, open]);

  const validate = () => {
    const newErrors = {};
    if (!formData.recurso_id) newErrors.recurso_id = 'Recurso é obrigatório';
    if (!formData.projeto_id) newErrors.projeto_id = 'Projeto é obrigatório';
    if (!formData.data_inicio_alocacao) newErrors.data_inicio_alocacao = 'Data de início é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
        const dataToSave = {
            ...formData,
            data_inicio_alocacao: formData.data_inicio_alocacao?.toISOString().split('T')[0],
            data_fim_alocacao: formData.data_fim_alocacao?.toISOString().split('T')[0] || null,
        };
      onSave(dataToSave);
    }
  };

  const handleAutocompleteChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value ? value.id : null }));
  };

  const findById = (options, id) => options?.find(opt => opt.id === id) || null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" keepMounted>
        <DialogTitle>{item ? 'Editar Alocação' : 'Nova Alocação'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={projetos || []}
                getOptionLabel={(option) => option.nome || ''}
                value={findById(projetos, formData.projeto_id)}
                onChange={(e, value) => handleAutocompleteChange('projeto_id', value)}
                renderInput={(params) => (
                  <TextField {...params} label="Projeto" error={!!errors.projeto_id} helperText={errors.projeto_id} />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={recursos || []}
                getOptionLabel={(option) => option.nome || ''}
                value={findById(recursos, formData.recurso_id)}
                onChange={(e, value) => handleAutocompleteChange('recurso_id', value)}
                renderInput={(params) => (
                  <TextField {...params} label="Recurso" error={!!errors.recurso_id} helperText={errors.recurso_id} />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data de Início da Alocação"
                value={formData.data_inicio_alocacao}
                onChange={(newValue) => setFormData(prev => ({ ...prev, data_inicio_alocacao: newValue }))}
                slotProps={{ textField: { fullWidth: true, error: !!errors.data_inicio_alocacao, helperText: errors.data_inicio_alocacao } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data de Fim da Alocação"
                value={formData.data_fim_alocacao}
                onChange={(newValue) => setFormData(prev => ({ ...prev, data_fim_alocacao: newValue }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
               <Autocomplete
                options={statusOptions || []}
                getOptionLabel={(option) => option.nome || ''}
                value={findById(statusOptions, formData.status_alocacao_id)}
                onChange={(e, value) => handleAutocompleteChange('status_alocacao_id', value)}
                renderInput={(params) => (
                  <TextField {...params} label="Status da Alocação" />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observação"
                multiline
                rows={3}
                fullWidth
                value={formData.observacao}
                onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
