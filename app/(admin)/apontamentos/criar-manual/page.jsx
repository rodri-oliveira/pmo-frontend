"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import AutocompleteRecurso from '@/components/AutocompleteRecurso';
import AutocompleteProjeto from '@/components/AutocompleteProjeto';
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



const CriarApontamentoManualPage = () => {
    const [formData, setFormData] = useState({
    recurso_id: null,
    projeto_id: null,
    data_apontamento: new Date(),
    horas_apontadas: 0,
    descricao: '',
    jira_issue_key: '',
    data_hora_inicio_trabalho: null,
    data_hora_fim_trabalho: null
  });
  
    const [recursos, setRecursos] = useState([]);
    const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [loadingProjetos, setLoadingProjetos] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
        severity: 'success'
  });
  
  // Função para buscar recursos
  const fetchRecursos = useCallback(async () => {
    setLoadingRecursos(true);
    try {
      const response = await fetch('http://localhost:8000/backend/v1/recursos?ativo=true');
      if (!response.ok) throw new Error('Falha ao buscar recursos');
      const data = await response.json();
      setRecursos(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar recursos:', error);
      setRecursos([]);
      setSnackbar({ open: true, message: 'Erro ao carregar recursos.', severity: 'error' });
    } finally {
      setLoadingRecursos(false);
    }
  }, []);
  
  // Função para buscar projetos
  const fetchProjetos = useCallback(async () => {
    setLoadingProjetos(true);
    try {
      const response = await fetch('http://localhost:8000/backend/v1/projetos?ativo=true');
      if (!response.ok) throw new Error('Falha ao buscar projetos');
      const data = await response.json();
      setProjetos(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setProjetos([]);
      setSnackbar({ open: true, message: 'Erro ao carregar projetos.', severity: 'error' });
    } finally {
      setLoadingProjetos(false);
    }
  }, []);
  
  // Função para enviar o formulário
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar formulário
      if (!formData.recurso_id || !formData.recurso_id.id || !formData.projeto_id || !formData.projeto_id.id || !formData.data_apontamento || formData.horas_apontadas <= 0) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }
      
      // Preparar dados para envio (extrair apenas o id)
      const dadosEnvio = {
        ...formData,
        recurso_id: formData.recurso_id.id,
        projeto_id: formData.projeto_id.id
      };
      
      const response = await fetch('http://localhost:8000/backend/v1/apontamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosEnvio),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erro ao criar apontamento');
      }
      
      setSnackbar({
        open: true,
        message: 'Apontamento criado com sucesso!',
        severity: 'success'
      });
      
      // Resetar formulário
      setFormData({
        recurso_id: null,
        projeto_id: null,
        data_apontamento: new Date(),
        horas_apontadas: 0,
        descricao: '',
        jira_issue_key: '',
        data_hora_inicio_trabalho: null,
        data_hora_fim_trabalho: null
      });

    } catch (error) {
      console.error('Erro ao criar apontamento:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Erro ao criar apontamento. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para calcular horas entre início e fim
  const calcularHoras = useCallback(() => {
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
  }, [formData]);
  
  // Efeito para buscar dados ao carregar a página
  useEffect(() => {
    fetchRecursos();
    fetchProjetos();
  }, [fetchRecursos, fetchProjetos]);
  
  // Efeito para calcular horas quando as datas são alteradas
  useEffect(() => {
    calcularHoras();
  }, [calcularHoras]);
  
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
                <AutocompleteRecurso
                  value={formData.recurso_id}
                  onChange={(val) => setFormData({ ...formData, recurso_id: val })}
                  placeholder="Digite o nome do recurso..."
                />
                {loadingRecursos && (
                  <CircularProgress size={24} sx={{ position: 'absolute', right: 40, top: 12 }} />
                )}
              </Grid>
              
              {/* Projeto */}
              <Grid item xs={12} md={6}>
                <AutocompleteProjeto
                  value={formData.projeto_id}
                  onChange={(val) => setFormData({ ...formData, projeto_id: val })}
                  placeholder="Digite o nome do projeto..."
                />
                {loadingProjetos && (
                  <CircularProgress size={24} sx={{ position: 'absolute', right: 40, top: 12 }} />
                )}
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