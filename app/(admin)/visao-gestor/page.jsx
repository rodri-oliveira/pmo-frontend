'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField
} from '@mui/material';
import { apiGet } from '../../../services/api';
import EChart from '../../../components/Echarts/Echarts';

// Nomes dos meses para os gráficos
const mesNomes = {
    1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
    7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
};

// Função para converter a string de porcentagem para número
const parsePercent = (percentString) => parseFloat(String(percentString).replace('%', ''));

// Função para definir a cor da barra com base na alocação
const getBarColor = (percentage) => {
    if (percentage > 100) return '#d32f2f'; // Vermelho para superalocação
    if (percentage >= 85) return '#388e3c'; // Verde para alocação ideal
    return '#1976d2'; // Azul para alocação normal
};

export default function VisaoGestorPage() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States for filters
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mesInicio, setMesInicio] = useState(1);
  const [mesFim, setMesFim] = useState(12);

  const [secoesList, setSecoesList] = useState([]);
  const [equipesList, setEquipesList] = useState([]);
  const [recursosList, setRecursosList] = useState([]);

  const [selectedSecao, setSelectedSecao] = useState(null);
  const [selectedEquipe, setSelectedEquipe] = useState(null);
  const [selectedRecurso, setSelectedRecurso] = useState(null);

  // 1. Fetch initial sections
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await apiGet('/filtros/filtros-populados');
        setSecoesList(data.secoes || []);
      } catch (err) {
        console.error("Falha ao buscar seções:", err);
        setError("Falha ao carregar filtros iniciais.");
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fetch teams when a section is selected
  useEffect(() => {
    if (!selectedSecao) {
      setEquipesList([]);
      return;
    }
    const fetchEquipes = async () => {
      try {
        const params = { secao_id: selectedSecao.id };
        const data = await apiGet('/filtros/filtros-populados', params);
        setEquipesList(data.equipes || []);
      } catch (err) {
        console.error("Falha ao buscar equipes:", err);
      }
    };
    fetchEquipes();
    // Reset subsequent filters
    setSelectedEquipe(null);
    setRecursosList([]);
    setSelectedRecurso(null);
  }, [selectedSecao]);

  // 3. Fetch resources when a team is selected
  useEffect(() => {
    if (!selectedEquipe) {
      setRecursosList([]);
      return;
    }
    const fetchRecursos = async () => {
      try {
        const params = { secao_id: selectedSecao.id, equipe_id: selectedEquipe.id };
        const data = await apiGet('/filtros/filtros-populados', params);
        setRecursosList(data.recursos || []);
      } catch (err) {
        console.error("Falha ao buscar recursos:", err);
      }
    };
    fetchRecursos();
    // Reset subsequent filter
    setSelectedRecurso(null);
  }, [selectedEquipe, selectedSecao]);


  // Fetch dashboard data when filters change
  const fetchData = useCallback(async () => {
    if (!selectedRecurso) {
      setApiData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = { ano, mes_inicio: mesInicio, mes_fim: mesFim, recurso_id: selectedRecurso.id };
      const response = await apiGet('/dashboard/disponibilidade-recurso', params);
      setApiData(response);
    } catch (err) {
      setError('Falha ao buscar dados do dashboard: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ano, mesInicio, mesFim, selectedRecurso]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Process data for KPIs and charts
  const { kpis, barChartOptions } = useMemo(() => {
    if (!apiData || !apiData.disponibilidade_mensal) {
      return { kpis: {}, barChartOptions: null };
    }

    const monthlyData = apiData.disponibilidade_mensal;
    
    const capacidadeTotal = monthlyData.reduce((acc, item) => acc + item.capacidade_rh, 0);
    const horasAlocadas = monthlyData.reduce((acc, item) => acc + item.total_horas_planejadas, 0);
    const superalocadosCount = monthlyData.filter(item => parsePercent(item.percentual_alocacao) > 100).length;
    const taxaMedia = capacidadeTotal > 0 ? (horasAlocadas / capacidadeTotal) * 100 : 0;

    const kpisData = {
        'Capacidade Total': `${capacidadeTotal}h`,
        'Horas Alocadas': `${horasAlocadas}h`,
        'Saldo de Horas': `${capacidadeTotal - horasAlocadas}h`,
        'Taxa de Alocação Média': `${taxaMedia.toFixed(1)}%`,
        'Meses com Superalocação': superalocadosCount,
    };

    const barChartOptionsData = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: {
            data: ['Capacidade', 'Horas Alocadas']
        },
        xAxis: {
            type: 'category',
            data: monthlyData.map(item => mesNomes[item.mes])
        },
        yAxis: { type: 'value', name: 'Horas' },
        series: [
            {
                name: 'Horas Alocadas',
                type: 'bar',
                data: monthlyData.map(item => ({
                    value: item.total_horas_planejadas,
                    itemStyle: {
                        color: getBarColor(parsePercent(item.percentual_alocacao))
                    }
                }))
            },
            {
                name: 'Capacidade',
                type: 'line',
                data: monthlyData.map(item => item.capacidade_rh),
                symbol: 'none',
                lineStyle: {
                    color: '#555',
                    width: 2,
                    type: 'dashed'
                }
            }
        ]
    };

    return { kpis: kpisData, barChartOptions: barChartOptionsData };
  }, [apiData]);

  const renderKPIs = () => (
    <Grid container spacing={3} mb={4}>
        {Object.entries(kpis).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={2.4} key={key}>
                <Card>
                    <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {key}
                        </Typography>
                        <Typography variant="h5" component="div">
                            {value}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Visão do Gestor
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
                <Autocomplete
                    options={secoesList}
                    getOptionLabel={(option) => option.nome || ''}
                    value={selectedSecao}
                    onChange={(event, newValue) => {
                        setSelectedSecao(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Selecione a Seção" />}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <Autocomplete
                    options={equipesList}
                    getOptionLabel={(option) => option.nome || ''}
                    value={selectedEquipe}
                    onChange={(event, newValue) => {
                        setSelectedEquipe(newValue);
                    }}
                    disabled={!selectedSecao}
                    renderInput={(params) => <TextField {...params} label="Selecione a Equipe" />}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <Autocomplete
                    options={recursosList}
                    getOptionLabel={(option) => option.nome || ''}
                    value={selectedRecurso}
                    onChange={(event, newValue) => {
                        setSelectedRecurso(newValue);
                    }}
                    disabled={!selectedEquipe}
                    renderInput={(params) => <TextField {...params} label="Selecione o Recurso" />}
                />
            </Grid>
        </Grid>
      </Paper>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
      
      {!selectedRecurso && !loading && (
        <Alert severity="info">Por favor, selecione uma seção, equipe e recurso para visualizar os dados.</Alert>
      )}

      {apiData && !loading && (
        <>
          {renderKPIs()}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Alocação vs. Capacidade Mensal</Typography>
                {barChartOptions && <EChart option={barChartOptions} />}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}