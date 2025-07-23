import React, { useEffect } from 'react';
import {
  Box, TextField, Button, IconButton, Grid, Typography, Autocomplete
} from '@mui/material';
import AutocompleteRecursoCascade from '../relatorios/AutocompleteRecursoCascade';
import AutocompleteEquipeCascade from '../relatorios/AutocompleteEquipeCascade';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const AlocacaoForm = ({ alocacao, index, onUpdate, onRemove, recursos, equipes = [], secaoId, errors = {} }) => {
  const planejamento = alocacao.horas_planejadas || [];

  useEffect(() => {
    const { data_inicio_alocacao, data_fim_alocacao } = alocacao;

    if (data_inicio_alocacao && data_fim_alocacao) {
      const startDate = new Date(data_inicio_alocacao + 'T00:00:00');
      const endDate = new Date(data_fim_alocacao + 'T00:00:00');

      if (startDate > endDate) {
        if (planejamento.length > 0) {
          onUpdate(index, { ...alocacao, horas_planejadas: [] });
        }
        return;
      }

      let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const newPlanejamento = [];

      while (currentDate <= endDate) {
        const ano = currentDate.getFullYear();
        const mes = currentDate.getMonth() + 1;
        const existingPlan = planejamento.find(p => p.ano === ano && p.mes === mes);

        newPlanejamento.push({
          ano,
          mes,
          horas_planejadas: existingPlan ? existingPlan.horas_planejadas : 0,
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      if (JSON.stringify(newPlanejamento) !== JSON.stringify(planejamento)) {
        onUpdate(index, { ...alocacao, horas_planejadas: newPlanejamento });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alocacao.data_inicio_alocacao, alocacao.data_fim_alocacao]);

  const handleResourceChange = (recurso) => {
    let equipeId = alocacao.equipe_id;
    // Sugere equipe principal do recurso, se houver
    if (recurso && recurso.equipe_principal_id) {
      equipeId = recurso.equipe_principal_id;
    }
    onUpdate(index, { ...alocacao, recurso_id: recurso ? recurso.id : '', equipe_id: equipeId });
  };

  const handleEquipeChange = (equipeObj) => {
    // Se a equipe mudar e o recurso atual não pertence à nova equipe, limpa o recurso
    let novoRecursoId = alocacao.recurso_id;
    if (equipeObj && alocacao.recurso_id) {
      const recursoAtual = Array.isArray(recursos) && recursos.find(r => r.id === alocacao.recurso_id);
      if (!recursoAtual || String(recursoAtual.equipe_id) !== String(equipeObj.id)) {
        novoRecursoId = '';
      }
    } else if (!equipeObj) {
      novoRecursoId = '';
    }
    onUpdate(index, { ...alocacao, equipe_id: equipeObj ? equipeObj.id : '', recurso_id: novoRecursoId });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    onUpdate(index, { ...alocacao, [name]: value });
  };

  const handlePlanejamentoChange = (planejamentoIndex, field, value) => {
    const newPlanejamento = [...planejamento];
    newPlanejamento[planejamentoIndex] = { ...newPlanejamento[planejamentoIndex], [field]: value };
    onUpdate(index, { ...alocacao, horas_planejadas: newPlanejamento });
  };

  const addPlanejamento = () => {
    const newPlanejamento = [...planejamento, { ano: new Date().getFullYear(), mes: new Date().getMonth() + 1, horas_planejadas: 0 }];
    onUpdate(index, { ...alocacao, horas_planejadas: newPlanejamento });
  };

  const removePlanejamento = (planejamentoIndex) => {
    const newPlanejamento = planejamento.filter((_, i) => i !== planejamentoIndex);
    onUpdate(index, { ...alocacao, horas_planejadas: newPlanejamento });
  };

  // Deduplique recursos por nome para evitar warnings de chave duplicada no Autocomplete
  const uniqueRecursos = Array.isArray(recursos) ? recursos.filter((r, idx, arr) => arr.findIndex(o => o.nome === r.nome) === idx) : [];

  const selectedRecurso = (Array.isArray(recursos) && recursos.find(r => r.id === alocacao.recurso_id)) || null;

  return (
    <Box sx={{ border: '1px solid #ddd', p: 2, mb: 2, borderRadius: '4px', position: 'relative' }}>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
            <AutocompleteEquipeCascade
                value={alocacao.equipe_id ? { id: alocacao.equipe_id, nome: '' } : null}
                onChange={handleEquipeChange}
                options={equipes || []}
                placeholder="Selecione a equipe..."
            />
            {errors.equipe_id && (
              <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 4 }}>{errors.equipe_id}</div>
            )}
        </Grid>
        <Grid item xs={12} sm={6}>
  <Autocomplete
    options={alocacao.equipe_id ? uniqueRecursos.filter(r => String(r.equipe_id) === String(alocacao.equipe_id)) : uniqueRecursos}
    getOptionLabel={option => option.nome || ''}
    value={selectedRecurso}
    onChange={(e, value) => handleResourceChange(value)}
    renderInput={params => (
      <TextField {...params} placeholder="Selecione o recurso" label="Recurso" variant="outlined" fullWidth />
    )}
    isOptionEqualToValue={(option, value) => option.id === value.id}
    disabled={!alocacao.equipe_id}
  />
</Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="data_inicio_alocacao"
            label="Início da Alocação"
            type="date"
            value={alocacao.data_inicio_alocacao || ''}
            onChange={handleDateChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="data_fim_alocacao"
            label="Fim da Alocação"
            type="date"
            value={alocacao.data_fim_alocacao || ''}
            onChange={handleDateChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Planejamento de Horas</Typography>
        {planejamento.map((plan, planIndex) => (
          <Grid container spacing={1} key={`${plan.ano}-${plan.mes}-${planIndex}`} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <TextField label="Ano" type="number" value={plan.ano} onChange={(e) => handlePlanejamentoChange(planIndex, 'ano', parseInt(e.target.value, 10))} fullWidth disabled />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Mês" type="number" value={plan.mes} onChange={(e) => handlePlanejamentoChange(planIndex, 'mes', parseInt(e.target.value, 10))} fullWidth disabled />
            </Grid>
            <Grid item xs={3}>
              <TextField
              label="Horas"
              type="number"
              value={plan.horas_planejadas}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                // Permite que o campo fique vazio, mas evita que NaN seja salvo no estado.
                // Se a entrada for inválida (ex: texto), o campo é limpo.
                handlePlanejamentoChange(planIndex, 'horas_planejadas', isNaN(value) ? '' : value);
              }}
              fullWidth
            />
            </Grid>
            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => removePlanejamento(planIndex)}><DeleteIcon /></IconButton>
            </Grid>
          </Grid>
        ))}
        <Button onClick={addPlanejamento} size="small" startIcon={<AddCircleOutlineIcon />}>
          Adicionar Mês Manualmente
        </Button>
      </Box>
    </Box>
  );
};

export default AlocacaoForm;
