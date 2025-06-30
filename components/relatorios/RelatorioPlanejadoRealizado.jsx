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

  const handleGerarRelatorio = async () => {
    if (!recurso?.id) return;

    setLoading(true);
    try {
      const apiData = await getRelatorioPlanejadoRealizadoV2({
        recurso_id: recurso.id,
        status: '', // ou "Em andamento" se quiser filtrar
        // mes_inicio/mes_fim podem vir de um date picker futuramente
      });
      // Mapeia snake_case para camelCase para evitar refactor grande na renderização
      const linhasResumo = apiData.linhas_resumo.map(l => ({
        label: l.label,
        esforcoPlanejado: l.esforco_planejado,
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

  return (
    <Paper elevation={3} sx={{ p: 4, background: 'white', borderRadius: '8px' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 1, color: wegBlue, fontWeight: 'bold' }}>
        Relatório: Planejado vs. Realizado
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
        Visão matricial para comparação de esforço planejado versus realizado por projeto.
      </Typography>

      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '4px', alignItems: 'center', position: 'relative' }}>
        <AutocompleteSecaoFiltro value={secao} onChange={v => { setSecao(v); setEquipe(null); setRecurso(null); }} />
        <AutocompleteEquipeFiltro value={equipe} onChange={v => { setEquipe(v); setRecurso(null); }} secaoId={secao?.id} />
        <AutocompleteRecursoFiltro value={recurso} onChange={setRecurso} equipeId={equipe?.id} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGerarRelatorio}
          disabled={loading || !recurso}
          sx={{ height: '56px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Gerar Relatório'}
        </Button>
      </Box>

      <Box sx={{ overflow: 'auto', maxHeight: '70vh' }}>
        <TableContainer component={Paper} variant="outlined">
        <Table stickyHeader sx={{ tableLayout: 'fixed' }} size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ width: 390, fontWeight: 'bold', pl: 1, whiteSpace: 'nowrap' }}>Projeto/Melhorias</TableCell>
              <TableCell sx={{ width: 100, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap' }}>Status</TableCell>
              <TableCell sx={{ width: 108, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap' }}>Esf. Est.</TableCell>
              <TableCell sx={{ width: 108, fontWeight: 'bold', textAlign: 'center', p: 0, whiteSpace: 'nowrap' }}>Esf. Plan.</TableCell>
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
            {reportData.linhasResumo.map((linha, index) => (
              <TableRow key={linha.label} sx={{ backgroundColor: index === 2 ? '#e3f2fd' : 'inherit' }}>
                <TableCell sx={{ fontWeight: 'bold', paddingLeft: '16px' }}>{linha.label}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{linha.esforcoPlanejado?.toFixed(2)}</TableCell>
                {colunasMeses.map(mes => (
                  <React.Fragment key={mes}>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{linha.meses[mes]?.planejado?.toFixed(2)}</TableCell>
                    <TableCell sx={{ backgroundColor: '#f5f5f5' }}></TableCell>
                  </React.Fragment>
                ))}
                <TableCell></TableCell>
              </TableRow>
            ))}

            {/* Linhas de Projetos */}
            {reportData.projetos.map(projeto => (
              <TableRow key={projeto.nome}>
                <TableCell sx={{ paddingLeft: '16px' }}>{projeto.nome}</TableCell>
                <TableCell sx={{ textAlign: 'center', p: 0 }}>{projeto.status}</TableCell>
                <TableCell sx={{ textAlign: 'center', p: 0 }}>{projeto.esforcoEstimado?.toFixed(2)}</TableCell>
                <TableCell sx={{ textAlign: 'center', p: 0 }}>{projeto.esforcoPlanejado?.toFixed(2)}</TableCell>
                {colunasMeses.map(mes => (
                  <React.Fragment key={mes}>
                    <TableCell sx={{ textAlign: 'center', p: 0 }}>{projeto.meses[mes]?.planejado?.toFixed(2)}</TableCell>
                    <TableCell sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>{projeto.meses[mes]?.realizado?.toFixed(2)}</TableCell>
                  </React.Fragment>
                ))}
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>
    </Paper>
  );
}
