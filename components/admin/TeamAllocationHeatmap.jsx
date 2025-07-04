'use client';

import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Tooltip
} from '@mui/material';

// Função para determinar a cor da célula com base no percentual de alocação
const getColorForPercentage = (percentage) => {
  if (percentage > 100) return '#ffcdd2'; // Vermelho claro para superalocação
  if (percentage >= 85) return '#c8e6c9'; // Verde claro para alocação ideal
  return '#bbdefb'; // Azul claro para alocação normal
};

const TeamAllocationHeatmap = ({ data, meses, mesNomes }) => {
  if (!data || !data.recursos || data.recursos.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 4, width: '100%' }}>
      <Typography variant="h6" gutterBottom>Mapa de Calor de Alocação da Equipe</Typography>
      <TableContainer>
        <Table stickyHeader size="small" sx={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Recurso</TableCell>
              {meses.map(mes => (
                <TableCell key={mes} align="center" sx={{ fontWeight: 'bold' }}>
                  {mesNomes[mes]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.recursos.map(recurso => (
              <TableRow key={recurso.recurso_id}>
                <TableCell component="th" scope="row">
                  {recurso.recurso_nome}
                </TableCell>
                {meses.map(mes => {
                  const alocacao = recurso.alocacoes.find(a => a.mes === mes);
                  const percentual = alocacao ? alocacao.percentual_alocacao : 0;
                  return (
                    <Tooltip key={mes} title={`${percentual}% alocado`} placement="top">
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: getColorForPercentage(percentual),
                          color: 'black',
                          border: '1px solid rgba(224, 224, 224, 1)',
                        }}
                      >
                        {`${percentual}%`}
                      </TableCell>
                    </Tooltip>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 14, height: 14, backgroundColor: '#ffcdd2', mr: 1 }} />
              <Typography variant="caption">{'> 100%'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 14, height: 14, backgroundColor: '#c8e6c9', mr: 1 }} />
              <Typography variant="caption">{'85-100%'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 14, height: 14, backgroundColor: '#bbdefb', mr: 1 }} />
              <Typography variant="caption">{'< 85%'}</Typography>
          </Box>
      </Box>
    </Paper>
  );
};

export default TeamAllocationHeatmap;
