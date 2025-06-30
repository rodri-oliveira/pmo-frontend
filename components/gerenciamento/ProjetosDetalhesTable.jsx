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
import EditIcon from '@mui/icons-material/Edit';

// Nomes dos meses para exibição amigável
const mesesNomes = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const wegBlue = '#00579d';

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
      // Converte para estrutura usada no modal (campo horas)
      const convertidas = alocacao.horas_planejadas.map((hp) => ({
        id: hp.id ?? null,
        ano: hp.ano,
        mes: hp.mes,
        horas: hp.horas_planejadas ?? hp.horas ?? 0,
      }));
      setHoras(convertidas);
    } else {
      setHoras([]);
    }
    setIsDirty(false);
  }, [alocacao]);

  const handleChange = (index, field, value) => {
    const newHoras = [...horas];
    // Permite string vazia para digitação manual
    if (field === 'horas') {
      newHoras[index][field] = value === '' ? '' : value.replace(/^0+(?=\d)/, '');
    } else {
      newHoras[index][field] = value;
    }
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
    // Remove entradas inválidas (sem ano, mês ou horas <= 0)
    const horasFiltradas = horas.filter(h =>
      h.ano && h.mes && h.horas !== '' && h.horas !== null && h.horas !== undefined && Number(h.horas) > 0
    );
    // Converte horas para número
    const horasConvertidas = horasFiltradas.map(h => ({
      ...h,
      horas: parseInt(h.horas, 10) || 0
    }));
    console.log('Horas convertidas para salvar:', horasConvertidas); // DEBUG
    if (horasConvertidas.length > 0) {
      onSave(projetoId, alocacao.id, horasConvertidas);
    }
    onClose();
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Editar Horas Planejadas</Typography>
        <Grid container spacing={2} sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
          {horas.map((h, index) => (
            <Grid item xs={12} container spacing={1} key={index} alignItems="center">
              <Grid item xs={3}>
                <TextField
                  label="Mês"
                  value={mesesNomes[h.mes - 1]}
                  disabled
                  fullWidth
                />
              </Grid>
              <Grid item xs={3}><TextField label="Ano" type="number" value={h.ano} onChange={(e) => handleChange(index, 'ano', e.target.value)} fullWidth /></Grid>
              <Grid item xs={4}><TextField label="Horas" type="number" value={h.horas ?? ''} onChange={(e) => handleChange(index, 'horas', e.target.value)} fullWidth inputProps={{ min: 0 }}/></Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => handleRemove(index)} sx={{ color: 'error.main' }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
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
        
        <TableCell>{projeto.data_inicio_prevista || 'N/A'}</TableCell>

      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Alocações
              </Typography>
              {projeto.alocacoes && projeto.alocacoes.length > 0 ? (
                <Table size="small" aria-label="alocacoes">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Recurso</TableCell>
                      <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Data Início</TableCell>
                      <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Data Fim</TableCell>
                      <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Horas Planejadas</TableCell>
                      <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projeto.alocacoes.map((alocacao) => (
                      <TableRow key={alocacao.id}>
                        <TableCell>{alocacao.recurso.nome}</TableCell>
                        <TableCell>{alocacao.data_inicio_alocacao}</TableCell>
                        <TableCell>{alocacao.data_fim_alocacao || 'Indeterminado'}</TableCell>
                        <TableCell>{alocacao.status_alocacao?.nome || 'N/A'}</TableCell>
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
                            <DeleteIcon color="error" />
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
    <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
      <Table stickyHeader aria-label="collapsible table">
      
        <TableHead>
          <TableRow sx={{ backgroundColor: wegBlue }}>
            <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }} />
            <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Nome do Projeto</TableCell>
            <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Seção</TableCell>
            <TableCell sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>Início Previsto</TableCell>
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
