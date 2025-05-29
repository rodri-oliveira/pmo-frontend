"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Alert, 
  CircularProgress,
  Snackbar
} from '@mui/material';

export default function IntegracaoJiraPage() {
  const { data: session } = useSession();
  const [loadingSincronizar, setLoadingSincronizar] = useState(false);

  // ...restante do código

  const handleSincronizarJira = async () => {
    try {
      setLoadingSincronizar(true);
      setSnackbar({ open: false, message: '', severity: 'success' });
      // Obter token do NextAuth/Keycloak
      const token = session?.accessToken;
      console.log('[JIRA] Token recuperado da sessão:', token);
      if (!token) throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      // LOG: Preparando chamada para backend
      console.log('[JIRA] Enviando requisição para /backend/v1/sincronizacoes-jira/importar com Authorization:', `Bearer ${token}`);
      console.log('[JIRA] Configuração enviada:', config);
      const response = await fetch('/backend/v1/sincronizacoes-jira/importar-tudo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('[JIRA] Status da resposta:', response.status);
      let data = null;
      try {
        data = await response.clone().json();
        console.log('[JIRA] Corpo da resposta:', data);
      } catch (err) {
        console.log('[JIRA] Não foi possível fazer parse do JSON da resposta.');
      }
      if (!response.ok) {
        throw new Error((data && data.detail) || 'Erro ao sincronizar com o Jira.');
      }
      setSnackbar({
        open: true,
        message: 'Sincronização iniciada com sucesso! Aguarde alguns minutos e consulte os apontamentos.',
        severity: 'success'
      });
    } catch (error) {
      console.error('[JIRA] Erro no handleSincronizarJira:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error
  ? error.message
  : 'Erro ao sincronizar com o Jira.',
        severity: 'error'
      });
    } finally {
      setLoadingSincronizar(false);
    }
  };

  const [config, setConfig] = useState({
    url: '',
    apiKey: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    // Aqui podemos carregar as configurações existentes
    const carregarConfiguracoes = async () => {
      try {
        setLoading(true);
        // Implementar chamada à API quando estiver disponível
        // const response = await fetch('/api/jira-config');
        // const data = await response.json();
        // setConfig(data);
        
        // Simulação para desenvolvimento
        setTimeout(() => {
          setConfig({
            url: 'https://jira.weg.net',
            apiKey: '',
            username: 'usuario.jira',
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        setLoading(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Implementar chamada à API quando estiver disponível
      // await fetch('/api/jira-config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Configurações salvas com sucesso!',
          severity: 'success'
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar configurações.',
        severity: 'error'
      });
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setTestResult(null);
      
      // Implementar chamada à API quando estiver disponível
      // const response = await fetch('/api/jira-test-connection', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      // const data = await response.json();
      
      // Simulação para desenvolvimento
      setTimeout(() => {
        setLoading(false);
        setTestResult({
          success: true,
          message: 'Conexão estabelecida com sucesso!'
        });
      }, 1500);
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setLoading(false);
      setTestResult({
        success: false,
        message: 'Erro ao conectar com o Jira. Verifique as credenciais.'
      });
    }
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
          Configurações de Conexão
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL do Jira"
              name="url"
              value={config.url}
              onChange={handleChange}
              placeholder="https://jira.exemplo.com"
              helperText="URL completa da instância do Jira"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome de Usuário"
              name="username"
              value={config.username}
              onChange={handleChange}
              placeholder="usuario.jira"
              helperText="Nome de usuário para autenticação no Jira"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="API Key / Token"
              name="apiKey"
              type="password"
              value={config.apiKey}
              onChange={handleChange}
              placeholder="••••••••••••••••"
              helperText="Token de API para autenticação (mantenha em segredo)"
            />
          </Grid>
          
          <Grid item xs={12} md={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              A sincronização irá importar automaticamente <b>todos os projetos do Jira</b> que o usuário configurado tem permissão de visualizar. Não é necessário informar nenhuma chave de projeto.
            </Alert>
          </Grid>
        </Grid>
        
        {testResult && (
          <Alert 
            severity={testResult.success ? "success" : "error"} 
            sx={{ mt: 3 }}
          >
            {testResult.message}
          </Alert>
        )}
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar Configurações'}
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleTestConnection}
            disabled={loading || !config.url || !config.apiKey || !config.username}
          >
            Testar Conexão
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleSincronizarJira}
            disabled={loadingSincronizar}
          >
            {loadingSincronizar ? <CircularProgress size={24} /> : 'Sincronizar Apontamentos do Jira'}
          </Button>
        </Box>
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