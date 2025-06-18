"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Snackbar,
  Switch, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import { 
  getSecoes, createSecao, updateSecao, deleteSecao, 
  getEquipes, createEquipe, updateEquipe, deleteEquipe, 
  getRecursos, createRecurso, updateRecurso, deleteRecurso,
  getStatusProjetos, createStatusProjeto, updateStatusProjeto, deleteStatusProjeto
} from '@/lib/api';
import EquipeModal from './EquipeModal';
import RecursoModal from './RecursoModal';
import StatusProjetoModal from './StatusProjetoModal';

const wegBlue = '#00579d';

// Modal Component
function SecaoModal({ open, onClose, onSave, secao }) {
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    setFormData({ nome: secao?.nome || '', descricao: secao?.descricao || '' });
  }, [secao, open]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSave = () => onSave(formData);
  const isEditing = !!secao;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: wegBlue, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Seção' : 'Nova Seção'}
      </DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" name="nome" label="Nome da Seção" type="text" fullWidth variant="outlined" value={formData.nome} onChange={handleChange} required sx={{ mt: 1 }}/>
        <TextField margin="dense" name="descricao" label="Descrição" type="text" fullWidth multiline rows={4} variant="outlined" value={formData.descricao} onChange={handleChange} />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: wegBlue }}>{isEditing ? 'Salvar' : 'Criar'}</Button>
      </DialogActions>
    </Dialog>
  );
}

const managementTypes = [
  { value: 'secoes', label: 'Seções' },
  { value: 'equipes', label: 'Equipes' },
  { value: 'recursos', label: 'Recursos' },
  { value: 'statusProjetos', label: 'Status de Projeto' },
];

export default function GerenciamentoCascade() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'secoes';

  const tipoGerenciamento = tab;
  const [secoes, setSecoes] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [statusProjetos, setStatusProjetos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');

  const fetchSecoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Buscando seções...');
    try {
      const data = await getSecoes(false);
      console.log('Dados recebidos da API:', data);

      let items = [];
      if (Array.isArray(data?.items)) {
        items = data.items;
      } else if (Array.isArray(data)) {
        items = data;
      }

      setSecoes(items);
    } catch (err) {
      console.error('Erro ao buscar seções:', err);
      setError(err.message);
      setSecoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

    const fetchEquipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEquipes();
      setEquipes(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setEquipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecursos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecursos();
      setRecursos(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setRecursos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatusProjetos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStatusProjetos(showInactive);
      setStatusProjetos(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setStatusProjetos([]);
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    if (tipoGerenciamento === 'secoes') {
      fetchSecoes();
    } else if (tipoGerenciamento === 'equipes') {
      fetchSecoes();
      fetchEquipes();
    } else if (tipoGerenciamento === 'recursos') {
      fetchEquipes();
      fetchRecursos();
    } else if (tipoGerenciamento === 'statusProjetos') {
      fetchStatusProjetos();
    }
  }, [tipoGerenciamento, fetchSecoes, fetchEquipes, fetchRecursos, fetchStatusProjetos, showInactive]);

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setModalOpen(false);
  };

    const handleSave = async (data) => {
    setLoading(true);
    try {
      let message = '';
      if (tipoGerenciamento === 'secoes') {
        if (currentItem) {
          await updateSecao(currentItem.id, data);
          message = 'Seção atualizada com sucesso!';
        } else {
          await createSecao(data);
          message = 'Seção criada com sucesso!';
        }
        fetchSecoes();
      } else if (tipoGerenciamento === 'equipes') {
        if (currentItem) {
          await updateEquipe(currentItem.id, data);
          message = 'Equipe atualizada com sucesso!';
        } else {
          await createEquipe(data);
          message = 'Equipe criada com sucesso!';
        }
        fetchEquipes();
      } else if (tipoGerenciamento === 'recursos') {
        if (currentItem) {
          await updateRecurso(currentItem.id, data);
          message = 'Recurso atualizado com sucesso!';
        } else {
          await createRecurso(data);
          message = 'Recurso criado com sucesso!';
        }
        fetchRecursos();
      } else if (tipoGerenciamento === 'statusProjetos') {
        if (currentItem) {
          await updateStatusProjeto(currentItem.id, data);
          message = 'Status de projeto atualizado com sucesso!';
        } else {
          await createStatusProjeto(data);
          message = 'Status de projeto criado com sucesso!';
        }
        fetchStatusProjetos();
      }
      setNotification({ open: true, message, severity: 'success' });
    } catch (err) {
      setNotification({ open: true, message: `Erro: ${err.message}`, severity: 'error' });
    } finally {
      handleCloseModal();
      setLoading(false);
    }
  };

        const handleDelete = async (id) => {
    const typeName = tipoGerenciamento === 'secoes' ? 'seção' : tipoGerenciamento === 'equipes' ? 'equipe' : tipoGerenciamento === 'recursos' ? 'recurso' : 'status de projeto';
    const confirmationMessage = `Tem certeza que deseja inativar este ${typeName}?`;

    if (window.confirm(confirmationMessage)) {
      try {
        if (tipoGerenciamento === 'secoes') {
          await deleteSecao(id);
          fetchSecoes();
        } else if (tipoGerenciamento === 'equipes') {
          await deleteEquipe(id);
          fetchEquipes();
        } else if (tipoGerenciamento === 'recursos') {
          await deleteRecurso(id);
          fetchRecursos();
        } else if (tipoGerenciamento === 'statusProjetos') {
          await deleteStatusProjeto(id);
          fetchStatusProjetos();
        }
        setNotification({ open: true, message: `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} inativado(a) com sucesso!`, severity: 'success' });
      } catch (err) {
        setNotification({ open: true, message: `Erro ao inativar: ${err.message}`, severity: 'error' });
      }
    }
  };

        const handleReactivate = async (id) => {
    const typeName = tipoGerenciamento === 'secoes' ? 'seção' : tipoGerenciamento === 'equipes' ? 'equipe' : tipoGerenciamento === 'recursos' ? 'recurso' : 'status de projeto';
    if (window.confirm(`Tem certeza que deseja reativar este ${typeName}?`)) {
      try {
        if (tipoGerenciamento === 'secoes') {
          await updateSecao(id, { ativo: true });
          fetchSecoes();
        } else if (tipoGerenciamento === 'equipes') {
          await updateEquipe(id, { ativo: true });
          fetchEquipes();
        } else if (tipoGerenciamento === 'recursos') {
          await updateRecurso(id, { ativo: true });
          fetchRecursos();
        } else if (tipoGerenciamento === 'statusProjetos') {
          await updateStatusProjeto(id, { ativo: true });
          fetchStatusProjetos();
        }
        setNotification({ open: true, message: `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} reativado(a) com sucesso!`, severity: 'success' });
      } catch (err) {
        setNotification({ open: true, message: `Erro ao reativar: ${err.message}`, severity: 'error' });
      }
    }
  };

  const renderSecoes = () => {
    const displayedSecoes = secoes
      .filter(s => showInactive || s.ativo === true)
      .filter(s => s.nome.toLowerCase().includes(filtroNome.toLowerCase()));

    return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Gerenciar Seções</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
                label="Filtrar por nome"
                variant="outlined"
                size="small"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                sx={{ width: 250 }}
            />
            <FormControlLabel
                control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
                label="Mostrar inativos"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ backgroundColor: wegBlue }}>Nova Seção</Button>
        </Box>
      </Box>
      {loading && <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {!loading && !error && (
        displayedSecoes.length === 0 ? (
          <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            Nenhuma seção encontrada. Clique em &quot;Nova Seção&quot; para adicionar a primeira.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ backgroundColor: wegBlue, position: 'sticky', top: 0, zIndex: 1 }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedSecoes.map((secao) => (
                  <TableRow key={secao.id} sx={{ backgroundColor: !secao.ativo ? '#fafafa' : 'inherit' }}>
                    <TableCell>{secao.id}</TableCell>
                    <TableCell>{secao.nome}</TableCell>
                    <TableCell>{secao.descricao}</TableCell>
                    <TableCell>{secao.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(secao)}><EditIcon /></IconButton>
                      {secao.ativo ? (
                        <IconButton onClick={() => handleDelete(secao.id)}><DeleteIcon color="error"/></IconButton>
                      ) : (
                        <IconButton onClick={() => handleReactivate(secao.id)}><RestoreFromTrashIcon /></IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
        )
      )}
      
    </Box>
  )};

  const renderEquipes = () => {
    const displayedEquipes = equipes
      .filter(e => showInactive || e.ativo === true)
      .filter(e => e.nome.toLowerCase().includes(filtroNome.toLowerCase()));
    const secoesMap = secoes.reduce((acc, secao) => ({ ...acc, [secao.id]: secao.nome }), {});

    return (
      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Gerenciar Equipes</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
                label="Filtrar por nome"
                variant="outlined"
                size="small"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                sx={{ width: 250 }}
            />
            <FormControlLabel
              control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
              label="Mostrar inativos"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ backgroundColor: wegBlue }}>Nova Equipe</Button>
          </Box>
        </Box>
        {loading && <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {!loading && !error && (
          displayedEquipes.length === 0 ? (
            <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
              Nenhuma equipe encontrada.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ backgroundColor: wegBlue, position: 'sticky', top: 0, zIndex: 1 }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Seção</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedEquipes.map((equipe) => (
                    <TableRow key={equipe.id} sx={{ backgroundColor: !equipe.ativo ? '#fafafa' : 'inherit' }}>
                      <TableCell>{equipe.nome}</TableCell>
                      <TableCell>{secoesMap[equipe.secao_id] || 'N/A'}</TableCell>
                      <TableCell>{equipe.descricao}</TableCell>
                      <TableCell>{equipe.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenModal(equipe)}><EditIcon /></IconButton>
                        {equipe.ativo ? (
                          <IconButton onClick={() => handleDelete(equipe.id)}><DeleteIcon color="error"/></IconButton>
                        ) : (
                          <IconButton onClick={() => handleReactivate(equipe.id)}><RestoreFromTrashIcon /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          )
        )}
      </Box>
    );
  };

  const renderRecursos = () => {
    const displayedRecursos = recursos
      .filter(r => showInactive || r.ativo === true)
      .filter(r => r.nome.toLowerCase().includes(filtroNome.toLowerCase()));
    const equipesMap = equipes.reduce((acc, equipe) => ({ ...acc, [equipe.id]: equipe.nome }), {});

    return (
      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Gerenciar Recursos</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
                label="Filtrar por nome"
                variant="outlined"
                size="small"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                sx={{ width: 250 }}
            />
            <FormControlLabel
              control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
              label="Mostrar inativos"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ backgroundColor: wegBlue }}>Novo Recurso</Button>
          </Box>
        </Box>
        {loading && <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {!loading && !error && (
          displayedRecursos.length === 0 ? (
            <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
              Nenhum recurso encontrado.
            </Typography>
          ) : (
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ backgroundColor: wegBlue, position: 'sticky', top: 0, zIndex: 1 }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Equipe Principal</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedRecursos.map((recurso) => (
                    <TableRow key={recurso.id} sx={{ backgroundColor: !recurso.ativo ? '#fafafa' : 'inherit' }}>
                      <TableCell>{recurso.nome}</TableCell>
                      <TableCell>{recurso.email}</TableCell>
                      <TableCell>{equipesMap[recurso.equipe_principal_id] || 'N/A'}</TableCell>
                      <TableCell>{recurso.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenModal(recurso)}><EditIcon /></IconButton>
                        {recurso.ativo ? (
                          <IconButton onClick={() => handleDelete(recurso.id)}><DeleteIcon color="error"/></IconButton>
                        ) : (
                          <IconButton onClick={() => handleReactivate(recurso.id)}><RestoreFromTrashIcon /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          )
        )}
      </Box>
    );
  };

  const renderStatusProjetos = () => {
    const displayedStatusProjetos = statusProjetos
      .filter(s => showInactive || s.ativo === true)
      .filter(s => s.nome.toLowerCase().includes(filtroNome.toLowerCase()));

    return (
      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Gerenciar Status de Projeto</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
                label="Filtrar por nome"
                variant="outlined"
                size="small"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                sx={{ width: 250 }}
            />
            <FormControlLabel
              control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
              label="Mostrar inativos"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ backgroundColor: wegBlue }}>Novo Status</Button>
          </Box>
        </Box>
        {loading && <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {!loading && !error && (
          displayedStatusProjetos.length === 0 ? (
            <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
              Nenhum status de projeto encontrado.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ backgroundColor: wegBlue }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ordem</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nome</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Final?</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedStatusProjetos.map((status) => (
                    <TableRow key={status.id} sx={{ backgroundColor: !status.ativo ? '#fafafa' : 'inherit' }}>
                      <TableCell>{status.ordem_exibicao}</TableCell>
                      <TableCell>{status.nome}</TableCell>
                      <TableCell>{status.descricao}</TableCell>
                      <TableCell>{status.is_final ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>{status.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenModal(status)}><EditIcon /></IconButton>
                        {status.ativo ? (
                          <IconButton onClick={() => handleDelete(status.id)}><DeleteIcon color="error"/></IconButton>
                        ) : (
                          <IconButton onClick={() => handleReactivate(status.id)}><RestoreFromTrashIcon /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 4, background: 'white', borderRadius: '8px' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, color: wegBlue, fontWeight: 'bold' }}>
        Gerenciamento
      </Typography>
      <FormControl sx={{ mt: 2, minWidth: 250 }} size="small">
        <InputLabel>Tipo de Gerenciamento</InputLabel>
        <Select value={tipoGerenciamento} label="Tipo de Gerenciamento" onChange={(e) => {
                const newTab = e.target.value;
                setFiltroNome(''); // Limpa o filtro ao trocar de aba
                router.push(`${pathname}?tab=${newTab}`);
              }}>
          {managementTypes.map(type => (
            <MenuItem key={type.value} value={type.value} disabled={type.disabled}>{type.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

            {tipoGerenciamento === 'secoes' && renderSecoes()}
            {tipoGerenciamento === 'equipes' && renderEquipes()}
      {tipoGerenciamento === 'recursos' && renderRecursos()}
      {tipoGerenciamento === 'statusProjetos' && renderStatusProjetos()}

      <SecaoModal open={modalOpen && tipoGerenciamento === 'secoes'} onClose={handleCloseModal} onSave={handleSave} secao={currentItem} />
      <EquipeModal open={modalOpen && tipoGerenciamento === 'equipes'} onClose={handleCloseModal} onSave={handleSave} equipe={currentItem} secoes={secoes.filter(s => s.ativo)} />
      <RecursoModal open={modalOpen && tipoGerenciamento === 'recursos'} onClose={handleCloseModal} onSave={handleSave} recurso={currentItem} equipes={equipes.filter(e => e.ativo)} />
      <StatusProjetoModal open={modalOpen && tipoGerenciamento === 'statusProjetos'} onClose={handleCloseModal} onSave={handleSave} statusProjeto={currentItem} />


      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
