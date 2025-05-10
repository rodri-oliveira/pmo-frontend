"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, Chip, Table,
  TableHead, TableBody, TableRow, TableCell, TableContainer,
  Divider
} from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import RefreshIcon from '@mui/icons-material/Refresh';
import PieChartIcon from '@mui/icons-material/PieChart';
import { getRelatorioAlocacaoRecursos, RelatorioAlocacaoRecursos } from '@/services/relatorios';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Função auxiliar para obter o nome do mês
const getNomeMes = (numeroMes: number) => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[numeroMes - 1];
};

export default function CapacidadeRHPage() {
  const [loading, setLoading] = useState(false);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<number | ''>('');
  const [dados, setDados] = useState<RelatorioAlocacaoRecursos | null>(null);

  // Função para buscar os dados de capacidade
  const fetchCapacidade = async () => {
    setLoading(true);
    try {
      const params: { ano: number, mes?: number } = { ano: anoSelecionado };
      if (mesSelecionado !== '') {
        params.mes = mesSelecionado as number;
      }
      
      const data = await getRelatorioAlocacaoRecursos(params);
      setDados(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados de capacidade:', error);
      setLoading(false);
    }
  };

  // Efeito inicial e para mudanças nos parâmetros
  useEffect(() => {
    fetchCapacidade();
  }, [anoSelecionado, mesSelecionado]);

  // Preparar dados para o gráfico
  const prepararDadosGrafico = () => {
    if (!dados || !dados.recursos.length) return null;

    const labels = dados.recursos.map(r => r.nome);
    const datasetsBase = {
      label: 'Capacidade Total',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      data: dados.recursos.map(r => r.horas_disponiveis),
    };
    const datasetsAlocado = {
      label: 'Alocado',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      data: dados.recursos.map(r => r.horas_planejadas),
    };
    const datasetsApontado = {
      label: 'Apontado',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      data: dados.recursos.map(r => r.horas_apontadas),
    };

    return {
      labels,
      datasets: [datasetsBase, datasetsAlocado, datasetsApontado],
    };
  };

  // Opções do gráfico
  const opcoesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Capacidade e Alocação de Recursos',
      },
    },
  };

  // Calcular o total de horas disponíveis, planejadas e apontadas
  const calcularTotais = () => {
    if (!dados || !dados.recursos.length) return { disponiveis: 0, planejadas: 0, apontadas: 0 };

    return {
      disponiveis: dados.recursos.reduce((sum, r) => sum + r.horas_disponiveis, 0),
      planejadas: dados.recursos.reduce((sum, r) => sum + r.horas_planejadas, 0),
      apontadas: dados.recursos.reduce((sum, r) => sum + r.horas_apontadas, 0),
    };
  };

  // Calcular a porcentagem de alocação
  const calcularPorcentagem = (valor: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  };

  const totais = calcularTotais();
  const dadosGrafico = prepararDadosGrafico();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Capacidade e Alocação de Recursos Humanos
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Ano</InputLabel>
              <Select
                value={anoSelecionado}
                label="Ano"
                onChange={(e) => setAnoSelecionado(e.target.value as number)}
              >
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((ano) => (
                  <MenuItem key={ano} value={ano}>
                    {ano}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Mês</InputLabel>
              <Select
                value={mesSelecionado}
                label="Mês"
                onChange={(e) => setMesSelecionado(e.target.value as number | '')}
              >
                <MenuItem value="">Todos os meses</MenuItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                  <MenuItem key={mes} value={mes}>
                    {getNomeMes(mes)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchCapacidade}
            >
              Atualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ color: '#00579d', mb: 2 }} />
          <Typography variant="body1">Carregando dados...</Typography>
        </Box>
      ) : !dados ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PieChartIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Sem dados disponíveis</Typography>
          <Typography variant="body1" color="text.secondary">
            Não foi possível carregar dados de capacidade para o período selecionado.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ fontSize: 36, color: '#00579d', mr: 2 }} />
              <Box>
                <Typography variant="h5">Resumo da Capacidade</Typography>
                <Typography variant="body2" color="text.secondary">
                  {mesSelecionado 
                    ? `${getNomeMes(Number(mesSelecionado))} de ${anoSelecionado}`
                    : `Ano: ${anoSelecionado}`
                  }
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(53, 162, 235, 0.1)' }}>
                  <Typography variant="h6" gutterBottom>Horas Disponíveis</Typography>
                  <Typography variant="h4">{totais.disponiveis.toFixed(0)}h</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Capacidade total dos recursos
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255, 99, 132, 0.1)' }}>
                  <Typography variant="h6" gutterBottom>Horas Alocadas</Typography>
                  <Typography variant="h4">{totais.planejadas.toFixed(0)}h</Typography>
                  <Chip 
                    label={`${calcularPorcentagem(totais.planejadas, totais.disponiveis)}% da capacidade`}
                    color={calcularPorcentagem(totais.planejadas, totais.disponiveis) > 90 ? "error" : "primary"}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(75, 192, 192, 0.1)' }}>
                  <Typography variant="h6" gutterBottom>Horas Apontadas</Typography>
                  <Typography variant="h4">{totais.apontadas.toFixed(0)}h</Typography>
                  <Chip 
                    label={`${calcularPorcentagem(totais.apontadas, totais.planejadas)}% do planejado`}
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribuição de Capacidade por Recurso
            </Typography>
            
            <Box sx={{ height: 400, mt: 3 }}>
              {dadosGrafico && <Bar options={opcoesGrafico} data={dadosGrafico} />}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detalhamento por Recurso
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Recurso</strong></TableCell>
                    <TableCell align="right"><strong>Horas Disponíveis</strong></TableCell>
                    <TableCell align="right"><strong>Horas Planejadas</strong></TableCell>
                    <TableCell align="right"><strong>Horas Apontadas</strong></TableCell>
                    <TableCell align="right"><strong>% Alocação</strong></TableCell>
                    <TableCell><strong>Projetos</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dados.recursos.map((recurso) => (
                    <TableRow key={recurso.id} hover>
                      <TableCell>{recurso.nome}</TableCell>
                      <TableCell align="right">{recurso.horas_disponiveis.toFixed(1)}h</TableCell>
                      <TableCell align="right">{recurso.horas_planejadas.toFixed(1)}h</TableCell>
                      <TableCell align="right">{recurso.horas_apontadas.toFixed(1)}h</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${calcularPorcentagem(recurso.horas_planejadas, recurso.horas_disponiveis)}%`}
                          color={calcularPorcentagem(recurso.horas_planejadas, recurso.horas_disponiveis) > 90 ? "error" : 
                                 calcularPorcentagem(recurso.horas_planejadas, recurso.horas_disponiveis) > 70 ? "warning" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {recurso.projetos.map((projeto) => (
                            <Chip 
                              key={projeto.id}
                              label={`${projeto.nome} (${projeto.horas_planejadas}h)`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}
