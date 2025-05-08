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
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2 }}>
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
        <Grid item xs={12} md={6} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Alertas de Capacidade</Typography>
            {capacityAlerts.length > 0 ? (
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

        {/* Atalhos Rápidos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Atalhos Rápidos</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <NextLink href="/apontamentos/criar-manual" passHref legacyBehavior><Button variant="contained" component="a">Criar Apontamento Manual</Button></NextLink>
              <NextLink href="/planejamento/horas-recurso" passHref legacyBehavior><Button variant="contained" component="a">Planejar Horas</Button></NextLink>
              <NextLink href="/gerenciamento/recursos" passHref legacyBehavior><Button variant="contained" component="a">Gerenciar Recursos</Button></NextLink>
              <NextLink href="/gerenciamento/projetos" passHref legacyBehavior><Button variant="contained" component="a">Gerenciar Projetos</Button></NextLink>
              <NextLink href="/apontamentos/consultar-gerenciar" passHref legacyBehavior><Button variant="contained" component="a">Consultar Apontamentos</Button></NextLink>
            </Box>
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
                  <NextLink href={`/gerenciamento/projetos?id=${project.id}`} passHref legacyBehavior>
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

