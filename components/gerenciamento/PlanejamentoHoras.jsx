import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { getAlocacoes } from '../../services/alocacoes';
import PlanejamentoHorasModal from './PlanejamentoHorasModal';

const PlanejamentoHoras = ({ setNotification }) => {
  const [alocacoes, setAlocacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlocacao, setSelectedAlocacao] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: rowsPerPage,
        searchTerm,
        apenas_ativos: true,
      };
      const data = await getAlocacoes(params);
      setAlocacoes(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      setNotification({
        open: true,
        message: `Erro ao buscar alocações: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, setNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (alocacao) => {
    setSelectedAlocacao(alocacao);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAlocacao(null);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Planejamento de Horas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Selecione uma alocação da lista para planejar as horas mensais.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Filtrar por nome do projeto ou recurso"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: '40%' }}
        />
      </Box>

      <Paper>
        <TableContainer>
          {loading && <CircularProgress sx={{ m: 2 }} />}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Projeto</TableCell>
                <TableCell>Recurso</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && alocacoes.map((alocacao) => (
                <TableRow key={alocacao.id}>
                  <TableCell>{alocacao.projeto_nome || 'N/A'}</TableCell>
                  <TableCell>{alocacao.recurso_nome || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Planejar Horas">
                      <IconButton onClick={() => handleOpenModal(alocacao)}>
                        <EventNoteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      {selectedAlocacao && (
        <PlanejamentoHorasModal
          open={modalOpen}
          onClose={handleCloseModal}
          alocacao={selectedAlocacao}
          setNotification={setNotification}
        />
      )}
    </Box>
  );
};

export default PlanejamentoHoras;
