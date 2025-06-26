import React, { useState, useEffect } from 'react';
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
  TextField,
  Grid,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function HorasPlanejadasModal({ open, onClose, onSave, alocacao, projetoId }) {
  const [horas, setHoras] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (alocacao?.horas_planejadas) {
      setHoras(JSON.parse(JSON.stringify(alocacao.horas_planejadas)));
    } else {
      setHoras([]);
    }
    setIsDirty(false);
  }, [alocacao]);

  const handleChange = (index, field, value) => {
    const newHoras = [...horas];
    const numericValue = parseInt(value, 10) || 0;
    newHoras[index][field] = numericValue;
    setHoras(newHoras);
    setIsDirty(true);
  };

  const handleAdd = () => {
    const lastEntry = horas[horas.length - 1];
    const nextDate = new Date(lastEntry ? `${lastEntry.ano}-${lastEntry.mes}-01` : new Date());
    if (lastEntry) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    setHoras([...horas, { ano: nextDate.getFullYear(), mes: nextDate.getMonth() + 1, horas: 0, id: null }]);
    setIsDirty(true);
  };

  const handleRemove = (index) => {
    const newHoras = horas.filter((_, i) => i !== index);
    setHoras(newHoras);
    setIsDirty(true);
  };

  const handleSaveClick = () => {
    onSave(projetoId, alocacao.id, horas);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Editar Horas Planejadas</Typography>
        <Grid container spacing={2} sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
          {horas.map((h, index) => (
            <Grid item xs={12} container spacing={1} key={index} alignItems="center">
              <Grid item xs={3}><TextField label="Mês" type="number" value={h.mes} onChange={(e) => handleChange(index, 'mes', e.target.value)} fullWidth /></Grid>
              <Grid item xs={3}><TextField label="Ano" type="number" value={h.ano} onChange={(e) => handleChange(index, 'ano', e.target.value)} fullWidth /></Grid>
              <Grid item xs={4}><TextField label="Horas" type="number" value={h.horas} onChange={(e) => handleChange(index, 'horas', e.target.value)} fullWidth /></Grid>
              <Grid item xs={2}><IconButton onClick={() => handleRemove(index)}><DeleteIcon /></IconButton></Grid>
            </Grid>
          ))}
        </Grid>
        <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAdd} sx={{ mt: 2 }}>Adicionar Mês</Button>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancelar</Button>
          <Button onClick={handleSaveClick} variant="contained" disabled={!isDirty}>Salvar</Button>
        </Box>
      </Box>
    </Modal>
  );
}

import EditIcon from '@mui/icons-material/Edit';

function Row({ projeto, onEditProjeto, onEditAlocacao, onDeleteAlocacao, onSaveHoras }) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlocacao, setSelectedAlocacao] = useState(null);

  const handleOpenModal = (alocacao) => {
    setSelectedAlocacao(alocacao);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAlocacao(null);
  };

  return (
    <React.Fragment>
      <HorasPlanejadasModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        onSave={onSaveHoras} 
        alocacao={selectedAlocacao}
        projetoId={projeto.id}
      />
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
        <TableCell>
          <IconButton onClick={() => onEditProjeto(projeto)} size="small">
            <EditIcon />
          </IconButton>
        </TableCell>
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
                      <TableCell>Horas Planejadas</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projeto.alocacoes.map((alocacao) => (
                      <TableRow key={alocacao.id}>
                        <TableCell>{alocacao.recurso.nome}</TableCell>
                        <TableCell>{alocacao.data_inicio_alocacao}</TableCell>
                        <TableCell>{alocacao.data_fim_alocacao || 'Indeterminado'}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenModal(alocacao)}
                          >
                            Editar Horas
                          </Button>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => onEditAlocacao(alocacao)} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => onDeleteAlocacao(alocacao)} size="small">
                            <DeleteIcon />
                          </IconButton>
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

export default function ProjetosDetalhesTable({ projetos, onEditProjeto, onEditAlocacao, onDeleteAlocacao, onSaveHoras }) {
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
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projetos.map((projeto) => (
            <Row
              key={projeto.id}
              projeto={projeto}
              onEditProjeto={onEditProjeto}
              onEditAlocacao={onEditAlocacao}
              onDeleteAlocacao={onDeleteAlocacao}
              onSaveHoras={onSaveHoras}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
