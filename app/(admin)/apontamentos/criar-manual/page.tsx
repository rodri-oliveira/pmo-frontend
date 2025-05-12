"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  Snackbar, Alert, CircularProgress, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { format, parseISO, addHours } from 'date-fns';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';

interface Recurso {
  id: number;
  nome: string;
  email?: string;
  ativo?: boolean;
}

interface Projeto {
  id: number;
  nome: string;
  codigo_empresa: string;
  ativo?: boolean;
}

interface ApontamentoFormData {
  recurso_id: number;
  projeto_id: number;
  data_apontamento: Date | null;
  horas_apontadas: number;
  descricao: string;
  jira_issue_key?: string;
  data_hora_inicio_trabalho?: Date | null;
  data_hora_fim_trabalho?: Date | null;
}

const CriarApontamentoManualPage = () => {
  const [formData, setFormData] = useState<ApontamentoFormData>({
    recurso_id: 0,
    projeto_id: 0,
    data_apontamento: new Date(),
    horas_apontadas: 0,
    descricao: '',
    jira_issue_key: '',
    data_hora_inicio_trabalho: null,
    data_hora_fim_trabalho: null
  });
  
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [loadingProjetos, setLoadingProjetos] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Dados mockados para desenvolvimento (quando a API não estiver disponível)
  const dadosMockRecursos: Recurso[] = [
    { id: 1, nome: 'João Silva', email: 'joao.silva@empresa.com', ativo: true },
    { id: 2, nome: 'Maria Oliveira', email: 'maria.oliveira@empresa.com', ativo: true },
    { id: 3, nome: 'Pedro Santos', email: 'pedro.santos@empresa.com', ativo: true },
    { id: 4, nome: 'Ana Souza', email: 'ana.souza@empresa.com', ativo: false }
  ];
  
  const dadosMockProjetos: Projeto[] = [
    { id: 1, nome: 'Projeto A', codigo_empresa: 'PROJ-001', ativo: true },
    { id: 2, nome: 'Projeto B', codigo_empresa: 'PROJ-002', ativo: true },
    { id: 3, nome: 'Projeto C', codigo_empresa: 'PROJ-003', ativo: true },
    { id: 4, nome: 'Projeto D', codigo_empresa: 'PROJ-004', ativo: false }
  ];
  
  // Função para buscar recursos
  const fetchRecursos = async () => {
    setLoadingRecursos(true);
    try {
      // Em ambiente de produção, descomente:
      // const response = await fetch('http://localhost:8000/backend/v1/recursos?ativo=true');
      // const data = await response.json();
      // setRecursos(data.items || []);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        setRecursos(dadosMockRecursos.filter(r => r.ativo));
        setLoadingRecursos(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      // Garantir que recursos seja um array mesmo em caso de erro
      setRecursos(dadosMockRecursos.filter(r => r.ativo));
      setSnackbar({
        open: true,
        message: 'Erro ao carregar recursos. Usando dados de exemplo.',
        severity: 'error'
      });
      setLoadingRecursos(false);
    }
  };
  
  // Função para buscar projetos
  const fetchProjetos = async () => {
    setLoadingProjetos(true);
    try {
      // Em ambiente de produção, descomente:
      // const response = await fetch('http://localhost:8000/backend/v1/projetos?ativo=true');
      // const data = await response.json();
      // setProjetos(data.items || []);
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        setProjetos(dadosMockProjetos.filter(p => p.ativo));
        setLoadingProjetos(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      // Garantir que projetos seja um array mesmo em caso de erro
      setProjetos(dadosMockProjetos.filter(p => p.ativo));
      setSnackbar({
        open: true,
        message: 'Erro ao carregar projetos. Usando dados de exemplo.',
        severity: 'error'
      });
      setLoadingProjetos(false);
    }
  };
  
  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar formulário
      if (!formData.recurso_id || !formData.projeto_id || !formData.data_apontamento || formData.horas_apontadas <= 0) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }
      
      // Em ambiente de produção, descomente:
      // const response = await fetch('http://localhost:8000/backend/v1/apontamentos', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Erro ao criar apontamento');
      // }
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        console.log('Apontamento criado:', formData);
        setSnackbar({
          open: true,
          message: 'Apontamento criado com sucesso!',
          severity: 'success'
        });
        
        // Resetar formulário
        setFormData({
          recurso_id: 0,
          projeto_id: 0,
          data_apontamento: new Date(),
          horas_apontadas: 0,
          descricao: '',
          jira_issue_key: '',
          data_hora_inicio_trabalho: null,
          data_hora_fim_trabalho: null
        });
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao criar apontamento:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Erro ao criar apontamento. Tente novamente.',
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  // Função para calcular horas entre início e fim
  const calcularHoras = () => {
    if (formData.data_hora_inicio_trabalho && formData.data_hora_fim_trabalho) {
      const inicio = new Date(formData.data_hora_inicio_trabalho);
      const fim = new Date(formData.data_hora_fim_trabalho);
      const diffMs = fim.getTime() - inicio.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      // Arredondar para 2 casas decimais
      const horasArredondadas = Math.round(diffHours * 100) / 100;
      
      setFormData({
        ...formData,
        horas_apontadas: horasArredondadas > 0 ? horasArredondadas : 0
      });
    }
  };
  
  // Efeito para buscar dados ao carregar a página
  useEffect(() => {
    fetchRecursos();
    fetchProjetos();
  }, []);
  
  // Efeito para calcular horas quando as datas são alteradas
  useEffect(() => {
    calcularHoras();
  }, [formData.data_hora_inicio_trabalho, formData.data_hora_fim_trabalho]);
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Criar Apontamento Manual
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Recurso */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="recurso-label">Recurso</InputLabel>
                  <Select
                    labelId="recurso-label"
                    value={formData.recurso_id || ''}
                    label="Recurso"
                    onChange={(e: SelectChangeEvent<number>) => 
                      setFormData({ ...formData, recurso_id: Number(e.target.value) })}
                    startAdornment={<PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    disabled={loadingRecursos}
                  >
                    <MenuItem value={0} disabled>Selecione um recurso</MenuItem>
                    {(recursos || []).map((recurso) => (
                      <MenuItem key={recurso.id} value={recurso.id}>
                        {recurso.nome}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingRecursos && (
                    <CircularProgress size={24} sx={{ position: 'absolute', right: 40, top: 12 }} />
                  )}
                </FormControl>
              </Grid>
              
              {/* Projeto */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="projeto-label">Projeto</InputLabel>
                  <Select
                    labelId="projeto-label"
                    value={formData.projeto_id || ''}
                    label="Projeto"
                    onChange={(e: SelectChangeEvent<number>) => 
                      setFormData({ ...formData, projeto_id: Number(e.target.value) })}
                    startAdornment={<FolderIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    disabled={loadingProjetos}
                  >
                    <MenuItem value={0} disabled>Selecione um projeto</MenuItem>
                    {(projetos || []).map((projeto) => (
                      <MenuItem key={projeto.id} value={projeto.id}>
                        {projeto.nome} ({projeto.codigo_empresa})
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingProjetos && (
                    <CircularProgress size={24} sx={{ position: 'absolute', right: 40, top: 12 }} />
                  )}
                </FormControl>
              </Grid>
              
              {/* Data do Apontamento */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data do Apontamento"
                  value={formData.data_apontamento}
                  onChange={(newValue) => 
                    setFormData({ ...formData, data_apontamento: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      InputProps: {
                        startAdornment: <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }
                    }
                  }}
                />
              </Grid>
              
              {/* Horas Apontadas */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horas Apontadas"
                  type="number"
                  value={formData.horas_apontadas}
                  onChange={(e) => 
                    setFormData({ ...formData, horas_apontadas: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    inputProps: { min: 0, step: 0.25 }
                  }}
                />
              </Grid>
              
              {/* Data/Hora Início */}
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Hora Início"
                  value={formData.data_hora_inicio_trabalho}
                  onChange={(newValue) => 
                    setFormData({ ...formData, data_hora_inicio_trabalho: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      helperText: 'Opcional: para cálculo automático de horas'
                    }
                  }}
                />
              </Grid>
              
              {/* Data/Hora Fim */}
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Hora Fim"
                  value={formData.data_hora_fim_trabalho}
                  onChange={(newValue) => 
                    setFormData({ ...formData, data_hora_fim_trabalho: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      helperText: 'Opcional: para cálculo automático de horas'
                    }
                  }}
                />
              </Grid>
              
              {/* Descrição */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              {/* Jira Issue */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Jira Issue Key"
                  placeholder="Ex: PROJ-123"
                  value={formData.jira_issue_key || ''}
                  onChange={(e) => setFormData({ ...formData, jira_issue_key: e.target.value })}
                  InputProps={{
                    startAdornment: <CodeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  helperText="Opcional: Referência ao ticket do Jira"
                />
              </Grid>
              
              {/* Botão Salvar */}
              <Grid item xs={12}>
                <Button 
                  type="submit"
                  variant="contained" 
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Salvando...' : 'Salvar Apontamento'}
                  {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {/* Snackbar para feedback */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default CriarApontamentoManualPage;