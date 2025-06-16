"use client";

import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, Button, TextField, MenuItem, Snackbar, Alert } from '@mui/material';
import { createAlocacao, getRecursos, getProjetos, getAlocacoes, getAlocacaoById, updateAlocacao } from '../../../services/alocacoes.jsx';
import { getPlanejamentosByAlocacao } from '../../../services/planejamentoHoras.jsx';

const AlocacoesPage = () => {
  const [recursos, setRecursos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [formData, setFormData] = useState({
    recurso_id: '',
    projeto_id: '',
    data_inicio_alocacao: '',
    data_fim_alocacao: '',
    status_alocacao_id: '',
    observacao: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [alocacoes, setAlocacoes] = useState([]);
  const [statusAlocacoes, setStatusAlocacoes] = useState([]);
  const statusAlocacoesMock = [
    { id: 1, nome: 'Ativo' },
    { id: 2, nome: 'Pausado' },
    { id: 3, nome: 'Finalizado' }
  ];
  const [editingId, setEditingId] = useState(null);
  const [openPlanejamentoModal, setOpenPlanejamentoModal] = useState(false);
  const [planejamentosAloc, setPlanejamentosAloc] = useState([]);
  const [planejamentosLoading, setPlanejamentosLoading] = useState(false);
  const [planejamentosErro, setPlanejamentosErro] = useState('');
  const [planejamentoAlocacaoSelecionada, setPlanejamentoAlocacaoSelecionada] = useState(null);

  useEffect(() => {
    getRecursos().then((data) => setRecursos(data.items || []));
    getProjetos().then((data) => setProjetos(data.items || []));
    carregarAlocacoes();
    carregarStatusAlocacoes();
    // eslint-disable-next-line
  }, []);

  const carregarStatusAlocacoes = async () => {
    try {
      const data = await import('../../../services/statusProjetos.jsx').then(mod => mod.getStatusProjetos());
      setStatusAlocacoes(data.items || []);
    } catch (error) {
      setStatusAlocacoes(statusAlocacoesMock);
      setSnackbar({ open: true, message: 'Erro ao carregar status. Usando dados de exemplo.', severity: 'error' });
    }
  };

  const carregarAlocacoes = async () => {
    try {
      const data = await getAlocacoes();
      setAlocacoes(data || []);
    } catch {
      setAlocacoes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      recurso_id: Number(formData.recurso_id),
      projeto_id: Number(formData.projeto_id),
      data_inicio_alocacao: formData.data_inicio_alocacao,
      status_alocacao_id: formData.status_alocacao_id,
      observacao: formData.observacao
    };
    if (formData.data_fim_alocacao) payload.data_fim_alocacao = formData.data_fim_alocacao;
    try {
      if (editingId) {
        await updateAlocacao(editingId, payload);
        setSnackbar({ open: true, message: 'Alocação atualizada com sucesso!', severity: 'success' });
      } else {
        await createAlocacao(payload);
        setSnackbar({ open: true, message: 'Alocação criada com sucesso!', severity: 'success' });
      }
      setFormData({ recurso_id: '', projeto_id: '', data_inicio_alocacao: '', data_fim_alocacao: '', status_alocacao_id: '', observacao: '' });
      setEditingId(null);
      carregarAlocacoes();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar alocação.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Ao clicar em uma linha da tabela, buscar alocação e preencher formulário para edição
  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const aloc = await getAlocacaoById(id);
      setFormData({
        recurso_id: aloc.recurso_id?.toString() || '',
        projeto_id: aloc.projeto_id?.toString() || '',
        data_inicio_alocacao: aloc.data_inicio_alocacao || '',
        data_fim_alocacao: aloc.data_fim_alocacao || '',
        status_alocacao_id: aloc.status_alocacao_id || '',
        observacao: aloc.observacao || ''
      });
      setEditingId(id);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao carregar alocação para edição.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal com planejamentos de uma alocação
  const handleOpenPlanejamento = async (alocacao) => {
    setPlanejamentoAlocacaoSelecionada(alocacao);
    setOpenPlanejamentoModal(true);
    setPlanejamentosLoading(true);
    setPlanejamentosErro('');
    try {
      const data = await getPlanejamentosByAlocacao(alocacao.id);
      setPlanejamentosAloc(Array.isArray(data) ? data : []);
    } catch (err) {
      setPlanejamentosAloc([]);
      setPlanejamentosErro('Erro ao buscar planejamentos desta alocação.');
    } finally {
      setPlanejamentosLoading(false);
    }
  };
  const handleClosePlanejamento = () => {
    setOpenPlanejamentoModal(false);
    setPlanejamentosAloc([]);
    setPlanejamentoAlocacaoSelecionada(null);
    setPlanejamentosErro('');
  };


  return (
    <Box p={3}>
      <Paper sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>
          Nova Alocação de Recurso em Projeto
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Recurso"
                name="recurso_id"
                value={formData.recurso_id}
                onChange={handleChange}
                required
                fullWidth
              >
                {recursos.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Projeto"
                name="projeto_id"
                value={formData.projeto_id}
                onChange={handleChange}
                required
                fullWidth
              >
                {projetos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Data Início Alocação"
                name="data_inicio_alocacao"
                type="date"
                value={formData.data_inicio_alocacao}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Data Fim Alocação"
                name="data_fim_alocacao"
                type="date"
                value={formData.data_fim_alocacao}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Status da Alocação"
                name="status_alocacao_id"
                value={formData.status_alocacao_id}
                onChange={handleChange}
                required
                fullWidth
              >
                {(statusAlocacoes || []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Observação"
                name="observacao"
                value={formData.observacao}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? 'Salvando...' : 'Salvar Alocação'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Listagem das alocações */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Alocações Cadastradas</Typography>
        <Paper>
          <Grid container>
            <Grid item xs={12}>
              <Box p={2}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>ID</th>
                      <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Recurso ID</th>
                      <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Projeto ID</th>
                      <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Data Início</th>
                      <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Data Fim</th>
<th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Status</th>
<th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Observação</th>
                      <th style={{ borderBottom: '1px solid #ccc', padding: 8 }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(alocacoes || []).map((a) => (
                      <tr key={a.id}>
                        <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{a.id}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{a.recurso_id || '-'}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{a.projeto_id || '-'}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{a.data_inicio_alocacao || '-'}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{a.data_fim_alocacao || '-'}</td>
<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{(statusAlocacoes.find(s => s.id === a.status_alocacao_id)?.nome) || '-'}</td>
<td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{a.observacao || '-'}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                          <Button size="small" variant="outlined" onClick={() => handleEdit(a.id)} sx={{ mr: 1 }}>
                            Editar
                          </Button>
                          <Button size="small" variant="contained" color="info" onClick={() => handleOpenPlanejamento(a)}>
                            Ver planejamento
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    {/* Modal de planejamento de horas */}
    {openPlanejamentoModal && (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.3)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={handleClosePlanejamento}
      >
        <Paper sx={{ minWidth: 400, maxWidth: 600, p: 3 }} onClick={e => e.stopPropagation()}>
          <Typography variant="h6" gutterBottom>
            Planejamento de Horas - Alocação #{planejamentoAlocacaoSelecionada?.id}
          </Typography>
          {planejamentosLoading ? (
            <Typography>Carregando...</Typography>
          ) : planeajamentosErro ? (
            <Alert severity="error">{planejamentosErro}</Alert>
          ) : (
            <>
              {planejamentosAloc.length === 0 ? (
                <Typography variant="body2">Nenhum planejamento cadastrado para esta alocação.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ano</TableCell>
                        <TableCell>Mês</TableCell>
                        <TableCell>Horas Planejadas</TableCell>
                        <TableCell>Projeto</TableCell>
                        <TableCell>Recurso</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {planejamentosAloc.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.ano}</TableCell>
                          <TableCell>{p.mes}</TableCell>
                          <TableCell>{p.horas_planejadas}</TableCell>
                          <TableCell>{p.projeto_id}</TableCell>
                          <TableCell>{p.recurso_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
          <Box mt={2} textAlign="right">
            <Button onClick={handleClosePlanejamento} variant="outlined">Fechar</Button>
          </Box>
        </Paper>
      </Box>
    )}
  </Box>
  );
};

export default AlocacoesPage;
