"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Link as MuiLink, CircularProgress, Snackbar, Alert } from '@mui/material';
import NextLink from 'next/link';
import { getProjetos } from '@/services/projetos';
import { getRecursos } from '@/services/recursos';
import { getApontamentos } from '@/services/apontamentos';
import { apiGet } from '@/services/api';
import { format, parseISO } from 'date-fns';




export default function DashboardPage() {
  // Estado para projetos recentes
    const [recentProjects, setRecentProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Estado para status do Jira
    const [jiraStatus, setJiraStatus] = useState(null);
  const [loadingJiraStatus, setLoadingJiraStatus] = useState(true);
  
  // Estado para alertas de capacidade
    const [capacityAlerts, setCapacityAlerts] = useState([]);
  const [loadingCapacityAlerts, setLoadingCapacityAlerts] = useState(true);
  
  // Estado para feedback ao usuário
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  // Busca projetos recentes
  useEffect(() => {
    const fetchRecentProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await getProjetos({ limit: 10 });
        const projects = response.items || [];
        
        // Ordena por data de atualização (mais recentes primeiro)
        projects.sort((a, b) => {
          const dateA = a.data_atualizacao ? new Date(a.data_atualizacao).getTime() : 0;
          const dateB = b.data_atualizacao ? new Date(b.data_atualizacao).getTime() : 0;
          return dateB - dateA;
        });
        
        setRecentProjects(projects.slice(0, 3));
      } catch (error) {
        console.error('Erro ao buscar projetos recentes:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar projetos recentes.',
          severity: 'error'
        });
        setRecentProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    
    fetchRecentProjects();
  }, []);
  

  

  // Busca status da integração Jira
  useEffect(() => {
    const fetchJiraStatus = async () => {
      setLoadingJiraStatus(true);
      try {
        // Usando o endpoint /health para verificar o status da integração
                const response = await apiGet('/health');
        
        // Assumindo que a resposta tem informações sobre a integração Jira
        if (response && response.jira_integration) {
          setJiraStatus({
            status: response.jira_integration.status === 'ok' ? 'Verde' : 'Vermelho',
            lastSync: response.jira_integration.last_sync || new Date().toISOString(),
            message: response.jira_integration.message || ''
          });
        } else if (response) {
          // Se não houver informações específicas sobre o Jira
          setJiraStatus({
            status: response.status === 'ok' ? 'Verde' : 'Vermelho',
            lastSync: new Date().toISOString(),
            message: ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar status do Jira:', error);
        setJiraStatus({
          status: 'Vermelho',
          lastSync: new Date().toISOString(),
          message: 'Erro ao verificar status da integração.'
        });
      } finally {
        setLoadingJiraStatus(false);
      }
    };
    
    fetchJiraStatus();
  }, []);
  

  

  // Busca alertas de capacidade (recursos com excesso de horas apontadas)
  useEffect(() => {
    const fetchCapacityAlerts = async () => {
      setLoadingCapacityAlerts(true);
      try {
        // Busca todos os recursos ativos
        const recursosResponse = await getRecursos({ ativo: true });
                const recursos = (recursosResponse?.items || []);
        
        // Para cada recurso, verifica as horas apontadas no mês atual
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JavaScript meses são 0-indexed
        
                const alerts = [];
        
        // Para cada recurso, busca apontamentos e calcula excesso
        for (const recurso of recursos) {
          try {
            // Busca apontamentos do recurso no mês atual
            const apontamentosResponse = await getApontamentos({
              recurso_id: recurso.id,
              mes: month,
              ano: year
            });
            
                        const apontamentos = (apontamentosResponse?.items || []);
            
            // Calcula total de horas apontadas
            const horasApontadas = apontamentos.reduce(
              (total, apontamento) => total + (apontamento.horas_apontadas || 0), 
              0
            );
            
            // Calcula horas disponíveis (dias úteis * horas diárias do recurso)
            // Simplificação: assumindo 22 dias úteis por mês
            const horasDisponiveis = 22 * (recurso.horas_diarias || 8);
            
            // Se houver excesso, adiciona ao alerta
            if (horasApontadas > horasDisponiveis) {
              alerts.push({
                id: recurso.id,
                nome: recurso.nome,
                horasApontadas,
                horasDisponiveis,
                excesso: horasApontadas - horasDisponiveis
              });
            }
          } catch (error) {
            console.error(`Erro ao processar apontamentos para recurso ${recurso.id}:`, error);
          }
        }
        
        // Ordena alertas por excesso (maior para menor)
        alerts.sort((a, b) => b.excesso - a.excesso);
        
        setCapacityAlerts(alerts);
      } catch (error) {
        console.error('Erro ao buscar alertas de capacidade:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar alertas de capacidade.',
          severity: 'error'
        });
        setCapacityAlerts([]);
      } finally {
        setLoadingCapacityAlerts(false);
      }
    };
    
    fetchCapacityAlerts();
  }, []);
  
  // Fecha o snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Snackbar para feedback ao usuário */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        {/* Status da Integração Jira */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Status da Integração Jira</Typography>
            {loadingJiraStatus ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : jiraStatus ? (
              <>
                <Typography>Status: <span style={{ color: jiraStatus.status === 'Verde' ? 'green' : jiraStatus.status === 'Amarelo' ? 'orange' : 'red' }}>{jiraStatus.status}</span></Typography>
                <Typography>Última Sincronização: {format(parseISO(jiraStatus.lastSync), 'dd/MM/yyyy HH:mm')}</Typography>
                {jiraStatus.message && <Typography color="error">{jiraStatus.message}</Typography>}
                <NextLink href="/administracao/integracao-jira" passHref legacyBehavior>
                  <MuiLink sx={{ mt: 1, display: 'block' }}>Ver Logs Detalhados</MuiLink>
                </NextLink>
              </>
            ) : (
              <Typography color="error">Não foi possível obter o status da integração.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Alertas de Capacidade */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Alertas de Capacidade</Typography>
            {loadingCapacityAlerts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : capacityAlerts.length > 0 ? (
              capacityAlerts.map(alert => (
                <Box key={alert.id} sx={{ mb: 1 }}>
                  <Typography>Recurso: {alert.nome} | Apontadas: {alert.horasApontadas}h | Disponíveis: {alert.horasDisponiveis}h | <span style={{ color: 'red' }}>Excesso: {alert.excesso}h</span></Typography>
                  <NextLink href={`/apontamentos/consultar-gerenciar?recurso=${alert.id}`} passHref legacyBehavior>
                    <MuiLink>Consultar Apontamentos</MuiLink>
                  </NextLink>
                </Box>
              ))
            ) : (
              <Typography>Nenhum alerta de capacidade no momento.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Atalhos Rápidos - Agora em formato de cards */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Atalhos Rápidos</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2.4}>
                <Button 
                  variant="contained" 
                  component={NextLink} 
                  href="/apontamentos/criar-manual"
                  sx={{ 
                    width: '100%', 
                    height: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#00579d',
                    '&:hover': {
                      backgroundColor: '#004'
                    }
                  }}
                >
                  Criar Apontamento Manual
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <Button 
                  variant="contained" 
                  component={NextLink} 
                  href="/planejamento/horas-recurso"
                  sx={{ 
                    width: '100%', 
                    height: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#00579d',
                    '&:hover': {
                      backgroundColor: '#004'
                    }
                  }}
                >
                  Planejar Horas
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <Button 
                  variant="contained" 
                  component={NextLink} 
                  href="/gerenciamento/recursos"
                  sx={{ 
                    width: '100%', 
                    height: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#00579d',
                    '&:hover': {
                      backgroundColor: '#004'
                    }
                  }}
                >
                  Gerenciar Recursos
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <Button 
                  variant="contained" 
                  component={NextLink} 
                  href="/gerenciamento/projetos"
                  sx={{ 
                    width: '100%', 
                    height: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#00579d',
                    '&:hover': {
                      backgroundColor: '#004'
                    }
                  }}
                >
                  Gerenciar Projetos
                </Button>
              </Grid>
              <Grid item xs={6} sm={4} md={2.4}>
                <Button 
                  variant="contained" 
                  component={NextLink} 
                  href="/apontamentos/consultar-gerenciar"
                  sx={{ 
                    width: '100%', 
                    height: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#00579d',
                    '&:hover': {
                      backgroundColor: '#004'
                    }
                  }}
                >
                  Consultar Apontamentos
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Projetos/Melhorias Recentes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Projetos/Melhorias Recentes</Typography>
            {loadingProjects ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                <CircularProgress />
              </Box>
            ) : recentProjects.length > 0 ? (
              recentProjects.map(project => (
                <Box key={project.id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">{project.nome}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status: {project.status_projeto?.nome || 'N/A'} - 
                      Modificado em: {project.data_atualizacao ? format(parseISO(project.data_atualizacao), 'dd/MM/yyyy HH:mm') : 'N/A'}
                    </Typography>
                  </Box>
                  <Button 
                    component={NextLink} 
                    href={`/gerenciamento/projetos?id=${project.id}`} 
                    variant="outlined" 
                    size="small"
                  >
                    Ver Projeto
                  </Button>
                </Box>
              ))
            ) : (
              <Typography>Nenhum projeto modificado recentemente.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

