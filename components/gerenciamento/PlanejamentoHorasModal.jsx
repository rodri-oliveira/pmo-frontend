import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getPlanejamentosByAlocacao, createOrUpdatePlanejamentoHoras } from '../../services/planejamentoHoras';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
};

const mesesNomes = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const PlanejamentoHorasModal = ({ open, onClose, alocacao, setNotification }) => {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [planejamentos, setPlanejamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPlanejamentos = useCallback(async () => {
    if (!alocacao || !ano) {
      setPlanejamentos([]);
      return;
    }
    setLoading(true);
    try {
      const response = await getPlanejamentosByAlocacao(alocacao.id, { ano });
      const existingPlanejamentos = Array.isArray(response) ? response : response.items || [];
      
      const meses = Array.from({ length: 12 }, (_, i) => i + 1);
      const newPlanejamentos = meses.map(mes => {
        const existente = existingPlanejamentos.find(p => p.mes === mes);
        return existente || {
          alocacao_id: alocacao.id,
          ano: ano,
          mes: mes,
          horas_planejadas: 0,
        };
      });
      setPlanejamentos(newPlanejamentos);
    } catch (error) {
      setNotification({ open: true, message: `Erro ao buscar planejamentos: ${error.message}`, severity: 'error' });
      setPlanejamentos([]);
    } finally {
      setLoading(false);
    }
  }, [alocacao, ano, setNotification]);

  useEffect(() => {
    if (open) {
      fetchPlanejamentos();
    }
  }, [open, fetchPlanejamentos]);

  const handleHorasChange = (mes, value) => {
    const updatedPlanejamentos = planejamentos.map((p) => 
      p.mes === mes ? { ...p, horas_planejadas: value } : p
    );
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
      setNotification({ open: true, message: 'Horas planejadas salvas com sucesso!', severity: 'success' });
      onClose();
    } catch (error) {
      setNotification({ open: true, message: `Erro ao salvar horas planejadas: ${error.message}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2"> 
          Planejar Horas - {alocacao?.projeto?.nome} / {alocacao?.recurso?.nome}
        </Typography>
        <TextField
          label="Ano"
          type="number"
          variant="outlined"
          value={ano}
          onChange={(e) => setAno(parseInt(e.target.value, 10) || new Date().getFullYear())}
          sx={{ my: 2, width: 150 }}
        />
        {loading ? (
          <CircularProgress />
        ) : (
          <Paper>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Mês</TableCell>
                    <TableCell align="right">Horas Planejadas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {planejamentos.map((p) => (
                    <TableRow key={p.mes}>
                      <TableCell>{mesesNomes[p.mes - 1]}</TableCell>
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
              <Button onClick={onClose} sx={{ mr: 1 }}>Cancelar</Button>
              <Button variant="contained" onClick={handleSaveChanges} disabled={saving}>
                {saving ? <CircularProgress size={24} /> : 'Salvar'}
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Modal>
  );
};

export default PlanejamentoHorasModal;
