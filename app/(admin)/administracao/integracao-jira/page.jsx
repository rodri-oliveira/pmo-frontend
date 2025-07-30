"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Alert, 
  CircularProgress,
  Snackbar,
  TextField,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';

export default function IntegracaoJiraPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // null, 'running', 'completed', 'error'
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, message: '' });
  const [syncId, setSyncId] = useState(null);
  const pollingInterval = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Estados para o formulário de período
  const [formData, setFormData] = useState({
    mesInicio: new Date().getMonth() + 1,
    anoInicio: new Date().getFullYear(),
    mesFim: new Date().getMonth() + 1,
    anoFim: new Date().getFullYear()
  });



  // Função para verificar status da sincronização
  const checkSyncStatus = async (syncId) => {
    try {
      const token = session?.accessToken;
      if (!token) return;
      
      const response = await fetch(`/backend/sincronizacoes-jira/status/${syncId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSyncProgress({
          current: data.processed || 0,
          total: data.total || 0,
          message: data.message || 'Processando...'
        });
        
        if (data.status === 'completed') {
          setSyncStatus('completed');
          clearInterval(pollingInterval.current);
          setSnackbar({
            open: true,
            message: `Sincronização concluída! ${data.processed || 0} registros processados.`,
            severity: 'success'
          });
          
          // Notificação do navegador se disponível
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sincronização JIRA Concluída', {
              body: `${data.processed || 0} registros foram processados com sucesso.`,
              icon: '/favicon.ico'
            });
          }
        } else if (data.status === 'error') {
          setSyncStatus('error');
          clearInterval(pollingInterval.current);
          setSnackbar({
            open: true,
            message: `Erro na sincronização: ${data.error || 'Erro desconhecido'}`,
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('[JIRA] Erro ao verificar status:', error);
    }
  };
  
  // Iniciar polling quando sincronização começar
  const startPolling = (syncId) => {
    setSyncId(syncId);
    setSyncStatus('running');
    setSyncProgress({ current: 0, total: 0, message: 'Iniciando sincronização...' });
    
    pollingInterval.current = setInterval(() => {
      checkSyncStatus(syncId);
    }, 3000); // Verificar a cada 3 segundos
  };
  
  // Limpar polling ao desmontar componente
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);
  
  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleSincronizarPeriodo = async () => {
    try {
      setLoading(true);
      setSnackbar({ open: false, message: '', severity: 'success' });
      
      // Validações
      if (formData.anoInicio > formData.anoFim || 
          (formData.anoInicio === formData.anoFim && formData.mesInicio > formData.mesFim)) {
        throw new Error('Data de início deve ser anterior ou igual à data de fim.');
      }
      
      // Obter token do NextAuth/Keycloak
      const token = session?.accessToken;
      console.log('[JIRA] Token recuperado da sessão:', token);
      if (!token) throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      
      // Construir URL com parâmetros
      const params = new URLSearchParams({
        mes_inicio: formData.mesInicio.toString(),
        ano_inicio: formData.anoInicio.toString(),
        mes_fim: formData.mesFim.toString(),
        ano_fim: formData.anoFim.toString()
      });
      
      const url = `/backend/sincronizacoes-jira/sincronizar-mes-ano?${params.toString()}`;
      console.log('[JIRA] Enviando requisição para:', url);
      
      // Configurar timeout para a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos de timeout
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        // Limpar o timeout após a resposta
        clearTimeout(timeoutId);
        
        console.log('[JIRA] Status da resposta:', response.status);
        let data = null;
        try {
          data = await response.clone().json();
          console.log('[JIRA] Corpo da resposta:', data);
        } catch (err) {
          console.log('[JIRA] Não foi possível fazer parse do JSON da resposta.');
        }
        
        if (!response.ok) {
          // Tratamento específico para diferentes códigos de status HTTP
          switch (response.status) {
            case 401:
              throw new Error('Não autorizado. Verifique suas credenciais ou faça login novamente.');
            case 403:
              throw new Error('Sem permissão para acessar este recurso.');
            case 404:
              throw new Error('Endpoint de sincronização não encontrado. Contate o suporte.');
            case 500:
              throw new Error('Erro interno no servidor. Tente novamente mais tarde.');
            case 503:
              throw new Error('Serviço indisponível. Tente novamente mais tarde.');
            default:
              throw new Error((data && data.detail) || `Erro ao sincronizar worklogs do período. Código: ${response.status}`);
          }
        }
        
        // Se o backend retornar um ID de sincronização, iniciar polling
        if (data && (data.sync_id || data.sincronizacao_id)) {
          const syncId = data.sync_id || data.sincronizacao_id;
          startPolling(syncId);
          setSnackbar({
            open: true,
            message: data.mensagem || `Sincronização iniciada! Acompanhe o progresso abaixo.`,
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: `Sincronização dos worklogs do período ${formData.mesInicio}/${formData.anoInicio} a ${formData.mesFim}/${formData.anoFim} iniciada com sucesso! Aguarde alguns minutos e consulte os apontamentos.`,
            severity: 'success'
          });
        }
      } catch (fetchError) {
        // Limpar o timeout em caso de erro
        clearTimeout(timeoutId);
        
        // Verificar se o erro foi por timeout
        if (fetchError && fetchError.name === 'AbortError') {
          throw new Error('A requisição excedeu o tempo limite. Verifique a conexão com o servidor.');
        }
        
        // Repassar o erro para ser tratado no catch externo
        throw fetchError;
      }
    } catch (error) {
      console.error('[JIRA] Erro ao sincronizar período:', error);
      
      // Tratamento específico para erros de rede
      let mensagemErro = '';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        mensagemErro = 'Erro de conexão. Verifique se o servidor está acessível.';
      } else if (error instanceof Error) {
        mensagemErro = error.message;
      } else {
        mensagemErro = 'Erro desconhecido ao sincronizar worklogs do período.';
      }
      
      setSnackbar({
        open: true,
        message: mensagemErro,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  


  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00579d', fontWeight: 'medium' }}>
        Integração com Jira
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sincronização por Período
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3, mt: 2 }}>
          Sincronize worklogs de um período específico selecionando mês/ano de início e fim.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Mês Início"
              type="number"
              value={formData.mesInicio}
              onChange={(e) => handleInputChange('mesInicio', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 12 }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Ano Início"
              type="number"
              value={formData.anoInicio}
              onChange={(e) => handleInputChange('anoInicio', parseInt(e.target.value))}
              inputProps={{ min: 2020, max: 2030 }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Mês Fim"
              type="number"
              value={formData.mesFim}
              onChange={(e) => handleInputChange('mesFim', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 12 }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Ano Fim"
              type="number"
              value={formData.anoFim}
              onChange={(e) => handleInputChange('anoFim', parseInt(e.target.value))}
              inputProps={{ min: 2020, max: 2030 }}
              size="small"
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSincronizarPeriodo}
            disabled={loading || syncStatus === 'running'}
            sx={{ minWidth: 250, py: 1.5 }}
          >
            {(loading || syncStatus === 'running') ? 
              <CircularProgress size={24} color="inherit" /> : 
              'Sincronizar Período'
            }
          </Button>
        </Box>
        
        {/* Status da Sincronização */}
        {syncStatus && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1">Status da Sincronização:</Typography>
              <Chip 
                label={
                  syncStatus === 'running' ? 'Em Andamento' :
                  syncStatus === 'completed' ? 'Concluída' :
                  syncStatus === 'error' ? 'Erro' : 'Desconhecido'
                }
                color={
                  syncStatus === 'running' ? 'warning' :
                  syncStatus === 'completed' ? 'success' :
                  syncStatus === 'error' ? 'error' : 'default'
                }
                size="small"
              />
            </Box>
            
            {syncStatus === 'running' && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {syncProgress.message}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {syncProgress.total > 0 ? `${syncProgress.current}/${syncProgress.total}` : `${syncProgress.current} processados`}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant={syncProgress.total > 0 ? "determinate" : "indeterminate"}
                  value={syncProgress.total > 0 ? (syncProgress.current / syncProgress.total) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
            
            {syncStatus === 'completed' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Sincronização concluída com sucesso! {syncProgress.current} registros foram processados.
              </Alert>
            )}
            
            {syncStatus === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Ocorreu um erro durante a sincronização. Verifique os logs ou tente novamente.
              </Alert>
            )}
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}