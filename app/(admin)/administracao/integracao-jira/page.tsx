"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Alert, 
  CircularProgress,
  Snackbar
} from '@mui/material';

export default function IntegracaoJiraPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleSincronizarMesAnterior = async () => {
    try {
      setLoading(true);
      setSnackbar({ open: false, message: '', severity: 'success' });
      
      // Obter token do NextAuth/Keycloak
      const token = session?.accessToken;
      console.log('[JIRA] Token recuperado da sessão:', token);
      if (!token) throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      
      // LOG: Preparando chamada para backend
      console.log('[JIRA] Enviando requisição para /backend/v1/sincronizacoes-jira/importar-mes-anterior');
      
      // Configurar timeout para a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
      
      try {
        const response = await fetch('/backend/v1/sincronizacoes-jira/importar-mes-anterior', {
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
              throw new Error((data && data.detail) || `Erro ao sincronizar worklogs do mês anterior. Código: ${response.status}`);
          }
        }
        
        setSnackbar({
          open: true,
          message: 'Sincronização dos worklogs do mês anterior iniciada com sucesso! Aguarde alguns minutos e consulte os apontamentos.',
          severity: 'success'
        });
      } catch (fetchError: any) {
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
      console.error('[JIRA] Erro ao sincronizar:', error);
      
      // Tratamento específico para erros de rede
      let mensagemErro = '';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        mensagemErro = 'Erro de conexão. Verifique se o servidor está acessível.';
      } else if (error instanceof Error) {
        mensagemErro = error.message;
      } else {
        mensagemErro = 'Erro desconhecido ao sincronizar worklogs do mês anterior.';
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
          Sincronização de Apontamentos
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4, mt: 2 }}>
          Esta funcionalidade permite sincronizar os worklogs (apontamentos) do mês anterior registrados no Jira.
          A sincronização é feita em segundo plano e pode levar alguns minutos para ser concluída.
        </Alert>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSincronizarMesAnterior}
            disabled={loading}
            sx={{ minWidth: 250, py: 1.5 }}
          >
            {loading ? 
              <CircularProgress size={24} color="inherit" /> : 
              'Sincronizar Worklogs do Mês Anterior'
            }
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