"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Cores do tema WEG
const colors = {
  wegBlue: '#00579d',
  wegGreen: '#00612E', 
  wegTeal: '#00a0a0',
  wegGray: '#6c757d',
  lightGray: '#f8f9fa',
  darkGray: '#343a40'
};

// Cores para os gráficos de pizza (baseadas no print)
const chartColors = {
  'To Do': '#b8d4f0',
  'Em andamento': '#00a0a0',
  'In Progress': '#00a0a0', 
  'Done': '#28a745',
  'Concluído': '#28a745',
  'Standby/On Hold': '#6c757d',
  'On Hold': '#6c757d',
  'Cancelled': '#dc3545',
  'Cancelado': '#dc3545'
};

export default function IndicadoresDepartamentoPage() {
  const reportRef = useRef(null);
  // Estados para filtros
  const [selectedSecao, setSelectedSecao] = useState('DTIN');
  const [dataInicio, setDataInicio] = useState({ mes: 1, ano: 2025 });
  const [dataFim, setDataFim] = useState({ mes: 12, ano: 2025 });

  // Estados para dados
  const [demandasData, setDemandasData] = useState(null);
  const [melhoriasData, setMelhoriasData] = useState(null);
  const [recursosData, setRecursosData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExportImage = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 2, // Aumenta a resolução da imagem
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'relatorio-indicadores-departamento.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  // Função para buscar dados
  const fetchDashboardData = useCallback(async () => {
    if (!selectedSecao) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams({
        secao: selectedSecao,
        data_inicio: `${dataInicio.ano}-${String(dataInicio.mes).padStart(2, '0')}-01`,
        data_fim: `${dataFim.ano}-${String(dataFim.mes).padStart(2, '0')}-28`,
        use_cache: 'true'
      });

      const [demandasResponse, melhoriasResponse, recursosResponse] = await Promise.all([
        fetch(`${baseUrl}/backend/dashboard-jira/demandas?${params}`),
        fetch(`${baseUrl}/backend/dashboard-jira/melhorias?${params}`),
        fetch(`${baseUrl}/backend/dashboard-jira/recursos-alocados?${params}`)
      ]);

      if (!demandasResponse.ok || !melhoriasResponse.ok || !recursosResponse.ok) {
        throw new Error('Erro ao buscar dados do dashboard');
      }

      const [demandas, melhorias, recursos] = await Promise.all([
        demandasResponse.json(),
        melhoriasResponse.json(),
        recursosResponse.json()
      ]);

      setDemandasData(demandas);
      setMelhoriasData(melhorias);
      setRecursosData(recursos);

    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSecao, dataInicio, dataFim]);

  // Buscar dados quando filtros mudarem
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Função para formatar dados para o gráfico de pizza
  const formatChartData = (data) => {
    if (!data || !data.items) return [];
    
    return data.items.map(item => ({
      name: item.status,
      value: item.quantidade,
      percentage: parseFloat(item.percentual)
    }));
  };

  // Componente de gráfico de pizza personalizado
  const CustomPieChart = ({ data, title, total }) => {
    const chartData = formatChartData(data);
    
    return (
      <Paper sx={{ 
        p: 3, 
        height: '600px',
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: 2
      }}>
        <Typography variant="h6" gutterBottom sx={{ 
          textAlign: 'center', 
          fontWeight: 'bold', 
          mb: 2,
          color: colors.darkGray,
          fontSize: '1rem'
        }}>
          {title}
        </Typography>
        
        <Box sx={{ 
          height: '400px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'visible'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                paddingAngle={2}
                dataKey="value"
                label={({ percentage, value, name }) => {
                  // Só mostra label se a porcentagem for maior que 5%
                  if (percentage < 5) return '';
                  return `${percentage.toFixed(1)}%`;
                }}
                labelLine={false}
                fontSize={12}
                fill="#000"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[entry.name] || colors.wegGray} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [
                  `${value} (${chartData.find(d => d.name === name)?.percentage || 0}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Total no centro */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <Typography variant="h2" sx={{ 
              fontWeight: 'bold', 
              color: colors.darkGray,
              fontSize: '2.5rem',
              lineHeight: 1
            }}>
              {total || 0}
            </Typography>
          </Box>
        </Box>

        {/* Legenda personalizada */}
        <Box sx={{ mt: 1, maxHeight: '140px', overflowY: 'auto' }}>
          {chartData.map((entry, index) => (
            <Box key={index} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 0.5,
              py: 0.25,
              px: 0.5
            }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: chartColors[entry.name] || colors.wegGray,
                  borderRadius: '2px',
                  mr: 1,
                  flexShrink: 0
                }}
              />
              <Typography variant="body2" sx={{ 
                flexGrow: 1,
                fontSize: '0.75rem',
                color: colors.darkGray,
                lineHeight: 1.2
              }}>
                {entry.name}
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold',
                fontSize: '0.75rem',
                color: colors.wegBlue,
                minWidth: '70px',
                textAlign: 'right'
              }}>
                {entry.percentage}% ({entry.value})
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, px: 3 }}>
      <Box ref={reportRef} sx={{ p: 3, backgroundColor: 'white' }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h4" sx={{ color: colors.wegBlue, fontWeight: 'bold' }}>
            Indicadores do Departamento
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportImage}
            disabled={loading}
            sx={{
              backgroundColor: colors.wegBlue,
              '&:hover': {
                backgroundColor: '#004488'
              }
            }}
          >
            Exportar Imagem
          </Button>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Seção</InputLabel>
              <Select
                value={selectedSecao}
                label="Seção"
                onChange={(e) => setSelectedSecao(e.target.value)}
              >
                <MenuItem value="DTIN">TIN</MenuItem>
                <MenuItem value="SEG">SEG</MenuItem>
                <MenuItem value="SGI">SGI</MenuItem>
              </Select>
            </FormControl>
          </Grid>

        </Grid>
      </Paper>

      {/* Loading e Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Seção do título da seção selecionada */}
      {selectedSecao && !loading && (
        <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: colors.darkGray,
              fontWeight: 'medium',
              mb: 1
            }}
          >
            {selectedSecao === 'DTIN' ? 'Seção Tecnologia de Infraestrutura' : selectedSecao}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.wegGray,
              fontStyle: 'italic'
            }}
          >
            (Não contabilizadas as CTs e Plataforma OPS & CCoE)
          </Typography>
        </Box>
      )}

      {/* Gráficos de Pizza */}
      {!loading && !error && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3} sx={{ 
            justifyContent: 'space-between'
          }}>
            <Grid item xs={12} md={4}>
              <CustomPieChart 
                data={demandasData}
                title="Demandas"
                total={demandasData?.total}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <CustomPieChart 
                data={melhoriasData}
                title="Melhorias"
                total={melhoriasData?.total}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <CustomPieChart 
                data={recursosData}
                title="Recursos Alocados (Atividades)"
                total={recursosData?.total}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Tabela de Comparação */}
      {!loading && !error && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            DONE 📊 2024-2025
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>2024</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>2025</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>% Variação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '32px', padding: '0 12px', borderRadius: '16px', backgroundColor: colors.wegTeal, color: 'white', fontWeight: 'bold', fontSize: '0.8125rem' }}>
                        Demandas
                      </Box>
                    </TableCell>
                    <TableCell align="center">11</TableCell>
                    <TableCell align="center">{demandasData?.total || 0}</TableCell>
                    <TableCell align="center">
                      <Typography sx={{ color: '#28a745', fontWeight: 'bold' }}>
                        +68,8%
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '32px', padding: '0 12px', borderRadius: '16px', backgroundColor: colors.wegTeal, color: 'white', fontWeight: 'bold', fontSize: '0.8125rem' }}>
                        Melhorias
                      </Box>
                    </TableCell>
                    <TableCell align="center">101</TableCell>
                    <TableCell align="center">{melhoriasData?.total || 0}</TableCell>
                    <TableCell align="center">
                      <Typography sx={{ color: '#28a745', fontWeight: 'bold' }}>
                        +27,7%
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '32px', padding: '0 12px', borderRadius: '16px', backgroundColor: colors.wegTeal, color: 'white', fontWeight: 'bold', fontSize: '0.8125rem' }}>
                        Recursos Alocados
                      </Box>
                    </TableCell>
                    <TableCell align="center">141</TableCell>
                    <TableCell align="center">{recursosData?.total || 0}</TableCell>
                    <TableCell align="center">
                      <Typography sx={{ color: '#28a745', fontWeight: 'bold' }}>
                        +94,4%
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ pl: 3 }}>
                <Typography variant="body2" sx={{ color: colors.darkGray, mb: 2 }}>
                  • Marathon<br/>
                  • Agilidade processos WEGNET e Carve-out
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="In Progress" size="small" sx={{ bgcolor: colors.wegTeal, color: 'white' }} />
                  <Chip label="Done" size="small" sx={{ bgcolor: '#28a745', color: 'white' }} />
                  <Chip label="To Do" size="small" sx={{ bgcolor: '#b8d4f0', color: 'black' }} />
                  <Chip label="Standby/On Hold" size="small" sx={{ bgcolor: colors.wegGray, color: 'white' }} />
                  <Chip label="Cancelled" size="small" sx={{ bgcolor: '#dc3545', color: 'white' }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      </Box>
    </Container>
  );
}
