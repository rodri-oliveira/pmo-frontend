"use client";

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutocompleteSecaoFiltro from './AutocompleteSecaoFiltro';
import AutocompleteEquipeFiltro from './AutocompleteEquipeFiltro';
import AutocompleteRecursoFiltro from './AutocompleteRecursoFiltro';
import { getFiltrosPopulados } from '../../lib/api';
import { getRelatorioPlanejadoRealizado } from '../../services/alocacoes';
import { salvarMatrizPlanejamento } from '../../services/alocacoes';
import { toast } from 'react-toastify';

const wegBlue = '#00579d';

// Mapeamento de Status baseado na tabela do banco de dados
const statusNameToId = {
  'Backlog': 1,
  'Não Iniciado': 2,
  'Em andamento': 3,
  'Parado': 4,
  'Concluído': 5,
  'Cancelado': 6,
  'Aguardando': 7,
};

const statusOptions = Object.keys(statusNameToId);

function formatMesLabel(ym) {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') + '/' + year.slice(-2);
}

// Estrutura vazia para manter estado inicial
const emptyData = {
  linhasResumo: [],
  projetos: [],
};

export default function RelatorioPlanejadoRealizado() {
  const [secao, setSecao] = useState(null);
  const [equipe, setEquipe] = useState(null);
  const [recurso, setRecurso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(emptyData);
  const [colunasMeses, setColunasMeses] = useState([]);
  const [status, setStatus] = useState('');
  const [mesInicioMes, setMesInicioMes] = useState('');
  const [mesInicioAno, setMesInicioAno] = useState('');
  const [mesFimMes, setMesFimMes] = useState('');
  const [mesFimAno, setMesFimAno] = useState('');
  const mesesOptions = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Fev' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Abr' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Ago' },
    { value: '09', label: 'Set' },
    { value: '10', label: 'Out' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dez' },
  ];
  const currentYear = new Date().getFullYear();
  const anosOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const handleGerarRelatorio = async () => {
    if (!recurso?.id) return;

    setLoading(true);
    try {
      const apiData = await getRelatorioPlanejadoRealizado({
        recurso_id: recurso.id,
        status,
        mes_inicio: mesInicioAno && mesInicioMes ? `${mesInicioAno}-${mesInicioMes}` : '',
        mes_fim: mesFimAno && mesFimMes ? `${mesFimAno}-${mesFimMes}` : '',
        alocacao_id: null, // Pode ser ajustado conforme filtro de projeto
      });
      // Mapeia snake_case para camelCase para evitar refactor grande na renderização
      const linhasResumo = apiData.linhas_resumo.map(l => ({
        label: l.label,
        esforcoPlanejado: l.esforco_planejado,
        esforcoEstimado: l.esforco_estimado, // Adicionado para exibir na linha de resumo
        meses: l.meses,
      }));
      const projetos = apiData.projetos.map(p => ({
        id: p.id,
        nome: p.nome,
        alocacao_id: p.alocacao_id,
        status: p.status || 'Não Iniciado', // API envia o nome, apenas garantimos um default
        acao: p.acao,
        esforcoEstimado: p.esforco_estimado,
        esforcoPlanejado: p.esforco_planejado,
        meses: p.meses,
      }));
      const data = { linhasResumo, projetos };

      // Define colunas de meses e garante até dez/26
      const allMeses = new Set();
      linhasResumo.forEach(l => Object.keys(l.meses).forEach(m => allMeses.add(m)));
      projetos.forEach(p => Object.keys(p.meses).forEach(m => allMeses.add(m)));

      // Encontra mês inicial e gera até 2026-12
      const mesesArray = Array.from(allMeses).sort();
      const inicio = mesesArray[0] || new Date().toISOString().slice(0,7);
      const [startY, startM] = inicio.split('-').map(Number);
      let y = startY, m = startM;
      while (y < 2026 || (y === 2026 && m <= 12)) {
        const ym = `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}`;
        allMeses.add(ym);
        m += 1;
        if (m === 13) { m = 1; y += 1; }
      }
      const finalMeses = Array.from(allMeses).sort();
      setColunasMeses(finalMeses);

      setReportData(data);
      console.log(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarAlteracoes = async () => {
    if (!recurso?.id) {
      toast.warn('Por favor, selecione um recurso para salvar as alterações.');
      return;
    }





    const alteracoes_projetos = reportData.projetos
      // Garante que apenas projetos com alocacao_id numérico sejam enviados
      .filter(p => Number.isInteger(parseInt(p.alocacao_id, 10)))
      .map(projeto => {
        // Transforma o objeto de meses em um array para a API
        // Aceita tanto formato YYYY-MM quanto MM/YYYY
        const planejamento_mensal = Object.keys(projeto.meses)
          .filter(mesAno => {
            const mesData = projeto.meses[mesAno];
            // Verifica se é um objeto válido com propriedade planejado
            return mesData && typeof mesData === 'object' && 
                  // Verifica se planejado existe e é um número maior que zero
                  'planejado' in mesData && 
                  !isNaN(parseFloat(mesData.planejado)) && 
                  parseFloat(mesData.planejado) > 0;
          })
          .map(mesAno => {
            let mes, ano;
            
            // Suporta ambos os formatos: MM/YYYY ou YYYY-MM
            if (mesAno.includes('/')) {
              [mes, ano] = mesAno.split('/');
            } else if (mesAno.includes('-')) {
              [ano, mes] = mesAno.split('-');
            } else {
              // Formato desconhecido, usa valores padrão para evitar erro
              console.warn(`Formato de mês/ano desconhecido: ${mesAno}`);
              const hoje = new Date();
              mes = hoje.getMonth() + 1;
              ano = hoje.getFullYear();
            }
            
            return {
              ano: parseInt(ano, 10),
              mes: parseInt(mes, 10),
              horas_planejadas: parseFloat(projeto.meses[mesAno].planejado) || 0
            };
          });



        return {
          projeto_id: projeto.id,
          alocacao_id: projeto.alocacao_id,
          status_alocacao_id: statusNameToId[projeto.status] || 2, // Default para 'Não Iniciado' (ID 2)
          observacao: projeto.acao || '',
          esforco_estimado: projeto.esforcoEstimado || 0,
          planejamento_mensal
        };
      });



    const payload = {
      recurso_id: recurso.id,
      alteracoes_projetos,
    };



    setLoading(true);
    try {
      const response = await salvarMatrizPlanejamento(payload);
      toast.success(response.message || 'Matriz de planejamento salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar a matriz de planejamento:', error);
      const errorMessage = error.response?.data?.detail || 'Falha ao salvar as alterações. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (projetoId, newStatus) => {
    setReportData(currentData => {
      const updatedProjetos = currentData.projetos.map(p => {
        if (p.id === projetoId) {
          // Retorna o projeto com todas as suas propriedades originais mais o status atualizado
          return { ...p, status: newStatus };
        }
        return p;
      });
      return { ...currentData, projetos: updatedProjetos };
    });
  };

  // Função genérica para atualizar dados do projeto
  const handleProjectDataChange = (projetoId, field, value) => {
    setReportData(currentData => {
      const updatedProjetos = currentData.projetos.map(p => {
        if (p.id === projetoId) {
          // Garante que todas as propriedades existentes sejam mantidas
          const updatedProject = { ...p, [field]: value };
          return updatedProject;
        }
        return p;
      });
      return { ...currentData, projetos: updatedProjetos };
    });
  };

  const handleHourChange = (projetoId, mesYM, value) => {
    setReportData(currentData => {
      // 1. Atualiza o projeto específico, garantindo que o `...p` preserve o alocacao_id
      const updatedProjetos = currentData.projetos.map(p => {
        if (p.id === projetoId) {
          const newMeses = {
            ...p.meses,
            [mesYM]: { ...p.meses[mesYM], planejado: parseFloat(value) || 0 },
          };
          const newEsforcoPlanejado = Object.values(newMeses).reduce((acc, mesData) => acc + (mesData.planejado || 0), 0);
          return { ...p, meses: newMeses, esforcoPlanejado: newEsforcoPlanejado };
        }
        return p;
      });

      // 2. Recalcula as linhas de resumo de forma imutável, com base nos projetos já atualizados
      const updatedLinhasResumo = currentData.linhasResumo.map(linha => {
        if (linha.label.includes('Total')) { // Pega todas as linhas de total
          const newTotalEsforcoPlanejado = updatedProjetos.reduce((acc, proj) => acc + (proj.esforcoPlanejado || 0), 0);
          const newMeses = { ...linha.meses };
          colunasMeses.forEach(mes => {
            const totalMes = updatedProjetos.reduce((acc, proj) => acc + (proj.meses[mes]?.planejado || 0), 0);
            newMeses[mes] = { ...newMeses[mes], planejado: totalMes };
          });
          return { ...linha, esforcoPlanejado: newTotalEsforcoPlanejado, meses: newMeses };
        }
        return linha;
      });

      // 3. Retorna o novo estado completo e limpo
      return { ...currentData, projetos: updatedProjetos, linhasResumo: updatedLinhasResumo };
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 4, background: 'white', borderRadius: '8px' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, color: wegBlue, fontWeight: 'bold' }}>
        Planejamento
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
        Visão matricial para comparação de esforço planejado versus realizado por projeto.
      </Typography>

      {/* Filtros agrupados em grid profissional */}
      <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 3, background: '#f8fafc', border: '1px solid #e0e0e0' }}>
        {/* Linha 1: Filtros principais */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }} gap={2} mb={2} alignItems="center">
          <AutocompleteSecaoFiltro
            value={secao}
            onChange={v => { setSecao(v); setEquipe(null); setRecurso(null); }}
            sx={{ minWidth: 140, height: 40, '& .MuiInputBase-root': { height: 40 } }}
            size="small"
          />
          <AutocompleteEquipeFiltro
            value={equipe}
            onChange={v => { setEquipe(v); setRecurso(null); }}
            secaoId={secao?.id}
            sx={{ minWidth: 140, height: 40, '& .MuiInputBase-root': { height: 40 } }}
            size="small"
          />
          <AutocompleteRecursoFiltro
            value={recurso}
            onChange={setRecurso}
            equipeId={equipe?.id}
            sx={{ minWidth: 140, height: 40, '& .MuiInputBase-root': { height: 40 } }}
            size="small"
          />
          <div>
            <Typography
              component="label"
              sx={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: 14, color: '#00579D' }}
            >
              Status
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                displayEmpty
                sx={{
                  height: 40,
                  width: '100%',
                  background: '#fff',
                  borderRadius: '6px',
                  fontSize: 15,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E3E7',
                    borderWidth: '1.5px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#00579D',
                  },
                }}
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                <MenuItem value="Em andamento">Em andamento</MenuItem>
                <MenuItem value="Concluído">Concluído</MenuItem>
              </Select>
            </FormControl>
          </div>
        </Box>
        {/* Linha 2: Datas e botões */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }} gap={2} alignItems="center">
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="subtitle2">Início</Typography>
            <FormControl sx={{ minWidth: 80, height: 40 }} size="small">
              <InputLabel>Mês</InputLabel>
              <Select value={mesInicioMes} onChange={(e) => setMesInicioMes(e.target.value)} label="Mês" sx={{ height: 40 }}>
                {mesesOptions.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 80, height: 40 }} size="small">
              <InputLabel>Ano</InputLabel>
              <Select value={mesInicioAno} onChange={(e) => setMesInicioAno(e.target.value)} label="Ano" sx={{ height: 40 }}>
                {anosOptions.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="subtitle2">Fim</Typography>
            <FormControl sx={{ minWidth: 80, height: 40 }} size="small">
              <InputLabel>Mês</InputLabel>
              <Select value={mesFimMes} onChange={(e) => setMesFimMes(e.target.value)} label="Mês" sx={{ height: 40 }}>
                {mesesOptions.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 80, height: 40 }} size="small">
              <InputLabel>Ano</InputLabel>
              <Select value={mesFimAno} onChange={(e) => setMesFimAno(e.target.value)} label="Ano" sx={{ height: 40 }}>
                {anosOptions.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box gridColumn={{ xs: '1', md: '3 / span 2' }} display="flex" gap={2} justifyContent="flex-end" alignItems="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleGerarRelatorio}
              disabled={loading || !recurso}
              sx={{ height: 40, minWidth: 140, fontWeight: 700 }}
              size="small"
            >
              {loading ? <CircularProgress size={20} /> : 'Gerar Relatório'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSalvarAlteracoes}
              sx={{ height: 40, minWidth: 140, fontWeight: 700 }}
              size="small"
            >
              SALVAR ALTERAÇÕES
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid' }}>
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Table stickyHeader sx={{ tableLayout: 'fixed' }} size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 390, fontWeight: 'bold', pl: 1, whiteSpace: 'nowrap', position: 'sticky', left: 0, top: 0, zIndex: 12, background: '#f5f5f5', border: '1px solid #ddd' }}>Projeto/Melhorias</TableCell>
                <TableCell sx={{ width: 160, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, background: '#f5f5f5', border: '1px solid #ddd' }}>Status</TableCell>
                <TableCell sx={{ width: 300, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, background: '#f5f5f5', border: '1px solid #ddd' }}>Ação</TableCell>
                <TableCell sx={{ width: 108, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, background: '#f5f5f5', border: '1px solid #ddd' }}>Esf. Estim.</TableCell>
                <TableCell sx={{ width: 108, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, background: '#f5f5f5', border: '1px solid #ddd' }}>Esf. Plan.</TableCell>
                {colunasMeses.map(mes => (
                  <React.Fragment key={mes}>
                    <TableCell sx={{ width: 65, fontWeight: 'bold', textAlign: 'center', p: 0.25, border: '1px solid #ddd' }}>{formatMesLabel(mes)}</TableCell>
                    <TableCell sx={{ width: 52, fontWeight: 'bold', backgroundColor: '#e0e0e0', textAlign: 'center', p: 0.25, border: '1px solid #ddd' }}>Hs.</TableCell>
                  </React.Fragment>
                ))}
                <TableCell sx={{ width: '2%', p: 0, border: '1px solid #ddd' }}>
                  <IconButton size="small" onClick={() => alert('Adicionar coluna (em breve)')}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Linhas de Resumo */}
              {reportData.linhasResumo.map((linha, index) => {
                const stickyTop = `${36 * (index + 1)}px`;
                const isTotalRow = index === 2;
                const cellStyle = {
                  border: '1px solid #ddd',
                  position: 'sticky',
                  top: stickyTop,
                  zIndex: 11,
                  background: isTotalRow ? '#e3f2fd' : '#fff',
                  borderBottom: isTotalRow ? '2px solid #ccc' : '1px solid #ddd',
                };

                return (
                  <TableRow key={linha.label} sx={{ backgroundColor: isTotalRow ? '#e3f2fd' : 'inherit' }}>
                    <TableCell sx={{ ...cellStyle, fontWeight: 'bold', paddingLeft: '16px', left: 0, zIndex: 12 }}>
                      {linha.label}
                    </TableCell>
                    <TableCell sx={cellStyle}></TableCell>{/* Status */}
                    <TableCell sx={cellStyle}></TableCell>{/* Ação */}
                    <TableCell sx={{ ...cellStyle, fontWeight: 'bold', textAlign: 'center' }}>{linha.esforcoEstimado?.toFixed(2)}</TableCell>
                    <TableCell sx={{ ...cellStyle, fontWeight: 'bold', textAlign: 'center' }}>{linha.esforcoPlanejado?.toFixed(2)}</TableCell>
                    {colunasMeses.map(mes => (
                      <React.Fragment key={mes}>
                        <TableCell sx={{ ...cellStyle, fontWeight: 'bold', textAlign: 'center' }}>{linha.meses[mes]?.planejado?.toFixed(2)}</TableCell>
                        <TableCell sx={{ ...cellStyle, backgroundColor: '#f5f5f5' }}></TableCell>
                      </React.Fragment>
                    ))}
                    <TableCell sx={cellStyle}></TableCell>
                  </TableRow>
                );
              })}

              {/* Linhas de Projetos */}
              {reportData.projetos.map((projeto, idx) => {
                const projectCellStyle = {
                  border: '1px solid #ddd',
                  p: 0,
                };

                return (
                  <TableRow key={projeto.id}>
                    <TableCell sx={{ ...projectCellStyle, position: 'sticky', left: 0, zIndex: 1, background: '#fff', padding: '0 16px' }}>
                      {projeto.nome}
                    </TableCell>
                    <TableCell sx={{ ...projectCellStyle, padding: 0 }}>
                      <Select
                        value={projeto.status || ''}
                        onChange={(e) => handleStatusChange(projeto.id, e.target.value)}
                        variant="standard"
                        fullWidth
                        sx={{
                          textAlign: 'center',
                          p: '0 8px',
                          height: '100%',
                          '&:before': { border: 'none' },
                          '&:after': { border: 'none' },
                        }}
                      >
                        {statusOptions.map(statusName => (
                          <MenuItem key={statusName} value={statusName}>{statusName}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                                        <TableCell sx={{ ...projectCellStyle, p: 0 }}>
                      <TextField
                        value={projeto.acao || ''}
                        onChange={(e) => handleProjectDataChange(projeto.id, 'acao', e.target.value)}
                        variant="standard"
                        fullWidth
                        sx={{ p: '0 8px', '& .MuiInput-underline:before': { border: 'none' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { border: 'none' } }}
                      />
                    </TableCell>
                                        <TableCell sx={{ ...projectCellStyle, p: 0 }}>
                       <TextField
                        type="number"
                        value={projeto.esforcoEstimado || ''}
                        onChange={(e) => handleProjectDataChange(projeto.id, 'esforcoEstimado', parseFloat(e.target.value))}
                        variant="standard"
                        fullWidth
                        sx={{ textAlign: 'center', p: '0 8px', '& input': { textAlign: 'center' }, '& .MuiInput-underline:before': { border: 'none' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { border: 'none' } }}
                      />
                    </TableCell>
                                        <TableCell sx={{ ...projectCellStyle, textAlign: 'center', fontWeight: 'bold' }}>
                      {projeto.esforcoPlanejado?.toFixed(2)}
                    </TableCell>
                    {colunasMeses.map(mes => [
                                            <TableCell key={`${mes}-plan`} sx={{ ...projectCellStyle, p: 0 }}>
                        <TextField
                          type="number"
                          value={projeto.meses[mes]?.planejado || ''}
                          onChange={(e) => handleHourChange(projeto.id, mes, e.target.value)}
                          variant="standard"
                          fullWidth
                          sx={{ p: '0 8px', '& input': { textAlign: 'center' }, '& .MuiInput-underline:before': { border: 'none' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { border: 'none' } }}
                        />
                      </TableCell>,
                      <TableCell key={`${mes}-real`} sx={{ ...projectCellStyle, backgroundColor: '#f5f5f5', textAlign: 'center', p: 0.25 }}>
                        {projeto.meses[mes]?.realizado?.toFixed(2)}
                      </TableCell>
                    ])}
                    <TableCell sx={projectCellStyle}></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}
