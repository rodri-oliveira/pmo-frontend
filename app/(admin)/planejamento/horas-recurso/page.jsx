"use client";

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/services/api.jsx';
import { createPlanejamentoHoras } from '@/services/planejamentoHoras.jsx';
import {
    Box, Typography, Paper, Button, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Grid, Snackbar, Alert, CircularProgress, FormControl,
    InputLabel, Select, MenuItem, Chip, Divider, InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale/pt-BR';
import TimerIcon from '@mui/icons-material/Timer';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';


// Função auxiliar para obter o nome do mês
const getNomeMes = (numeroMes) => {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes - 1];
};

export default function PlanejamentoHorasRecurso() {
    const [planejamentos, setPlanejamentos] = useState([]);
    const [recursos, setRecursos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filtros, setFiltros] = useState({ recurso_id: '', ano: '', mes: '' });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });
    const [formData, setFormData] = useState({ alocacao_id: '', ano: '', mes: '', horas_planejadas: '' });
    const [alocacoes, setAlocacoes] = useState([]);

    // Token fictício - em produção, use o token real do usuário
    const token = "";

    // Buscar lista de recursos para o filtro
    useEffect(() => {
        async function fetchRecursos() {
            setLoading(true);
            try {
                const data = await apiGet('/recursos', { ativo: true });
                setRecursos(data && typeof data === 'object' && 'items' in data ? data.items : []);
                setError("");
            } catch (err) {
                try {
                    const data = await apiGet('/recursos/', {});
                    setRecursos(data && typeof data === 'object' && 'items' in data ? data.items : []);
                } catch (secondError) {
                    setRecursos([]);
                    setSnackbar({
                        open: true,
                        message: 'Erro ao carregar recursos.',
                        severity: 'error'
                    });
                }
            } finally {
                setLoading(false);
            }
        }
        async function fetchAlocacoes() {
            try {
                const data = await apiGet('/alocacoes', {});
                setAlocacoes(data && typeof data === 'object' && 'items' in data ? data.items : []);
            } catch (err) {
                setAlocacoes([]);
            }
        }
        fetchRecursos();
        fetchAlocacoes();
    }, []);

    // Buscar planejamentos com filtros
    const buscarPlanejamentos = async () => {
        setLoading(true);
        setError("");
        try {
            // Preparar parâmetros para a busca
            const params = {
                recurso_id: filtros.recurso_id || undefined,
                ano: filtros.ano || undefined,
                mes: filtros.mes || undefined
            };
            
            console.log('Buscando planejamentos com params:', params);
            
            // Buscar planejamentos no endpoint correto
            let data = null;
            try {
                data = await apiGet('/planejamento-horas', params);
                console.log('Dados recebidos:', data);
                if (Array.isArray(data)) {
                    setPlanejamentos(data);
                } else if (data && typeof data === 'object' && 'items' in data) {
                    setPlanejamentos(data.items);
                } else {
                    setPlanejamentos([]);
                }
            } catch (error) {
                console.error('Erro ao buscar planejamentos:', error);
                // Se for ApiError com response, tenta logar o corpo
                if (error && error.response && typeof error.response.text === 'function') {
                  error.response.text().then(txt => console.error('Detalhe do erro backend:', txt));
                }
                setPlanejamentos([]);
                setError("Erro ao buscar dados.");
                setSnackbar({
                    open: true,
                    message: 'Erro ao carregar planejamentos.',
                    severity: 'error'
                });
            }
        } catch (err) {
            console.error("Erro geral ao buscar planejamentos:", err);
            setPlanejamentos([]);
            setError("Erro ao buscar dados.");
        } finally {
            setLoading(false);
        }
    };

    // Carregar dados iniciais
    useEffect(() => {
        buscarPlanejamentos();
    }, []);

    const handleFiltroChange = (e) => {
        const name = e.target.name;
        setFiltros({ ...filtros, [name]: e.target.value });
    };

    const handleBuscar = (e) => {
        e.preventDefault();
        buscarPlanejamentos();
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Helper para mostrar nome do recurso
    const getNomeRecurso = (id) => {
        const rec = recursos.find((r) => r.id === id);
        return rec ? rec.nome : id;
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.alocacao_id || !formData.ano || !formData.mes || !formData.horas_planejadas) {
            setSnackbar({ open: true, message: 'Preencha todos os campos!', severity: 'warning' });
            return;
        }
        setLoading(true);
        try {
            await createPlanejamentoHoras({
                alocacao_id: Number(formData.alocacao_id),
                ano: Number(formData.ano),
                mes: Number(formData.mes),
                horas_planejadas: Number(formData.horas_planejadas)
            });
            setSnackbar({ open: true, message: 'Planejamento cadastrado com sucesso!', severity: 'success' });
            setFormData({ alocacao_id: '', ano: '', mes: '', horas_planejadas: '' });
            buscarPlanejamentos();
        } catch (error) {
            setSnackbar({ open: true, message: 'Erro ao cadastrar planejamento.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box p={3}>
                <Typography variant="h5" mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimerIcon sx={{ mr: 1 }} />
                    Planejamento de Horas por Recurso
                </Typography>

                {/* Formulário de cadastro */}
                <Paper sx={{ p: 2, mb: 3, background: '#f7fafc' }}>
                    <Typography variant="subtitle1" mb={1} fontWeight={600}>Cadastrar Planejamento de Horas</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={5} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Alocação</InputLabel>
                                    <Select
                                        name="alocacao_id"
                                        value={formData.alocacao_id}
                                        label="Alocação"
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="">Selecione</MenuItem>
                                        {(alocacoes || []).map((a) => (
                                            <MenuItem key={a.id} value={a.id}>
                                                {`Alocação #${a.id} - Projeto ${a.projeto_id} / Recurso ${a.recurso_id}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} sm={3} md={2}>
                                <TextField
                                    name="ano"
                                    label="Ano"
                                    size="small"
                                    value={formData.ano}
                                    onChange={handleFormChange}
                                    type="number"
                                    inputProps={{ min: 2000, max: 2100 }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6} sm={2} md={2}>
                                <TextField
                                    name="mes"
                                    label="Mês"
                                    size="small"
                                    value={formData.mes}
                                    onChange={handleFormChange}
                                    type="number"
                                    inputProps={{ min: 1, max: 12 }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={2} md={2}>
                                <TextField
                                    name="horas_planejadas"
                                    label="Horas Planejadas"
                                    size="small"
                                    value={formData.horas_planejadas}
                                    onChange={handleFormChange}
                                    type="number"
                                    inputProps={{ min: 0, max: 744 }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={2}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                >
                                    Cadastrar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <form onSubmit={handleBuscar}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Recurso</InputLabel>
                                    <Select
                                        name="recurso_id"
                                        value={filtros.recurso_id}
                                        label="Recurso"
                                        onChange={handleFiltroChange}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        {(recursos || []).map((r) => (
                                            <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <TextField
                                    name="ano"
                                    label="Ano"
                                    size="small"
                                    value={filtros.ano}
                                    onChange={handleFiltroChange}
                                    type="number"
                                    inputProps={{ min: 2000, max: 2100 }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <TextField
                                    name="mes"
                                    label="Mês"
                                    size="small"
                                    value={filtros.mes}
                                    onChange={handleFiltroChange}
                                    type="number"
                                    inputProps={{ min: 1, max: 12 }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={2}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    startIcon={<SearchIcon />}
                                >
                                    Buscar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
                {loading && (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                )}

                {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell><strong>Recurso</strong></TableCell>
                                <TableCell><strong>Ano</strong></TableCell>
                                <TableCell><strong>Mês</strong></TableCell>
                                <TableCell><strong>Horas Planejadas</strong></TableCell>
                                <TableCell><strong>Alocação ID</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(planejamentos || []).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Box py={2}>
                                            <Typography variant="body1" color="text.secondary">
                                                Nenhum dado encontrado para os filtros selecionados.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (planejamentos || []).map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{getNomeRecurso(row.recurso_id)}</TableCell>
                                        <TableCell>{row.ano}</TableCell>
                                        <TableCell>{row.mes ? getNomeMes(row.mes) : '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${row.horas_planejadas}h`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{row.alocacao_id}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
}
