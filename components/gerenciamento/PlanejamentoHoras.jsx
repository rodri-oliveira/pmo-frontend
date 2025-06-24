import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { getAlocacoes, getPlanejamentosByAlocacao, createOrUpdatePlanejamentoHoras } from '../../services/planejamentoHoras';

const PlanejamentoHoras = ({ setNotification }) => {
  const [alocacoes, setAlocacoes] = useState([]);
  const [selectedAlocacao, setSelectedAlocacao] = useState('');
  const [planejamentos, setPlanejamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAlocacoes = useCallback(async () => {
    try {
      const response = await getAlocacoes({ limit: 1000 });
      setAlocacoes(response.items || []);
    } catch (error) {
      setNotification({
        open: true,
        message: `Erro ao buscar alocações: ${error.message}`,
        severity: 'error',
      });
    }
  }, [setNotification]);

  useEffect(() => {
    fetchAlocacoes();
  }, [fetchAlocacoes]);

  const handleAlocacaoChange = async (event) => {
    const alocacaoId = event.target.value;
    setSelectedAlocacao(alocacaoId);
    if (!alocacaoId) {
      setPlanejamentos([]);
      return;
    }
    setLoading(true);
    try {
      const response = await getPlanejamentosByAlocacao(alocacaoId);
      const sortedPlanejamentos = (response.items || []).sort((a, b) => a.mes - b.mes);
      setPlanejamentos(sortedPlanejamentos);
    } catch (error) {
      setNotification({
        open: true,
        message: `Erro ao buscar planejamentos: ${error.message}`,
        severity: 'error',
      });
      setPlanejamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHorasChange = (mes, value) => {
    const updatedPlanejamentos = planejamentos.map((p) => {
      if (p.mes === mes) {
        return { ...p, horas_planejadas: value };
      }
      return p;
    });
    setPlanejamentos(updatedPlanejamentos);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const promises = planejamentos.map((p) => {
        const data = {
          alocacao_id: p.alocacao_id,
          ano: p.ano,
          mes: p.mes,
          horas_planejadas: parseFloat(p.horas_planejadas) || 0,
        };
        return createOrUpdatePlanejamentoHoras(data);
      });
      await Promise.all(promises);
      setNotification({
        open: true,
        message: 'Horas planejadas salvas com sucesso!',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Erro ao salvar horas planejadas: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Planejamento de Horas por Alocação
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="alocacao-select-label">Selecione a Alocação</InputLabel>
        <Select
          labelId="alocacao-select-label"
          value={selectedAlocacao}
          label="Selecione a Alocação"
          onChange={handleAlocacaoChange}
        >
          <MenuItem value="">
            <em>Nenhuma</em>
          </MenuItem>
          {alocacoes.map((aloc) => (
            <MenuItem key={aloc.id} value={aloc.id}>
              {`Alocação ID: ${aloc.id} (Recurso: ${aloc.recurso_id}, Projeto: ${aloc.projeto_id})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <CircularProgress />
      ) : planejamentos.length > 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mês</TableCell>
                  <TableCell align="right">Horas Planejadas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planejamentos.map((p) => (
                  <TableRow key={p.mes}>
                    <TableCell>{meses[p.mes - 1]}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={p.horas_planejadas}
                        onChange={(e) => handleHorasChange(p.mes, e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
            </Button>
          </Box>
        </Paper>
      )}

    </Box>
  );
};

export default PlanejamentoHoras;
