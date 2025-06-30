"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, Autocomplete, CircularProgress, Box
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { getProjetos } from '../../services/projetos';
import { getRecursos } from '../../services/recursos';
import AutocompleteEquipeCascade from '../relatorios/AutocompleteEquipeCascade';

const initialFormState = {
  secao_id: null,
  recurso_id: null,
  projeto_id: null,
  equipe_id: null,
  data_inicio_alocacao: null,
  data_fim_alocacao: null,
  status_alocacao_id: null,
  observacao: '',
};

export default function AlocacaoModal({ open, onClose, onSave, item, secoes, statusOptions }) {
  const [formData, setFormData] = useState(initialFormState);
  const [projetosList, setProjetosList] = useState([]);
const [projetosLoading, setProjetosLoading] = useState(false);
const [projetoInput, setProjetoInput] = useState("");
  const [recursosList, setRecursosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Popula o formulário quando o modal abre ou o item muda
  useEffect(() => {
    if (open) {
      const initialData = item ? {
        secao_id: item.secao_id || null,
        recurso_id: item.recurso_id || null,
        projeto_id: item.projeto_id || null,
        equipe_id: item.equipe_id || null,
        data_inicio_alocacao: item.data_inicio_alocacao ? new Date(item.data_inicio_alocacao + 'T00:00:00') : null,
        data_fim_alocacao: item.data_fim_alocacao ? new Date(item.data_fim_alocacao + 'T00:00:00') : null,
        status_alocacao_id: item.status_alocacao_id || null,
        observacao: item.observacao || '',
      } : initialFormState;
      setFormData(initialData);
      setErrors({});
    } else {
      // Limpa tudo quando o modal fecha
      setFormData(initialFormState);
      setProjetosList([]);
      setRecursosList([]);
    }
  }, [item, open]);

  // Busca recursos quando a seção muda
  useEffect(() => {
    const fetchRecursos = async () => {
      if (formData.secao_id) {
        setLoading(true);
        try {
          const recursosResp = await getRecursos({ secao_id: formData.secao_id, per_page: 999, apenas_ativos: true });
          setRecursosList(recursosResp.items || []);
        } catch (error) {
          console.error("Erro ao buscar recursos da seção:", error);
          setRecursosList([]);
        } finally {
          setLoading(false);
        }
      } else {
        setRecursosList([]);
      }
    };
    fetchRecursos();
    // Limpa equipe ao trocar de seção
    setFormData(prev => ({ ...prev, equipe_id: null }));
  }, [formData.secao_id]);

  // Busca projetos conforme digita
  const fetchProjetosAsync = useCallback(async (inputValue) => {
    if (!formData.secao_id || !inputValue) {
      setProjetosList([]);
      return;
    }
    setProjetosLoading(true);
    try {
      const projetosResp = await getProjetos({
        secao_id: formData.secao_id,
        apenas_ativos: true,
        nome: inputValue,
        per_page: 20
      });
      setProjetosList(projetosResp.items || []);
    } catch (error) {
      setProjetosList([]);
    } finally {
      setProjetosLoading(false);
    }
  }, [formData.secao_id]);

  const validate = () => {
    const newErrors = {};
    if (!formData.recurso_id) newErrors.recurso_id = 'Recurso é obrigatório';
    if (!formData.projeto_id) newErrors.projeto_id = 'Projeto é obrigatório';
    if (!formData.equipe_id) newErrors.equipe_id = 'Equipe é obrigatória';
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
      // Remove secao_id, pois não faz parte do modelo de dados da Alocacao
      delete dataToSave.secao_id;
      onSave(dataToSave);
    }
  };

  const handleAutocompleteChange = (field, value) => {
    const newFormData = { ...formData, [field]: value ? value.id : null };

    // Se a seção for alterada, limpa o projeto e o recurso selecionados
    if (field === 'secao_id') {
      newFormData.projeto_id = null;
      newFormData.recurso_id = null;
    }
    
    setFormData(newFormData);
  };

  const findById = (options, id) => options?.find(opt => opt.id === id) || null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{item?.id ? 'Editar Alocação' : 'Nova Alocação'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {loading && <CircularProgress />}
          </Box>
          <Grid container spacing={2} sx={{ mt: 1, opacity: loading ? 0.5 : 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={secoes || []}
                getOptionLabel={(option) => option.nome || ''}
                value={findById(secoes, formData.secao_id)}
                onChange={(e, value) => handleAutocompleteChange('secao_id', value)}
                renderInput={(params) => (
                  <TextField {...params} label="Seção" error={!!errors.secao_id} helperText={errors.secao_id} />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={projetosList}
                getOptionLabel={(option) => option.nome || ''}
                value={findById(projetosList, formData.projeto_id)}
                onChange={(e, value) => handleAutocompleteChange('projeto_id', value)}
                inputValue={projetoInput}
                onInputChange={(e, value, reason) => {
                  setProjetoInput(value);
                  if (reason === 'input' && value.length >= 2) {
                    fetchProjetosAsync(value);
                  } else if (reason === 'clear') {
                    setProjetosList([]);
                  }
                }}
                filterOptions={(x) => x} // Não filtra client-side
                loading={projetosLoading}
                disabled={!formData.secao_id || loading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Projeto"
                    error={!!errors.projeto_id}
                    helperText={errors.projeto_id}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {projetosLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>{option.nome}</li>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={recursosList}
                getOptionLabel={(option) => option.nome || ''}
                value={findById(recursosList, formData.recurso_id)}
                onChange={(e, value) => {
                  handleAutocompleteChange('recurso_id', value);
                  // Ao selecionar recurso, sugerir equipe principal se disponível
                  if (value && value.equipe_principal_id) {
                    setFormData(prev => ({ ...prev, equipe_id: value.equipe_principal_id }));
                  }
                }}
                disabled={!formData.secao_id || loading}
                renderInput={(params) => (
                  <TextField {...params} label="Recurso" error={!!errors.recurso_id} helperText={errors.recurso_id} />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AutocompleteEquipeCascade
                value={formData.equipe_id ? { id: formData.equipe_id, nome: '' } : null}
                onChange={equipeObj => setFormData(prev => ({ ...prev, equipe_id: equipeObj ? equipeObj.id : null }))}
                secaoId={formData.secao_id}
                placeholder="Selecione a equipe..."
              />
              {errors.equipe_id && (
                <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 4 }}>{errors.equipe_id}</div>
              )}
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
