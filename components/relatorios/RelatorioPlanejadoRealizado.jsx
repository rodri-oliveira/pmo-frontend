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
import { getRelatorioPlanejadoRealizadoV2 } from '../../lib/api';

const wegBlue = '#00579d';

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
      const apiData = await getRelatorioPlanejadoRealizadoV2({
        recurso_id: recurso.id,
        status,
        mes_inicio: mesInicioAno && mesInicioMes ? `${mesInicioAno}-${mesInicioMes}` : '',
        mes_fim: mesFimAno && mesFimMes ? `${mesFimAno}-${mesFimMes}` : '',
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
        status: p.status,
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

  const handleSalvarAlteracoes = () => {
    // TODO: implementar lógica de salvar alterações
    console.log('Salvar alterações', { secao, equipe, recurso, status, mesInicioMes, mesInicioAno, mesFimMes, mesFimAno });
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
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, ml: 0.5 }}>
              Status
            </Typography>
            <FormControl sx={{ minWidth: 140, height: 40, '& .MuiInputBase-root': { height: 40 }, width: '100%' }} size="small">
              <Select value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty sx={{ height: 40, width: '100%' }}>
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
                <TableCell sx={{ width: 390, fontWeight: 'bold', pl: 1, whiteSpace: 'nowrap', position: 'sticky', left: 0, top: 0, zIndex: 12, background: '#f5f5f5' }}>Projeto/Melhorias</TableCell>
                <TableCell sx={{ width: 100, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, background: '#f5f5f5' }}>Status</TableCell>
                <TableCell sx={{ width: 80, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, background: '#f5f5f5' }}>Ação</TableCell>
                <TableCell sx={{ width: 108, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, background: '#f5f5f5' }}>Esf. Estim.</TableCell>
                <TableCell sx={{ width: 108, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, background: '#f5f5f5' }}>Esf. Plan.</TableCell>
                {colunasMeses.map(mes => (
                  <React.Fragment key={mes}>
                    <TableCell sx={{ width: 65, fontWeight: 'bold', textAlign: 'center', p: 0.25 }}>{formatMesLabel(mes)}</TableCell>
                    <TableCell sx={{ width: 52, fontWeight: 'bold', backgroundColor: '#e0e0e0', textAlign: 'center', p: 0.25 }}>Hs.</TableCell>
                  </React.Fragment>
                ))}
                <TableCell sx={{ width: '2%', p:0 }}>
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
                const stickyZ = 11;
                const borderBottom = index === 2 ? '1px solid #e0e0e0' : undefined;
                return (
                  <TableRow key={linha.label} sx={{ backgroundColor: index === 2 ? '#e3f2fd' : 'inherit' }}>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        paddingLeft: '16px',
                        position: 'sticky',
                        left: 0,
                        top: stickyTop,
                        zIndex: stickyZ + 1,
                        background: index === 2 ? '#e3f2fd' : '#fff',
                        borderBottom,
                      }}
                    >
                      {linha.label}
                    </TableCell>
                    <TableCell sx={{ position: 'sticky', top: stickyTop, zIndex: stickyZ, background: index === 2 ? '#e3f2fd' : '#fff', borderBottom }}></TableCell>{/* Status */}
                    <TableCell sx={{ position: 'sticky', top: stickyTop, zIndex: stickyZ, background: index === 2 ? '#e3f2fd' : '#fff', borderBottom }}></TableCell>{/* Ação */}
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', position: 'sticky', top: stickyTop, zIndex: stickyZ, background: index === 2 ? '#e3f2fd' : '#fff', borderBottom }}>{linha.esforcoEstimado?.toFixed(2)}</TableCell>{/* Esf. Estim. */}
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', position: 'sticky', top: stickyTop, zIndex: stickyZ, background: index === 2 ? '#e3f2fd' : '#fff', borderBottom }}>{linha.esforcoPlanejado?.toFixed(2)}</TableCell>
                    {colunasMeses.map(mes => (
                      <React.Fragment key={mes}>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', position: 'sticky', top: stickyTop, zIndex: stickyZ, background: index === 2 ? '#e3f2fd' : '#fff', borderBottom }}>{linha.meses[mes]?.planejado?.toFixed(2)}</TableCell>
                        <TableCell sx={{ position: 'sticky', top: stickyTop, zIndex: stickyZ, backgroundColor: '#f5f5f5', borderBottom }}></TableCell>
                      </React.Fragment>
                    ))}
                    <TableCell sx={{ position: 'sticky', top: stickyTop, zIndex: stickyZ, background: index === 2 ? '#e3f2fd' : '#fff', borderBottom }}></TableCell>
                  </TableRow>
                );
              })}

              {/* Linhas de Projetos */}
              {reportData.projetos.map((projeto, idx) => {
                const isLast = idx === reportData.projetos.length - 1;
                return (
                  <TableRow key={projeto.id}>
                    <TableCell
                      sx={
                        !isLast
                          ? {
                              position: 'sticky',
                              left: 0,
                              zIndex: 1,
                              background: '#fff',
                              paddingLeft: '16px',
                            }
                          : { paddingLeft: '16px' }
                      }
                    >
                      {projeto.nome}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', p: 0 }}>{projeto.status}</TableCell>
                    <TableCell sx={{ textAlign: 'center', p: 0 }}>{/* Ação */}</TableCell>
                    <TableCell sx={{ textAlign: 'center', p: 0 }}>{projeto.esforcoEstimado?.toFixed(2)}</TableCell>
                    <TableCell sx={{ textAlign: 'center', p: 0 }}>{projeto.esforcoPlanejado?.toFixed(2)}</TableCell>
                    {colunasMeses.map(mes => [
                      <TableCell key={`${mes}-plan`} sx={{ textAlign: 'center', p: 0.25 }}>
                        {projeto.meses[mes]?.planejado?.toFixed(2)}
                      </TableCell>,
                      <TableCell key={`${mes}-real`} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', p: 0.25 }}>
                        {projeto.meses[mes]?.realizado?.toFixed(2)}
                      </TableCell>
                    ])}
                    <TableCell></TableCell>
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
