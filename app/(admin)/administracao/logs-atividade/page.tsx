"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale/pt-BR';

// Tipo para os logs
interface Log {
  id: number;
  usuario: string;
  acao: string;
  entidade: string;
  entidade_id: number;
  detalhes: string;
  data_hora: string;
  ip: string;
}

// Tipos de ações possíveis
const TIPOS_ACAO = ['Criar', 'Atualizar', 'Excluir', 'Login', 'Logout', 'Visualizar'];

// Tipos de entidades
const TIPOS_ENTIDADE = ['Usuário', 'Projeto', 'Recurso', 'Equipe', 'Seção', 'Apontamento', 'Status'];

export default function LogsAtividadePage() {
  // Estado para armazenar os logs
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estados para filtros
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroAcao, setFiltroAcao] = useState<string>('');
  const [filtroEntidade, setFiltroEntidade] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  
  // Carregar logs (simulação)
  useEffect(() => {
    const carregarLogs = async () => {
      try {
        setLoading(true);
        // Simulação de chamada à API
        // const response = await fetch('/api/logs?page=${page}&limit=${rowsPerPage}');
        // const data = await response.json();
        // setLogs(data.items);
        
        // Dados simulados para desenvolvimento
        setTimeout(() => {
          const dadosSimulados: Log[] = Array.from({ length: 35 }, (_, i) => ({
            id: i + 1,
            usuario: `usuario${i % 5 + 1}@weg.net`,
            acao: TIPOS_ACAO[i % TIPOS_ACAO.length],
            entidade: TIPOS_ENTIDADE[i % TIPOS_ENTIDADE.length],
            entidade_id: Math.floor(Math.random() * 100) + 1,
            detalhes: `Detalhes da operação ${i + 1}`,
            data_hora: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            ip: `192.168.1.${Math.floor(Math.random() * 255) + 1}`
          }));
          
          setLogs(dadosSimulados);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar logs:', error);
        setLoading(false);
      }
    };
    
    carregarLogs();
  }, [page, rowsPerPage]);
  
  // Manipuladores de eventos para paginação
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Função para aplicar filtros
  const logsFiltered = logs.filter(log => {
    // Filtro por usuário
    if (filtroUsuario && !log.usuario.toLowerCase().includes(filtroUsuario.toLowerCase())) {
      return false;
    }
    
    // Filtro por ação
    if (filtroAcao && log.acao !== filtroAcao) {
      return false;
    }
    
    // Filtro por entidade
    if (filtroEntidade && log.entidade !== filtroEntidade) {
      return false;
    }
    
    // Filtro por data de início
    if (dataInicio && new Date(log.data_hora) < dataInicio) {
      return false;
    }
    
    // Filtro por data de fim
    if (dataFim) {
      const dataFimAjustada = new Date(dataFim);
      dataFimAjustada.setHours(23, 59, 59);
      if (new Date(log.data_hora) > dataFimAjustada) {
        return false;
      }
    }
    
    return true;
  });
  
  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };
  
  // Função para obter a cor do chip baseado na ação
  const getChipColor = (acao: string) => {
    switch (acao) {
      case 'Criar':
        return 'success';
      case 'Atualizar':
        return 'info';
      case 'Excluir':
        return 'error';
      case 'Login':
        return 'primary';
      case 'Logout':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00579d', fontWeight: 'medium' }}>
        Logs de Atividade
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Usuário"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Ação</InputLabel>
              <Select
                value={filtroAcao}
                label="Ação"
                onChange={(e) => setFiltroAcao(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {TIPOS_ACAO.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Entidade</InputLabel>
              <Select
                value={filtroEntidade}
                label="Entidade"
                onChange={(e) => setFiltroEntidade(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {TIPOS_ENTIDADE.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label="Data Início"
                value={dataInicio}
                onChange={(newValue) => setDataInicio(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label="Data Fim"
                value={dataFim}
                onChange={(newValue) => setDataFim(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={2} sx={{ width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="tabela de logs">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Data/Hora</TableCell>
                    <TableCell>Usuário</TableCell>
                    <TableCell>Ação</TableCell>
                    <TableCell>Entidade</TableCell>
                    <TableCell>ID Entidade</TableCell>
                    <TableCell>Detalhes</TableCell>
                    <TableCell>IP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logsFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{formatarData(log.data_hora)}</TableCell>
                        <TableCell>{log.usuario}</TableCell>
                        <TableCell>
                          <Chip 
                            label={log.acao} 
                            color={getChipColor(log.acao) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.entidade}</TableCell>
                        <TableCell>{log.entidade_id}</TableCell>
                        <TableCell>{log.detalhes}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={logsFiltered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}