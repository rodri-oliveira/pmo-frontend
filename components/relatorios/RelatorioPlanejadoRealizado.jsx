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
import AutocompleteSecaoCascade from './AutocompleteSecaoCascade';
import AutocompleteEquipeCascade from './AutocompleteEquipeCascade';
import AutocompleteRecursoCascade from './AutocompleteRecursoCascade';

const wegBlue = '#00579d';

// Dados mocados para visualização inicial
const mockData = {
  linhasResumo: [
    {
      label: 'GAP',
      esforcoPlanejado: -10.00,
      meses: {
        'ago/24': { planejado: -5.00, realizado: null },
        'set/24': { planejado: -20.00, realizado: null },
      }
    },
    {
      label: 'Horas Disponíveis',
      esforcoPlanejado: 340.00,
      meses: {
        'ago/24': { planejado: 170.00, realizado: null },
        'set/24': { planejado: 170.00, realizado: null },
      }
    },
    {
      label: 'Total de esforço (hrs)',
      esforcoPlanejado: 350.00,
      meses: {
        'ago/24': { planejado: 175.00, realizado: null },
        'set/24': { planejado: 175.00, realizado: null },
      }
    },
  ],
  projetos: [
    {
      nome: 'Projeto Alpha',
      status: 'Em andamento',
      esforcoEstimado: 200,
      esforcoPlanejado: 180,
      meses: {
        'ago/24': { planejado: 90, realizado: 95 },
        'set/24': { planejado: 90, realizado: 85 },
      }
    },
    {
      nome: 'Melhoria Contínua',
      status: 'Backlog',
      esforcoEstimado: 180,
      esforcoPlanejado: 170,
      meses: {
        'ago/24': { planejado: 85, realizado: 80 },
        'set/24': { planejado: 85, realizado: 90 },
      }
    },
  ]
};

const colunasMeses = ['ago/24', 'set/24'];

export default function RelatorioPlanejadoRealizado() {
  const [secao, setSecao] = useState(null);
  const [equipe, setEquipe] = useState(null);
  const [recurso, setRecurso] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGerarRelatorio = () => {
    console.log({ secao, equipe, recurso });
    // A chamada à API será implementada aqui
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
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3, p: 2, border: '1px solid #ddd', borderRadius: '4px', alignItems: 'center' }}>
        <AutocompleteSecaoCascade value={secao} onChange={(newValue) => { setSecao(newValue); setEquipe(null); setRecurso(null); }} />
        <AutocompleteEquipeCascade value={equipe} secaoId={secao?.id} onChange={(newValue) => { setEquipe(newValue); setRecurso(null); }} disabled={!secao} />
        <AutocompleteRecursoCascade value={recurso} equipeId={equipe?.id} onChange={setRecurso} disabled={!equipe} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGerarRelatorio}
          disabled={loading || !recurso} // Matriz só reflete o recurso selecionado
          sx={{ height: '56px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Gerar Relatório'}
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ tableLayout: 'fixed' }} size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ width: '11%', fontWeight: 'bold', paddingLeft: '16px' }}>Projeto/Melhorias</TableCell>
              <TableCell sx={{ width: '7.5%', fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
              <TableCell sx={{ width: '7.5%', fontWeight: 'bold', textAlign: 'center' }}>Esforço Estimado</TableCell>
              <TableCell sx={{ width: '7.5%', fontWeight: 'bold', textAlign: 'center' }}>Esforço Planejado</TableCell>
              {colunasMeses.map(mes => (
                <React.Fragment key={mes}>
                  <TableCell sx={{ width: '6%', fontWeight: 'bold', textAlign: 'center' }}>{mes}</TableCell>
                  <TableCell sx={{ width: '6%', fontWeight: 'bold', backgroundColor: '#e0e0e0', textAlign: 'center' }}>Hs. Apont</TableCell>
                </React.Fragment>
              ))}
              <TableCell sx={{ width: '3%' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Linhas de Resumo */}
            {mockData.linhasResumo.map((linha, index) => (
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
            {mockData.projetos.map(projeto => (
              <TableRow key={projeto.nome}>
                <TableCell sx={{ paddingLeft: '16px' }}>{projeto.nome}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{projeto.status}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{projeto.esforcoEstimado?.toFixed(2)}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{projeto.esforcoPlanejado?.toFixed(2)}</TableCell>
                {colunasMeses.map(mes => (
                  <React.Fragment key={mes}>
                    <TableCell sx={{ textAlign: 'center' }}>{projeto.meses[mes]?.planejado?.toFixed(2)}</TableCell>
                    <TableCell sx={{ backgroundColor: '#f5f5f5', textAlign: 'center' }}>{projeto.meses[mes]?.realizado?.toFixed(2)}</TableCell>
                  </React.Fragment>
                ))}
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
