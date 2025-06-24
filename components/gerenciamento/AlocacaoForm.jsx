import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, IconButton, Grid, Typography
} from '@mui/material';
import AutocompleteRecursoCascade from '../relatorios/AutocompleteRecursoCascade';
import DeleteIcon from '@mui/icons-material/Delete';

const AlocacaoForm = ({ alocacao, index, onUpdate, onRemove, recursos }) => {
  const [planejamento, setPlanejamento] = useState(alocacao.horas_planejadas || []);

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
    setPlanejamento(newPlanejamento);
    onUpdate(index, { ...alocacao, horas_planejadas: newPlanejamento });
  };

  const addPlanejamento = () => {
    const newPlanejamento = [...planejamento, { ano: new Date().getFullYear(), mes: new Date().getMonth() + 1, horas_planejadas: 0 }];
    setPlanejamento(newPlanejamento);
    onUpdate(index, { ...alocacao, horas_planejadas: newPlanejamento });
  };

  const removePlanejamento = (planejamentoIndex) => {
    const newPlanejamento = planejamento.filter((_, i) => i !== planejamentoIndex);
    setPlanejamento(newPlanejamento);
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
          <Grid container spacing={1} key={planIndex} sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <TextField label="Ano" type="number" value={plan.ano} onChange={(e) => handlePlanejamentoChange(planIndex, 'ano', parseInt(e.target.value, 10))} fullWidth />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Mês" type="number" value={plan.mes} onChange={(e) => handlePlanejamentoChange(planIndex, 'mes', parseInt(e.target.value, 10))} fullWidth />
            </Grid>
            <Grid item xs={3}>
              <TextField label="Horas" type="number" value={plan.horas_planejadas} onChange={(e) => handlePlanejamentoChange(planIndex, 'horas_planejadas', parseFloat(e.target.value))} fullWidth />
            </Grid>
            <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => removePlanejamento(planIndex)}><DeleteIcon /></IconButton>
            </Grid>
          </Grid>
        ))}
        <Button onClick={addPlanejamento} size="small">Adicionar Mês</Button>
      </Box>
    </Box>
  );
};

export default AlocacaoForm;
