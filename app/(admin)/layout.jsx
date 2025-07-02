"use client";

import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Header from '@/components/admin/Header'; // Ajuste o caminho se necessário
import Sidebar from '@/components/admin/Sidebar'; // Ajuste o caminho se necessário
import Toolbar from '@mui/material/Toolbar';

export default function AdminLayout({ children }) {
  // Para um drawer responsivo, você precisaria de um estado para controlar a abertura/fechamento em telas menores
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header handleDrawerToggle={handleDrawerToggle} /> {/* Passando a função de toggle */}
      <Sidebar /> {/* Removendo as props que estão causando o erro */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // As propriedades 'p' e 'width' foram removidas para permitir que o conteúdo filho controle seu próprio espaçamento e ocupe todo o espaço.
        }}
      >
        <Toolbar /> {/* Para garantir que o conteúdo não fique sob o Header */}
        {children}
      </Box>
    </Box>
  );
}

