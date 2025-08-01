"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useDeferredValue,
  useTransition,
} from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  TextField,
  TablePagination,
  Autocomplete,
  Tooltip
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

// Importações dos serviços de API padronizados
import {
  getSecoes,
  createSecao,
  updateSecao,
  deleteSecao,
} from "../../services/secoes";
import {
  getEquipes,
  createEquipe,
  updateEquipe,
  deleteEquipe,
} from "../../services/equipes";
import {
  getRecursos,
  createRecurso,
  updateRecurso,
  deleteRecurso,
} from "../../services/recursos";
import {
  getStatusProjetos,
  createStatusProjeto,
  updateStatusProjeto,
  deleteStatusProjeto,
} from "../../services/statusProjetos";
import {
  getProjetos,
  getProjetosDetalhados,
  createProjetoComAlocacoes,
  updateProjeto,
  deleteProjeto,
  
} from "../../services/projetos";
import {
  getAlocacoes,
  createAlocacao,
  updateAlocacao,
  deleteAlocacao,
} from "../../services/alocacoes.js"; // Corrigido o caminho de importação


// Importações dos Modais (lazy loaded para melhorar performance)
import dynamic from "next/dynamic";

const SecaoModal = dynamic(() => import("./SecaoModal"), { ssr: false });
const EquipeModal = dynamic(() => import("./EquipeModal"), { ssr: false });
const RecursoModal = dynamic(() => import("./RecursoModal"), { ssr: false });
const StatusProjetoModal = dynamic(() => import("./StatusProjetoModal"), {
  ssr: false,
});
const ProjetoModal = dynamic(() => import("./ProjetoModal"), { ssr: false });
const AlocacaoModal = dynamic(() => import("./AlocacaoModal"), { ssr: false });
const ProjetosDetalhesTable = dynamic(() => import("./ProjetosDetalhesTable"), {
  ssr: false,
});

const wegBlue = "#00579d";

const managementTypes = [
  { value: "projetos", label: "Projetos e Planejamento" },
  { value: "statusProjetos", label: "Status de Projeto" },
  { value: "secoes", label: "Seções" },
  { value: "equipes", label: "Equipes" },
  { value: "recursos", label: "Recursos" },
];

export default function GerenciamentoCascade() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "projetos";

  // Estados para os dados
  const [projetos, setProjetosEPlanejamento] = useState([]);
  const [secoes, setSecoes] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [statusProjetos, setStatusProjetos] = useState([]);

  // Lista completa de projetos da seção para o modal de alocação
  const [projetosDaSecao, setProjetosEPlanejamentoDaSecao] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [modalError, setModalError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailedView, setDetailedView] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [alocacaoModalOpen, setAlocacaoModalOpen] = useState(false);
  const [currentAlocacao, setCurrentAlocacao] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroSecao, setFiltroSecao] = useState("");
  const [filtroRecurso, setFiltroRecurso] = useState("");
  // Usa algoritmo concurrent do React 18 para adiar buscas sem bloquear UI
  const deferredFiltro = useDeferredValue(filtroNome);
  const [total, setTotal] = useState(0);

  // Opções de recursos filtradas por seção em visão detalhada
  const recursosOptions = useMemo(() => {
    if (tab === "projetos" && detailedView && filtroSecao) {
      return projetos
        .filter((p) => p.secao?.id === filtroSecao)
        .flatMap((p) => p.alocacoes.map((a) => a.recurso.nome))
        .filter((v, i, a) => a.indexOf(v) === i);
    }
    return recursos.map((r) => r.nome);
  }, [tab, detailedView, filtroSecao, projetos, recursos]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Função reutilizável para buscar dados, agora visível para outros handlers
  const fetchData = useCallback(
    async (showSpinner = true) => {
      setLoading(true);
      setError(null);

      const params = {
        apenas_ativos: !showInactive,
        skip: page * rowsPerPage, // API espera skip (offset)
        limit: rowsPerPage,
        search: deferredFiltro || null,
        ...(filtroSecao && { secao_id: filtroSecao }),
        ...(filtroRecurso && { recurso: filtroRecurso }),
      };

      try {
        switch (tab) {
          case "projetos": {
            if (detailedView) {
              const data = await getProjetosDetalhados({
                skip: page * rowsPerPage,
                limit: rowsPerPage,
                search: deferredFiltro,
                apenas_ativos: !showInactive,
                com_alocacoes: true,
                ...(filtroSecao && { secao_id: filtroSecao }),
                ...(filtroRecurso && { recurso: filtroRecurso }),
              });
              const items = Array.isArray(data) ? data : data.items;
              const totalCount = Array.isArray(data)
                ? data.length
                : data.total || (data.items ? data.items.length : 0);
              setProjetosEPlanejamento(items || []);
              setTotal(totalCount || 0);
            } else {
              const projData = await getProjetos(params);
              const items = Array.isArray(projData) ? projData : projData.items;
              const totalCount = Array.isArray(projData)
                ? projData.length
                : projData.total ||
                  (projData.items ? projData.items.length : 0);
              setProjetosEPlanejamento(items || []);
              setTotal(totalCount || 0);
            }
            const [secData, statData] = await Promise.all([
              getSecoes({ apenas_ativos: true }),
              getStatusProjetos({ apenas_ativos: true }),
            ]);
            setSecoes(Array.isArray(secData) ? secData : secData.items || []);
            setStatusProjetos(
              Array.isArray(statData) ? statData : statData.items || [],
            );
            break;
          }
          case "secoes": {
            const data = await getSecoes({ ...params, apenas_ativos: !showInactive, nome: filtroNome });
            const items = Array.isArray(data) ? data : data.items;
            const totalCount = Array.isArray(data)
              ? data.length
              : data.total || (data.items ? data.items.length : 0);
            setSecoes(items || []);
            setTotal(totalCount || 0);
            break;
          }
          case "equipes": {
            const [eqData, secData] = await Promise.all([
              getEquipes(params),
              getSecoes({ apenas_ativos: true }),
            ]);
            const items = Array.isArray(eqData) ? eqData : eqData.items;
            const totalCount = Array.isArray(eqData)
              ? eqData.length
              : eqData.total || (eqData.items ? eqData.items.length : 0);
            setEquipes(items || []);
            setTotal(totalCount || 0);
            setSecoes(Array.isArray(secData) ? secData : secData.items || []);
            break;
          }
          case "recursos": {
            const [recData, eqData] = await Promise.all([
              getRecursos({ ...params, nome: deferredFiltro }),
              getEquipes({ apenas_ativos: true }),
            ]);
            const items = Array.isArray(recData) ? recData : recData.items;
            const totalCount = Array.isArray(recData)
              ? recData.length
              : recData.total || (recData.items ? recData.items.length : 0);
            setRecursos(items || []);
            setTotal(totalCount || 0);
            setEquipes(Array.isArray(eqData) ? eqData : eqData.items || []);
            break;
          }
          case "statusProjetos": {
            const data = await getStatusProjetos(params);
            const items = Array.isArray(data) ? data : data.items;
            const totalCount = Array.isArray(data)
              ? data.length
              : data.total || (data.items ? data.items.length : 0);
            setStatusProjetos(items || []);
            setTotal(totalCount || 0);
            break;
          }

          default:
            break;
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [
      tab,
      showInactive,
      page,
      rowsPerPage,
      deferredFiltro,
      filtroSecao,
      filtroRecurso,
      detailedView,
    ],
  );

  // Reseta a página para 0 quando o filtro de nome ou de inativos muda
  useEffect(() => {
    setPage(0);
  }, [deferredFiltro, filtroSecao, filtroRecurso, showInactive]);

  // Carrega dados quando a função de busca é recriada (devido a mudança de dependências)
  // Ao alternar detailedView, zeramos page antes de buscar dados para evitar requisição em página inexistente
  useEffect(() => {
    setPage(0);
  }, [detailedView]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData, page, detailedView]);

  const handleOpenModal = useCallback((item = null) => {
    setCurrentItem(item);
    setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setCurrentItem(null);
    setModalOpen(false);
    setModalError("");
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
        statusProjetos: {
          create: createStatusProjeto,
          update: updateStatusProjeto,
        },
        alocacoes: { create: createAlocacao, update: updateAlocacao },
      };
      const { create, update } = apiMap[tab];
      const typeName = managementTypes
        .find((t) => t.value === tab)
        .label.slice(0, -1);

      if (isEditing) {
        await update(currentItem.id, data);
        setNotification({
          open: true,
          message: `${typeName} atualizado com sucesso!`,
          severity: "success",
        });
      } else {
        const newItem = await create(data);
        setNotification({
          open: true,
          message: `${typeName} criado com sucesso!`,
          severity: "success",
        });
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
      const errMsg =
        err.response?.data?.detail || err.message || "Ocorreu um erro.";
      setModalError(errMsg);
      // Mantém o modal aberto para que o usuário possa corrigir os dados.
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  

  const handleTabChange = (event) => {
    router.push(`${pathname}?tab=${event.target.value}`);
  };

  const handleCloseNotification = () =>
    setNotification({ ...notification, open: false });

  // Handlers específicos para o modal de alocação na visão detalhada
  const handleEditAlocacao = async (alocacao) => {
    setLoading(true);
    try {
      // Encontra o projeto ao qual a alocacao pertence para obter a seção
      const projetoDaAlocacao = projetos.find((p) =>
        p.alocacoes.some((a) => a.id === alocacao.id)
      );

      if (!projetoDaAlocacao || !projetoDaAlocacao.secao) {
        setNotification({
          open: true,
          message: "Não foi possível encontrar a seção da alocação para edição.",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      // Prepara o item para edição, mantendo os dados atuais para pré-preencher o modal
      const alocacaoParaEdicao = {
        ...alocacao,
        secao_id: projetoDaAlocacao.secao.id,
        // Manter os IDs atuais para pré-preencher o modal
        projeto_id: alocacao.projeto_id,
        recurso_id: alocacao.recurso_id,
      };
      
      setCurrentAlocacao(alocacaoParaEdicao);
      setAlocacaoModalOpen(true);

    } catch (err) {
      setNotification({
        open: true,
        message: `Erro ao preparar dados para edição: ${err.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlocacaoModal = () => {
    setCurrentAlocacao(null);
    setAlocacaoModalOpen(false);
    setModalError("");
  };

  const handleSaveAlocacao = async (data) => {
    setLoading(true);
    setModalError(""); // Limpa erros anteriores
    try {
      let result;
      if (currentAlocacao && currentAlocacao.id) {
        // Edição: usar updateAlocacao
        result = await updateAlocacao(currentAlocacao.id, data);
        setNotification({
          open: true,
          message: "Alocação atualizada com sucesso!",
          severity: "success",
        });
      } else {
        // Criação: usar createAlocacao
        result = await createAlocacao(data);
        setNotification({
          open: true,
          message: "Alocação criada com sucesso!",
          severity: "success",
        });
      }

      await fetchData(); // Recarrega os dados para refletir a mudança
      handleCloseAlocacaoModal();
      return result; // Retorna o resultado para o modal
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || err.message || "Ocorreu um erro ao salvar a alocação.";
      setModalError(errMsg);
      setNotification({
        open: true,
        message: errMsg,
        severity: "error",
      });
      throw err; // Re-throw para o modal tratar
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlocacao = async (alocacao) => {
    if (!window.confirm(`Tem certeza que deseja excluir a alocação do recurso '${alocacao.recurso.nome}'?`))
      return;

    setLoading(true);
    try {
      // A lógica de encontrar o projetoId foi removida, pois a API usa a rota /alocacoes/{id}
      await deleteAlocacao(alocacao.id);

      setNotification({
        open: true,
        message: "Alocação excluída com sucesso!",
        severity: "success",
      });
      await fetchData(); // Recarrega os dados para refletir a exclusão
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || "Ocorreu um erro ao excluir a alocação.";
      setNotification({
        open: true,
        message: `Erro: ${errorMsg}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHoras = async (projetoId, alocacaoId, horasEditadas) => {
    setLoading(true);
    try {
      // Encontrar a alocação para obter o ano de referência
      const alocacao = projetos
        .flatMap(p => p.alocacoes)
        .find(a => a.id === alocacaoId);

      // Determinar o ano. Usa o ano da primeira hora planejada existente ou o ano atual como fallback.
      const ano = alocacao?.horas_planejadas[0]?.ano || new Date().getFullYear();

      // O backend espera um ARRAY de objetos, cada um com alocacao_id
      const payload = (horasEditadas || [])
        .filter(h => h.ano && h.mes && h.horas !== '' && h.horas !== null && h.horas !== undefined)
        .map(h => ({
          alocacao_id: alocacaoId, // Adiciona o ID da alocação em cada item
          ano: h.ano,
          mes: h.mes,
          horas_planejadas: Number(h.horas) || 0
        }));

      console.log('Payload enviado para planejamentoHoras:', payload); // DEBUG

      // A API espera um objeto por vez, não um array.
      // Usamos Promise.all para enviar todas as requisições em paralelo.
      await Promise.all(payload.map(item => planejamentoHoras(item)));
      
      setNotification({
        open: true,
        message: "Horas planejadas salvas com sucesso!",
        severity: "success",
      });
      fetchData(); // Re-fetch data to show updates
    } catch (err) {
      // Usa a mensagem de erro detalhada do backend, se disponível
      const errorMessage = err.response?.data?.detail || `Erro ao salvar horas: ${err.message}`;
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('🔍 handleRowsPerPageChange - Mudando de', rowsPerPage, 'para', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleDetailedViewChange = (checked) => {
    startTransition(() => {
      setDetailedView(checked);
      setPage(0); // garante que a busca comece da primeira página
    });
  };

  const renderContent = () => {
    if (loading && !modalOpen) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Typography color="error">Erro ao carregar dados: {error}</Typography>
      );
    }

    const dataMap = {
      projetos,
      secoes,
      equipes,
      recursos,
      statusProjetos,
    };
    const currentData = dataMap[tab] || [];

    const columns = {
      projetos: [
        { id: "nome", label: "Nome" },
        { id: "descricao", label: "Descrição" },
        {
          id: "secao_id",
          label: "Seção",
          format: (val) => secoes.find((s) => s.id === val)?.nome || "N/A",
        },
        {
          id: "status_projeto_id",
          label: "Status",
          format: (val) =>
            statusProjetos.find((s) => s.id === val)?.nome || "N/A",
        },
        {
          id: "data_inicio_prevista",
          label: "Início Previsto",
          format: (val) =>
            val ? new Date(val + "T00:00:00").toLocaleDateString() : "N/A",
        },
      ],
      secoes: [
        { id: "nome", label: "Nome" },
        { id: "descricao", label: "Descrição" },
        { id: "acoes", label: "Ações", isAction: true, align: "right" },
      ],
      equipes: [
        { id: "nome", label: "Nome" },
        { id: "descricao", label: "Descrição" },
        {
          id: "secao_id",
          label: "Seção",
          format: (val) => secoes.find((s) => s.id === val)?.nome || "N/A",
        },
        { id: "acoes", label: "Ações", isAction: true, align: "right" },
      ],
      recursos: [
        { id: "nome", label: "Nome" },
        {
          id: "equipe_principal_id",
          label: "Equipe",
          format: (val) => equipes.find((e) => e.id === val)?.nome || "N/A",
        },
        { id: "acoes", label: "Ações", isAction: true, align: "right" },
      ],
      statusProjetos: [
        { id: "nome", label: "Nome" },
        { id: "descricao", label: "Descrição" },
        { id: "acoes", label: "Ações", isAction: true, align: "right" },
      ],
    };
    const currentColumns = columns[tab];

    return (
      <>
        {(tab === "statusProjetos" || tab === "secoes" || tab === "equipes" || tab === "recursos") && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={() => setShowInactive((prev) => !prev)}
                  color="primary"
                />
              }
              label="Mostrar Inativos"
            />
          </Box>
        )}

        <TableContainer sx={{ maxHeight: "70vh" }}>
          <Table stickyHeader>
          <TableHead>
            <TableRow>
              {currentColumns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || "left"}
                  sx={{
                    backgroundColor: wegBlue,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentData
              .filter((item) => {
                if (tab === "statusProjetos") {
                  return showInactive ? true : item.ativo !== false;
                }
                if (tab === "equipes") {
                  // Filtro por nome (case insensitive)
                  const matchNome = filtroNome.trim() === "" || (item.nome ?? "").toLowerCase().includes(filtroNome.trim().toLowerCase());
                  return (showInactive ? true : item.ativo !== false) && matchNome;
                }
                if (tab === "recursos") {
                  // Filtro por nome (case insensitive)
                  const matchNome = filtroNome.trim() === "" || (item.nome ?? "").toLowerCase().includes(filtroNome.trim().toLowerCase());
                  return (showInactive ? true : item.ativo !== false) && matchNome;
                }
                // Para 'secoes', não filtra mais no frontend, pois a API já retorna o correto
                return true;
              })
              .map((item, index) => (
                <TableRow
                  key={item.id || index}
                  sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                >
                  {currentColumns.map((col) => {
                    if (col.isAction) {
                      return (
                        <TableCell key={col.id} align="right">
                          
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setCurrentItem(item);
                              setModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: "red" }}
                            onClick={async () => {
                              if (tab === "secoes") {
                                if (window.confirm("Deseja realmente excluir esta seção?")) {
                                  setLoading(true);
                                  try {
                                    await deleteSecao(item.id);
                                    await fetchData();
                                    setNotification({ open: true, message: "Seção excluída com sucesso!", severity: "success" });
                                  } catch (err) {
                                    setNotification({ open: true, message: err?.message || "Erro ao excluir seção.", severity: "error" });
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              } else if (tab === "statusProjetos") {
                                if (window.confirm("Deseja realmente excluir este status de projeto?")) {
                                  setLoading(true);
                                  try {
                                    await deleteStatusProjeto(item.id);
                                    await fetchData();
                                    setNotification({ open: true, message: "Status de projeto excluído com sucesso!", severity: "success" });
                                  } catch (err) {
                                    setNotification({ open: true, message: err?.message || "Erro ao excluir status.", severity: "error" });
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              } else if (tab === "equipes") {
                                if (window.confirm("Deseja realmente excluir esta equipe?")) {
                                  setLoading(true);
                                  try {
                                    await deleteEquipe(item.id);
                                    await fetchData();
                                    setNotification({ open: true, message: "Equipe excluída com sucesso!", severity: "success" });
                                  } catch (err) {
                                    setNotification({ open: true, message: err?.message || "Erro ao excluir equipe.", severity: "error" });
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              } else if (tab === "recursos") {
                                if (window.confirm("Deseja realmente excluir este recurso?")) {
                                  setLoading(true);
                                  try {
                                    await deleteRecurso(item.id);
                                    await fetchData();
                                    setNotification({ open: true, message: "Recurso excluído com sucesso!", severity: "success" });
                                  } catch (err) {
                                    setNotification({ open: true, message: err?.message || "Erro ao excluir recurso.", severity: "error" });
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      );
                    }
                    if (col.id === "ativo") {
                      return (
                        <TableCell key={col.id} align="center">
                          <Tooltip title={item.ativo ? "Ativo" : "Inativo"}>
                            {item.ativo ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </Tooltip>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={col.id}>
                        {col.format ? col.format(item[col.id]) : item[col.id]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: wegBlue, fontWeight: "bold" }}
      >
        Gerenciamento do Sistema
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <FormControl sx={{ m: 1, minWidth: 200 }} variant="outlined">
            <InputLabel>Tipo de Gerenciamento</InputLabel>
            <Select
              value={tab}
              onChange={handleTabChange}
              label="Tipo de Gerenciamento"
            >
              {managementTypes.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Filtrar por nome…"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            variant="outlined"
            sx={{ m: 1, flexGrow: 1, maxWidth: 220 }}
          />

          {/* Aparece só em projetos/detailed */}
          {tab === "projetos" && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                  />
                }
                label="Mostrar Inativos"
                sx={{ m: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={detailedView}
                    onChange={(e) => {
                      console.log("toggle detailedView:", e.target.checked);
                      handleDetailedViewChange(e.target.checked);
                    }}
                  />
                }
                label="Visão Detalhada"
                sx={{ m: 1, opacity: isPending ? 0.7 : 1 }}
              />
            </>
          )}

          {/* Filtros extras só em detailedView */}
          {tab === "projetos" && detailedView && (
            <>

          </>
        )}

        {/* Filtros extras só em detailedView */}
        {tab === "projetos" && detailedView && (
          <>
            <FormControl sx={{ m: 1, minWidth: 160 }} variant="outlined">
              <InputLabel id="secao-filter-label">Seção</InputLabel>
              <Select
                labelId="secao-filter-label"
                value={filtroSecao}
                onChange={(e) => {
                  console.log("secao:", e.target.value);
                  setFiltroSecao(e.target.value);
                  setPage(0);
                }}
                label="Seção"
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {secoes.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
              <Autocomplete
                freeSolo
                options={recursosOptions}
                value={filtroRecurso}
                onInputChange={(_, v) => {
                  console.log("recurso:", v);
                  setFiltroRecurso(v);
                  setPage(0);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Recurso" variant="outlined" />
                )}
                sx={{ m: 1, width: 200 }}
              />
            </>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              // Se estiver na aba projetos com visão detalhada, abre modal de alocação
              if (tab === "projetos" && detailedView) {
                setCurrentAlocacao(null);
                setAlocacaoModalOpen(true);
              } else {
                // Caso contrário, abre modal normal (projeto, seção, etc.)
                handleOpenModal();
              }
            }}
            sx={{
              m: 1,
              backgroundColor: wegBlue,
              "&:hover": { backgroundColor: "#00447c" },
            }}
          >
            + NOVO ITEM
          </Button>
        </Box>
      </Paper>

      <>
        {tab === "projetos" && detailedView ? (
          <Paper sx={{ width: "100%", overflow: "hidden", mb: 2 }}>
            <ProjetosDetalhesTable
              projetos={projetos}
              onEditProjeto={handleOpenModal}
              onEditAlocacao={handleEditAlocacao}
              onDeleteAlocacao={handleDeleteAlocacao}
              onSaveHoras={handleSaveHoras}
              onDataChange={fetchData}
            />
            {total > 0 && (
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 25, 50]}
              />
            )}
          </Paper>
        ) : (
          <Paper sx={{ width: "100%", overflow: "hidden", mb: 2 }}>
            {renderContent()}
            {total > 0 && tab !== "planejamento_horas" && (
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 25, 50]}
              />
            )}
          </Paper>
        )}
      </>

      {modalOpen &&
        ((tab === "projetos" && (
          <ProjetoModal
            open={modalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            projeto={currentItem}
            secoes={secoes}
            statusProjetos={statusProjetos}
            apiError={modalError}
            showAlocacaoStep={detailedView}
          />
        )) ||
          (tab === "alocacoes" && (
            <AlocacaoModal
              open={modalOpen}
              onClose={handleCloseModal}
              onSave={handleSave}
              item={currentItem}
              secoes={secoes}
              statusOptions={statusProjetos}
            />
          )) ||
          ((tab === "secoes" || tab === "statusProjetos") && (
            <SecaoModal
              open={modalOpen}
              onClose={handleCloseModal}
              onSave={handleSave}
              secao={currentItem}
            />
          )) ||
          (tab === "equipes" && (
            <EquipeModal
              open={modalOpen}
              onClose={handleCloseModal}
              onSave={handleSave}
              equipe={currentItem}
              secoes={secoes}
            />
          )) ||
          (tab === "recursos" && (
            <RecursoModal
              open={modalOpen}
              onClose={handleCloseModal}
              onSave={handleSave}
              recurso={currentItem}
              equipes={equipes}
            />
          )) ||
          (tab === "statusProjetos" && (
            <StatusProjetoModal
              open={modalOpen}
              onClose={handleCloseModal}
              onSave={handleSave}
              statusProjeto={currentItem}
            />
          )))}

      {/* Modal de Alocação para a Visão Detalhada */}
      {alocacaoModalOpen && (
        <AlocacaoModal
          open={alocacaoModalOpen}
          onClose={handleCloseAlocacaoModal}
          onSave={handleSaveAlocacao}
          item={currentAlocacao}
          secoes={secoes}
          statusOptions={statusProjetos}
          onDataChange={fetchData}
        />
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
