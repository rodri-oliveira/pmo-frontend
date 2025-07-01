"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, Autocomplete, CircularProgress, Box, Typography
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { getProjetos } from '../../services/projetos';
import { getFiltrosPopulados } from '../../services/filtros';
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
const [equipes, setEquipes] = useState([]);
const [recursosList, setRecursosList] = useState([]);
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState({});

  // Popula o formulário quando o modal abre ou o item muda
  useEffect(() => {
    const fetchFiltros = async (data) => {
      setLoading(true);
      try {
        const filtros = await getFiltrosPopulados({
          secao_id: data.secao_id,
          equipe_id: data.equipe_id,
          recurso_id: data.recurso_id,
        });
        setEquipes(filtros.equipes || []);
        setRecursosList(filtros.recursos || []);
      } catch (error) {
        setEquipes([]);
        setRecursosList([]);
      } finally {
        setLoading(false);
      }
    };
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
      fetchFiltros(initialData);
    } else {
      setFormData(initialFormState);
      setProjetosList([]);
      setRecursosList([]);
    }
  }, [item, open]);

  // Atualiza filtros em cascata ao alterar secao, equipe ou recurso
  useEffect(() => {
    if (!open) return;
    const fetchFiltros = async () => {
      setLoading(true);
      try {
        const filtros = await getFiltrosPopulados({
          secao_id: formData.secao_id,
          equipe_id: formData.equipe_id,
          recurso_id: formData.recurso_id,
        });
        setEquipes(filtros.equipes || []);
        setRecursosList(filtros.recursos || []);
      } catch (error) {
        setEquipes([]);
        setRecursosList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFiltros();
  }, [formData.secao_id, formData.equipe_id, formData.recurso_id, open]);

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
              {/* Linha 1: Seção | Equipe */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Seção</Typography>
                <Autocomplete
                  options={secoes || []}
                  getOptionLabel={(option) => option.nome || ''}
                  value={findById(secoes, formData.secao_id)}
                  onChange={(e, value) => handleAutocompleteChange('secao_id', value)}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Selecione a seção" error={!!errors.secao_id} helperText={errors.secao_id} />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Equipe</Typography>
                <AutocompleteEquipeCascade
                  value={formData.equipe_id ? equipes.find(eq => eq.id === formData.equipe_id) || { id: formData.equipe_id, nome: '' } : null}
                  onChange={equipeObj => setFormData(prev => ({ ...prev, equipe_id: equipeObj ? equipeObj.id : null }))}
                  secaoId={formData.secao_id}
                  options={equipes}
                  placeholder="Selecione a equipe..."
                />
                {errors.equipe_id && (
                  <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 4 }}>{errors.equipe_id}</div>
                )}
              </Grid>

              {/* Linha 2: Recurso | Projeto */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Recurso</Typography>
                <Autocomplete
                  options={recursosList}
                  getOptionLabel={(option) => option.nome || ''}
                  value={findById(recursosList, formData.recurso_id)}
                  onChange={(e, value) => {
                    handleAutocompleteChange('recurso_id', value);
                    if (value && value.equipe_principal_id) {
                      setFormData(prev => ({ ...prev, equipe_id: value.equipe_principal_id }));
                    }
                  }}
                  disabled={!formData.secao_id || loading}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Selecione o recurso" error={!!errors.recurso_id} helperText={errors.recurso_id} />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Projeto</Typography>
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
                  filterOptions={(x) => x}
                  loading={projetosLoading}
                  disabled={!formData.secao_id || loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Selecione o projeto"
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

              {/* Linha 3: Datas */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Data de Início da Alocação</Typography>
                <DatePicker
                  value={formData.data_inicio_alocacao}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, data_inicio_alocacao: newValue }))}
                  slotProps={{ textField: { fullWidth: true, error: !!errors.data_inicio_alocacao, helperText: errors.data_inicio_alocacao } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Data de Fim da Alocação</Typography>
                <DatePicker
                  value={formData.data_fim_alocacao}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, data_fim_alocacao: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              {/* Linha 4: Status da Alocação */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Status da Alocação</Typography>
                <Autocomplete
                  options={statusOptions || []}
                  getOptionLabel={(option) => option.nome || ''}
                  value={findById(statusOptions, formData.status_alocacao_id)}
                  onChange={(e, value) => handleAutocompleteChange('status_alocacao_id', value)}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Selecione o status" />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </Grid>

              {/* Linha 5: Observação */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Observação</Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={formData.observacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Adicione qualquer observação aqui..."
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
