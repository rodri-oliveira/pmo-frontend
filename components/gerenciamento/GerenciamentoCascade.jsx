"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback, useMemo, useDeferredValue, startTransition } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress,
  Select, MenuItem, FormControl, InputLabel,
  Alert, Snackbar,
  Switch, FormControlLabel, TextField, TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

// Importações dos serviços de API padronizados
import { getSecoes, createSecao, updateSecao, deleteSecao } from '../../services/secoes';
import { getEquipes, createEquipe, updateEquipe, deleteEquipe } from '../../services/equipes';
import { getRecursos, createRecurso, updateRecurso, deleteRecurso } from '../../services/recursos';
import { getStatusProjetos, createStatusProjeto, updateStatusProjeto, deleteStatusProjeto } from '../../services/statusProjetos';
import { getProjetos, createProjeto, createProjetoComAlocacoes, updateProjeto, deleteProjeto } from '../../services/projetos';
import { getAlocacoes, createAlocacao, updateAlocacao, deleteAlocacao } from '../../services/alocacoes';
import PlanejamentoHoras from './PlanejamentoHoras';

// Importações dos Modais (lazy loaded para melhorar performance)
import dynamic from 'next/dynamic';

const SecaoModal = dynamic(() => import('./SecaoModal'), { ssr: false });
const EquipeModal = dynamic(() => import('./EquipeModal'), { ssr: false });
const RecursoModal = dynamic(() => import('./RecursoModal'), { ssr: false });
const StatusProjetoModal = dynamic(() => import('./StatusProjetoModal'), { ssr: false });
const ProjetoModal = dynamic(() => import('./ProjetoModal'), { ssr: false });
const AlocacaoModal = dynamic(() => import('./AlocacaoModal'), { ssr: false });

const wegBlue = '#00579d';

const managementTypes = [
  { value: 'projetos', label: 'Projetos' },
  { value: 'statusProjetos', label: 'Status de Projeto' },
  { value: 'secoes', label: 'Seções' },
  { value: 'equipes', label: 'Equipes' },
  { value: 'recursos', label: 'Recursos' },
  { value: 'alocacoes', label: 'Alocações' },
  { value: 'planejamento_horas', label: 'Planejamento de Horas' },
];

export default function GerenciamentoCascade() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'projetos';

  // Estados para os dados
  const [projetos, setProjetos] = useState([]);
  const [secoes, setSecoes] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [statusProjetos, setStatusProjetos] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [modalError, setModalError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  // Usa algoritmo concurrent do React 18 para adiar buscas sem bloquear UI
  const deferredFiltro = useDeferredValue(filtroNome);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Função reutilizável para buscar dados, agora visível para outros handlers
  const fetchData = useCallback(async (showSpinner = true) => {
    setLoading(true);
    setError(null);
    
    const params = {
      apenas_ativos: !showInactive,
      limit: rowsPerPage,
      skip: page * rowsPerPage,
      nome: deferredFiltro || null, // Envia o termo de busca para o backend
    };

    try {
      switch (tab) {
        case 'projetos': {
          const projData = await getProjetos(params);
          const items = Array.isArray(projData) ? projData : projData.items;
          const totalCount = Array.isArray(projData) ? projData.length : (projData.total || (projData.items ? projData.items.length : 0));
          setProjetos(items || []);
          setTotal(totalCount || 0);
          const [secData, statData] = await Promise.all([
            getSecoes({ apenas_ativos: true }),
            getStatusProjetos({ apenas_ativos: true })
          ]);
          setSecoes(Array.isArray(secData) ? secData : secData.items || []);
          setStatusProjetos(Array.isArray(statData) ? statData : statData.items || []);
          break;
        }
        case 'secoes': {
          const data = await getSecoes(params);
          const items = Array.isArray(data) ? data : data.items;
          const totalCount = Array.isArray(data) ? data.length : (data.total || (data.items ? data.items.length : 0));
          setSecoes(items || []);
          setTotal(totalCount || 0);
          break;
        }
        case 'equipes': {
          const [eqData, secData] = await Promise.all([getEquipes(params), getSecoes({ apenas_ativos: true })]);
          const items = Array.isArray(eqData) ? eqData : eqData.items;
          const totalCount = Array.isArray(eqData) ? eqData.length : (eqData.total || (eqData.items ? eqData.items.length : 0));
          setEquipes(items || []);
          setTotal(totalCount || 0);
          setSecoes(Array.isArray(secData) ? secData : secData.items || []);
          break;
        }
        case 'recursos': {
          const [recData, eqData] = await Promise.all([getRecursos(params), getEquipes({ apenas_ativos: true })]);
          const items = Array.isArray(recData) ? recData : recData.items;
          const totalCount = Array.isArray(recData) ? recData.length : (recData.total || (recData.items ? recData.items.length : 0));
          setRecursos(items || []);
          setTotal(totalCount || 0);
          setEquipes(Array.isArray(eqData) ? eqData : eqData.items || []);
          break;
        }
        case 'statusProjetos': {
          const data = await getStatusProjetos(params);
          const items = Array.isArray(data) ? data : data.items;
          const totalCount = Array.isArray(data) ? data.length : (data.total || (data.items ? data.items.length : 0));
          setStatusProjetos(items || []);
          setTotal(totalCount || 0);
          break;
        }
        case 'alocacoes': {
          const [alocData, projData, recData, statAlocData] = await Promise.all([
              getAlocacoes(params),
              getProjetos({ limit: 1000 }),
              getRecursos({ limit: 1000 }),
              getStatusProjetos({ limit: 1000 }),
          ]);
          const items = Array.isArray(alocData) ? alocData : alocData.items;
          const totalCount = Array.isArray(alocData) ? alocData.length : (alocData.total || (alocData.items ? alocData.items.length : 0));
          setAlocacoes(items || []);
          setTotal(totalCount || 0);
          setProjetos(Array.isArray(projData) ? projData : projData.items || []);
          setRecursos(Array.isArray(recData) ? recData : recData.items || []);
          setStatusProjetos(Array.isArray(statAlocData) ? statAlocData : statAlocData.items || []);
          break;
        }
        case 'planejamento_horas':
          // O componente PlanejamentoHoras busca seus próprios dados.
          // Apenas garantimos que o estado de total seja zerado.
          setTotal(0);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Erro ao buscar dados para ${tab}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, showInactive, page, rowsPerPage, deferredFiltro]);

  // Reseta a página para 0 quando o filtro de nome ou de inativos muda
  useEffect(() => {
    setPage(0);
  }, [deferredFiltro, showInactive]);

  // Carrega dados quando a função de busca é recriada (devido a mudança de dependências)
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const handleOpenModal = useCallback((item = null) => {
    setCurrentItem(item);
    setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setCurrentItem(null);
    setModalOpen(false);
  setModalError('');
  };

  const handleSave = async (data, keepModalOpen = false) => {
    setLoading(true);
    try {
      const isEditing = !!currentItem;
      const apiMap = {
        projetos: { create: createProjetoComAlocacoes, update: updateProjeto },
        secoes: { create: createSecao, update: updateSecao },
        equipes: { create: createEquipe, update: updateEquipe },
        recursos: { create: createRecurso, update: updateRecurso },
        statusProjetos: { create: createStatusProjeto, update: updateStatusProjeto },
        alocacoes: { create: createAlocacao, update: updateAlocacao },
      };
      const { create, update } = apiMap[tab];
      const typeName = managementTypes.find(t => t.value === tab).label.slice(0, -1);

      if (isEditing) {
        await update(currentItem.id, data);
        setNotification({ open: true, message: `${typeName} atualizado com sucesso!`, severity: 'success' });
      } else {
        const newItem = await create(data);
        setNotification({ open: true, message: `${typeName} criado com sucesso!`, severity: 'success' });
        if (keepModalOpen) {
          setCurrentItem(newItem.projeto || newItem);
        }
      }
      
      await fetchData();

      if (!keepModalOpen) {
        handleCloseModal();
      }
    } catch (err) {
      console.error(`[handleSave] Falha ao salvar: ${err.message}`);
      const errMsg = err.response?.data?.detail || err.message || 'Ocorreu um erro.';
      setModalError(errMsg);
      // Mantém o modal aberto para que o usuário possa corrigir os dados.
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Manipula a exclusão ou restauração de itens com memoização correta
  const handleDeleteToggle = useCallback(async (item) => {
    const action = item.ativo ? 'inativar' : 'reativar';
    if (!window.confirm(`Tem certeza que deseja ${action} este item?`)) return;

    setLoading(true);
    try {
      const apiMap = {
        projetos: { del: deleteProjeto, update: updateProjeto },
        secoes: { del: deleteSecao, update: updateSecao },
        equipes: { del: deleteEquipe, update: updateEquipe },
        recursos: { del: deleteRecurso, update: updateRecurso },
        statusProjetos: { del: deleteStatusProjeto, update: updateStatusProjeto },
      alocacoes: { del: deleteAlocacao, update: updateAlocacao },
      };
      const { del, update } = apiMap[tab];

      if (item.ativo) {
        await del(item.id);
      } else {
        await update(item.id, { ativo: true });
      }
      setNotification({ open: true, message: `Item ${action} com sucesso!`, severity: 'success' });
      await fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Ocorreu um erro.';
      setNotification({ open: true, message: `Erro: ${errorMsg}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [tab, fetchData]);

  const handleTabChange = (event) => {
    router.push(`${pathname}?tab=${event.target.value}`);
  };

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Volta para a primeira página ao mudar o número de itens por página
  }, []);

  /* =====================
     Memoizações de dados
  ===================== */
  const secaoMap = useMemo(() => secoes.reduce((acc, s) => ({ ...acc, [s.id]: s.nome }), {}), [secoes]);
  const equipeMap = useMemo(() => equipes.reduce((acc, e) => ({ ...acc, [e.id]: e.nome }), {}), [equipes]);
  const statusMap = useMemo(() => statusProjetos.reduce((acc, s) => ({ ...acc, [s.id]: s.nome }), {}), [statusProjetos]);
  const projetoMap = useMemo(() => projetos.reduce((acc, p) => ({ ...acc, [p.id]: p.nome }), {}), [projetos]);
  const recursoMap = useMemo(() => recursos.reduce((acc, r) => ({ ...acc, [r.id]: r.nome }), {}), [recursos]);
  // O statusMap existente é para Status de Projeto. Vamos usá-lo para alocações também, conforme API.
  const statusAlocacaoMap = statusMap;

  const currentData = useMemo(() => {
    const dataMap = { projetos, secoes, equipes, recursos, statusProjetos, alocacoes };
    return dataMap[tab] || [];
  }, [tab, projetos, secoes, equipes, recursos, statusProjetos, alocacoes]);

  // Para alocações, garantimos que cada item possua "equipe_id" derivado do recurso, caso ainda não exista.
  const currentDataWithDerivatives = useMemo(() => {
    if (tab !== 'alocacoes') return currentData;
    return currentData.map(aloc => ({
      ...aloc,
      equipe_id: aloc.equipe_id || recursoMap[aloc.recurso_id] ? recursos.find(r => r.id === aloc.recurso_id)?.equipe_id : null,
    }));
  }, [currentData, tab, recursos, recursoMap]);

  const filteredData = useMemo(() => {
    return currentDataWithDerivatives.filter(item => {
      const isEntityActive = item.ativo === undefined ? true : item.ativo;
      const isVisible = showInactive || isEntityActive;
      if (!isVisible) return false;
      if (!deferredFiltro) return true;

      const lowerCaseFilter = deferredFiltro.toLowerCase();

      if (tab === 'alocacoes') {
        return (
          item.projeto_nome?.toLowerCase().includes(lowerCaseFilter) ||
          item.recurso_nome?.toLowerCase().includes(lowerCaseFilter) ||
          item.equipe_nome?.toLowerCase().includes(lowerCaseFilter) ||
          item.observacao?.toLowerCase().includes(lowerCaseFilter)
        );
      }

      // Filtro padrão para outras abas
      return (
        item.nome?.toLowerCase().includes(lowerCaseFilter) ||
        item.descricao?.toLowerCase().includes(lowerCaseFilter)
      );
    });
  }, [currentDataWithDerivatives, showInactive, deferredFiltro, tab]);

  const columns = {
    projetos: [
      { id: 'nome', label: 'Nome' },
      { id: 'descricao', label: 'Descrição' },
      { id: 'secao_id', label: 'Seção', format: (val) => secaoMap[val] || 'N/A' },
      { id: 'status_projeto_id', label: 'Status', format: (val) => statusMap[val] || 'N/A' },
      { id: 'data_inicio_prevista', label: 'Início Previsto', format: (val) => val ? new Date(val + 'T00:00:00').toLocaleDateString() : 'N/A' },
    ],
    secoes: [{ id: 'nome', label: 'Nome' }, { id: 'descricao', label: 'Descrição' }],
    equipes: [{ id: 'nome', label: 'Nome' }, { id: 'descricao', label: 'Descrição' }, { id: 'secao_id', label: 'Seção', format: (val) => secaoMap[val] || 'N/A' }],
    recursos: [{ id: 'nome', label: 'Nome' }, { id: 'equipe_principal_id', label: 'Equipe', format: (val) => equipeMap[val] || 'N/A' }],
    statusProjetos: [{ id: 'nome', label: 'Nome' }, { id: 'descricao', label: 'Descrição' }],
    alocacoes: [
      { id: 'projeto_nome', label: 'Projeto' },
      { id: 'recurso_nome', label: 'Recurso' },
      { id: 'equipe_nome', label: 'Equipe' },
      { id: 'status_alocacao_id', label: 'Status', format: (val) => statusAlocacaoMap[val] || 'N/A' },
      { id: 'data_inicio_alocacao', label: 'Início', format: (val) => val ? new Date(val + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A' },
      { id: 'observacao', label: 'Observação' },
    ],
  };
  const currentColumns = columns[tab];

  // Callbacks estáveis para evitar recriação nas dependências
  const handleEdit = useCallback((item) => handleOpenModal(item), [handleOpenModal]);
  const handleDelete = useCallback((item) => handleDeleteToggle(item), [handleDeleteToggle]);

  const renderedTable = useMemo(() => {
    if (!currentColumns) return <Typography>Selecione um tipo de gerenciamento.</Typography>;

    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {currentColumns.map(col => (
                  <TableCell key={col.id} sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold' }}>
                    {col.label}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ backgroundColor: wegBlue, color: 'white', fontWeight: 'bold', width: '120px' }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={item.id || index} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  {currentColumns.map(col => (
                    <TableCell key={col.id}>{col.format ? col.format(item[col.id]) : item[col.id]}</TableCell>
                  ))}
                  <TableCell>
                    <IconButton onClick={() => handleEdit(item)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(item)}>
                      {/* Para alocações, o ícone de deletar será sempre vermelho, pois não há status 'inativo' explícito */}
                      <DeleteIcon sx={{ color: '#d32f2f' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={total} // Correção: usar o estado 'total' em vez de data.length
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    );
  }, [filteredData, currentColumns, handleEdit, handleDelete, total, rowsPerPage, page, handleChangePage, handleChangeRowsPerPage]);

  /* =====================
     Renderização
  ===================== */

  // O retorno da função antes era 'renderContent()'; substituímos pelo JSX memoizado.
  const renderContent = () => renderedTable;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: wegBlue, fontWeight: 'bold' }}>
        Gerenciamento do Sistema
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel>Tipo de Gerenciamento</InputLabel>
            <Select value={tab} label="Tipo de Gerenciamento" onChange={handleTabChange}>
              {managementTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Filtrar por nome ou descrição..."
            variant="outlined"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          <FormControlLabel
            control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
            label="Mostrar inativos"
            sx={{ ml: 'auto' }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ backgroundColor: wegBlue, '&:hover': { backgroundColor: '#004175' } }}
          >
            Novo Item
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : tab === 'planejamento_horas' ? (
        <PlanejamentoHoras setNotification={setNotification} />
      ) : (
        renderContent()
      )}

      {/* Modais Renderizados de forma performática */}
      {tab === 'projetos' && <ProjetoModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} projeto={currentItem} secoes={secoes} statusProjetos={statusProjetos} apiError={modalError} />}
      {tab === 'alocacoes' && <AlocacaoModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} item={currentItem} projetos={projetos} recursos={recursos} statusOptions={statusProjetos} />}
      {tab === 'secoes' && <SecaoModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} secao={currentItem} />}
      {tab === 'equipes' && <EquipeModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} equipe={currentItem} secoes={secoes} />}
      {tab === 'recursos' && <RecursoModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} recurso={currentItem} equipes={equipes} />}
      {tab === 'statusProjetos' && <StatusProjetoModal open={modalOpen} onClose={handleCloseModal} onSave={handleSave} statusProjeto={currentItem} />}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
