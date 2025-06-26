import React, { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Modal,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function HorasPlanejadasModal({ open, handleClose, horas }) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          Horas Planejadas
        </Typography>
        {horas && horas.length > 0 ? (
          <Box id="modal-description" sx={{ mt: 2 }}>
            {horas.map((h, index) => (
              <Typography key={index}>
                {h.mes}/{h.ano}: {h.horas} horas
              </Typography>
            ))}
          </Box>
        ) : (
          <Typography sx={{ mt: 2 }}>Nenhuma hora planejada.</Typography>
        )}
      </Box>
    </Modal>
  );
}

function Row({ projeto }) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHoras, setSelectedHoras] = useState([]);

  const handleOpenModal = (horas) => {
    setSelectedHoras(horas);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedHoras([]);
  };

  return (
    <React.Fragment>
      <HorasPlanejadasModal open={modalOpen} handleClose={handleCloseModal} horas={selectedHoras} />
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {projeto.nome}
        </TableCell>
        <TableCell>{projeto.secao?.nome || 'N/A'}</TableCell>
        <TableCell>{projeto.status_projeto?.nome || 'N/A'}</TableCell>
        <TableCell>{projeto.data_inicio_prevista || 'N/A'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Alocações
              </Typography>
              {projeto.alocacoes && projeto.alocacoes.length > 0 ? (
                <Table size="small" aria-label="alocacoes">
                  <TableHead>
                    <TableRow>
                      <TableCell>Recurso</TableCell>
                      <TableCell>Data Início</TableCell>
                      <TableCell>Data Fim</TableCell>
                      <TableCell align="center">Horas Planejadas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projeto.alocacoes.map((alocacao) => (
                      <TableRow key={alocacao.id}>
                        <TableCell>{alocacao.recurso.nome}</TableCell>
                        <TableCell>{alocacao.data_inicio_alocacao}</TableCell>
                        <TableCell>{alocacao.data_fim_alocacao || 'Indeterminado'}</TableCell>
                        <TableCell align="center">
                          <Button size="small" onClick={() => handleOpenModal(alocacao.horas_planejadas)} disabled={!alocacao.horas_planejadas || alocacao.horas_planejadas.length === 0}>
                            Ver Horas
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography>Nenhuma alocação para este projeto.</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function ProjetosDetalhesTable({ data }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Nome do Projeto</TableCell>
            <TableCell>Seção</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Início Previsto</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((projeto) => (
            <Row key={projeto.id} projeto={projeto} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
