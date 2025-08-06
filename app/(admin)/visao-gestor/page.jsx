'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  TextField,
  Modal,
  Fade,
  Backdrop,
  Button
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import html2canvas from 'html2canvas';
import { apiGet } from '../../../services/api';
import TeamAllocationHeatmap from '../../../components/admin/TeamAllocationHeatmap';
import EChart from '../../../components/Echarts/Echarts';

// Nomes dos meses para os gráficos
const mesNomes = {
    1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
    7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
};

const mesNomesCompleto = {
    1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril', 5: 'Maio', 6: 'Junho',
    7: 'Julho', 8: 'Agosto', 9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
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
  const reportRef = useRef();
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
  const [projetosList, setProjetosList] = useState([]);

  const [selectedSecao, setSelectedSecao] = useState(null);
  const [selectedEquipe, setSelectedEquipe] = useState(null);
  const [selectedRecurso, setSelectedRecurso] = useState(null);
  const [selectedProjeto, setSelectedProjeto] = useState(null);

  // State for drill-down modal
  const [modalOpen, setModalOpen] = useState(false);
  const [chartDataType, setChartDataType] = useState('planejadas'); // 'planejadas' ou 'apontadas'

  // State for heatmap
  const [teamHeatmapData, setTeamHeatmapData] = useState(null);
  const [isHeatmapLoading, setIsHeatmapLoading] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);

  const handleExportImage = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current, {
        useCORS: true, // Para carregar imagens de outras origens, se houver
        backgroundColor: '#ffffff', // Garante um fundo branco na imagem
        scale: 2, // Aumenta a resolução da imagem
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'relatorio-capacidade-alocacao.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  // 1. Fetch initial sections
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await apiGet('/filtros/filtros-populados');
        // Remove duplicados pelo nome para evitar chaves repetidas no Autocomplete
        const secaoUnicas = Array.from(new Map((data.secoes || []).map(s => [s.nome, s])).values());
        setSecoesList(secaoUnicas);
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
      setRecursosList([]);
      setProjetosList([]);
      setSelectedEquipe(null);
      setSelectedRecurso(null);
      setSelectedProjeto(null);
      return;
    }
    const fetchEquipes = async () => {
      try {
        const params = { secao_id: selectedSecao.id };
        const data = await apiGet('/filtros/filtros-populados', params);
        const equipesUnicas = Array.from(new Map((data.equipes || []).map(e => [e.nome, e])).values());
        setEquipesList(equipesUnicas);
      } catch (err) {
        console.error("Falha ao buscar equipes:", err);
      }
    };
    fetchEquipes();
    setSelectedEquipe(null);
    setSelectedRecurso(null);
    setSelectedProjeto(null);
  }, [selectedSecao]);

  // 3. Fetch resources and projects when a team is selected
  useEffect(() => {
    if (!selectedEquipe) {
      setRecursosList([]);
      setProjetosList([]);
      setSelectedRecurso(null);
      setSelectedProjeto(null);
      return;
    }
    const fetchRecursosEProjetos = async () => {
      try {
        const params = { secao_id: selectedSecao.id, equipe_id: selectedEquipe.id };
        const data = await apiGet('/filtros/filtros-populados', params);
        const recursosUnicos = Array.from(new Map((data.recursos || []).map(r => [r.nome, r])).values());
        const projetosUnicos = Array.from(new Map((data.projetos || []).map(p => [p.nome, p])).values());
        setRecursosList(recursosUnicos);
        setProjetosList(projetosUnicos);
      } catch (err) {
        console.error("Falha ao buscar recursos e projetos:", err);
      }
    };
    fetchRecursosEProjetos();
    setSelectedRecurso(null);
    setSelectedProjeto(null);
  }, [selectedEquipe, selectedSecao]);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!selectedRecurso) {
      setApiData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = { ano, mes_inicio: mesInicio, mes_fim: mesFim, recurso_id: selectedRecurso.id };
      const response = await apiGet('http://localhost:8000/backend/dashboard/disponibilidade-recurso', params);
      setApiData(response);
    } catch (err) {
      setError('Falha ao buscar dados do dashboard: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ano, mesInicio, mesFim, selectedRecurso]);

  useEffect(() => {
    if (selectedRecurso) {
        fetchData();
    }
  }, [fetchData, selectedRecurso]);

  // 4. Populate projects list when data is available for a resource
  // 4. Populate projects list when data is available for a resource
  useEffect(() => {
    if (apiData && apiData.disponibilidade_mensal) {
      // Correção: Acessar alocacoes_detalhadas e, em seguida, o objeto projeto.
      const allProjects = apiData.disponibilidade_mensal.flatMap(month => month.alocacoes_detalhadas.map(detalhe => detalhe.projeto) || []);
      const uniqueProjects = Array.from(
        new Map(allProjects.filter(p => p && p.id && p.nome).map(p => [p.id, {id: p.id, nome: p.nome}]))
        .values()
      );
      console.log('Projetos encontrados para o filtro:', uniqueProjects);
      setProjetosList(uniqueProjects);
    } else {
      setProjetosList([]);
    }
    setSelectedProjeto(null);
  }, [apiData]);

  const handleChartClick = useCallback((params) => {
    if (!params || !apiData || !apiData.disponibilidade_mensal) return;

    if (params.componentType === 'series' && (params.seriesName === 'Horas Alocadas' || params.seriesName === 'Horas Apontadas')) {
      const monthIndex = params.dataIndex;
      const clickedMonthData = apiData.disponibilidade_mensal[monthIndex];

      if (clickedMonthData && clickedMonthData.alocacoes_detalhadas && clickedMonthData.alocacoes_detalhadas.length > 0) {
        // Define o tipo de dados baseado na barra clicada
        setChartDataType(params.seriesName === 'Horas Apontadas' ? 'apontadas' : 'planejadas');
        setSelectedMonthData(clickedMonthData);
        setModalOpen(true);
      } else {
        console.log('Nenhum detalhe de projeto para exibir para este mês.');
      }
    }
  }, [apiData]);

  const pieChartOptions = useMemo(() => {
    if (!selectedMonthData || !selectedMonthData.alocacoes_detalhadas) return null;

    // Usa o campo correto baseado no tipo de dados selecionado
    const chartData = selectedMonthData.alocacoes_detalhadas
      .map(detalhe => ({
        value: chartDataType === 'apontadas' ? (detalhe.horas_apontadas || 0) : detalhe.horas_planejadas,
        name: `${detalhe.projeto.id} - ${detalhe.projeto.nome}`
      }))
      .filter(p => p.value > 0);

    const totalHoras = chartData.reduce((sum, item) => sum + item.value, 0);
    const tipoHoras = chartDataType === 'apontadas' ? 'Horas Apontadas' : 'Horas Planejadas';

    return {
      title: {
        text: `Detalhamento de Projetos - ${mesNomesCompleto[selectedMonthData.mes]}`,
        subtext: `${tipoHoras} - Total: ${totalHoras.toFixed(1)}h`,
        left: 'center',
        top: '2%',
        textStyle: {
            fontSize: 22,
            fontWeight: 'bold'
        },
        subtextStyle: {
            fontSize: 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}:<br/>{c}h ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '2%',
        type: 'scroll'
      },
      series: [{
        name: 'Alocação',
        type: 'pie',
        radius: ['30%', '50%'], // Even smaller radius for more label space
        center: ['50%', '50%'],
        itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
        },
        label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {d}%',
            fontWeight: 'bold',
            fontSize: 14,
            // The critical fix: force all labels to show, even if they overlap.
            avoidLabelOverlap: false 
        },
        labelLine: {
            show: true,
            length: 20,
            length2: 55, // Significantly longer line to spread out labels
            smooth: true
        },
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        },
        data: chartData,
      }]
    };
  }, [selectedMonthData, chartDataType]);

  // Efeito para buscar dados do mapa de calor da equipe
  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (selectedEquipe) {
        setIsHeatmapLoading(true);
        setTeamHeatmapData(null); // Limpa dados anteriores
        try {
          const params = {
            equipe_id: selectedEquipe.id,
            ano: ano,
            mes_inicio: mesInicio,
            mes_fim: mesFim,
          };
          const response = await apiGet('/dashboard/disponibilidade-equipe', params);
          setTeamHeatmapData(response);
        } catch (error) {
          console.error('Erro ao buscar dados do mapa de calor:', error);
          setTeamHeatmapData(null);
        } finally {
          setIsHeatmapLoading(false);
        }
      } else {
        setTeamHeatmapData(null); // Limpa os dados se nenhuma equipe for selecionada
      }
    };

    fetchHeatmapData();
  }, [selectedEquipe, ano, mesInicio, mesFim]);

  // Process data for KPIs and charts
  const { kpis, barChartOptions } = useMemo(() => {
    if (!apiData || !apiData.disponibilidade_mensal) {
      return { kpis: {}, barChartOptions: null };
    }

    let monthlyData = apiData.disponibilidade_mensal;

    if (selectedProjeto) {
      monthlyData = monthlyData.map(month => {
        // Correção: buscar em 'alocacoes_detalhadas' e usar a estrutura correta do objeto.
        const projetoInfo = month.alocacoes_detalhadas.find(detalhe => detalhe.projeto.id === selectedProjeto.id);
        // Correção: usar 'horas_planejadas'
        const horasAlocadasProjeto = projetoInfo ? projetoInfo.horas_planejadas : 0;
        const horasApontadasProjeto = projetoInfo ? projetoInfo.horas_apontadas : 0;
        return {
          ...month,
          total_horas_planejadas: horasAlocadasProjeto,
          total_horas_apontadas: horasApontadasProjeto,
          percentual_alocacao: month.capacidade_rh > 0 ? ((horasAlocadasProjeto / month.capacidade_rh) * 100).toFixed(1) + '%' : '0.0%'
        };
      });
    }

    const capacidadeTotal = monthlyData.reduce((acc, item) => acc + item.capacidade_rh, 0);
    const horasAlocadas = monthlyData.reduce((acc, item) => acc + item.total_horas_planejadas, 0);
    const horasApontadas = monthlyData.reduce((acc, item) => acc + (item.total_horas_apontadas || 0), 0);
    const superalocadosCount = monthlyData.filter(item => parsePercent(item.percentual_alocacao) > 100).length;
    const taxaMedia = capacidadeTotal > 0 ? (horasAlocadas / capacidadeTotal) * 100 : 0;

    const kpisData = {
      'Capacidade Total': `${capacidadeTotal.toFixed(0)}h`,
      'Horas Alocadas': `${horasAlocadas.toFixed(0)}h`,
      'Horas Apontadas': `${horasApontadas.toFixed(0)}h`,
      'Saldo de Horas': `${(capacidadeTotal - horasAlocadas).toFixed(0)}h`,
      'Taxa de Alocação Média': `${taxaMedia.toFixed(1)}%`,
      'Meses com Superalocação': superalocadosCount,
    };

    const barChartOptionsData = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['Capacidade', 'Horas Alocadas', 'Horas Apontadas'] },
      xAxis: { type: 'category', data: monthlyData.map(item => mesNomes[item.mes]) },
      yAxis: { type: 'value', name: 'Horas' },
      series: [
        {
          name: 'Capacidade',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
            formatter: '{c}h',
            fontSize: 10,
            color: '#333'
          },
          itemStyle: {
            color: '#a9a9a9' // DarkGray for capacity
          },
          data: monthlyData.map(item => Math.round(item.capacidade_rh)),
        },
        {
          name: 'Horas Alocadas',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
            formatter: '{c}h',
            fontSize: 10,
            color: '#333'
          },
          data: monthlyData.map(item => ({
            value: Math.round(item.total_horas_planejadas),
            itemStyle: { color: getBarColor(parsePercent(item.percentual_alocacao)) },
          })),
        },
        {
          name: 'Horas Apontadas',
          type: 'bar',
          label: {
            show: true,
            position: 'top',
            formatter: '{c}h',
            fontSize: 10,
            color: '#333'
          },
          itemStyle: {
            color: '#ff9800' // Orange for tracked hours
          },
          data: monthlyData.map(item => Math.round(item.total_horas_apontadas || 0)),
        }
      ],
    };

    return { kpis: kpisData, barChartOptions: barChartOptionsData };
  }, [apiData, selectedProjeto]);

  const renderKPIs = () => (
    <Grid container spacing={3} mb={4}>
      {Object.entries(kpis).map(([key, value]) => (
        <Grid item xs={12} sm={6} md={2.4} key={key}>
          <Card sx={{ bgcolor: 'grey.100' }}><CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>{key}</Typography>
            <Typography variant="h5" component="div">{value}</Typography>
          </CardContent></Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, paddingX: { xs: 2, sm: 3 } }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
          <Typography variant="h4">Controle de Capacidade e Alocação</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportImage}
          >
            Exportar Imagem
          </Button>
        </Grid>
      </Grid>

      <Box ref={reportRef} sx={{ bgcolor: 'background.paper' }}>
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete options={secoesList} getOptionLabel={(o) => o.nome || ''} getOptionKey={(o) => o.id} value={selectedSecao} onChange={(_, v) => setSelectedSecao(v)} renderInput={(p) => <TextField {...p} label="Seção" />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete options={equipesList} getOptionLabel={(o) => o.nome || ''} getOptionKey={(o) => o.id} value={selectedEquipe} onChange={(_, v) => setSelectedEquipe(v)} disabled={!selectedSecao} renderInput={(p) => <TextField {...p} label="Equipe" />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete options={recursosList} getOptionLabel={(o) => o.nome || ''} getOptionKey={(o) => o.id} value={selectedRecurso} onChange={(_, v) => setSelectedRecurso(v)} disabled={!selectedEquipe} renderInput={(p) => <TextField {...p} label="Recurso" />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete options={projetosList} getOptionLabel={(o) => o.nome || ''} getOptionKey={(o) => o.id} value={selectedProjeto} onChange={(_, v) => setSelectedProjeto(v)} disabled={!selectedRecurso} renderInput={(p) => <TextField {...p} label="Projeto (Opcional)" />} />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select value={ano} label="Ano" onChange={(e) => setAno(e.target.value)}>
                {[...Array(5)].map((_, i) => <MenuItem key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Mês Início</InputLabel>
              <Select value={mesInicio} label="Mês Início" onChange={(e) => setMesInicio(e.target.value)}>
                {Object.entries(mesNomes).map(([num, nome]) => <MenuItem key={num} value={parseInt(num)}>{nome}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Mês Fim</InputLabel>
              <Select value={mesFim} label="Mês Fim" onChange={(e) => setMesFim(e.target.value)}>
                {Object.entries(mesNomes).map(([num, nome]) => <MenuItem key={num} value={parseInt(num)}>{nome}</MenuItem>)}
              </Select>
            </FormControl>
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
                <Typography variant="h6" gutterBottom>
                  Alocação vs. Capacidade Mensal {selectedProjeto ? `(${selectedProjeto.nome})` : ''}
                </Typography>
                {barChartOptions && <EChart option={barChartOptions} onEvents={{ 'click': handleChartClick }} />}
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}><Box sx={{ width: 12, height: 12, bgcolor: '#d32f2f', mr: 1 }} /> <Typography variant="caption">Superalocação (&gt;100%)</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}><Box sx={{ width: 12, height: 12, bgcolor: '#388e3c', mr: 1 }} /> <Typography variant="caption">Alocação Ideal (85-100%)</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}><Box sx={{ width: 12, height: 12, bgcolor: '#1976d2', mr: 1 }} /> <Typography variant="caption">Alocação Normal (&lt;85%)</Typography></Box>
              </Box>
            </Grid>

            {/* Team Heatmap Section */}
            {selectedEquipe && (
              <Grid item xs={12}>
                {isHeatmapLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : (
                  <TeamAllocationHeatmap 
                    data={teamHeatmapData} 
                    meses={Array.from({ length: mesFim - mesInicio + 1 }, (_, i) => mesInicio + i)}
                    mesNomes={mesNomes}
                  />
                )}
              </Grid>
            )}
            </Grid>
          </>
        )}
      </Box>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={modalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85vw',
            maxWidth: '1200px',
            height: '80vh',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}>
            {pieChartOptions && <EChart option={pieChartOptions} style={{ height: '100%', width: '100%' }} />}
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
}