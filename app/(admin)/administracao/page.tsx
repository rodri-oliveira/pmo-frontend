'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { Settings, Code, Person, History } from '@mui/icons-material';

// Componente para os cards de navegação
const NavCard = ({ title, icon, path }: { title: string; icon: React.ReactNode; path: string }) => {
  const router = useRouter();
  
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 6
          }
        }}
        onClick={() => router.push(path)}
      >
        <Box sx={{ mb: 2, color: 'primary.main' }}>
          {icon}
        </Box>
        <Typography variant="h6" component="h2" align="center">
          {title}
        </Typography>
      </Paper>
    </Grid>
  );
};

export default function AdministracaoPage() {
  const router = useRouter();

  // Opcionalmente, você pode redirecionar para uma subpágina específica
  // useEffect(() => {
  //   router.push('/administracao/usuarios');
  // }, [router]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Administração
      </Typography>
      
      <Grid container spacing={4}>
        <NavCard 
          title="Usuários" 
          icon={<Person sx={{ fontSize: 40 }} />} 
          path="/administracao/usuarios" 
        />
        <NavCard 
          title="Integração Jira" 
          icon={<Code sx={{ fontSize: 40 }} />} 
          path="/administracao/integracao-jira" 
        />
        <NavCard 
          title="Logs de Atividade" 
          icon={<History sx={{ fontSize: 40 }} />} 
          path="/administracao/logs-atividade" 
        />
        <NavCard 
          title="Configurações" 
          icon={<Settings sx={{ fontSize: 40 }} />} 
          path="/administracao/configuracoes" 
        />
      </Grid>
    </Container>
  );
}
