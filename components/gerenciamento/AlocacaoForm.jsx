import React, { useEffect } from 'react';
import {
  Box, TextField, Button, IconButton, Grid, Typography
} from '@mui/material';
import AutocompleteRecursoCascade from '../relatorios/AutocompleteRecursoCascade';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const AlocacaoForm = ({ alocacao, index, onUpdate, onRemove, recursos }) => {
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
    onUpdate(index, { ...alocacao, recurso_id: recurso ? recurso.id : '' });
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

  const selectedRecurso = (Array.isArray(recursos) && recursos.find(r => r.id === alocacao.recurso_id)) || null;

  return (
    <Box sx={{ border: '1px solid #ddd', p: 2, mb: 2, borderRadius: '4px', position: 'relative' }}>
      <IconButton
        aria-label="delete"
        onClick={() => onRemove(index)}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <DeleteIcon />
      </IconButton>
      <Grid container spacing={2}>
        <Grid item xs={12}>
            <AutocompleteRecursoCascade
                placeholder="Selecione o recurso"
                value={selectedRecurso}
                onChange={handleResourceChange}
                options={recursos || []}
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
