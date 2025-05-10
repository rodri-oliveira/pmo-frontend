import { Box, Typography, Grid, Paper, Button, Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';

// Placeholder data - a ser substituído por chamadas de API
const jiraStatus = {
  status: 'Verde',
  lastSync: '08/05/2025 10:00',
  message: '',
};

const capacityAlerts = [
  { id: 1, nome: 'Recurso A', horasApontadas: 180, horasDisponiveis: 160, excesso: 20 },
  { id: 2, nome: 'Recurso B', horasApontadas: 170, horasDisponiveis: 160, excesso: 10 },
];

const recentProjects = [
  { id: 1, nome: 'Projeto Alpha', status: 'Em Andamento', dataModificacao: '07/05/2025' },
  { id: 2, nome: 'Melhoria XPTO', status: 'Concluído', dataModificacao: '06/05/2025' },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Status da Integração Jira */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Status da Integração Jira</Typography>
            <Typography>Status: <span style={{ color: jiraStatus.status === 'Verde' ? 'green' : jiraStatus.status === 'Amarelo' ? 'orange' : 'red' }}>{jiraStatus.status}</span></Typography>
            <Typography>Última Sincronização: {jiraStatus.lastSync}</Typography>
            {jiraStatus.message && <Typography color="error">{jiraStatus.message}</Typography>}
            <NextLink href="/administracao/integracao-jira" passHref legacyBehavior>
              <MuiLink sx={{ mt: 1, display: 'block' }}>Ver Logs Detalhados</MuiLink>
            </NextLink>
          </Paper>
        </Grid>

        {/* Alertas de Capacidade */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Alertas de Capacidade</Typography>
            {capacityAlerts.length > 0 ? (
              capacityAlerts.map(alert => (
                <Box key={alert.id} sx={{ mb: 1 }}>
                  <Typography>Recurso: {alert.nome} | Apontadas: {alert.horasApontadas}h | Disponíveis: {alert.horasDisponiveis}h | <span style={{ color: 'red' }}>Excesso: {alert.excesso}h</span></Typography>
                  <NextLink href={`/admin/apontamentos/consultar-gerenciar?recurso=${alert.id}`} passHref legacyBehavior>
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
                  href="/admin/apontamentos/criar-manual"
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
                  href="/admin/gerenciamento/recursos"
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
                  href="/admin/gerenciamento/projetos"
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
            {recentProjects.length > 0 ? (
              recentProjects.map(project => (
                <Box key={project.id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>{project.nome} ({project.status}) - Modificado em: {project.dataModificacao}</Typography>
                  <NextLink href={`/admin/gerenciamento/projetos?id=${project.id}`} passHref legacyBehavior>
                    <MuiLink>Ver Projeto</MuiLink>
                  </NextLink>
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

