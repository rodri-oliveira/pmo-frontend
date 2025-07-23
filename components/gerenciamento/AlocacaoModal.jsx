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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { saveHorasPlanejadas } from '../../services/alocacoes';

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
  const [horasPlanejadasList, setHorasPlanejadasList] = useState([]);

  // Nomes dos meses para exibição
  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

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
      console.log('🔍 AlocacaoModal - Item recebido:', item);
      const initialData = item ? {
        secao_id: item.secao_id || null,
        recurso_id: item.recurso?.id || null,
        projeto_id: item.projeto?.id || null,
        equipe_id: item.equipe?.id || item.equipe_id || null,
        data_inicio_alocacao: item.data_inicio_alocacao ? new Date(item.data_inicio_alocacao + 'T00:00:00') : null,
        data_fim_alocacao: item.data_fim_alocacao ? new Date(item.data_fim_alocacao + 'T00:00:00') : null,
        status_alocacao_id: item.status_alocacao?.id || item.status_alocacao_id || null,
        observacao: item.observacao ?? '',
      } : initialFormState;
      console.log('🔍 AlocacaoModal - FormData inicial:', initialData);
      setFormData(initialData);
      setErrors({});
      fetchFiltros(initialData);
      
      // Se for edição e tiver projeto, garantir que fique na lista
      if (item && item.projeto && item.projeto.id && item.projeto.nome) {
        setProjetosList(prev => {
          const exists = prev.some(p => p.id === item.projeto.id);
          return exists ? prev : [{ id: item.projeto.id, nome: item.projeto.nome }, ...prev];
        });
      }
      // Se for edição e tiver recurso, garantir que fique na lista
      if (item && item.recurso && item.recurso.id && item.recurso.nome) {
        setRecursosList(prev => {
          const exists = prev.some(r => r.id === item.recurso.id);
          return exists ? prev : [{ id: item.recurso.id, nome: item.recurso.nome }, ...prev];
        });
      }
      // Se for edição e tiver equipe, garantir que fique na lista
      if (item && item.equipe && item.equipe.id && item.equipe.nome) {
        setEquipes(prev => {
          const exists = prev.some(e => e.id === item.equipe.id);
          return exists ? prev : [{ id: item.equipe.id, nome: item.equipe.nome }, ...prev];
        });
      }
      
      // Inicializar horas planejadas se for edição
      if (item && item.horas_planejadas) {
        const horasConvertidas = item.horas_planejadas
          .map((hp) => ({
            id: hp.id ?? null,
            ano: hp.ano,
            mes: hp.mes,
            horas: hp.horas_planejadas ?? hp.horas ?? 0,
          }))
          .sort((a, b) => {
            // Ordena por ano primeiro, depois por mês
            if (a.ano !== b.ano) {
              return a.ano - b.ano;
            }
            return a.mes - b.mes;
          });
        setHorasPlanejadasList(horasConvertidas);
      } else {
        setHorasPlanejadasList([]);
      }
    } else {
      setFormData(initialFormState);
      setProjetosList([]);
      setRecursosList([]);
      setHorasPlanejadasList([]);
    }
  }, [item, open]);

  // Força re-render quando as listas são carregadas para garantir que findById funcione
  useEffect(() => {
    if (open && item && recursosList.length > 0) {
      console.log('🔍 Listas carregadas - forçando re-render');
      // Força um pequeno re-render para que findById execute com as listas populadas
      setFormData(prev => ({ ...prev }));
    }
  }, [recursosList, projetosList, equipes, open, item]);

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
      // Mantém o projeto atual na lista se existir
      setProjetosList(prev => (prev.some(p => p.id === item?.projeto?.id) ? prev : []));
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
  }, [formData.secao_id, item]);

  const validate = () => {
    const newErrors = {};
    if (!formData.recurso_id) newErrors.recurso_id = 'Recurso é obrigatório';
    if (!formData.projeto_id) newErrors.projeto_id = 'Projeto é obrigatório';
    if (!formData.equipe_id) newErrors.equipe_id = 'Equipe é obrigatória';
    if (!formData.data_inicio_alocacao) newErrors.data_inicio_alocacao = 'Data de início é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      const dataToSave = {
        ...formData,
        data_inicio_alocacao: formData.data_inicio_alocacao?.toISOString().split('T')[0],
        data_fim_alocacao: formData.data_fim_alocacao?.toISOString().split('T')[0] || null,
      };
      // Remove secao_id, pois não faz parte do modelo de dados da Alocacao
      delete dataToSave.secao_id;
      
      try {
        // 1. Salvar alocação primeiro
        console.log('📤 Salvando alocação...');
        await onSave(dataToSave);
        
        // 2. Se for edição e tiver horas planejadas, salvar separadamente
        if (item?.id && horasPlanejadasList.length > 0) {
          const horasValidas = horasPlanejadasList.filter(h => h.horas > 0);
          if (horasValidas.length > 0) {
            console.log('📤 Salvando horas planejadas...', horasValidas);
            try {
              await saveHorasPlanejadas(item.id, horasValidas);
              console.log('✅ Horas planejadas salvas com sucesso!');
            } catch (horasError) {
              console.error('❌ Erro detalhado ao salvar horas planejadas:', {
                error: horasError,
                message: horasError.message,
                stack: horasError.stack,
                alocacaoId: item.id,
                horas: horasValidas
              });
              throw horasError; // Re-throw para o catch externo
            }
          }
        }
        
        console.log('✅ Tudo salvo com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        // O erro já será tratado pelo componente pai
      }
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

  const findById = (options, id) => {
    console.log('🔍 findById - options:', options, 'id:', id);
    const result = options?.find(opt => opt.id === id);
    
    // Se não encontrou na lista mas tem ID, cria objeto temporário
    if (!result && id && item) {
      if (options === recursosList && id === item.recurso_id && item.recurso) {
        console.log('🔍 findById - criando recurso temporário:', item.recurso);
        return { id: item.recurso_id, nome: item.recurso.nome };
      }
      if (options === projetosList && id === item.projeto?.id && item.projeto) {
        console.log('🔍 findById - criando projeto temporário:', item.projeto);
        return { id: item.projeto.id, nome: item.projeto.nome };
      }
    }
    
    console.log('🔍 findById - resultado:', result);
    return result || null;
  };

  // Funções para manipular horas planejadas
  const handleHorasChange = (index, field, value) => {
    const newHoras = [...horasPlanejadasList];
    if (field === 'horas') {
      newHoras[index][field] = value === '' ? '' : value.replace(/^0+(?=\d)/, '');
    } else {
      newHoras[index][field] = value;
    }
    setHorasPlanejadasList(newHoras);
  };

  const handleAddHoras = () => {
    const lastEntry = horasPlanejadasList[horasPlanejadasList.length - 1];
    let nextYear, nextMonth;
    
    if (lastEntry) {
      // Se já tem entradas, incrementa o mês
      if (lastEntry.mes === 12) {
        nextYear = lastEntry.ano + 1;
        nextMonth = 1;
      } else {
        nextYear = lastEntry.ano;
        nextMonth = lastEntry.mes + 1;
      }
    } else {
      // Se não tem entradas, usa data atual
      const currentDate = new Date();
      nextYear = currentDate.getFullYear();
      nextMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11, queremos 1-12
    }

    setHorasPlanejadasList([...horasPlanejadasList, { 
      ano: nextYear, 
      mes: nextMonth, 
      horas: 0, 
      id: null 
    }]);
  };

  const handleRemoveHoras = (index) => {
    const newHoras = horasPlanejadasList.filter((_, i) => i !== index);
    setHorasPlanejadasList(newHoras);
  };

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
                  value={formData.equipe_id ? (equipes.find(eq => eq.id === formData.equipe_id) || (item?.equipe ? { id: item.equipe.id, nome: item.equipe.nome } : { id: formData.equipe_id, nome: '' })) : null}
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
                  value={(() => {
                    const value = findById(recursosList, formData.recurso_id);
                    console.log('🔍 Recurso Autocomplete - value:', value, 'formData.recurso_id:', formData.recurso_id);
                    return value;
                  })()}
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
                  isOptionEqualToValue={(option, value) => {
                    console.log('🔍 Recurso isOptionEqualToValue - option:', option, 'value:', value);
                    return option.id === value.id;
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" component="label" sx={{ mb: 0.5, display: 'block', fontWeight: 'medium' }}>Projeto</Typography>
                <Autocomplete
                  options={projetosList}
                  getOptionLabel={(option) => option.nome || ''}
                  value={(() => {
                    const val = findById(projetosList, formData.projeto_id);
                    if (val) return val;
                    if (item?.projeto && formData.projeto_id === item.projeto.id) {
                      return { id: item.projeto.id, nome: item.projeto.nome };
                    }
                    return null;
                  })()}
                  onChange={(e, value) => handleAutocompleteChange('projeto_id', value)}
                  inputValue={projetoInput}
                  onInputChange={(e, value, reason) => {
                    setProjetoInput(value);
                    if (reason === 'input' && value.length >= 2) {
                      fetchProjetosAsync(value);
                    } else if (reason === 'clear') {
                      setProjetosList(prev => (prev.some(p => p.id === item?.projeto?.id) ? prev : []));
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

              {/* Linha 6: Horas Planejadas */}
              {item?.id && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 'bold' }}>
                    Horas Planejadas
                  </Typography>
                  
                  {horasPlanejadasList.length > 0 ? (
                    horasPlanejadasList.map((horas, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3}>
                            <TextField
                              label="Ano"
                              type="number"
                              value={horas.ano}
                              onChange={(e) => handleHorasChange(index, 'ano', parseInt(e.target.value))}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Autocomplete
                              options={Array.from({length: 12}, (_, i) => ({ value: i + 1, label: mesesNomes[i] }))}
                              getOptionLabel={(option) => option.label}
                              value={mesesNomes[horas.mes - 1] ? { value: horas.mes, label: mesesNomes[horas.mes - 1] } : null}
                              onChange={(e, value) => handleHorasChange(index, 'mes', value ? value.value : 1)}
                              renderInput={(params) => <TextField {...params} label="Mês" size="small" />}
                              isOptionEqualToValue={(option, value) => option.value === value.value}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              label="Horas"
                              type="number"
                              value={horas.horas}
                              onChange={(e) => handleHorasChange(index, 'horas', e.target.value)}
                              fullWidth
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              onClick={() => handleRemoveHoras(index)}
                              size="small"
                              fullWidth
                            >
                              Remover
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Nenhuma hora planejada cadastrada
                    </Typography>
                  )}
                  
                  <Button 
                    variant="contained" 
                    onClick={handleAddHoras}
                    sx={{ mt: 1 }}
                    startIcon={<AddCircleOutlineIcon />}
                  >
                    Adicionar Período
                  </Button>
                </Grid>
              )}
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
